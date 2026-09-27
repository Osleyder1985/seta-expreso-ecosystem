import { createHash } from 'node:crypto';
import { cpus, totalmem } from 'node:os';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import ExcelJS from 'exceljs';
import { createRequire } from 'node:module';

const READER_MODULES = {
  exceljs: './dist/modules/paqueteria/import/experimental-exceljs-workbook-reader.js',
  sheetjs: './dist/modules/paqueteria/import/experimental-sheetjs-workbook-reader.js',
  'read-excel-file': './dist/modules/paqueteria/import/experimental-read-excel-file-workbook-reader.js',
};

const NODE_VERSION = process.version;
const NPM_VERSION = await commandVersion('npm', ['--version']);
const READER_VERSIONS = Object.fromEntries(Object.keys(READER_MODULES).map(name => [name, readInstalledPackageVersion(name === 'read-excel-file' ? 'read-excel-file' : name)]));
const ITERATIONS = 5;
const WARMUP = 1;
const FIXTURES = [
  { id: 'manifest-180', rows: 180, columns: 12, sheets: 1 },
  { id: 'manifest-180-3sheets', rows: 180, columns: 12, sheets: 3 },
  { id: 'stress-1000', rows: 1000, columns: 12, sheets: 1 },
  { id: 'stress-5000', rows: 5000, columns: 20, sheets: 1 },
];

const isWorker = process.argv[2] === '--worker';

if (isWorker) {
  await runWorker();
} else {
  await runBenchmark();
}

