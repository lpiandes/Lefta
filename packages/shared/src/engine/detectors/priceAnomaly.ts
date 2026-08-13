import type { Transaction } from '../../types';
import type { Detector, OpportunityCandidate } from './types';

const JUMP_THRESHOLD = 0.25; // 25%+ vs trailing average

function groupByMerchant(transactions: Transaction[]): Transaction[][] {
  const byMerchant = new Map<string, Transaction[]>();
  for (const txn of transactions) {
    if (txn.amount <= 0) continue;
    const key = txn.merchantName.trim().toLowerCase();
    const list = byMerchant.get(key) ?? [];
    list.push(txn);
    byMerchant.set(key, list);
  }
  return [...byMerchant.values()]
    .map((list) =>
      [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    )
    .filter((list) => list.length >= 3);
}

/**
 * Recurring bill amount jumped vs recent history.
 * Uses merchant grouping (not amount-similarity) so spikes are visible.
 */
export const detectPriceAnomalies: Detector = ({ transactions }) => {
  const candidates: OpportunityCandidate[] = [];
  const groups = groupByMerchant(transactions);

  for (const group of groups) {
    const latest = group[group.length - 1];
    const history = group.slice(0, -1);
    const avg =
      history.reduce((sum, t) => sum + t.amount, 0) / Math.max(history.length, 1);
    if (avg <= 0) continue;

    // History itself should be stable, otherwise it's not a clear "bill jump"
    const historyStable = history.every((t) => Math.abs(t.amount - avg) / avg < 0.1);
    if (!historyStable) continue;

    const jump = (latest.amount - avg) / avg;
    if (jump < JUMP_THRESHOLD) continue;

    const delta = Math.round((latest.amount - avg) * 100) / 100;

    candidates.push({
      detectorId: 'price_anomaly',
      category: 'investigate',
      title: 'Unusual bill increase',
      summary: `${latest.merchantName} rose from about $${avg.toFixed(2)} to $${latest.amount.toFixed(2)}.`,
      whyFlagged: `This recurring bill increased roughly ${Math.round(jump * 100)}% versus your recent average.`,
      potentialValue: delta,
      confidence: jump >= 0.4 ? 'high' : 'medium',
      effort: 'medium',
      merchantName: latest.merchantName,
      relatedTransactionIds: group.map((t) => t.id),
      evidence: [
        { label: 'Merchant', value: latest.merchantName },
        { label: 'Typical bill', value: `$${avg.toFixed(2)}` },
        { label: 'Latest bill', value: `$${latest.amount.toFixed(2)}` },
        { label: 'Increase', value: `$${delta.toFixed(2)}` },
      ],
      actionMode: 'assisted',
    });
  }

  return candidates;
};
