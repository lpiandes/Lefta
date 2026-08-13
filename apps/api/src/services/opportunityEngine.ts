import type { ScanResult } from '@find-money/shared';
import { getScanStepsTemplate, runOpportunityEngine } from '@find-money/shared';
import { store } from './store';

export { getScanStepsTemplate, runOpportunityEngine };

export function scanConnectedAccounts(): ScanResult {
  if (store.transactions.length === 0) {
    store.connectDemoBank();
  }

  const opportunities = runOpportunityEngine({
    userId: store.user.id,
    transactions: store.transactions,
  });

  store.opportunities = opportunities;
  store.scanComplete = true;

  const potentialValue =
    Math.round(opportunities.reduce((s, o) => s + o.potentialValue, 0) * 100) / 100;

  const steps = getScanStepsTemplate().map((s) => ({ ...s, done: true }));

  return {
    transactionCount: store.transactions.length,
    opportunityCount: opportunities.length,
    potentialValue,
    opportunities,
    steps,
  };
}
