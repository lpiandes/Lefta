import { Router } from 'express';
import type { CategoryFilter } from '@find-money/shared';
import { ignoreOpportunity } from '../services/actionService';
import { store } from '../services/store';

export const opportunitiesRouter = Router();

opportunitiesRouter.get('/', (req, res) => {
  const filter = (req.query.category as CategoryFilter | undefined) ?? 'all';
  let list = [...store.opportunities];

  if (filter !== 'all') {
    list = list.filter((o) => o.category === filter);
  }

  const summary = store.moneySummary();
  res.json({ summary, opportunities: list });
});

opportunitiesRouter.get('/expiring', (_req, res) => {
  const list = store.opportunities
    .filter((o) => o.expiresAt && !['recovered', 'ignored'].includes(o.status))
    .sort((a, b) => (a.expiresAt! > b.expiresAt! ? 1 : -1));
  res.json({ opportunities: list });
});

opportunitiesRouter.get('/:id', (req, res) => {
  const opportunity = store.opportunities.find((o) => o.id === req.params.id);
  if (!opportunity) {
    res.status(404).json({ error: 'Opportunity not found' });
    return;
  }
  const related = store.transactions.filter((t) =>
    opportunity.relatedTransactionIds.includes(t.id),
  );
  const action = store.actions.find((a) => a.opportunityId === opportunity.id);
  res.json({ opportunity, relatedTransactions: related, action });
});

opportunitiesRouter.post('/:id/ignore', (req, res) => {
  try {
    const opportunity = ignoreOpportunity(req.params.id);
    res.json({ opportunity });
  } catch {
    res.status(404).json({ error: 'Opportunity not found' });
  }
});
