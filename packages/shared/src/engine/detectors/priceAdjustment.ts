import type { Detector, OpportunityCandidate } from './types';

/**
 * Purchase still inside price-match window and current price is lower.
 */
export const detectPriceAdjustments: Detector = ({ transactions, now }) => {
  const candidates: OpportunityCandidate[] = [];

  for (const txn of transactions) {
    const currentPrice = Number(txn.metadata?.currentPrice ?? NaN);
    const windowDays = Number(txn.metadata?.priceMatchWindowDays ?? 0);
    if (!windowDays || !Number.isFinite(currentPrice) || currentPrice >= txn.amount) continue;

    const purchased = new Date(txn.date);
    const expires = new Date(purchased);
    expires.setDate(expires.getDate() + windowDays);
    if (expires.getTime() < now.getTime()) continue;

    const delta = Math.round((txn.amount - currentPrice) * 100) / 100;

    candidates.push({
      detectorId: 'price_adjustment',
      category: 'recover',
      title: 'Possible price adjustment',
      summary: `This recent purchase may qualify for a lower price based on the merchant’s current price.`,
      whyFlagged:
        'You paid more than the merchant’s current listed price within a typical price-adjustment window.',
      potentialValue: delta,
      confidence: 'medium',
      effort: 'medium',
      merchantName: txn.merchantName,
      relatedTransactionIds: [txn.id],
      expiresAt: expires.toISOString().slice(0, 10),
      evidence: [
        { label: 'Merchant', value: txn.merchantName },
        { label: 'Product', value: txn.metadata?.product ?? 'Purchase' },
        { label: 'You paid', value: `$${txn.amount.toFixed(2)}` },
        { label: 'Current price', value: `$${currentPrice.toFixed(2)}` },
        { label: 'Potential adjustment', value: `$${delta.toFixed(2)}` },
      ],
      actionMode: 'assisted',
    });
  }

  return candidates;
};
