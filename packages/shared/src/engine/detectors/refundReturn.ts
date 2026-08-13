import type { Detector, OpportunityCandidate } from './types';

/**
 * Recent purchases still inside a return window (from receipt metadata).
 */
export const detectRefundReturns: Detector = ({ transactions, now }) => {
  const candidates: OpportunityCandidate[] = [];

  for (const txn of transactions) {
    const windowDays = Number(txn.metadata?.returnWindowDays ?? 0);
    if (!windowDays || txn.amount <= 0) continue;

    const purchased = new Date(txn.date);
    const expires = new Date(purchased);
    expires.setDate(expires.getDate() + windowDays);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0 || daysLeft > windowDays) continue;

    candidates.push({
      detectorId: 'refund_return',
      category: daysLeft <= 5 ? 'prevent' : 'recover',
      title: daysLeft <= 5 ? 'Return window closing' : 'Potential return / refund',
      summary:
        daysLeft <= 5
          ? `Your ${txn.metadata?.product ?? 'purchase'} return window closes in ${daysLeft} days.`
          : `${txn.merchantName} purchase may still be eligible for return.`,
      whyFlagged: 'Purchase date + merchant return policy suggest you may still be eligible.',
      potentialValue: txn.amount,
      confidence: 'medium',
      effort: 'medium',
      merchantName: txn.merchantName,
      relatedTransactionIds: [txn.id],
      expiresAt: expires.toISOString().slice(0, 10),
      evidence: [
        { label: 'Merchant', value: txn.merchantName },
        { label: 'Product', value: txn.metadata?.product ?? 'Purchase' },
        { label: 'Purchase date', value: txn.date },
        { label: 'Order number', value: txn.orderNumber ?? '—' },
        { label: 'Days left', value: String(daysLeft) },
      ],
      actionMode: 'assisted',
    });
  }

  return candidates;
};
