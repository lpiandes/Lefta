import type {
  Account,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  Transaction,
  User,
} from '@find-money/shared';
import {
  DEMO_ACCOUNTS,
  DEMO_CONNECTION,
  DEMO_USER,
  buildDemoTransactions,
} from '@find-money/shared';

/**
 * In-memory store for the MVP demo.
 * Swap for Postgres + repositories without changing route shapes.
 */
class AppStore {
  user: User = { ...DEMO_USER };
  connections: FinancialConnection[] = [];
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  opportunities: Opportunity[] = [];
  actions: RecoveryAction[] = [];
  scanComplete = false;

  resetDemo(): void {
    this.user = { ...DEMO_USER };
    this.connections = [];
    this.accounts = [];
    this.transactions = [];
    this.opportunities = [];
    this.actions = [];
    this.scanComplete = false;
  }

  connectDemoBank(): FinancialConnection {
    this.connections = [{ ...DEMO_CONNECTION, connectedAt: new Date().toISOString() }];
    this.accounts = DEMO_ACCOUNTS.map((a) => ({ ...a }));
    this.transactions = buildDemoTransactions();
    return this.connections[0];
  }

  moneySummary(): MoneySummary {
    const active = this.opportunities.filter((o) => o.status !== 'ignored');
    const recovered = this.opportunities
      .filter((o) => o.status === 'recovered')
      .reduce((s, o) => s + o.potentialValue, 0);
    const pending = this.opportunities
      .filter((o) =>
        ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
      )
      .reduce((s, o) => s + o.potentialValue, 0);
    const ignored = this.opportunities
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
}

export const store = new AppStore();
