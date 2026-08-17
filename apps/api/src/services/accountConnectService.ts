import { getStore } from '../db/store';
import { encryptSecret } from '../lib/crypto';
import { AppError } from '../lib/errors';
import { createId } from '../lib/ids';
import {
  exchangePublicToken,
  fetchAccounts,
  fetchTransactions,
  requirePlaid,
  resolveInstitutionName,
} from './plaidService';

export async function connectPlaidItem(input: {
  userId: string;
  publicToken: string;
  institutionName?: string;
  institutionId?: string;
}) {
  requirePlaid();
  const publicToken = input.publicToken.trim();
  if (!publicToken) {
    throw new AppError('publicToken required', 400, 'VALIDATION');
  }

  const { accessToken, itemId } = await exchangePublicToken(publicToken);
  const fromPlaid = await resolveInstitutionName(input.institutionId);
  const institutionName = (fromPlaid ?? input.institutionName ?? '').trim();
  if (!institutionName) {
    throw new AppError('Plaid did not return an institution name', 502, 'PLAID_INSTITUTION');
  }

  const db = await getStore();
  const connectionId = createId('conn');
  const connection = await db.createConnection(
    input.userId,
    {
      id: connectionId,
      provider: 'plaid',
      institutionName,
      status: 'active',
      providerItemId: itemId,
      connectedAt: new Date().toISOString(),
    },
    encryptSecret(accessToken),
  );

  const accounts = await fetchAccounts(accessToken, connectionId, institutionName);
  const withInstitution = accounts.map((account) => ({ ...account, institutionName }));
  await db.replaceAccounts(input.userId, connectionId, withInstitution);
  const transactions = await fetchTransactions(
    accessToken,
    new Set(withInstitution.map((account) => account.id)),
  );
  await db.replaceTransactionsForConnection(input.userId, connectionId, transactions);
  await db.writeAudit(input.userId, 'account.connect.plaid', { institutionName, itemId });

  return {
    connection,
    accounts: withInstitution,
    transactionCount: transactions.length,
    message: 'Bank connected. Find Money stored a provider token reference, never your bank password.',
  };
}
