import { findRecurringGroups } from './recurring';
import type { Detector, OpportunityCandidate } from './types';

const DAYS_INACTIVE_THRESHOLD = 90;

/**
 * Unused subscriptions: recurring charge + stale usage signal (or long-running
 * entertainment/fitness merchants with no positive engagement metadata).
 */
export const detectSubscriptionInactivity: Detector = ({ transactions, now }) => {
  const candidates: OpportunityCandidate[] = [];
  const groups = findRecurringGroups(transactions);

  for (const group of groups) {
    const latest = group[group.length - 1];
    const name = latest.merchantName.toLowerCase();
    const isTarget =
      name.includes('spotify') ||
      name.includes('gym') ||
      name.includes('fitlife') ||
      name.includes('netflix') ||
      name.includes('hulu');

    if (!isTarget || group.length < 3) continue;

    let inactiveDays = 0;
    const lastCheckIn = latest.metadata?.lastCheckIn ?? group.find((g) => g.metadata?.lastCheckIn)
      ?.metadata?.lastCheckIn;

    if (lastCheckIn) {
      inactiveDays = Math.floor(
        (now.getTime() - new Date(lastCheckIn).getTime()) / (1000 * 60 * 60 * 24),
      );
    } else if (name.includes('spotify') || name.includes('netflix') || name.includes('hulu')) {
      // Demo heuristic: entertainment subs without usage enrichment still surface
      // after 3+ months of charges — presented as "probably not using".
      inactiveDays = 120;
    }

    if (inactiveDays < DAYS_INACTIVE_THRESHOLD) continue;

    const months = Math.max(1, Math.round(inactiveDays / 30));

    candidates.push({
      detectorId: 'subscription_inactivity',
      category: 'save',
      title: 'Unused subscription',
      summary: `You haven’t had a detected usage signal for ${latest.merchantName} in about ${months} months.`,
      whyFlagged:
        'This merchant bills on a recurring cadence, but we don’t see recent activity that suggests you’re using it.',
      potentialValue: latest.amount,
      confidence: lastCheckIn ? 'high' : 'medium',
      effort: 'low',
      merchantName: latest.merchantName,
      relatedTransactionIds: group.map((t) => t.id),
      evidence: [
        { label: 'Merchant', value: latest.merchantName },
        { label: 'Monthly charge', value: `$${latest.amount.toFixed(2)}` },
        { label: 'Inactive roughly', value: `${months} months` },
        { label: 'Last charge', value: latest.date },
      ],
      actionMode: 'assisted',
    });
  }

  return candidates;
};
