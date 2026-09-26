import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type Bucket = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, { short: Bucket; long: Bucket }>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const now = Date.now();
    const key = request.ip ?? 'unknown';

    let entry = this.buckets.get(key);
    if (!entry || now >= entry.long.resetAt) {
      entry = {
        short: { count: 0, resetAt: now + 1_000 },
        long: { count: 0, resetAt: now + 60_000 },
      };
      this.buckets.set(key, entry);
    } else if (now >= entry.short.resetAt) {
      entry.short = { count: 0, resetAt: now + 1_000 };
    }

    entry.short.count += 1;
    entry.long.count += 1;

    const shortRemaining = Math.max(0, 20 - entry.short.count);
    const longRemaining = Math.max(0, 300 - entry.long.count);
    const remaining = Math.min(shortRemaining, longRemaining);
    const resetAt = Math.min(entry.short.resetAt, entry.long.resetAt);

    response.setHeader('RateLimit-Limit', '20;w=1, 300;w=60');
    response.setHeader('RateLimit-Remaining', String(remaining));
    response.setHeader('RateLimit-Reset', String(Math.ceil((resetAt - now) / 1000)));

    if (entry.short.count > 20 || entry.long.count > 300) {
      throw new HttpException('Too many requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    return true;
  }
}
