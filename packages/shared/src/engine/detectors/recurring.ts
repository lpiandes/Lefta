import type { Transaction } from '../../types';
import type { Detector, OpportunityCandidate } from './types';

const SUBSCRIPTION_HINTS = [
  'netflix',
  'spotify',
  'hulu',
  'adobe',
  'gym',
  'fitlife',
  'disney',
  'apple.com/bill',
  'icloud',
  'youtube',
  'hbo',
  'paramount',
];

/**
 * Groups merchants with near-monthly similar amounts.
 * Used as input for inactivity + price anomaly detectors.
 */
export function findRecurringGroups(transactions: Transaction[]): Transaction[][] {
  const byMerchant = new Map<string, Transaction[]>();

  for (const txn of transactions) {
    if (txn.amount <= 0) continue;
    const key = txn.merchantName.trim().toLowerCase();
    const list = byMerchant.get(key) ?? [];
    list.push(txn);
    byMerchant.set(key, list);
  }

  const groups: Transaction[][] = [];

  for (const list of byMerchant.values()) {
    if (list.length < 2) continue;
    const sorted = [...list].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const amounts = sorted.map((t) => t.amount);
    const avg = amounts.reduce((s, n) => s + n, 0) / amounts.length;
    const similar = amounts.every((a) => Math.abs(a - avg) / avg < 0.08);
    if (!similar) continue;
    groups.push(sorted);
  }

  return groups;
}

export const detectRecurringSubscriptions: Detector = ({ transactions }) => {
  const candidates: OpportunityCandidate[] = [];
  const groups = findRecurringGroups(transactions);

  for (const group of groups) {
    const latest = group[group.length - 1];
    const name = latest.merchantName.toLowerCase();
    const looksLikeSub =
      SUBSCRIPTION_HINTS.some((h) => name.includes(h)) || group.length >= 3;

    if (!looksLikeSub) continue;

    // Only surface as "save" when we also have inactivity signal elsewhere;
    // here we emit a light recurring notice only for known subscription brands
    // without separate inactivity metadata — gym/spotify handled by inactivity.
    if (latest.metadata?.lastCheckIn) continue;

    if (!SUBSCRIPTION_HINTS.some((h) => name.includes(h))) continue;
    if (name.includes('spotify') || name.includes('gym') || name.includes('fitlife')) {
      // Handled by subscription inactivity detector for richer context
      continue;
    }

    candidates.push({
      detectorId: 'recurring',
      category: 'save',
      title: 'Recurring subscription',
      summary: `${latest.merchantName} charges about $${latest.amount.toFixed(2)} on a recurring cadence.`,
      whyFlagged: 'We detected a stable recurring charge pattern that may be a subscription.',
      potentialValue: latest.amount,
      confidence: 'medium',
      effort: 'low',
      merchantName: latest.merchantName,
      relatedTransactionIds: group.map((t) => t.id),
      evidence: [
        { label: 'Merchant', value: latest.merchantName },
        { label: 'Typical amount', value: `$${latest.amount.toFixed(2)}` },
        { label: 'Occurrences', value: String(group.length) },
      ],
      actionMode: 'assisted',
    });
  }

  return candidates;
};
