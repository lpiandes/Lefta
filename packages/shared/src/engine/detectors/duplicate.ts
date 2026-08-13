import { hoursBetween } from '../../lib/dates';
import type { Detector, OpportunityCandidate } from './types';

/**
 * Flags same merchant + same amount within a short window.
 * Deterministic rules only — AI explains later, never invents disputes.
 */
export const detectDuplicates: Detector = ({ transactions }) => {
  const candidates: OpportunityCandidate[] = [];
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const used = new Set<string>();

  for (let i = 0; i < sorted.length; i += 1) {
    const a = sorted[i];
    if (a.amount <= 0 || used.has(a.id)) continue;

    for (let j = i + 1; j < sorted.length; j += 1) {
      const b = sorted[j];
      if (used.has(b.id)) continue;
      if (normalizeMerchant(a.merchantName) !== normalizeMerchant(b.merchantName)) continue;
      if (a.amount !== b.amount) continue;

      const hours = hoursBetween(a.date, b.date);
      if (hours > 72) continue;

      used.add(a.id);
      used.add(b.id);

      candidates.push({
        detectorId: 'duplicate',
        category: 'investigate',
        title: 'Possible duplicate charge',
        summary: `We found two very similar charges from ${a.merchantName} within ${Math.ceil(hours)} hours.`,
        whyFlagged:
          'These two transactions appear unusually similar — same merchant, same amount, close timestamps.',
        potentialValue: a.amount,
        confidence: hours <= 48 ? 'high' : 'medium',
        effort: 'medium',
        merchantName: a.merchantName,
        relatedTransactionIds: [a.id, b.id],
        evidence: [
          { label: 'Merchant', value: a.merchantName },
          { label: 'First charge', value: `${a.date} · $${a.amount.toFixed(2)}` },
          { label: 'Similar charge', value: `${b.date} · $${b.amount.toFixed(2)}` },
          { label: 'Hours apart', value: String(Math.round(hours)) },
        ],
        actionMode: 'assisted',
      });
      break;
    }
  }

  return candidates;
};

function normalizeMerchant(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}
