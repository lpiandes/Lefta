import { Router } from 'express';
import { z } from 'zod';
import { getStore } from '../db/store';
import { decryptSecret } from '../lib/crypto';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, userIdOf } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { connectPlaidItem } from '../services/accountConnectService';
import { createLinkToken, plaidConfigured, removeItem } from '../services/plaidService';
import { loadConfig } from '../lib/config';
import { AppError } from '../lib/errors';

export const accountsRouter = Router();
accountsRouter.use(requireAuth);

const exchangeSchema = z.object({
  publicToken: z.string().min(1),
  institutionName: z.string().min(1).max(120).optional(),
  institutionId: z.string().min(1).max(64).optional(),
});

async function revokePlaidItem(userId: string, connectionId: string): Promise<void> {
  const db = await getStore();
  const encrypted = await db.getAccessTokenEncrypted(userId, connectionId);
  if (!encrypted || !plaidConfigured()) return;
  try {
    await removeItem(decryptSecret(encrypted));
  } catch {
    // Local data is still removed even if the provider call fails.
  }
}

accountsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    res.json({
      connections: await db.listConnections(userId),
      accounts: await db.listAccounts(userId),
      plaidConfigured: plaidConfigured(),
    });
  }),
);

accountsRouter.get('/plaid/status', (_req, res) => {
  const configured = plaidConfigured();
  res.json({
    configured,
    env: configured ? loadConfig().plaidEnv : null,
    products: configured ? ['transactions'] : [],
    access: 'read-only',
  });
});

accountsRouter.post(
  '/plaid/link-token',
  asyncHandler(async (req, res) => {
    const linkToken = await createLinkToken(userIdOf(req));
    res.json({ linkToken });
  }),
);

accountsRouter.post(
  '/plaid/exchange',
  validateBody(exchangeSchema),
  asyncHandler(async (req, res) => {
    const result = await connectPlaidItem({
      userId: userIdOf(req),
      publicToken: req.body.publicToken,
      institutionName: req.body.institutionName,
      institutionId: req.body.institutionId,
    });
    res.json(result);
  }),
);

accountsRouter.post(
  '/disconnect/:connectionId',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const connectionId = req.params.connectionId;
    if (!connectionId) throw new AppError('connectionId required', 400, 'VALIDATION');
    await revokePlaidItem(userId, connectionId);
    const db = await getStore();
    await db.disconnect(userId, connectionId);
    await db.writeAudit(userId, 'account.disconnect', { connectionId });
    res.json({ ok: true });
  }),
);

accountsRouter.delete(
  '/data',
  asyncHandler(async (req, res) => {
    const userId = userIdOf(req);
    const db = await getStore();
    const connections = await db.listConnections(userId);
    for (const connection of connections) {
      await revokePlaidItem(userId, connection.id);
    }
    await db.writeAudit(userId, 'data.delete', {});
    await db.deleteAllUserData(userId);
    res.json({ ok: true, message: 'Account and financial data deleted.' });
  }),
);
