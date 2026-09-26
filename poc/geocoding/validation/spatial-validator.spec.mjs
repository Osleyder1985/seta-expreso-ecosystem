import test from "node:test";
import assert from "node:assert/strict";
import {
  haversineDistanceMeters,
  classifyDistance
} from "./spatial-validator.mjs";

test("Haversine returns zero for identical coordinates", () => {
  assert.equal(
    haversineDistanceMeters(
      { latitude: 21.38, longitude: -77.92 },
      { latitude: 21.38, longitude: -77.92 }
    ),
    0
  );
});

test("Haversine produces a finite positive distance", () => {
  const distance = haversineDistanceMeters(
    { latitude: 21.38, longitude: -77.92 },
    { latitude: 23.11, longitude: -82.36 }
  );
  assert.ok(Number.isFinite(distance));
  assert.ok(distance > 0);
});

test("distance bands are deterministic", () => {
  assert.equal(classifyDistance(10), "rooftop_or_nearby");
  assert.equal(classifyDistance(40), "building_or_nearby");
  assert.equal(classifyDistance(100), "street");
  assert.equal(classifyDistance(500), "locality");
  assert.equal(classifyDistance(3000), "municipality");
  assert.equal(classifyDistance(10000), "province_or_worse");
});
