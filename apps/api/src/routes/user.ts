import { Router } from 'express';
import { getStore } from '../db/store';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';
import { AppError } from '../lib/errors';
import { toPublicUser } from '../services/authService';

export const userRouter = Router();
userRouter.use(requireAuth);

userRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const user = await db.findUserById(userId);
    if (!user) throw new AppError('Session expired', 401, 'SESSION_EXPIRED');
    res.json({
      user: toPublicUser(user),
      summary: await db.moneySummary(userId),
      connections: await db.listConnections(userId),
      hasScanned: await db.isScanComplete(userId),
    });
  }),
);

userRouter.get(
  '/history',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const opportunities = await db.listOpportunities(userId);
    const recovered = opportunities.filter((o) => o.status === 'recovered');
    const pending = opportunities.filter((o) =>
      ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
    );
    const ignored = opportunities.filter((o) => o.status === 'ignored');

    res.json({
      summary: await db.moneySummary(userId),
      recovered,
      pending,
      ignored,
      actions: await db.listActions(userId),
    });
  }),
);

userRouter.get('/privacy', (_req, res) => {
  res.json({
    title: 'Your Money. Your Data.',
    commitments: [
      'We don’t sell your financial data.',
      'We don’t sell transaction histories.',
      'We don’t use financial information for advertising.',
      'You control connected accounts.',
      'You can disconnect at any time.',
      'You can delete your account and data.',
    ],
    access: {
      can: ['Account information', 'Transactions', 'Balances'],
      cannot: ['Transfer money', 'Withdraw money', 'Move money', 'Make purchases'],
    },
    security: [
      'Bank password isn’t stored by Find Money',
      'OAuth / provider tokens only — never raw bank credentials',
      'Plaid access tokens encrypted at rest (AES-256-GCM)',
      'TLS in transit',
      'Sessions expire automatically',
      'Read-only financial access',
      'Delete your data anytime',
    ],
    minimization:
      'We store merchant, amount, date, category, and ids needed by detectors — not bank passwords or extra Plaid fields.',
  });
});
