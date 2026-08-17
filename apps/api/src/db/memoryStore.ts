import type {
  Account,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  Transaction,
} from '@find-money/shared';
import { createId } from '../lib/ids';
import type { DataStore, RefreshSession, StoredUser } from './types';

interface UserBucket {
  user: StoredUser;
  connections: FinancialConnection[];
  accessTokens: Map<string, string>;
  accounts: Account[];
  transactions: Transaction[];
  opportunities: Opportunity[];
  actions: RecoveryAction[];
  scanComplete: boolean;
}

function emptySummary(): MoneySummary {
  return { totalFound: 0, opportunityCount: 0, recovered: 0, pending: 0, ignored: 0 };
}

export function computeMoneySummary(opportunities: Opportunity[]): MoneySummary {
  const active = opportunities.filter((o) => o.status !== 'ignored');
  const recovered = opportunities
    .filter((o) => o.status === 'recovered')
    .reduce((s, o) => s + (o.potentialValue ?? 0), 0);
  const pending = opportunities
    .filter((o) =>
      ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
    )
    .reduce((s, o) => s + o.potentialValue, 0);
  const ignored = opportunities
    .filter((o) => o.status === 'ignored')
    .reduce((s, o) => s + o.potentialValue, 0);
  const found = active
    .filter((o) => o.status !== 'recovered')
    .reduce((s, o) => s + o.potentialValue, 0);

  return {
    totalFound: Math.round((found + recovered) * 100) / 100,
    opportunityCount: active.filter((o) => !['recovered', 'ignored'].includes(o.status)).length,
    recovered: Math.round(recovered * 100) / 100,
    pending: Math.round(pending * 100) / 100,
    ignored: Math.round(ignored * 100) / 100,
  };
}

export class MemoryStore implements DataStore {
  private users = new Map<string, UserBucket>();
  private byEmail = new Map<string, string>();
  private refreshSessions = new Map<string, RefreshSession>();
  readonly audits: { userId: string; event: string; metadata?: Record<string, unknown> }[] = [];

  private bucket(userId: string): UserBucket {
    const b = this.users.get(userId);
    if (!b) throw new Error('User not found');
    return b;
  }

