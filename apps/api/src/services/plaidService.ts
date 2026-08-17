import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from 'plaid';
import type { Account, Transaction } from '@find-money/shared';
import { loadConfig, plaidIsConfigured } from '../lib/config';
import { isoDateOnly, daysAgoDate } from '../lib/duration';
import { AppError } from '../lib/errors';

export function plaidConfigured(): boolean {
  return plaidIsConfigured();
}

export function requirePlaid(): void {
  if (!plaidConfigured()) {
    throw new AppError(
      'Bank connect requires Plaid. Set PLAID_CLIENT_ID, PLAID_SECRET, and PLAID_ENV.',
      501,
      'PLAID_NOT_CONFIGURED',
    );
  }
}

function client(): PlaidApi {
  const config = loadConfig();
  requirePlaid();
  const basePath =
    config.plaidEnv === 'production'
      ? PlaidEnvironments.production
      : config.plaidEnv === 'development'
        ? PlaidEnvironments.development
        : PlaidEnvironments.sandbox;

  return new PlaidApi(
    new Configuration({
      basePath,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': config.plaidClientId,
          'PLAID-SECRET': config.plaidSecret,
        },
      },
    }),
  );
}

export async function createLinkToken(userId: string): Promise<string> {
  const response = await client().linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Find Money',
    products: [Products.Transactions],
    country_codes: [CountryCode.Us],
    language: 'en',
  });
  return response.data.link_token;
}

export async function exchangePublicToken(publicToken: string): Promise<{
  accessToken: string;
  itemId: string;
}> {
  const response = await client().itemPublicTokenExchange({ public_token: publicToken });
  return {
    accessToken: response.data.access_token,
    itemId: response.data.item_id,
  };
}

export async function resolveInstitutionName(institutionId: string | null | undefined): Promise<string | undefined> {
  if (!institutionId) return undefined;
  try {
    const response = await client().institutionsGetById({
      institution_id: institutionId,
      country_codes: [CountryCode.Us],
    });
    return response.data.institution.name;
  } catch {
    return undefined;
  }
}

export async function fetchAccounts(
  accessToken: string,
  connectionId: string,
  fallbackInstitutionName?: string,
): Promise<Account[]> {
  const response = await client().accountsGet({ access_token: accessToken });
  const institutionName =
    (await resolveInstitutionName(response.data.item.institution_id)) ?? fallbackInstitutionName;
  if (!institutionName) {
    throw new AppError('Plaid did not return an institution for this connection', 502, 'PLAID_INSTITUTION');
  }

  return response.data.accounts.map((account) => ({
    id: account.account_id,
    connectionId,
    institutionName,
    name: account.name,
    type: account.type === 'credit' ? 'credit' : account.type === 'depository' ? 'depository' : 'other',
    mask: account.mask ?? '',
    currentBalance: account.balances.current ?? undefined,
  }));
}

export async function fetchTransactions(accessToken: string, accountIds: Set<string>): Promise<Transaction[]> {
  const days = loadConfig().plaidTransactionDays;
  const end = new Date();
  const start = daysAgoDate(days, end);

  const response = await client().transactionsGet({
    access_token: accessToken,
    start_date: isoDateOnly(start),
    end_date: isoDateOnly(end),
    options: { count: 500, offset: 0 },
  });

  return response.data.transactions
    .filter((txn) => accountIds.has(txn.account_id))
    .map((txn) => ({
      id: txn.transaction_id,
      accountId: txn.account_id,
      merchantName: txn.merchant_name || txn.name,
      amount: txn.amount,
      date: txn.date,
      category: txn.personal_finance_category?.primary ?? txn.category?.[0] ?? 'Other',
      pending: txn.pending,
    }));
}

export async function removeItem(accessToken: string): Promise<void> {
  await client().itemRemove({ access_token: accessToken });
}
