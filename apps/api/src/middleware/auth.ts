import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../lib/jwt';

export function userIdOf(req: Request): string {
  if (!req.userId) throw new Error('Unauthenticated');
  return req.userId;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: 'Sign in required', code: 'UNAUTHENTICATED' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Sign in again.', code: 'SESSION_EXPIRED' });
  }
}
