import type { NextFunction, Request, Response } from 'express';
import { loadConfig } from '../lib/config';

const hits = new Map<string, number[]>();

function prune(timestamps: number[], windowMs: number, now: number): number[] {
  return timestamps.filter((t) => now - t < windowMs);
}

/** In-memory limiter — reusable for auth and other sensitive routes. */
export function rateLimit(options?: { max?: number; windowMs?: number; prefix?: string }) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const config = loadConfig();
    const max = options?.max ?? config.authRateLimitMax;
    const windowMs = options?.windowMs ?? config.authRateLimitWindowMs;
    const ip = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${options?.prefix ?? 'rl'}:${ip}:${req.path}`;
    const now = Date.now();
    const nextHits = prune(hits.get(key) ?? [], windowMs, now);
    if (nextHits.length >= max) {
      res.status(429).json({ error: 'Too many attempts. Try again later.', code: 'RATE_LIMITED' });
      return;
    }
    nextHits.push(now);
    hits.set(key, nextHits);
    next();
  };
}

export function resetRateLimitsForTests(): void {
  hits.clear();
}
