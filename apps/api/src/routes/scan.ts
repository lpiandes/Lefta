import { Router } from 'express';
import { getScanStepsTemplate, scanConnectedAccounts } from '../services/opportunityEngine';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';

export const scanRouter = Router();
scanRouter.use(requireAuth);

scanRouter.get('/steps', (_req, res) => {
  res.json({ steps: getScanStepsTemplate() });
});

scanRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const result = await scanConnectedAccounts(userIdOf(req));
    res.json(result);
  }),
);
