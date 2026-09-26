import test from "node:test";
import assert from "node:assert/strict";
import { compareProviders } from "./provider-comparison.mjs";

test("comparison keeps no-result and false-positive rates distinct", () => {
  const result = compareProviders([
    { provider: "a", status: "no_result", validation: "REJECTED" },
    { provider: "a", status: "ok", validation: "REJECTED" },
    { provider: "a", status: "ok", validation: "ACCEPTED",
      validation_detail: { checks: { country: true, province: true } } }
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].result_rate, 2 / 3);
  assert.equal(result[0].false_positive_rate, 1 / 2);
});
