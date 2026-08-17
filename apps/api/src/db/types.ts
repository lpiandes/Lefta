import type {
  Account,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  Transaction,
  User,
} from '@find-money/shared';

export type StoredUser = User & { passwordHash: string };

export type RefreshSession = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: string;
  revokedAt?: string;
};

export interface DataStore {
  createUser(input: { email: string; name: string; passwordHash: string }): Promise<StoredUser>;
  findUserByEmail(email: string): Promise<StoredUser | undefined>;
  findUserById(id: string): Promise<StoredUser | undefined>;

  listConnections(userId: string): Promise<FinancialConnection[]>;
  createConnection(
    userId: string,
    connection: FinancialConnection,
    accessTokenEncrypted?: string,
  ): Promise<FinancialConnection>;
  getAccessTokenEncrypted(userId: string, connectionId: string): Promise<string | undefined>;
  disconnect(userId: string, connectionId: string): Promise<void>;

  replaceAccounts(userId: string, connectionId: string, accounts: Account[]): Promise<void>;
  listAccounts(userId: string): Promise<Account[]>;

  replaceTransactionsForConnection(
    userId: string,
    connectionId: string,
    transactions: Transaction[],
  ): Promise<void>;
  seedTransactions(userId: string, transactions: Transaction[]): Promise<void>;
  listTransactions(userId: string): Promise<Transaction[]>;

  listOpportunities(userId: string): Promise<Opportunity[]>;
  getOpportunity(userId: string, id: string): Promise<Opportunity | undefined>;
  saveOpportunities(userId: string, opportunities: Opportunity[]): Promise<void>;
  updateOpportunity(userId: string, opportunity: Opportunity): Promise<void>;

  listActions(userId: string): Promise<RecoveryAction[]>;
  getActionByOpportunity(userId: string, opportunityId: string): Promise<RecoveryAction | undefined>;
  saveAction(userId: string, action: RecoveryAction): Promise<void>;

  moneySummary(userId: string): Promise<MoneySummary>;
  deleteAllUserData(userId: string): Promise<void>;
  writeAudit(userId: string, event: string, metadata?: Record<string, unknown>): Promise<void>;
  markScanComplete(userId: string, complete: boolean): Promise<void>;
  isScanComplete(userId: string): Promise<boolean>;

  createRefreshSession(session: RefreshSession): Promise<void>;
  findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | undefined>;
  revokeRefreshSession(id: string): Promise<void>;
  revokeRefreshSessionsForUser(userId: string): Promise<void>;
}