async function runBenchmark() {
  const workspace = await mkdtemp(join(tmpdir(), 'seta-xlsx-benchmark-'));
  try {
    const generated = [];
    for (const fixture of FIXTURES) {
      const path = join(workspace, fixture.id + '.xlsx');
      await generateFixture(path, fixture);
      const bytes = await readFile(path);
      generated.push({
        ...fixture,
        path,
        bytes: bytes.byteLength,
        sha256: sha256(bytes),
      });
    }

    const results = [];
    for (const fixture of generated) {
      for (const reader of Object.keys(READER_MODULES)) {
        const samples = [];
        for (let i = 0; i < WARMUP + ITERATIONS; i += 1) {
          const sample = await runIsolatedReader(reader, fixture.path, fixture.sha256, fixture.id);
          if (i >= WARMUP) samples.push(sample);
        }
        results.push(summarize(fixture, reader, samples));
      }
    }

    const artifact = {
      protocol: 'xlsx-reader-resource-benchmark-v1.0.0',
      generatedAt: new Date().toISOString(),
      node: NODE_VERSION,
      npm: NPM_VERSION,
      readerVersions: READER_VERSIONS,
      platform: process.platform,
      arch: process.arch,
      cpus: cpus().length,
      totalMemoryBytes: totalmem(),
      iterations: ITERATIONS,
      warmup: WARMUP,
      methodology: {
        processIsolation: true,
        sameBinaryPerFixture: true,
        generatedBy: 'ExcelJS 4.4.0',
        timing: 'performance.now inside isolated worker',
        memory: 'process.resourceUsage().maxRSS and RSS delta inside isolated worker',
        noRanking: true,
      },
      fixtures: generated.map(({ path, ...fixture }) => fixture),
      results,
    };

    const outputDir = join(process.cwd(), 'certification-artifacts');
    await mkdir(outputDir, { recursive: true });
    const output = join(outputDir, 'xlsx-reader-resource-benchmark.json');
    await writeFile(output, JSON.stringify(artifact, null, 2) + '\n', 'utf8');
    console.log(JSON.stringify({ output, fixtures: generated.length, resultRows: results.length }, null, 2));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
}

async function runWorker() {
  const [, , , reader, fixturePath, fixtureHash, fixtureId] = process.argv;
  if (!READER_MODULES[reader]) throw new Error('Unknown reader: ' + reader);
  const source = await readFile(fixturePath);
  if (sha256(source) !== fixtureHash) throw new Error('Fixture hash mismatch');
  const started = performance.now();
  const before = process.memoryUsage().rss;
  const module = await import(new URL('../' + READER_MODULES[reader].replace(/^\.\//, ''), import.meta.url));
  const className = reader === 'exceljs'
    ? 'ExperimentalExcelJsWorkbookReader'
    : reader === 'sheetjs'
      ? 'ExperimentalSheetJsWorkbookReader'
      : 'ExperimentalReadExcelFileWorkbookReader';
  const Reader = module[className];
  const readerInstance = new Reader();
  const snapshot = await readerInstance.read(source, {
    importSnapshotId: 'benchmark-' + fixtureId,
    sourceDocumentId: 'benchmark-' + fixtureId,
    contentHash: fixtureHash,
    sourceFileName: fixtureId + '.xlsx',
    mappingProfileId: 'benchmark',
    mappingProfileVersion: '1.0.0',
  });
  const elapsedMs = performance.now() - started;
  const after = process.memoryUsage().rss;
  const maxRSS = process.resourceUsage().maxRSS * 1024;
  console.log(JSON.stringify({
    reader,
    fixtureId,
    elapsedMs,
    rssBeforeBytes: before,
    rssAfterBytes: after,
    rssDeltaBytes: after - before,
    maxRSSBytes: maxRSS,
    sheets: snapshot.sheets.length,
    rows: snapshot.sheets.reduce((n, s) => n + s.rows.length, 0),
    cells: snapshot.sheets.reduce((n, s) => n + s.rows.reduce((m, r) => m + r.cells.length, 0), 0),
  }));
}

async function runIsolatedReader(reader, fixturePath, fixtureHash, fixtureId) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [fileURLToPath(import.meta.url), '--worker', reader, fixturePath, fixtureHash, fixtureId], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', reject);
    child.on('close', code => {
      if (code !== 0) return reject(new Error('Benchmark worker failed (' + reader + '/' + fixtureId + '): ' + stderr + stdout));
      const line = stdout.trim().split('\n').at(-1);
      try { resolve(JSON.parse(line)); } catch (error) { reject(new Error('Invalid worker JSON: ' + stdout + '\n' + stderr)); }
    });
  });
}

function summarize(fixture, reader, samples) {
  const times = samples.map(s => s.elapsedMs).sort((a,b) => a-b);
  const rss = samples.map(s => s.maxRSSBytes).sort((a,b) => a-b);
  const delta = samples.map(s => s.rssDeltaBytes).sort((a,b) => a-b);
  const median = values => values[Math.floor(values.length / 2)];
  return {
    reader,
    fixtureId: fixture.id,
    sourceBytes: fixture.bytes,
    sourceSha256: fixture.sha256,
    iterations: samples.length,
    elapsedMs: {
      min: times[0],
      median: median(times),
      max: times.at(-1),
    },
    maxRSSBytes: {
      min: rss[0],
      median: median(rss),
      max: rss.at(-1),
    },
    rssDeltaBytes: {
      min: delta[0],
      median: median(delta),
      max: delta.at(-1),
    },
    rows: samples[0].rows,
    cells: samples[0].cells,
    sheets: samples[0].sheets,
  };
}

async function generateFixture(path, fixture) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SETA EXPRESO XLSX benchmark';
  for (let s = 1; s <= fixture.sheets; s += 1) {
    const sheet = workbook.addWorksheet('Manifest' + s);
    const headers = Array.from({ length: fixture.columns }, (_, i) => 'COL_' + String(i + 1).padStart(2, '0'));
    sheet.addRow(headers);
    for (let r = 1; r <= fixture.rows; r += 1) {
      const row = headers.map((_, c) => {
        if (c === 0) return 'HOUSE-' + String(r).padStart(4, '0');
        if (c === 1) return 'Destination ' + r;
        if (c === 2) return r % 7 === 0 ? 'Camagüey' : 'La Habana';
        if (c === 3) return r;
        if (c === 4) return r * 1.25;
        if (c === 5) return r % 3 === 0;
        if (c === 6) return new Date(Date.UTC(2026, 8, (r % 28) + 1));
        if (c === 7) return 'Phone-' + r;
        return 'VALUE-' + r + '-' + c;
      });
      sheet.addRow(row);
    }
    const totalRow = fixture.rows + 2;
    sheet.getCell(totalRow, 1).value = 'TOTAL';
    sheet.getCell(totalRow, 4).value = { formula: 'SUM(D2:D' + (fixture.rows + 1) + ')', result: fixture.rows * (fixture.rows + 1) / 2 };
    sheet.getCell(totalRow, 5).value = { formula: 'SUM(E2:E' + (fixture.rows + 1) + ')', result: 1.25 * fixture.rows * (fixture.rows + 1) / 2 };
    sheet.getColumn(7).numFmt = 'dd/mm/yyyy';
    sheet.getColumn(5).numFmt = '0.00';
  }
  await workbook.xlsx.writeFile(path);
}

async function commandVersion(command, args) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; let err = '';
    child.stdout.on('data', c => { out += c; });
    child.stderr.on('data', c => { err += c; });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolve(out.trim()) : reject(new Error(err)));
  });
}

function readInstalledPackageVersion(name) {
  try {
    return createRequire(import.meta.url)(name + '/package.json').version;
  } catch (error) {
    return 'UNRESOLVED:' + String(error?.message ?? error);
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}
