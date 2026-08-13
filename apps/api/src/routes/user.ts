import { Router } from 'express';
import { store } from '../services/store';

export const userRouter = Router();

userRouter.get('/me', (_req, res) => {
  res.json({
    user: store.user,
    summary: store.moneySummary(),
    connections: store.connections,
  });
});

userRouter.get('/history', (_req, res) => {
  const recovered = store.opportunities.filter((o) => o.status === 'recovered');
  const pending = store.opportunities.filter((o) =>
    ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
  );
  const ignored = store.opportunities.filter((o) => o.status === 'ignored');
  const summary = store.moneySummary();

  res.json({
    summary,
    recovered,
    pending,
    ignored,
    actions: store.actions,
  });
});

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
      'Encrypted data in transit (TLS) and at rest',
      'Read-only financial access for MVP',
      'Delete your data anytime',
    ],
  });
});
