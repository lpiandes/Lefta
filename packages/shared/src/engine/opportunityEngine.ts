import type { Opportunity, ScanProgressStep, Transaction } from '../types';
import { createId } from '../lib/ids';
import { DETECTORS } from './detectors';
import { explainCandidate } from './aiExplain';

export const SCAN_STEPS: ScanProgressStep[] = [
  { id: 'txns', label: 'Analyzing transactions…', done: false },
  { id: 'recurring', label: 'Checking recurring payments…', done: false },
  { id: 'unusual', label: 'Checking unusual charges…', done: false },
  { id: 'refunds', label: 'Checking potential refunds…', done: false },
  { id: 'credits', label: 'Checking credits…', done: false },
];

/**
 * Opportunity Detection Engine
 * normalized transactions → detectors → policy → AI explanation → opportunities
 */
export function runOpportunityEngine(input: {
  userId: string;
  transactions: Transaction[];
  now?: Date;
}): Opportunity[] {
  const now = input.now ?? new Date();
  const ctx = { userId: input.userId, transactions: input.transactions, now };

  const candidates = DETECTORS.flatMap((detector) => detector(ctx)).map(explainCandidate);

  const seen = new Set<string>();
  const opportunities: Opportunity[] = [];

  for (const c of candidates) {
    if (c.potentialValue <= 0) continue;
    const key = `${c.detectorId}:${c.merchantName}:${c.potentialValue}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const timestamp = now.toISOString();
    opportunities.push({
      id: createId('opp'),
      userId: input.userId,
      category: c.category,
      detectorId: c.detectorId,
      title: c.title,
      summary: c.summary,
      whyFlagged: c.whyFlagged,
      potentialValue: c.potentialValue,
      confidence: c.confidence,
      effort: c.effort,
      status: 'new',
      actionMode: c.actionMode ?? 'assisted',
      merchantName: c.merchantName,
      evidence: c.evidence,
      relatedTransactionIds: c.relatedTransactionIds,
      createdAt: timestamp,
      updatedAt: timestamp,
      expiresAt: c.expiresAt,
    });
  }

  return opportunities.sort((a, b) => b.potentialValue - a.potentialValue);
}

export function getScanStepsTemplate(): ScanProgressStep[] {
  return SCAN_STEPS.map((s) => ({ ...s }));
}