  async createUser(input: { email: string; name: string; passwordHash: string }): Promise<StoredUser> {
    const email = input.email.trim().toLowerCase();
    if (this.byEmail.has(email)) throw new Error('Email already registered');
    const user: StoredUser = {
      id: createId('user'),
      email,
      name: input.name.trim(),
      passwordHash: input.passwordHash,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, {
      user,
      connections: [],
      accessTokens: new Map(),
      accounts: [],
      transactions: [],
      opportunities: [],
      actions: [],
      scanComplete: false,
    });
    this.byEmail.set(email, user.id);
    return user;
  }

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    const id = this.byEmail.get(email.trim().toLowerCase());
    return id ? this.users.get(id)?.user : undefined;
  }

  async findUserById(id: string): Promise<StoredUser | undefined> {
    return this.users.get(id)?.user;
  }

  async listConnections(userId: string): Promise<FinancialConnection[]> {
    return [...this.bucket(userId).connections];
  }

  async createConnection(
    userId: string,
    connection: FinancialConnection,
    accessTokenEncrypted?: string,
  ): Promise<FinancialConnection> {
    const b = this.bucket(userId);
    b.connections.push(connection);
    if (accessTokenEncrypted) b.accessTokens.set(connection.id, accessTokenEncrypted);
    return connection;
  }

  async getAccessTokenEncrypted(userId: string, connectionId: string): Promise<string | undefined> {
    return this.bucket(userId).accessTokens.get(connectionId);
  }

  async disconnect(userId: string, connectionId: string): Promise<void> {
    const b = this.bucket(userId);
    const accountIds = new Set(b.accounts.filter((a) => a.connectionId === connectionId).map((a) => a.id));
    b.connections = b.connections.filter((c) => c.id !== connectionId);
    b.accounts = b.accounts.filter((a) => a.connectionId !== connectionId);
    b.transactions = b.transactions.filter((t) => !accountIds.has(t.accountId));
    b.accessTokens.delete(connectionId);
  }

  async replaceAccounts(userId: string, connectionId: string, accounts: Account[]): Promise<void> {
    const b = this.bucket(userId);
    b.accounts = [...b.accounts.filter((a) => a.connectionId !== connectionId), ...accounts];
  }

  async listAccounts(userId: string): Promise<Account[]> {
    return [...this.bucket(userId).accounts];
  }

  async replaceTransactionsForConnection(
    userId: string,
    connectionId: string,
    transactions: Transaction[],
  ): Promise<void> {
    const b = this.bucket(userId);
    const accountIds = new Set(b.accounts.filter((a) => a.connectionId === connectionId).map((a) => a.id));
    b.transactions = [...b.transactions.filter((t) => !accountIds.has(t.accountId)), ...transactions];
  }

  async seedTransactions(userId: string, transactions: Transaction[]): Promise<void> {
    this.bucket(userId).transactions = [...transactions];
  }

  async listTransactions(userId: string): Promise<Transaction[]> {
    return [...this.bucket(userId).transactions];
  }

  async listOpportunities(userId: string): Promise<Opportunity[]> {
    return [...this.bucket(userId).opportunities];
  }

  async getOpportunity(userId: string, id: string): Promise<Opportunity | undefined> {
    return this.bucket(userId).opportunities.find((o) => o.id === id);
  }

  async saveOpportunities(userId: string, opportunities: Opportunity[]): Promise<void> {
    const b = this.bucket(userId);
    const kept = b.opportunities.filter((o) => !['new', 'reviewed'].includes(o.status));
    const keptKeys = new Set(kept.map((o) => `${o.detectorId}:${o.merchantName}:${o.potentialValue}`));
    const fresh = opportunities.filter(
      (o) => !keptKeys.has(`${o.detectorId}:${o.merchantName}:${o.potentialValue}`),
    );
    b.opportunities = [...kept, ...fresh];
  }

  async updateOpportunity(userId: string, opportunity: Opportunity): Promise<void> {
    const b = this.bucket(userId);
    b.opportunities = b.opportunities.map((o) => (o.id === opportunity.id ? opportunity : o));
  }

  async listActions(userId: string): Promise<RecoveryAction[]> {
    return [...this.bucket(userId).actions];
  }

  async getActionByOpportunity(userId: string, opportunityId: string): Promise<RecoveryAction | undefined> {
    return this.bucket(userId).actions.find((a) => a.opportunityId === opportunityId);
  }

  async saveAction(userId: string, action: RecoveryAction): Promise<void> {
    const b = this.bucket(userId);
    const idx = b.actions.findIndex((a) => a.opportunityId === action.opportunityId);
    if (idx >= 0) b.actions[idx] = action;
    else b.actions.push(action);
  }

  async moneySummary(userId: string): Promise<MoneySummary> {
    if (!this.users.has(userId)) return emptySummary();
    return computeMoneySummary(this.bucket(userId).opportunities);
  }

  async deleteAllUserData(userId: string): Promise<void> {
    const user = this.users.get(userId)?.user;
    this.users.delete(userId);
    if (user) this.byEmail.delete(user.email);
    for (const [id, session] of this.refreshSessions) {
      if (session.userId === userId) this.refreshSessions.delete(id);
    }
  }

  async writeAudit(userId: string, event: string, metadata?: Record<string, unknown>): Promise<void> {
    this.audits.push({ userId, event, metadata });
  }

  async markScanComplete(userId: string, complete: boolean): Promise<void> {
    this.bucket(userId).scanComplete = complete;
  }

  async isScanComplete(userId: string): Promise<boolean> {
    return this.bucket(userId).scanComplete;
  }

  async createRefreshSession(session: RefreshSession): Promise<void> {
    this.refreshSessions.set(session.id, session);
  }

  async findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | undefined> {
    return [...this.refreshSessions.values()].find((session) => session.tokenHash === tokenHash);
  }

  async revokeRefreshSession(id: string): Promise<void> {
    const session = this.refreshSessions.get(id);
    if (session) session.revokedAt = new Date().toISOString();
  }

  async revokeRefreshSessionsForUser(userId: string): Promise<void> {
    const now = new Date().toISOString();
    for (const session of this.refreshSessions.values()) {
      if (session.userId === userId) session.revokedAt = now;
    }
  }
}
