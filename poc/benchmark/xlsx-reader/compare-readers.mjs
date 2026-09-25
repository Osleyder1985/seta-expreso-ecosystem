import { readFile, writeFile, readdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

import { evaluateFixture } from './acceptance-contract.mjs';

const fixtureSets = [
  { dir: new URL('./fixtures/', import.meta.url), filter: /^F\d\d\.xlsx$/, kind: 'acceptance' },
  { dir: new URL('./stress-fixtures/', import.meta.url), filter: /^ST\d\d-.*\.xlsx$/, kind: 'stress' }
];

const fixtureFiles = [];
for (const set of fixtureSets) {
  for (const file of (await readdir(set.dir)).filter(name => set.filter.test(name)).sort()) {
    fixtureFiles.push({ file, dir: set.dir, kind: set.kind });
  }
}
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const percentile = (values, p) => {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i), hi = Math.ceil(i);
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo);
};

const EXECUTION_TIMEOUT_MS = 15000;

function runIsolated(reader, filePath) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['reader-worker.mjs', reader, filePath], {
      cwd: fileURLToPath(new URL('.', import.meta.url)),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '', stderr = '';
    let settled = false;
    const started = process.hrtime.bigint();
    const finish = value => { if (!settled) { settled = true; clearTimeout(timer); resolve(value); } };
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      finish({timeout:true, elapsedMs:Number(process.hrtime.bigint()-started)/1e6, error:{name:'TimeoutError',message:`Reader exceeded hard timeout of ${EXECUTION_TIMEOUT_MS} ms`}});
    }, EXECUTION_TIMEOUT_MS);
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('error', e => finish({timeout:false, elapsedMs:Number(process.hrtime.bigint()-started)/1e6, error:{name:e.name,message:e.message}}));
    child.on('close', code => {
      if (settled) return;
      let parsed;
      try { parsed = JSON.parse(stdout); } catch {
        finish({timeout:false,elapsedMs:Number(process.hrtime.bigint()-started)/1e6,error:{name:'WorkerProtocolError',message:`Invalid worker output (exit ${code}): ${stderr.slice(0,500)}`}}); return;
      }
      finish({timeout:false,elapsedMs:Number(process.hrtime.bigint()-started)/1e6,...parsed});
    });
  });
}

const results = [];

for (const fixture of fixtureFiles) {
  const { file, dir, kind } = fixture;
  const buffer = await readFile(new URL(file, dir));
  const fixtureId = file.slice(0, 3);
  const isZipContainer = buffer.length >= 4 && buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const readers = ['exceljs', 'sheetjs', 'read-excel-file'];

  for (const reader of readers) {
    const samples = [];
    const snapshotHashes = [];
    const errors = [];
    let lastResult = null;

    for (let i = 0; i < 6; i++) {
      global.gc?.();
      const isolated = await runIsolated(reader, fileURLToPath(new URL(file, dir)));
      const durationMs = isolated.elapsedMs;
      if (isolated.timeout) {
        errors.push({ iteration: i + 1, name: isolated.error.name, message: isolated.error.message });
        snapshotHashes.push(null);
      } else if (!isolated.ok) {
        errors.push({ iteration: i + 1, name: isolated.error.name, message: isolated.error.message, preflightRejected: isolated.preflightRejected === true });
        snapshotHashes.push(null);
      } else {
        lastResult = isolated.result;
        snapshotHashes.push(hash(isolated.result));
      }
      samples.push({ durationMs, rssBytes: isolated.maxRssBytes ?? null });
    }

    const warm = samples.slice(1).map(x => x.durationMs);
    const stableHashes = snapshotHashes.slice(1).filter(Boolean);
    const deterministic = stableHashes.length > 0 && stableHashes.every(x => x === stableHashes[0]);
    const malformedFixture = kind === 'stress' && /^ST0[456]-/.test(file);
    const preflightRejected = errors.length > 0 && errors.every(e => e.preflightRejected === true);
    const acceptance = malformedFixture
      ? {
          status: preflightRejected || (errors.length > 0 && /^ST0[45]-/.test(file)) ? 'EXPECTED_REJECTION' : 'UNEXPECTED_ACCEPTANCE',
          message: preflightRejected ? 'Input rejected by the strict XLSX container preflight before parser invocation.' : errors.length ? 'Malformed XLSX container was rejected by the reader.' : 'Malformed/non-XLSX fixture was accepted by the reader.',
          details: {
            strictContainerSignatureValid: isZipContainer,
            rawParserAccepted: errors.length === 0,
            rawParserErrors: errors
          }
        }
      : errors.length
        ? { status: 'ERROR', message: 'Reader raised one or more execution errors.', details: { errors } }
        : kind === 'acceptance'
          ? evaluateFixture(fixtureId, reader, lastResult)
          : { status: 'NOT_APPLICABLE', message: 'Stress fixture: performance/memory evidence only.' };

    results.push({
      fixture: file,
      fixtureKind: kind,
      reader,
      bytes: buffer.length,
      acceptance,
      durationMedianMs: percentile(warm, 0.5),
      durationP95Ms: percentile(warm, 0.95),
      durationSamplesMs: samples.map(x => x.durationMs),
      maxRssBytes: Math.max(...samples.map(x => x.rssBytes ?? 0)),
      snapshotHash: stableHashes[stableHashes.length - 1] ?? null,
      snapshotHashes,
      deterministic,
      errors,
      strictContainerGate: isZipContainer,
      preflightRejectionCount: errors.filter(e => e.preflightRejected === true).length
    });
  }
}

const acceptanceSummary = results.reduce((acc, item) => {
  const status = item.acceptance.status;
  acc[status] = (acc[status] ?? 0) + 1;
  return acc;
}, { PASS: 0, FAIL: 0, ERROR: 0, EXPECTED_REJECTION: 0, UNEXPECTED_ACCEPTANCE: 0, NOT_APPLICABLE: 0 });

const robustnessSummary = results
  .filter(x => x.fixtureKind === 'stress')
  .reduce((acc, x) => {
    const key = x.acceptance.status === 'EXPECTED_REJECTION'
      ? 'EXPECTED_REJECTION'
      : x.acceptance.status === 'UNEXPECTED_ACCEPTANCE'
        ? 'UNEXPECTED_ACCEPTANCE'
        : x.errors.length
          ? 'ERROR'
          : 'EXECUTED';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, { EXECUTED: 0, EXPECTED_REJECTION: 0, UNEXPECTED_ACCEPTANCE: 0, ERROR: 0 });

const report = {
  protocol: 'xlsx-reader-comparison-v0.9.0',
  executionTimeoutMs: EXECUTION_TIMEOUT_MS,
  node: process.version,
  platform: process.platform,
  arch: process.arch,
  fixtureCount: fixtureFiles.length,
  fixtures: fixtureFiles,
  acceptanceSummary,
  robustnessSummary,
  results
};

await writeFile(new URL('comparison-report.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
