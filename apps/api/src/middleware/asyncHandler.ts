import type { NextFunction, Request, Response } from 'express';
import { toErrorBody } from '../lib/errors';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void fn(req, res, next).catch(next);
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const body = toErrorBody(err);
  if (body.status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(body.status).json({ error: body.error, code: body.code });
}
