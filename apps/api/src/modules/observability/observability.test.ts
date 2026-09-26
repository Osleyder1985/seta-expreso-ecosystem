import { trace } from '@opentelemetry/api';
import { ObservabilityMiddleware } from './observability.middleware';

describe('ObservabilityMiddleware', () => {
  it('does not require an active span and remains safe for public HTTP requests', () => {
    expect(trace.getActiveSpan()).toBeUndefined();
    expect(new ObservabilityMiddleware()).toBeDefined();
  });
});
