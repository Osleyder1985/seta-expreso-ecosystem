function percentile(values, p) {
  const xs = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!xs.length) return null;
  const index = (xs.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return xs[lower];
  return xs[lower] + (xs[upper] - xs[lower]) * (index - lower);
}

export function calculateMetrics(records) {
  const total = records.length;
  const count = (predicate) => records.filter(predicate).length;

  const statusCounts = {
    ok: count(r => r.status === "ok"),
    no_result: count(r => r.status === "no_result"),
    http_error: count(r => r.status === "http_error"),
    rate_limited: count(r => r.status === "rate_limited"),
    timeout: count(r => r.status === "timeout"),
    error: count(r => r.status === "error")
  };

  const validationCounts = {
    accepted: count(r => r.validation === "ACCEPTED"),
    review: count(r => r.validation === "REVIEW"),
    rejected: count(r => r.validation === "REJECTED")
  };

  const successful = records.filter(r => r.status === "ok");
  const latencies = successful.map(r => Number(r.latency_ms));

  return {
    total_cases: total,
    result_rate: total ? successful.length / total : 0,
    no_result_rate: total ? statusCounts.no_result / total : 0,
    http_error_rate: total ? statusCounts.http_error / total : 0,
    rate_limited_rate: total ? statusCounts.rate_limited / total : 0,
    timeout_rate: total ? statusCounts.timeout / total : 0,
    error_rate: total ? statusCounts.error / total : 0,
    usable_result_rate: total ? (validationCounts.accepted + validationCounts.review) / total : 0,
    accepted_rate: total ? validationCounts.accepted / total : 0,
    review_rate: total ? validationCounts.review / total : 0,
    rejected_rate: total ? validationCounts.rejected / total : 0,
    p50_latency_ms: percentile(latencies, 0.50),
    p95_latency_ms: percentile(latencies, 0.95),
    status_counts: statusCounts,
    validation_counts: validationCounts
  };
}
