import { performance } from 'node:perf_hooks';

const [requestsArg, concurrencyArg, warmupArg, nameArg, baseArg] = process.argv.slice(2);
const requests = Number(requestsArg);
const concurrency = Number(concurrencyArg);
const warmupRequests = Number(warmupArg);
if (!Number.isInteger(requests) || requests < 1 ||
    !Number.isInteger(concurrency) || concurrency < 1 ||
    !Number.isInteger(warmupRequests) || warmupRequests < 0 ||
    !nameArg || !baseArg) {
  throw new Error('Usage: node http-benchmark.mjs <requests> <concurrency> <warmupRequests> <name> <baseUrl>');
}
const target = { name: nameArg, base: baseArg };

async function requestOnce() {
  try {
    const response = await fetch(target.base + '/packages');
    if (!response.ok) return false;
    await response.text();
    return true;
  } catch {
    return false;
  }
}

async function warmup() {
  if (warmupRequests === 0) return;
  let next = 0;
  const worker = async () => {
    while (true) {
      const index = next++;
      if (index >= warmupRequests) return;
      await requestOnce();
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, warmupRequests) }, worker));
}

async function run() {
  await warmup();

  const latencies = [];
  let errors = 0;
  let next = 0;

  const worker = async () => {
    while (true) {
      const index = next++;
      if (index >= requests) return;
      const started = performance.now();
      try {
        const response = await fetch(target.base + '/packages');
        if (!response.ok) errors++;
        else await response.text();
      } catch {
        errors++;
      } finally {
        latencies.push(performance.now() - started);
      }
    }
  };

  const started = performance.now();
  await Promise.all(Array.from({ length: Math.min(concurrency, requests) }, worker));
  const elapsed = performance.now() - started;
  latencies.sort((a, b) => a - b);
  const percentile = p => latencies[Math.min(latencies.length - 1, Math.ceil(latencies.length * p) - 1)];
  const rps = requests / (elapsed / 1000);
  const errorRate = errors / requests;

  return {
    implementation: target.name,
    requests,
    concurrency,
    warmup_requests: warmupRequests,
    elapsed_ms: Number(elapsed.toFixed(2)),
    throughput_rps: Number(rps.toFixed(2)),
    p50_ms: Number(percentile(0.50).toFixed(2)),
    p95_ms: Number(percentile(0.95).toFixed(2)),
    error_rate: Number(errorRate.toFixed(4))
  };
}

console.log(JSON.stringify(await run()));
