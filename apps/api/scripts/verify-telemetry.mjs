import { readFile } from 'node:fs/promises';

const checks = [
  ['instrumentation source', new URL('../src/instrumentation.ts', import.meta.url)],
  ['observability middleware', new URL('../src/modules/observability/observability.middleware.ts', import.meta.url)],
  ['collector config', new URL('../../../infra/observability/otel-collector/config.yaml', import.meta.url)],
  ['prometheus config', new URL('../../../infra/observability/prometheus/prometheus.yml', import.meta.url)],
  ['alert rules', new URL('../../../infra/observability/prometheus/alerts.yml', import.meta.url)],
  ['loki config', new URL('../../../infra/observability/loki/config.yaml', import.meta.url)],
  ['compose', new URL('../../../infra/observability/docker-compose.yml', import.meta.url)],
  ['alloy config', new URL('../../../infra/observability/alloy/config.alloy', import.meta.url)],
];

for (const [name, url] of checks) {
  const content = await readFile(url, 'utf8');
  if (!content.trim()) throw new Error(name + ' is empty');
}

const instrumentation = await readFile(checks[0][1], 'utf8');
for (const token of ['OTLPTraceExporter', 'OTLPMetricExporter', 'NodeTracerProvider', 'MeterProvider']) {
  if (!instrumentation.includes(token)) throw new Error('Missing telemetry component: ' + token);
}

const collector = await readFile(checks[2][1], 'utf8');
for (const token of ['traces:', 'metrics:', 'otlp:', 'prometheus:']) {
  if (!collector.includes(token)) throw new Error('Missing Collector pipeline component: ' + token);
}

const middleware = await readFile(checks[1][1], 'utf8');
for (const token of ['http.server.request.count', 'http.server.request.duration', 'trace_id', 'span_id']) {
  if (!middleware.includes(token)) throw new Error('Missing correlation/metric component: ' + token);
}

console.log(JSON.stringify({
  protocol: 'observability-baseline-verification-v1',
  telemetryCode: 'PASS',
  collectorPipelines: 'PASS',
  httpMetrics: 'PASS',
  logCorrelation: 'PASS',
}));
