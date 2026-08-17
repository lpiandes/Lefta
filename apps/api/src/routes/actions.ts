import { Router } from 'express';
import { z } from 'zod';
import { approveAction, planAction, verifyRecovery } from '../services/actionService';
import { getStore } from '../db/store';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { markIntentPaid } from '../services/stripeService';
import { AppError } from '../lib/errors';

export const actionsRouter = Router();
actionsRouter.use(requireAuth);

const planSchema = z.object({
  selfServe: z.boolean().optional(),
});

const verifySchema = z.object({
  recoveredAmount: z.number().positive().optional(),
});

actionsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const db = await getStore();
    res.json({ actions: await db.listActions(userIdOf(req)) });
  }),
);

actionsRouter.post(
  '/:opportunityId/plan',
  validateBody(planSchema),
  asyncHandler(async (req, res) => {
    const action = await planAction(userIdOf(req), req.params.opportunityId, Boolean(req.body?.selfServe));
    res.json({ action });
  }),
);

actionsRouter.post(
  '/:opportunityId/approve',
  asyncHandler(async (req, res) => {
    const action = await approveAction(userIdOf(req), req.params.opportunityId);
    res.json({
      action,
      message:
        'Assisted request submitted. Find Money will not mark this recovered until cash is verified.',
    });
  }),
);

actionsRouter.post(
  '/:opportunityId/verify',
  validateBody(verifySchema),
  asyncHandler(async (req, res) => {
    const { action, stripeClientSecret, stripeCheckoutUrl } = await verifyRecovery(
      userIdOf(req),
      req.params.opportunityId,
      req.body?.recoveredAmount,
    );
    const db = await getStore();
    const remaining = await db.moneySummary(userIdOf(req));
    res.json({
      action,
      stripeClientSecret,
      stripeCheckoutUrl,
      remainingFound: Math.max(0, remaining.totalFound - remaining.recovered),
    });
  }),
);

actionsRouter.post(
  '/:opportunityId/fee/refresh',
  asyncHandler(async (req, res) => {
    const db = await getStore();
    const action = await db.getActionByOpportunity(userIdOf(req), req.params.opportunityId);
    if (!action) throw new AppError('Action not found', 404, 'NOT_FOUND');
    if (action.stripePaymentIntentId && (await markIntentPaid(action.stripePaymentIntentId))) {
      action.feeStatus = 'paid';
      await db.saveAction(userIdOf(req), action);
    }
    res.json({ action });
  }),
);
