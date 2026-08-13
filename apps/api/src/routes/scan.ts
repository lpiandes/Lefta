import { Router } from 'express';
import { getScanStepsTemplate, scanConnectedAccounts } from '../services/opportunityEngine';

export const scanRouter = Router();

scanRouter.get('/steps', (_req, res) => {
  res.json({ steps: getScanStepsTemplate() });
});

scanRouter.post('/', (_req, res) => {
  const result = scanConnectedAccounts();
  res.json(result);
});
