import { performance } from 'node:perf_hooks';

const [requestsArg, concurrencyArg, warmupArg, name, baseUrl] = process.argv.slice(2);
const requests = Number(requestsArg);
const concurrency = Number(concurrencyArg);
const warmupRequests = Number(warmupArg);

if (!Number.isInteger(requests) || requests < 1 ||
    !Number.isInteger(concurrency) || concurrency < 1 ||
    !Number.isInteger(warmupRequests) || warmupRequests < 0 ||
    !name || !baseUrl) {
  throw new Error('Usage: node http-benchmark.mjs <requests> <concurrency> <warmupRequests> <name> <baseUrl>');
}

async function load(count) {
  let errors = 0;
  let next = 0;
  const latencies = [];

  const worker = async () => {
    while (true) {
      const index = next++;
      if (index >= count) return;
      const started = performance.now();
      try {
        const response = await fetch(baseUrl + '/packages');
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
  await Promise.all(Array.from({length: Math.min(concurrency, count)}, worker));
  return {
    elapsed_ms: performance.now() - started,
    errors,
    latencies
  };
}

if (warmupRequests > 0) await load(warmupRequests);

const result = await load(requests);
result.latencies.sort((a,b) => a-b);
const percentile = p => result.latencies[Math.min(result.latencies.length - 1, Math.ceil(result.latencies.length * p) - 1)];
const elapsedSeconds = result.elapsed_ms / 1000;

console.log(JSON.stringify({
  implementation: name,
  requests,
  concurrency,
  warmup_requests: warmupRequests,
  elapsed_ms: Number(result.elapsed_ms.toFixed(2)),
  throughput_rps: Number((requests / elapsedSeconds).toFixed(2)),
  p50_ms: Number(percentile(0.50).toFixed(2)),
  p95_ms: Number(percentile(0.95).toFixed(2)),
  error_rate: Number((result.errors / requests).toFixed(4))
}));
