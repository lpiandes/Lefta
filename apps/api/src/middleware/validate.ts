import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', code: 'VALIDATION' });
      return;
    }
    req.body = parsed.data;
    next();
  };
}
