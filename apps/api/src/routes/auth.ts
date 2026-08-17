import { Router } from 'express';
import { getStore } from '../db/store';
import { loadConfig } from '../lib/config';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validateBody } from '../middleware/validate';
import {
  loginAccount,
  loginBodySchema,
  logoutAccount,
  refreshBodySchema,
  refreshSession,
  registerAccount,
  registerBodySchema,
  toPublicUser,
} from '../services/authService';

export const authRouter = Router();

authRouter.post(
  '/register',
  rateLimit({ prefix: 'auth' }),
  validateBody(registerBodySchema),
  asyncHandler(async (req, res) => {
    const result = await registerAccount(req.body);
    res.status(201).json(result);
  }),
);

authRouter.post(
  '/login',
  rateLimit({ prefix: 'auth' }),
  validateBody(loginBodySchema),
  asyncHandler(async (req, res) => {
    const result = await loginAccount(req.body);
    res.json(result);
  }),
);

authRouter.post(
  '/refresh',
  rateLimit({ prefix: 'auth-refresh', max: 30 }),
  validateBody(refreshBodySchema),
  asyncHandler(async (req, res) => {
    const result = await refreshSession(req.body.refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  '/logout',
  requireAuth,
  asyncHandler(async (req, res) => {
    await logoutAccount(userIdOf(req));
    res.json({ ok: true });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const user = await db.findUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Session expired', code: 'SESSION_EXPIRED' });
      return;
    }
    res.json({
      user: toPublicUser(user),
      summary: await db.moneySummary(userId),
      connections: await db.listConnections(userId),
      hasScanned: await db.isScanComplete(userId),
      session: {
        accessExpiresIn: loadConfig().jwtAccessExpiresIn,
        refreshExpiresIn: loadConfig().jwtRefreshExpiresIn,
      },
    });
  }),
);
