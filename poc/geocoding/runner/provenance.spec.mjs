import test from "node:test";
import assert from "node:assert/strict";
import { buildProvenance, sanitizeConfig, sha256, parseNonNegativeInteger } from "./provenance.mjs";

test("sha256 is deterministic", () => {
  assert.equal(
    sha256("SETA geocoding"),
    sha256("SETA geocoding")
  );
  assert.match(sha256("SETA geocoding"), /^[a-f0-9]{64}$/);
});

test("sanitizeConfig redacts secrets", () => {
  const sanitized = sanitizeConfig({
    GEOAPIFY_API_KEY: "secret-value",
    LOCATIONIQ_TOKEN: "token-value",
    timeout_ms: 5000,
    countrycodes: "cu"
  });

  assert.equal(sanitized.GEOAPIFY_API_KEY, "[REDACTED]");
  assert.equal(sanitized.LOCATIONIQ_TOKEN, "[REDACTED]");
  assert.equal(sanitized.timeout_ms, 5000);
  assert.equal(sanitized.countrycodes, "cu");
});

test("buildProvenance records dataset and output hashes", () => {
  const manifest = buildProvenance({
    protocolVersion: "cuba-geocoding-benchmark-v0.1",
    datasetId: "cuba-benchmark",
    datasetVersion: "0.1",
    datasetContent: "dataset",
    provider: "offline-fixture",
    adapterVersion: "0.1.0",
    runnerVersion: "0.1.0",
    startedAt: "2026-09-26T00:00:00.000Z",
    finishedAt: "2026-09-26T00:00:01.000Z",
    runId: "test-run",
    requestCount: 4,
    cacheHits: 1,
    cacheMisses: 3,
    rateLimit: { requests_per_second: 1 },
    userAgent: "SETA-Geocoding-Benchmark/0.1",
    config: { API_KEY: "must-not-appear", limit: 5 },
    outputContent: "output"
  });

  assert.equal(manifest.dataset.sha256, sha256("dataset"));
  assert.equal(manifest.output_sha256, sha256("output"));
  assert.equal(manifest.config.API_KEY, "[REDACTED]");
  assert.equal(manifest.requests.cache_hits, 1);
  assert.equal(manifest.requests.cache_misses, 3);
});


test("parseNonNegativeInteger rejects invalid counters", () => {
  assert.equal(parseNonNegativeInteger("4"), 4);
  assert.equal(parseNonNegativeInteger("-1"), 0);
  assert.equal(parseNonNegativeInteger("NaN"), 0);
});
