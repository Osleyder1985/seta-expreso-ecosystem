import { performance } from 'node:perf_hooks';

const [requestsArg, concurrencyArg, warmupArg, name, baseUrl, operation = 'list', idsArg = ''] = process.argv.slice(2);
const requests = Number(requestsArg);
const concurrency = Number(concurrencyArg);
const warmupRequests = Number(warmupArg);
const ids = idsArg ? idsArg.split(',').map(Number).filter(Number.isInteger) : [];

if (!Number.isInteger(requests) || requests < 1 ||
    !Number.isInteger(concurrency) || concurrency < 1 ||
    !Number.isInteger(warmupRequests) || warmupRequests < 0 ||
    !name || !baseUrl ||
    !['create', 'list', 'get', 'update', 'delete'].includes(operation)) {
  throw new Error('Usage: node http-benchmark.mjs <requests> <concurrency> <warmupRequests> <name> <baseUrl> [operation] [idsCsv]');
}

if (['get', 'update', 'delete'].includes(operation) && ids.length < requests) {
  throw new Error(`Operation ${operation} requires at least ${requests} seeded ids; received ${ids.length}.`);
}

const payload = JSON.stringify({
  house: 'BENCH-HOUSE',
  weightKg: 1.25,
  recipientAddress: 'Benchmark address'
});

function target(index, warmupPhase = false) {
  if (operation === 'create') return { method: 'POST', url: baseUrl + '/packages', body: payload };
  if (operation === 'list') return { method: 'GET', url: baseUrl + '/packages' };
  const idIndex = operation === 'delete' ? (warmupPhase ? index : warmupRequests + index) : index;
  const id = ids[idIndex % ids.length];
  if (operation === 'get') return { method: 'GET', url: baseUrl + `/packages/${id}` };
  if (operation === 'update') return {
    method: 'PATCH',
    url: baseUrl + `/packages/${id}`,
    body: JSON.stringify({ weightKg: 2.5 })
  };
  return { method: 'DELETE', url: baseUrl + `/packages/${id}` };
}

async function load(count, warmupPhase = false) {
  let errors = 0;
  let next = 0;
  const latencies = [];

  const worker = async () => {
    while (true) {
      const index = next++;
      if (index >= count) return;
      const started = performance.now();
      try {
        const request = target(index, warmupPhase);
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.body ? { 'content-type': 'application/json' } : undefined,
          body: request.body
        });
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
  return { elapsed_ms: performance.now() - started, errors, latencies };
}

if (warmupRequests > 0) await load(warmupRequests, true);

const result = await load(requests);
result.latencies.sort((a,b) => a-b);
const percentile = p => result.latencies[Math.min(result.latencies.length - 1, Math.ceil(result.latencies.length * p) - 1)];
const elapsedSeconds = result.elapsed_ms / 1000;

console.log(JSON.stringify({
  implementation: name,
  operation,
  requests,
  concurrency,
  warmup_requests: warmupRequests,
  elapsed_ms: Number(result.elapsed_ms.toFixed(2)),
  throughput_rps: Number((requests / elapsedSeconds).toFixed(2)),
  p50_ms: Number(percentile(0.50).toFixed(2)),
  p95_ms: Number(percentile(0.95).toFixed(2)),
  error_rate: Number((result.errors / requests).toFixed(4))
}));
