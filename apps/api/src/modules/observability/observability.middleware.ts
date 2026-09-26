import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { metrics, trace } from '@opentelemetry/api';
import type { Request, Response, NextFunction } from 'express';

const meter = metrics.getMeter('seta-expreso-api');
const requestCounter = meter.createCounter('http.server.request.count', {
  description: 'Number of HTTP requests received by the API.',
  unit: '{request}',
});
const requestDuration = meter.createHistogram('http.server.request.duration', {
  description: 'HTTP server request duration.',
  unit: 'ms',
});

@Injectable()
export class ObservabilityMiddleware implements NestMiddleware {
  private readonly logger = new Logger('http');

  use(request: Request, response: Response, next: NextFunction): void {
    const started = performance.now();
    response.on('finish', () => {
      const duration = performance.now() - started;
      const span = trace.getActiveSpan();
      const spanContext = span?.spanContext();
      const attributes = {
        'http.request.method': request.method,
        'http.response.status_code': response.statusCode,
      };
      requestCounter.add(1, attributes);
      requestDuration.record(duration, attributes);
      this.logger.log(
        JSON.stringify({
          event: 'http.request',
          method: request.method,
          route: request.route?.path ?? request.path,
          status: response.statusCode,
          duration_ms: Math.round(duration * 100) / 100,
          trace_id: spanContext?.traceId ?? null,
          span_id: spanContext?.spanId ?? null,
        }),
      );
    });
    next();
  }
}
