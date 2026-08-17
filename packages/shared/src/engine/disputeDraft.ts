import type { DetectorId, Opportunity, OpportunityEvidence } from '../types';

const SUBJECT: Record<DetectorId, string> = {
  duplicate: 'Possible duplicate charge',
  recurring: 'Recurring subscription review',
  price_anomaly: 'Unexpected bill increase',
  subscription_inactivity: 'Cancellation / unused subscription',
  refund_return: 'Return / refund request',
  expiring_credit: 'Expiring credit',
  price_adjustment: 'Price adjustment request',
  rewards: 'Unused rewards',
};

/**
 * Copy-paste letter. Find Money does not send this automatically.
 */
export function buildDisputeDraft(input: {
  userName: string;
  opportunity: Pick<Opportunity, 'detectorId' | 'merchantName' | 'potentialValue' | 'title'>;
  evidence: OpportunityEvidence[];
}): string {
  const subject = SUBJECT[input.opportunity.detectorId] ?? 'Account review request';
  const evidenceLines = input.evidence.map((e) => `- ${e.label}: ${e.value}`).join('\n');

  return `Subject: ${subject} — ${input.opportunity.merchantName}

Hello ${input.opportunity.merchantName} support,

My name is ${input.userName}. I am writing about a charge / benefit of $${input.opportunity.potentialValue.toFixed(2)}.

${input.opportunity.title}

Evidence:
${evidenceLines || '- See related transactions in my account'}

Please investigate and, if appropriate, refund or credit the amount. This is a request for review — not a guarantee of recovery.

Thank you,
${input.userName}

— Drafted by Find Money for the customer to send. Find Money does not file disputes on your behalf without a separate, permitted integration.`;
}
