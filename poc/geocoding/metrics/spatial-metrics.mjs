function finite(values) {
  return values.filter(Number.isFinite).sort((a, b) => a - b);
}

function percentile(values, p) {
  const xs = finite(values);
  if (!xs.length) return null;
  const i = (xs.length - 1) * p;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return xs[lo];
  return xs[lo] + (xs[hi] - xs[lo]) * (i - lo);
}

export function calculateSpatialMetrics(records) {
  const distances = records
    .map(r => r.spatial_validation?.distance_meters)
    .filter(Number.isFinite);

  const byClass = {};
  for (const record of records) {
    const cls = record.spatial_validation?.distance_class;
    if (cls) byClass[cls] = (byClass[cls] ?? 0) + 1;
  }

  return {
    spatial_control_cases: distances.length,
    median_distance_meters: percentile(distances, 0.50),
    p95_distance_meters: percentile(distances, 0.95),
    max_distance_meters: distances.length ? Math.max(...distances) : null,
    distance_classes: byClass
  };
}
