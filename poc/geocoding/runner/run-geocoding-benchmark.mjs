#!/usr/bin/env node
import fs from "node:fs/promises";
import { buildProvenance } from "./provenance.mjs";

const RUNNER_VERSION = "0.1.0";
const PROTOCOL_VERSION = "cuba-geocoding-benchmark-v0.1";

function usage() {
  console.error("Usage: node run-geocoding-benchmark.mjs <dataset.jsonl> [output.jsonl] [manifest.json]");
  process.exit(2);
}

const [, , datasetPath, outputPath = "geocoding-results.jsonl", manifestPath = "geocoding-run-manifest.json"] = process.argv;
if (!datasetPath) usage();

const startedAt = new Date().toISOString();
const raw = await fs.readFile(datasetPath, "utf8");
const cases = raw.split(/\r?\n/).filter(Boolean).map((line, i) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`Invalid JSONL at line ${i + 1}: ${error.message}`); }
});

const required = ["case_id","dataset_version","province","municipality","input","case_type","reference"];
for (const [i, item] of cases.entries()) {
  for (const key of required) {
    if (!(key in item)) throw new Error(`Case ${i + 1} missing required field: ${key}`);
  }
}

const provider = process.env.GEOCODING_PROVIDER ?? "offline-fixture";
const adapterVersion = process.env.GEOCODING_ADAPTER_VERSION ?? "0.1.0";
const datasetId = process.env.GEOCODING_DATASET_ID ?? datasetPath.split(/[\\/]/).pop();
const runId = process.env.GEOCODING_RUN_ID ?? `${Date.now()}-${process.pid}`;
const requestCount = Number(process.env.GEOCODING_REQUESTS_ATTEMPTED ?? 0);
const cacheHits = Number(process.env.GEOCODING_CACHE_HITS ?? 0);
const cacheMisses = Number(process.env.GEOCODING_CACHE_MISSES ?? cases.length);
const rateLimit = process.env.GEOCODING_RATE_LIMIT
  ? JSON.parse(process.env.GEOCODING_RATE_LIMIT)
  : null;
const userAgent = process.env.NOMINATIM_USER_AGENT ?? process.env.GEOCODING_USER_AGENT ?? null;

const results = cases.map(item => ({
  case_id: item.case_id,
  provider,
  adapter_version: adapterVersion,
  status: "no_result",
  http_status: null,
  latency_ms: 0,
  validation: "REVIEW",
  result: null,
  error: "Offline runner: no provider adapter configured."
}));

const outputContent = results.map(JSON.stringify).join("\n") + "\n";
await fs.writeFile(outputPath, outputContent, "utf8");

const finishedAt = new Date().toISOString();
const manifest = buildProvenance({
  protocolVersion: PROTOCOL_VERSION,
  datasetId,
  datasetVersion: cases[0]?.dataset_version ?? "unknown",
  datasetContent: raw,
  provider,
  adapterVersion,
  runnerVersion: RUNNER_VERSION,
  startedAt,
  finishedAt,
  runId,
  requestCount,
  cacheHits,
  cacheMisses,
  rateLimit,
  userAgent,
  config: {
    GEOCODING_PROVIDER: provider,
    GEOCODING_ADAPTER_VERSION: adapterVersion,
    GEOCODING_DATASET_ID: datasetId,
    GEOCODING_REQUESTS_ATTEMPTED: requestCount,
    GEOCODING_CACHE_HITS: cacheHits,
    GEOCODING_CACHE_MISSES: cacheMisses,
    GEOCODING_RATE_LIMIT: rateLimit
  },
  outputContent
});

await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  dataset_version: manifest.dataset.version,
  dataset_sha256: manifest.dataset.sha256,
  cases: cases.length,
  provider,
  adapter_version: adapterVersion,
  run_id: runId,
  status: "offline_validation_only",
  results_written: results.length,
  manifest: manifestPath
}, null, 2));
