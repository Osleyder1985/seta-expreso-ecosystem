import { diag, DiagConsoleLogger, DiagLogLevel, metrics } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

if (process.env.OTEL_DIAGNOSTICS === 'true') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318';
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME ?? 'seta-expreso-api',
  [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? '0.1.0',
});

const tracerProvider = new NodeTracerProvider({ resource });
tracerProvider.addSpanProcessor(
  new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  ),
);
tracerProvider.register();

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `${endpoint}/v1/metrics`,
  }),
  exportIntervalMillis: Number(process.env.OTEL_METRIC_EXPORT_INTERVAL_MS ?? 10000),
});

const meterProvider = new MeterProvider({ resource, readers: [metricReader] });
metrics.setGlobalMeterProvider(meterProvider);

const httpInstrumentation = new HttpInstrumentation();
httpInstrumentation.setTracerProvider(tracerProvider);
httpInstrumentation.enable();

export { metricReader, resource, tracerProvider };
