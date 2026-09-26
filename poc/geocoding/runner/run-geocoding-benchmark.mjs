#!/usr/bin/env node
import fs from "node:fs/promises";

function usage() {
  console.error("Usage: node run-geocoding-benchmark.mjs <dataset.jsonl> [output.jsonl]");
  process.exit(2);
}

const [, , datasetPath, outputPath = "geocoding-results.jsonl"] = process.argv;
if (!datasetPath) usage();

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

await fs.writeFile(outputPath, results.map(JSON.stringify).join("\n") + "\n", "utf8");

const summary = {
  dataset_version: cases[0]?.dataset_version ?? null,
  cases: cases.length,
  provider,
  adapter_version: adapterVersion,
  status: "offline_validation_only",
  results_written: results.length
};

console.log(JSON.stringify(summary, null, 2));
