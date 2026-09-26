import { ExecutionContext } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  it('blocks the request after the short window limit', () => {
    const guard = new RateLimitGuard();
    const headers = new Map<string, string>();
    const request = { ip: '127.0.0.1' };
    const response = {
      setHeader: (name: string, value: string) => headers.set(name, value),
    };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as unknown as ExecutionContext;

    for (let index = 0; index < 20; index += 1) {
      expect(guard.canActivate(context)).toBe(true);
    }

    expect(() => guard.canActivate(context)).toThrow('Too many requests');
    expect(headers.get('RateLimit-Limit')).toBe('20;w=1, 300;w=60');
  });
});
