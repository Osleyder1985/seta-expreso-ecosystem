import { performance } from 'node:perf_hooks';

const [requestsArg, concurrencyArg, ...pairs] = process.argv.slice(2);
const requests = Number(requestsArg);
const concurrency = Number(concurrencyArg);
if (!Number.isInteger(requests) || requests < 1 || !Number.isInteger(concurrency) || concurrency < 1 || pairs.length % 2 !== 0) {
  throw new Error('Usage: node http-benchmark.mjs <requests> <concurrency> <name> <baseUrl> [<name> <baseUrl>...]');
}
const targets = [];
for (let i = 0; i < pairs.length; i += 2) targets.push({ name: pairs[i], base: pairs[i + 1] });

async function run(target) {
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
    elapsed_ms: Number(elapsed.toFixed(2)),
    throughput_rps: Number(rps.toFixed(2)),
    p50_ms: Number(percentile(0.50).toFixed(2)),
    p95_ms: Number(percentile(0.95).toFixed(2)),
    error_rate: Number(errorRate.toFixed(4))
  };
}

for (const target of targets) {
  console.log(JSON.stringify(await run(target)));
}