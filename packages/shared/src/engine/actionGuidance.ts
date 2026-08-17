import type { DetectorId } from '../types';

/**
 * Assisted vs self-serve copy. The engine never disputes or moves money;
 * these are the steps a human (or later a permitted integration) can follow.
 */
export function guidanceForDetector(detectorId: DetectorId, selfServe: boolean): string[] {
  const assisted: Record<DetectorId, string[]> = {
    duplicate:
      [
        'Confirm both charges posted and were not already reversed.',
        'Ask the merchant or issuer to investigate a possible duplicate.',
        'Keep the two transaction dates and amounts as evidence.',
      ],
    recurring: [
      'Confirm this is a subscription you still want.',
      'If not, cancel with the merchant using their official flow.',
      'Watch the next billing cycle to confirm it stopped.',
    ],
    price_anomaly: [
      'Compare the latest bill to your recent typical amount.',
      'Contact the biller and ask why the charge increased.',
      'Request a courtesy adjustment if the increase was an error.',
    ],
    subscription_inactivity: [
      'Confirm you are not using this service.',
      'Cancel through the merchant’s account settings.',
      'Verify no further charges post next cycle.',
    ],
    refund_return: [
      'Check the merchant return policy and deadline.',
      'Start a return or refund with the order number from the receipt.',
      'Track the refund until it posts to your account.',
    ],
    expiring_credit: [
      'Use the credit before the expiration date.',
      'If you cannot use it, ask the issuer about an extension.',
    ],
    price_adjustment: [
      'Confirm the current listed price and the merchant’s price-match window.',
      'Request an adjustment for the difference with your receipt.',
      'Wait for the merchant to confirm the credit.',
    ],
    rewards: [
      'Confirm the reward balance and expiration in the issuer app.',
      'Redeem or use the balance before it lapses.',
    ],
  };

  if (!selfServe) return assisted[detectorId] ?? assisted.duplicate;

  return [
    ...(assisted[detectorId] ?? assisted.duplicate),
    'Find Money will not contact the merchant for you on this path.',
  ];
}

export const SHARED_ACTION_INFO = [
  'Name',
  'Transaction date',
  'Transaction amount',
  'Relevant account information',
];
