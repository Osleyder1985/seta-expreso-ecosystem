import fs from "node:fs";
import { calculateMetrics } from "../metrics/benchmark-metrics.mjs";
import { calculateSpatialMetrics } from "../metrics/spatial-metrics.mjs";
import { validateTerritorialMatch } from "../validation/territorial-validator.mjs";
import { validateSpatialMatch } from "../validation/spatial-validator.mjs";

const [,, inputPath, outputPath = "geocoding-results-evaluated.jsonl"] = process.argv;

if (!inputPath) {
  console.error("Usage: node evaluate-geocoding-results.mjs <provider-results.jsonl> [output.jsonl]");
  process.exit(2);
}

const records = fs.readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => JSON.parse(line));

const evaluated = records.map((record) => {
  if (record.status !== "ok" || !record.result) {
    return {
      ...record,
      validation: record.validation ?? "REJECTED",
      validation_detail: null,
      spatial_validation: null
    };
  }

  const validationDetail = validateTerritorialMatch(record.expected ?? {}, record.result);
  const reference = record.expected?.reference_coordinates;
  const coordinates = record.result?.coordinates;
  const spatialValidation = reference && coordinates
    ? validateSpatialMatch(reference, coordinates)
    : null;

  return {
    ...record,
    validation: validationDetail.validation,
    validation_detail: validationDetail,
    spatial_validation: spatialValidation
  };
});

fs.writeFileSync(
  outputPath,
  evaluated.map(record => JSON.stringify(record)).join("\n") + "\n"
);

console.log(JSON.stringify({
  overall: calculateMetrics(evaluated),
  spatial: calculateSpatialMetrics(evaluated)
}, null, 2));
