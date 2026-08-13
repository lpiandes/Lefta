import type { Detector, OpportunityCandidate } from './types';

/**
 * Unused / expiring credits & rewards from account or receipt enrichment.
 */
export const detectExpiringCredits: Detector = ({ transactions, now }) => {
  const candidates: OpportunityCandidate[] = [];

  for (const txn of transactions) {
    const balance = Number(txn.metadata?.creditBalance ?? NaN);
    const expiresAt = txn.metadata?.expiresAt;
    if (!expiresAt || !Number.isFinite(balance) || balance <= 0) continue;

    const daysLeft = Math.ceil(
      (new Date(expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysLeft < 0) continue;

    candidates.push({
      detectorId: 'expiring_credit',
      category: daysLeft <= 14 ? 'prevent' : 'claim',
      title: daysLeft <= 14 ? 'Expiring credit' : 'Unused credit',
      summary:
        daysLeft <= 14
          ? `Your $${balance.toFixed(0)} ${txn.metadata?.creditType ?? 'credit'} expires in ${daysLeft} days.`
          : `You have $${balance.toFixed(0)} in unused ${txn.metadata?.creditType ?? 'credit'}.`,
      whyFlagged: 'We found a credit/reward balance with an expiration date.',
      potentialValue: balance,
      confidence: 'high',
      effort: 'low',
      merchantName: txn.merchantName,
      relatedTransactionIds: [txn.id],
      expiresAt,
      evidence: [
        { label: 'Source', value: txn.merchantName },
        { label: 'Balance', value: `$${balance.toFixed(2)}` },
        { label: 'Expires', value: expiresAt },
        { label: 'Days left', value: String(daysLeft) },
      ],
      actionMode: 'self_serve',
    });
  }

  return candidates;
};
