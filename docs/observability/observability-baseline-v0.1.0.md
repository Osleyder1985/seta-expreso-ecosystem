# Observability Baseline v0.1.0

## Scope

The API now has a reproducible OpenTelemetry baseline for HTTP telemetry:

- distributed HTTP traces using W3C Trace Context;
- HTTP request count and duration metrics;
- structured JSON HTTP logs containing `trace_id` and `span_id` when a span is active;
- OTLP export to a local OpenTelemetry Collector;
- Prometheus-compatible metrics from the Collector;
- local Prometheus and Grafana services;
- local Loki service receiving the structured Docker log pipeline through Grafana Alloy.

OpenTelemetry JavaScript currently marks traces and metrics as stable while logs remain in development. The API therefore uses correlation-ready structured JSON on stdout rather than claiming an OpenTelemetry Logs SDK implementation. Grafana Alloy collects Docker stdout/stderr and forwards those entries to Loki. The log correlation payload includes trace_id/span_id when the request is inside an active HTTP span.

## Metrics

Implemented now:

- `http.server.request.count`
- `http.server.request.duration`

Planned when the corresponding subsystems exist:

- database query/pool metrics;
- asynchronous-job metrics;
- geocoding latency/error/cache metrics;
- routing latency/error metrics;
- mobile synchronization metrics.

No metric is fabricated for an unimplemented subsystem.

## Traces

The Node runtime initializes OpenTelemetry before the Nest application and instruments HTTP. OTLP traces are sent to the Collector.

Default endpoint:

`http://localhost:4318`

Override with `OTEL_EXPORTER_OTLP_ENDPOINT`.

## Logs

The HTTP middleware emits structured JSON to stdout with:

- event
- method
- route
- status
- duration
- trace_id
- span_id

This creates deterministic correlation data without coupling the application to Loki.

## Local stack

From the repository root:

`docker compose -f infra/observability/docker-compose.yml up -d`

Services:

- Collector: OTLP 4317/4318; Prometheus metrics 8889
- Prometheus: 9090
- Grafana: 3001
- Loki: 3100

The stack is a development/verification environment. Production retention, access control, TLS, persistent storage, backup and alert routing remain deployment decisions.

## Retention

The local baseline uses seven days for Prometheus and Loki. This is not a production retention policy.

## Security boundary

Telemetry must not contain access tokens, passwords, full request bodies, or sensitive business payloads. Future instrumentation must preserve this rule.

## Verification

CI verifies:

1. API compilation with telemetry enabled.
2. OpenTelemetry configuration files exist and contain the expected OTLP/Prometheus pipelines.
3. The application exposes deterministic structured telemetry code paths.
4. The observability compose file is syntactically valid when Docker Compose is available.

The baseline does not claim that production observability is complete.
