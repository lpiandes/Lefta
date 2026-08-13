import type { ActionStep, Opportunity, RecoveryAction } from '@find-money/shared';
import { calculateSuccessFee, createId } from '@find-money/shared';
import { store } from './store';

function buildSteps(opportunity: Opportunity): ActionStep[] {
  if (opportunity.actionMode === 'self_serve') {
    return [
      { id: '1', label: 'Verify opportunity', status: 'complete' },
      { id: '2', label: 'Prepare guidance', status: 'complete' },
      { id: '3', label: 'User takes action', status: 'current' },
      { id: '4', label: 'Confirm result', status: 'pending' },
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

export function planAction(opportunityId: string): RecoveryAction {
  const opportunity = store.opportunities.find((o) => o.id === opportunityId);
  if (!opportunity) {
    throw new Error('Opportunity not found');
  }

  const existing = store.actions.find((a) => a.opportunityId === opportunityId);
  if (existing) return existing;

  const action: RecoveryAction = {
    id: createId('act'),
    opportunityId,
    mode: opportunity.actionMode,
    status: 'action_planned',
    steps: buildSteps(opportunity),
    sharedInfo: [
      'Name',
      'Transaction date',
      'Transaction amount',
      'Relevant account information',
    ],
  };

  opportunity.status = 'action_planned';
  opportunity.updatedAt = new Date().toISOString();
  store.actions.push(action);
  return action;
}

export function approveAction(opportunityId: string): RecoveryAction {
  const action = planAction(opportunityId);
  const opportunity = store.opportunities.find((o) => o.id === opportunityId)!;

  action.status = 'waiting';
  action.submittedAt = new Date().toISOString();
  action.steps = action.steps.map((step) => {
    if (step.id === '3') return { ...step, status: 'complete' };
    if (step.id === '4') return { ...step, status: 'complete' };
    if (step.id === '5') return { ...step, status: 'current' };
    return step;
  });

  opportunity.status = 'waiting';
  opportunity.updatedAt = new Date().toISOString();
  return action;
}

/** Demo helper: mark recovery complete (merchant confirmed). */
export function markRecovered(opportunityId: string, amount?: number): RecoveryAction {
  const action = store.actions.find((a) => a.opportunityId === opportunityId) ?? planAction(opportunityId);
  const opportunity = store.opportunities.find((o) => o.id === opportunityId)!;
  const recoveredAmount = amount ?? opportunity.potentialValue;

  action.status = 'recovered';
  action.recoveredAt = new Date().toISOString();
  action.recoveredAmount = recoveredAmount;
  action.feeAmount = calculateSuccessFee(recoveredAmount);
  action.steps = action.steps.map((step) => ({ ...step, status: 'complete' }));

  opportunity.status = 'recovered';
  opportunity.updatedAt = new Date().toISOString();
  return action;
}

export function ignoreOpportunity(opportunityId: string): Opportunity {
  const opportunity = store.opportunities.find((o) => o.id === opportunityId);
  if (!opportunity) throw new Error('Opportunity not found');
  opportunity.status = 'ignored';
  opportunity.updatedAt = new Date().toISOString();
  return opportunity;
}
