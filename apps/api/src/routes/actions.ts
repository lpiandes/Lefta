import { Router } from 'express';
import { approveAction, markRecovered, planAction } from '../services/actionService';
import { store } from '../services/store';

export const actionsRouter = Router();

actionsRouter.get('/', (_req, res) => {
  res.json({ actions: store.actions });
});

actionsRouter.post('/:opportunityId/plan', (req, res) => {
  try {
    const action = planAction(req.params.opportunityId);
    res.json({ action });
  } catch {
    res.status(404).json({ error: 'Opportunity not found' });
  }
});

actionsRouter.post('/:opportunityId/approve', (req, res) => {
  try {
    const action = approveAction(req.params.opportunityId);
    res.json({
      action,
      message: 'Request submitted. Tracking merchant / institution response.',
    });
  } catch {
    res.status(404).json({ error: 'Opportunity not found' });
  }
});

/** Demo-only: simulate merchant confirming recovery */
actionsRouter.post('/:opportunityId/complete', (req, res) => {
  try {
    const action = markRecovered(req.params.opportunityId);
    const remaining = store.moneySummary();
    res.json({
      action,
      remainingFound: Math.max(0, remaining.totalFound - remaining.recovered),
    });
  } catch {
    res.status(404).json({ error: 'Opportunity not found' });
  }
});
