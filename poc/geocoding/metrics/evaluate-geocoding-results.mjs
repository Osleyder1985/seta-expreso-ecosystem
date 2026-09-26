import fs from "node:fs";
import { calculateMetrics } from "../metrics/benchmark-metrics.mjs";
import { validateTerritorialMatch } from "../validation/territorial-validator.mjs";

const [,, inputPath, outputPath = "geocoding-results.jsonl"] = process.argv;

if (!inputPath) {
  console.error("Usage: node evaluate-geocoding-results.mjs <provider-results.jsonl> [output.jsonl]");
  process.exit(2);
}

const lines = fs.readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean);

const records = lines.map((line) => JSON.parse(line));

const evaluated = records.map((record) => {
  if (record.status !== "ok" || !record.result) {
    return {
      ...record,
      validation: record.validation ?? "REJECTED",
      validation_detail: null
    };
  }

  const detail = validateTerritorialMatch(
    record.expected ?? {},
    record.result
  );

  return {
    ...record,
    validation: detail.validation,
    validation_detail: detail
  };
});

fs.writeFileSync(
  outputPath,
  evaluated.map((record) => JSON.stringify(record)).join("\n") + "\n"
);

console.log(JSON.stringify(calculateMetrics(evaluated), null, 2));
