import fs from "node:fs";
import { compareProviders, compareByCaseType, compareByProvince, compareByPrecision } from "./provider-comparison.mjs";

const [,, inputPath, outputPath = "geocoding-comparison-report.json", manifestPath] = process.argv;

if (!inputPath) {
  console.error("Usage: node generate-comparison-report.mjs <evaluated.jsonl> [report.json] [manifest.json]");
  process.exit(2);
}

const records = fs.readFileSync(inputPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .map(line => JSON.parse(line));

const provenance = manifestPath
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : null;

const report = {
  protocol_version: "cuba-geocoding-benchmark-v0.1",
  generated_at: new Date().toISOString(),
  provenance,
  cases: records.length,
  providers: compareProviders(records),
  by_case_type: compareByCaseType(records),
  by_province: compareByProvince(records),
  by_precision: compareByPrecision(records),
  interpretation_rules: {
    no_provider_ranking: true,
    false_positive_is_separate_from_no_result: true,
    http_200_is_not_success_by_itself: true,
    spatial_150m_is_poc_threshold_only: true
  }
};

fs.writeFileSync(outputPath, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
