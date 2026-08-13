import { Router } from 'express';
import { store } from '../services/store';

export const accountsRouter = Router();

/** List connected financial accounts (read-only product). */
accountsRouter.get('/', (_req, res) => {
  res.json({
    connections: store.connections,
    accounts: store.accounts,
  });
});

/**
 * Start bank connection.
 * Production: create Plaid Link token → client opens Plaid Link →
 * exchange public_token server-side → store provider item id (never bank password).
 */
accountsRouter.post('/connect/bank', (_req, res) => {
  const connection = store.connectDemoBank();
  res.json({
    connection,
    accounts: store.accounts,
    message:
      'Demo bank connected via simulated Plaid Link. Production uses OAuth at the institution.',
    permissions: {
      canAccess: ['Account information', 'Transactions', 'Balances'],
      cannotDo: ['Transfer money', 'Withdraw money', 'Move money', 'Make purchases'],
    },
  });
});

accountsRouter.post('/disconnect/:connectionId', (req, res) => {
  const { connectionId } = req.params;
  store.connections = store.connections.filter((c) => c.id !== connectionId);
  store.accounts = store.accounts.filter((a) => a.connectionId !== connectionId);
  res.json({ ok: true });
});

accountsRouter.delete('/data', (_req, res) => {
  store.resetDemo();
  res.json({ ok: true, message: 'User financial data deleted.' });
});
