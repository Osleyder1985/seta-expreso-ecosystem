import test from "node:test";
import assert from "node:assert/strict";
import { createRequestTelemetry, recordRequest } from "./common.mjs";

test("request telemetry separates cache hits from provider requests", () => {
  const telemetry = createRequestTelemetry();
  recordRequest(telemetry, { cacheHit: true });
  recordRequest(telemetry, { status: 200 });
  recordRequest(telemetry, { status: 429 });
  recordRequest(telemetry, { error: true });

  assert.deepEqual(telemetry, {
    attempted: 3,
    cache_hits: 1,
    cache_misses: 3,
    rate_limited: 1,
    errors: 1
  });
});
