import type { ActionStep, Opportunity, RecoveryAction } from '@find-money/shared';
import {
  SHARED_ACTION_INFO,
  buildDisputeDraft,
  calculateSuccessFee,
  guidanceForDetector,
} from '@find-money/shared';
import { getStore } from '../db/store';
import { AppError } from '../lib/errors';
import { createId } from '../lib/ids';
import { createSuccessFeeCheckout } from './stripeService';

function buildSteps(opportunity: Opportunity, selfServe: boolean): ActionStep[] {
  if (selfServe || opportunity.actionMode === 'self_serve') {
    return [
      { id: '1', label: 'Verify opportunity', status: 'complete' },
      { id: '2', label: 'Prepare guidance', status: 'complete' },
      { id: '3', label: 'You take action', status: 'current' },
      { id: '4', label: 'Confirm recovered cash', status: 'pending' },
    ];
  }

  return [
    { id: '1', label: 'Verify transaction', status: 'complete' },
    { id: '2', label: 'Prepare request', status: 'complete' },
    { id: '3', label: 'User approval', status: 'current' },
    { id: '4', label: 'Submit / request action', status: 'pending' },
    { id: '5', label: 'Track response', status: 'pending' },
  ];
}

export async function planAction(
  userId: string,
  opportunityId: string,
  selfServe = false,
): Promise<RecoveryAction> {
  const db = await getStore();
  const opportunity = await db.getOpportunity(userId, opportunityId);
  if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');

  const existing = await db.getActionByOpportunity(userId, opportunityId);
  if (existing) return existing;

  const mode = selfServe ? 'self_serve' : opportunity.actionMode;
  const user = await db.findUserById(userId);
  const action: RecoveryAction = {
    id: createId('act'),
    opportunityId,
    mode,
    status: 'action_planned',
    steps: buildSteps(opportunity, selfServe),
    sharedInfo: SHARED_ACTION_INFO,
    guidance: guidanceForDetector(opportunity.detectorId, selfServe || mode === 'self_serve'),
    feeStatus: 'none',
    disputeDraft: buildDisputeDraft({
      userName: user?.name ?? 'Customer',
      opportunity,
      evidence: opportunity.evidence,
    }),
  };
  action.notes = action.disputeDraft;

  opportunity.status = 'action_planned';
  opportunity.updatedAt = new Date().toISOString();
  await db.updateOpportunity(userId, opportunity);
  await db.saveAction(userId, action);
  await db.writeAudit(userId, 'action.plan', { opportunityId, mode });
  return action;
}

/** User approval gate — submits an assisted request. Does not mark money recovered. */
export async function approveAction(userId: string, opportunityId: string): Promise<RecoveryAction> {
  const db = await getStore();
  const action = await planAction(userId, opportunityId);
  const opportunity = await db.getOpportunity(userId, opportunityId);
  if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');

  action.status = 'waiting';
  action.submittedAt = new Date().toISOString();
  action.steps = action.steps.map((step) => {
    if (step.id === '3' || step.id === '4') return { ...step, status: 'complete' };
    if (step.id === '5') return { ...step, status: 'current' };
    if (step.id === '3' && action.mode === 'self_serve') return { ...step, status: 'complete' };
    return step;
  });
  if (action.mode === 'self_serve') {
    action.steps = action.steps.map((step) =>
      step.id === '3' ? { ...step, status: 'complete' } : step.id === '4' ? { ...step, status: 'current' } : step,
    );
  }

  opportunity.status = 'waiting';
  opportunity.updatedAt = new Date().toISOString();
  await db.updateOpportunity(userId, opportunity);
  await db.saveAction(userId, action);
  await db.writeAudit(userId, 'action.approve', { opportunityId });
  return action;
}

/**
 * Verified recovery only. Call when the user (or a later merchant webhook)
 * confirms cash actually posted — then the 20% success fee may apply.
 */
export async function verifyRecovery(
  userId: string,
  opportunityId: string,
  recoveredAmount?: number,
): Promise<{ action: RecoveryAction; stripeClientSecret: string | null; stripeCheckoutUrl: string | null }> {
  const db = await getStore();
  const opportunity = await db.getOpportunity(userId, opportunityId);
  if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');
  const action = (await db.getActionByOpportunity(userId, opportunityId)) ?? (await planAction(userId, opportunityId));

  const amount = recoveredAmount ?? opportunity.potentialValue;
  if (amount <= 0) throw new AppError('Recovered amount must be positive', 400, 'VALIDATION');

  const fee = await createSuccessFeeCheckout({
    userId,
    opportunityId,
    recoveredAmount: amount,
  });

  action.status = 'recovered';
  action.recoveredAt = new Date().toISOString();
  action.recoveredAmount = amount;
  action.feeAmount = fee?.feeAmount ?? calculateSuccessFee(amount);
  action.feeStatus = fee?.checkoutUrl ? 'pending' : action.feeAmount ? 'owed' : 'none';
  action.stripePaymentIntentId = fee?.paymentIntentId || undefined;
  action.stripeCheckoutUrl = fee?.checkoutUrl || undefined;
  action.steps = action.steps.map((step) => ({ ...step, status: 'complete' }));

  opportunity.status = 'recovered';
  opportunity.updatedAt = new Date().toISOString();
  await db.updateOpportunity(userId, opportunity);
  await db.saveAction(userId, action);
  await db.writeAudit(userId, 'action.verify', {
    opportunityId,
    recoveredAmount: amount,
    feeAmount: action.feeAmount,
  });

  return {
    action,
    stripeClientSecret: fee?.clientSecret ?? null,
    stripeCheckoutUrl: fee?.checkoutUrl ?? null,
  };
}

export async function markFeePaid(userId: string, opportunityId: string): Promise<void> {
  const db = await getStore();
  const action = await db.getActionByOpportunity(userId, opportunityId);
  if (!action) return;
  action.feeStatus = 'paid';
  await db.saveAction(userId, action);
  await db.writeAudit(userId, 'fee.paid', { opportunityId });
}

export async function ignoreOpportunity(userId: string, opportunityId: string): Promise<Opportunity> {
  const db = await getStore();
  const opportunity = await db.getOpportunity(userId, opportunityId);
  if (!opportunity) throw new AppError('Opportunity not found', 404, 'NOT_FOUND');
  opportunity.status = 'ignored';
  opportunity.updatedAt = new Date().toISOString();
  await db.updateOpportunity(userId, opportunity);
  await db.writeAudit(userId, 'opportunity.ignore', { opportunityId });
  return opportunity;
}
