import type {
  Account,
  ActionMode,
  ActionStep,
  ConfidenceLevel,
  DetectorId,
  EffortLevel,
  FeeStatus,
  FinancialConnection,
  Opportunity,
  OpportunityCategoryId,
  OpportunityStatus,
  RecoveryAction,
  Transaction,
} from '@find-money/shared';
import { PrismaClient, Prisma } from '@prisma/client';
import { createId } from '../lib/ids';
import { computeMoneySummary } from './memoryStore';
import type { DataStore, RefreshSession, StoredUser } from './types';

let client: PrismaClient | undefined;

export function getPrisma(): PrismaClient {
  if (!client) client = new PrismaClient();
  return client;
}

function toUser(row: {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}): StoredUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt.toISOString(),
  };
}

function toOpportunity(row: {
  id: string;
  userId: string;
  category: string;
  detectorId: string;
  title: string;
  summary: string;
  whyFlagged: string;
  potentialValue: number;
  confidence: string;
  effort: string;
  status: string;
  actionMode: string;
  merchantName: string;
  evidence: unknown;
  relatedTransactionIds: unknown;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: string | null;
}): Opportunity {
  return {
    id: row.id,
    userId: row.userId,
    category: row.category as OpportunityCategoryId,
    detectorId: row.detectorId as DetectorId,
    title: row.title,
    summary: row.summary,
    whyFlagged: row.whyFlagged,
    potentialValue: row.potentialValue,
    confidence: row.confidence as ConfidenceLevel,
    effort: row.effort as EffortLevel,
    status: row.status as OpportunityStatus,
    actionMode: row.actionMode as ActionMode,
    merchantName: row.merchantName,
    evidence: row.evidence as Opportunity['evidence'],
    relatedTransactionIds: row.relatedTransactionIds as string[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    expiresAt: row.expiresAt ?? undefined,
  };
}

function toAction(row: {
  id: string;
  opportunityId: string;
  mode: string;
  status: string;
  steps: unknown;
  sharedInfo: unknown;
  guidance: unknown;
  submittedAt: Date | null;
  recoveredAt: Date | null;
  recoveredAmount: number | null;
  feeAmount: number | null;
  feeStatus: string;
  stripePaymentIntentId: string | null;
  stripeCheckoutUrl: string | null;
  notes: string | null;
}): RecoveryAction {
  return {
    id: row.id,
    opportunityId: row.opportunityId,
    mode: row.mode as RecoveryAction['mode'],
    status: row.status as OpportunityStatus,
    steps: row.steps as ActionStep[],
    sharedInfo: row.sharedInfo as string[],
    guidance: (row.guidance as string[] | null) ?? undefined,
    submittedAt: row.submittedAt?.toISOString(),
    recoveredAt: row.recoveredAt?.toISOString(),
    recoveredAmount: row.recoveredAmount ?? undefined,
    feeAmount: row.feeAmount ?? undefined,
    feeStatus: row.feeStatus as FeeStatus,
    stripePaymentIntentId: row.stripePaymentIntentId ?? undefined,
    stripeCheckoutUrl: row.stripeCheckoutUrl ?? undefined,
    notes: row.notes ?? undefined,
    disputeDraft: row.notes ?? undefined,
  };
}

function jsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export class PrismaStore implements DataStore {
  private prisma = getPrisma();

  async createUser(input: { email: string; name: string; passwordHash: string }): Promise<StoredUser> {
    const row = await this.prisma.user.create({
      data: {
        id: createId('user'),
        email: input.email.trim().toLowerCase(),
        name: input.name.trim(),
        passwordHash: input.passwordHash,
      },
    });
    return toUser(row);
  }

  async findUserByEmail(email: string): Promise<StoredUser | undefined> {
    const row = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    return row ? toUser(row) : undefined;
  }

  async findUserById(id: string): Promise<StoredUser | undefined> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? toUser(row) : undefined;
  }

  async listConnections(userId: string): Promise<FinancialConnection[]> {
    const rows = await this.prisma.financialConnection.findMany({ where: { userId } });
    return rows.map((c) => ({
      id: c.id,
      provider: c.provider as FinancialConnection['provider'],
      institutionName: c.institutionName,
      status: c.status as FinancialConnection['status'],
      providerItemId: c.providerItemId,
      connectedAt: c.connectedAt.toISOString(),
    }));
  }

  async createConnection(
    userId: string,
    connection: FinancialConnection,
    accessTokenEncrypted?: string,
  ): Promise<FinancialConnection> {
    await this.prisma.financialConnection.create({
      data: {
        id: connection.id,
        userId,
        provider: connection.provider,
        institutionName: connection.institutionName,
        status: connection.status,
        providerItemId: connection.providerItemId,
        accessTokenEncrypted: accessTokenEncrypted ?? null,
        connectedAt: new Date(connection.connectedAt),
      },
    });
    return connection;
  }

  async getAccessTokenEncrypted(userId: string, connectionId: string): Promise<string | undefined> {
    const row = await this.prisma.financialConnection.findFirst({
      where: { id: connectionId, userId },
    });
    return row?.accessTokenEncrypted ?? undefined;
  }

  async disconnect(userId: string, connectionId: string): Promise<void> {
    await this.prisma.financialConnection.deleteMany({ where: { id: connectionId, userId } });
  }

  async replaceAccounts(userId: string, connectionId: string, accounts: Account[]): Promise<void> {
    await this.prisma.account.deleteMany({ where: { userId, connectionId } });
    if (accounts.length === 0) return;
    await this.prisma.account.createMany({
      data: accounts.map((a) => ({
        id: a.id,
        userId,
        connectionId,
        institutionName: a.institutionName,
        name: a.name,
        type: a.type,
        mask: a.mask,
        currentBalance: a.currentBalance,
      })),
    });
  }

  async listAccounts(userId: string): Promise<Account[]> {
    const rows = await this.prisma.account.findMany({ where: { userId } });
    return rows.map((a) => ({
      id: a.id,
      connectionId: a.connectionId,
      institutionName: a.institutionName,
      name: a.name,
      type: a.type as Account['type'],
      mask: a.mask,
      currentBalance: a.currentBalance ?? undefined,
    }));
  }

  async replaceTransactionsForConnection(
    userId: string,
    connectionId: string,
    transactions: Transaction[],
  ): Promise<void> {
    const accounts = await this.prisma.account.findMany({ where: { userId, connectionId } });
    const ids = accounts.map((a) => a.id);
    await this.prisma.transaction.deleteMany({ where: { userId, accountId: { in: ids } } });
    if (transactions.length === 0) return;
    await this.prisma.transaction.createMany({
      data: transactions.map((t) => ({
        id: t.id,
        userId,
        accountId: t.accountId,
        merchantName: t.merchantName,
        amount: t.amount,
        date: t.date,
        category: t.category,
        pending: t.pending,
        orderNumber: t.orderNumber,
        metadata: t.metadata ? jsonValue(t.metadata) : undefined,
      })),
    });
  }

  async seedTransactions(userId: string, transactions: Transaction[]): Promise<void> {
    await this.prisma.transaction.deleteMany({ where: { userId } });
    if (transactions.length === 0) return;
    await this.prisma.transaction.createMany({
      data: transactions.map((t) => ({
        id: t.id,
        userId,
        accountId: t.accountId,
        merchantName: t.merchantName,
        amount: t.amount,
        date: t.date,
        category: t.category,
        pending: t.pending,
        orderNumber: t.orderNumber,
        metadata: t.metadata ? jsonValue(t.metadata) : undefined,
      })),
    });
  }

  async listTransactions(userId: string): Promise<Transaction[]> {
    const rows = await this.prisma.transaction.findMany({ where: { userId } });
    return rows.map((t) => ({
      id: t.id,
      accountId: t.accountId,
      merchantName: t.merchantName,
      amount: t.amount,
      date: t.date,
      category: t.category,
      pending: t.pending,
      orderNumber: t.orderNumber ?? undefined,
      metadata: (t.metadata as Record<string, string> | null) ?? undefined,
    }));
  }

  async listOpportunities(userId: string): Promise<Opportunity[]> {
    const rows = await this.prisma.opportunity.findMany({ where: { userId } });
    return rows.map(toOpportunity);
  }

  async getOpportunity(userId: string, id: string): Promise<Opportunity | undefined> {
    const row = await this.prisma.opportunity.findFirst({ where: { id, userId } });
    return row ? toOpportunity(row) : undefined;
  }

  async saveOpportunities(userId: string, opportunities: Opportunity[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.opportunity.deleteMany({
        where: {
          userId,
          status: { in: ['new', 'reviewed'] },
        },
      });
      const existing = await tx.opportunity.findMany({ where: { userId } });
      const keptKeys = new Set(existing.map((o) => `${o.detectorId}:${o.merchantName}:${o.potentialValue}`));
      const fresh = opportunities.filter(
        (o) => !keptKeys.has(`${o.detectorId}:${o.merchantName}:${o.potentialValue}`),
      );
      if (fresh.length === 0) return;
      await tx.opportunity.createMany({
        data: fresh.map((o) => ({
          id: o.id,
          userId,
          category: o.category,
          detectorId: o.detectorId,
          title: o.title,
          summary: o.summary,
          whyFlagged: o.whyFlagged,
          potentialValue: o.potentialValue,
          confidence: o.confidence,
          effort: o.effort,
          status: o.status,
          actionMode: o.actionMode,
          merchantName: o.merchantName,
          evidence: jsonValue(o.evidence),
          relatedTransactionIds: jsonValue(o.relatedTransactionIds),
          createdAt: new Date(o.createdAt),
          updatedAt: new Date(o.updatedAt),
          expiresAt: o.expiresAt ?? null,
        })),
      });
    });
  }

  async updateOpportunity(userId: string, opportunity: Opportunity): Promise<void> {
    await this.prisma.opportunity.updateMany({
      where: { id: opportunity.id, userId },
      data: {
        status: opportunity.status,
        updatedAt: new Date(opportunity.updatedAt),
      },
    });
  }

  async listActions(userId: string): Promise<RecoveryAction[]> {
    const rows = await this.prisma.recoveryAction.findMany({ where: { userId } });
    return rows.map(toAction);
  }

  async getActionByOpportunity(userId: string, opportunityId: string): Promise<RecoveryAction | undefined> {
    const row = await this.prisma.recoveryAction.findFirst({ where: { userId, opportunityId } });
    return row ? toAction(row) : undefined;
  }

  async saveAction(userId: string, action: RecoveryAction): Promise<void> {
    await this.prisma.recoveryAction.upsert({
      where: { opportunityId: action.opportunityId },
      create: {
        id: action.id,
        userId,
        opportunityId: action.opportunityId,
        mode: action.mode,
        status: action.status,
        steps: jsonValue(action.steps),
        sharedInfo: jsonValue(action.sharedInfo),
        guidance: action.guidance ? jsonValue(action.guidance) : undefined,
        submittedAt: action.submittedAt ? new Date(action.submittedAt) : null,
        recoveredAt: action.recoveredAt ? new Date(action.recoveredAt) : null,
        recoveredAmount: action.recoveredAmount,
        feeAmount: action.feeAmount,
        feeStatus: action.feeStatus ?? 'none',
        stripePaymentIntentId: action.stripePaymentIntentId,
        stripeCheckoutUrl: action.stripeCheckoutUrl,
        notes: action.disputeDraft ?? action.notes,
      },
      update: {
        mode: action.mode,
        status: action.status,
        steps: jsonValue(action.steps),
        sharedInfo: jsonValue(action.sharedInfo),
        guidance: action.guidance ? jsonValue(action.guidance) : undefined,
        submittedAt: action.submittedAt ? new Date(action.submittedAt) : null,
        recoveredAt: action.recoveredAt ? new Date(action.recoveredAt) : null,
        recoveredAmount: action.recoveredAmount,
        feeAmount: action.feeAmount,
        feeStatus: action.feeStatus ?? 'none',
        stripePaymentIntentId: action.stripePaymentIntentId,
        stripeCheckoutUrl: action.stripeCheckoutUrl,
        notes: action.disputeDraft ?? action.notes,
      },
    });
  }

  async moneySummary(userId: string): Promise<import('@find-money/shared').MoneySummary> {
    const opps = await this.listOpportunities(userId);
    return computeMoneySummary(opps);
  }

  async deleteAllUserData(userId: string): Promise<void> {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  async writeAudit(userId: string, event: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: createId('aud'),
        userId,
        event,
        metadata: metadata ? jsonValue(metadata) : undefined,
      },
    });
  }

  async markScanComplete(userId: string, complete: boolean): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { hasScanned: complete } });
  }

  async isScanComplete(userId: string): Promise<boolean> {
    const row = await this.prisma.user.findUnique({ where: { id: userId }, select: { hasScanned: true } });
    if (row) return row.hasScanned;
    const count = await this.prisma.opportunity.count({ where: { userId } });
    return count > 0;
  }

  async createRefreshSession(session: RefreshSession): Promise<void> {
    await this.prisma.refreshSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        tokenHash: session.tokenHash,
        expiresAt: new Date(session.expiresAt),
      },
    });
  }

  async findRefreshSessionByHash(tokenHash: string): Promise<RefreshSession | undefined> {
    const row = await this.prisma.refreshSession.findUnique({ where: { tokenHash } });
    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt.toISOString(),
      revokedAt: row.revokedAt?.toISOString(),
    };
  }

  async revokeRefreshSession(id: string): Promise<void> {
    await this.prisma.refreshSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeRefreshSessionsForUser(userId: string): Promise<void> {
    await this.prisma.refreshSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
