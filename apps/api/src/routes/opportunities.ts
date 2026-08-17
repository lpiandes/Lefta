import { Router } from 'express';
import type { CategoryFilter } from '@find-money/shared';
import { ignoreOpportunity } from '../services/actionService';
import { getStore } from '../db/store';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';
import { AppError } from '../lib/errors';

export const opportunitiesRouter = Router();
opportunitiesRouter.use(requireAuth);

opportunitiesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const filter = (req.query.category as CategoryFilter | undefined) ?? 'all';
    let list = await db.listOpportunities(userId);
    if (filter !== 'all') list = list.filter((o) => o.category === filter);
    res.json({ summary: await db.moneySummary(userId), opportunities: list });
  }),
);

opportunitiesRouter.get(
  '/expiring',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const list = (await db.listOpportunities(userId))
      .filter((o) => o.expiresAt && !['recovered', 'ignored'].includes(o.status))
      .sort((a, b) => (a.expiresAt! > b.expiresAt! ? 1 : -1));
    res.json({ opportunities: list });
  }),
);

opportunitiesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const opportunity = await db.getOpportunity(userId, req.params.id);
    if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');
    const related = (await db.listTransactions(userId)).filter((t) =>
      opportunity.relatedTransactionIds.includes(t.id),
    );
    const action = await db.getActionByOpportunity(userId, opportunity.id);
    res.json({ opportunity, relatedTransactions: related, action });
  }),
);

opportunitiesRouter.post(
  '/:id/ignore',
  asyncHandler(async (req, res) => {
    const opportunity = await ignoreOpportunity(userIdOf(req), req.params.id);
    res.json({ opportunity });
  }),
);
