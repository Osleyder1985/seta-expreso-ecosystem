import fs from "node:fs/promises";
import { geocodeGeoapify } from "../adapters/geoapify.mjs";
import { geocodeLocationIQ } from "../adapters/locationiq.mjs";
import { geocodeNominatim } from "../adapters/nominatim.mjs";
import { buildProvenance, parseNonNegativeInteger } from "./provenance.mjs";

const RUNNER_VERSION = "0.2.0";
const PROTOCOL_VERSION = "cuba-geocoding-benchmark-v0.1";

const ADAPTERS = {
  geoapify: geocodeGeoapify,
  locationiq: geocodeLocationIQ,
  nominatim: geocodeNominatim
};

function usage() {
  console.error("Usage: node run-geocoding-benchmark.mjs <dataset.jsonl> [output.jsonl] [manifest.json]");
  process.exit(2);
}

function sleep(ms) {
  return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve();
}

function normalizeResult(item, response, adapterVersion) {
  return {
    case_id: item.case_id,
    provider: process.env.GEOCODING_PROVIDER,
    adapter_version: adapterVersion,
    status: response.status ?? "error",
    http_status: response.http_status ?? null,
    latency_ms: Number(response.latency_ms ?? 0),
    validation: "REVIEW",
    result: response.result ?? null,
    error: response.error ?? null,
    expected: item.expected ?? null,
    reference: item.reference ?? null,
    case_type: item.case_type ?? null
  };
}

const [, , datasetPath, outputPath = "geocoding-results.jsonl", manifestPath = "geocoding-run-manifest.json"] = process.argv;
if (!datasetPath) usage();

const startedAt = new Date().toISOString();
const raw = await fs.readFile(datasetPath, "utf8");
const cases = raw.split(/\r?\n/).filter(Boolean).map((line, i) => {
  try { return JSON.parse(line); }
  catch (error) { throw new Error(`Invalid JSONL at line ${i + 1}: ${error.message}`); }
});

const required = ["case_id", "dataset_version", "province", "municipality", "input", "case_type", "reference"];
for (const [i, item] of cases.entries()) {
  for (const key of required) {
    if (!(key in item)) throw new Error(`Case ${i + 1} missing required field: ${key}`);
  }
}

const provider = process.env.GEOCODING_PROVIDER ?? "offline-fixture";
const adapterVersion = process.env.GEOCODING_ADAPTER_VERSION ?? "0.2.0";
const datasetId = process.env.GEOCODING_DATASET_ID ?? datasetPath.split(/[\\/]/).pop();
const runId = process.env.GEOCODING_RUN_ID ?? `${Date.now()}-${process.pid}`;
const adapter = ADAPTERS[provider];
const intervalMs = parseNonNegativeInteger(process.env.GEOCODING_INTERVAL_MS);
const requestTelemetry = { attempted: 0, cache_hits: 0, cache_misses: 0, rate_limited: 0 };
const results = [];

if (provider === "offline-fixture") {
  for (const item of cases) {
    results.push({
      case_id: item.case_id,
      provider,
      adapter_version: adapterVersion,
      status: "no_result",
      http_status: null,
      latency_ms: 0,
      validation: "REVIEW",
      result: null,
      error: "Offline runner: no provider adapter configured.",
      expected: item.expected ?? null,
      reference: item.reference ?? null,
      case_type: item.case_type ?? null
    });
  }
} else {
  if (!adapter) throw new Error(`Unsupported GEOCODING_PROVIDER: ${provider}`);
  for (const item of cases) {
    const started = performance.now();
    let response;
    requestTelemetry.attempted += 1;
    requestTelemetry.cache_misses += 1;
    try {
      response = await adapter(item.input);
    } catch (error) {
      const latency = performance.now() - started;
      results.push({
        case_id: item.case_id,
        provider,
        adapter_version: adapterVersion,
        status: error.code === "TIMEOUT" ? "timeout" : "error",
        http_status: null,
        latency_ms: latency,
        validation: "REVIEW",
        result: null,
        error: error.message,
        expected: item.expected ?? null,
        reference: item.reference ?? null,
        case_type: item.case_type ?? null
      });
      await sleep(intervalMs);
      continue;
    }

    if (response.status === "rate_limited") requestTelemetry.rate_limited += 1;
    results.push(normalizeResult(item, response, adapterVersion));
    await sleep(intervalMs);
  }
}

const outputContent = results.map(JSON.stringify).join("\n") + "\n";
await fs.writeFile(outputPath, outputContent, "utf8");
const finishedAt = new Date().toISOString();

const rateLimit = process.env.GEOCODING_RATE_LIMIT
  ? JSON.parse(process.env.GEOCODING_RATE_LIMIT)
  : null;

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
  requestCount: requestTelemetry.attempted,
  cacheHits: requestTelemetry.cache_hits,
  cacheMisses: requestTelemetry.cache_misses,
  rateLimit,
  userAgent: process.env.NOMINATIM_USER_AGENT ?? process.env.GEOCODING_USER_AGENT ?? null,
  config: {
    GEOCODING_PROVIDER: provider,
    GEOCODING_ADAPTER_VERSION: adapterVersion,
    GEOCODING_DATASET_ID: datasetId,
    GEOCODING_INTERVAL_MS: intervalMs,
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
  status: provider === "offline-fixture" ? "offline_validation_only" : "provider_execution",
  results_written: results.length,
  requests_attempted: requestTelemetry.attempted,
  rate_limited: requestTelemetry.rate_limited,
  manifest: manifestPath
}, null, 2));
