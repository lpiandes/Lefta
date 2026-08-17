import type { ScanResult } from '@find-money/shared';
import { getScanStepsTemplate, runOpportunityEngine } from '@find-money/shared';
import { getStore } from '../db/store';
import { decryptSecret } from '../lib/crypto';
import { fetchTransactions, plaidConfigured } from './plaidService';

export { getScanStepsTemplate, runOpportunityEngine };

async function syncPlaidTransactions(userId: string): Promise<void> {
  if (!plaidConfigured()) return;
  const db = await getStore();
  const connections = await db.listConnections(userId);
  for (const connection of connections) {
    if (connection.provider !== 'plaid' || connection.status !== 'active') continue;
    const encrypted = await db.getAccessTokenEncrypted(userId, connection.id);
    if (!encrypted) continue;
    const accessToken = decryptSecret(encrypted);
    const accounts = (await db.listAccounts(userId)).filter((a) => a.connectionId === connection.id);
    const txns = await fetchTransactions(accessToken, new Set(accounts.map((a) => a.id)));
    await db.replaceTransactionsForConnection(userId, connection.id, txns);
  }
}

export async function scanConnectedAccounts(userId: string): Promise<ScanResult> {
  const db = await getStore();
  await syncPlaidTransactions(userId);

  const transactions = await db.listTransactions(userId);
  const found = runOpportunityEngine({ userId, transactions });
  await db.saveOpportunities(userId, found);
  await db.markScanComplete(userId, true);
  await db.writeAudit(userId, 'scan.run', { transactionCount: transactions.length, found: found.length });

  const opportunities = await db.listOpportunities(userId);
  const potentialValue =
    Math.round(
      opportunities
        .filter((o) => !['recovered', 'ignored'].includes(o.status))
        .reduce((s, o) => s + o.potentialValue, 0) * 100,
    ) / 100;

  return {
    transactionCount: transactions.length,
    opportunityCount: opportunities.filter((o) => !['recovered', 'ignored'].includes(o.status)).length,
    potentialValue,
    opportunities,
    steps: getScanStepsTemplate().map((s) => ({ ...s, done: true })),
  };
}
