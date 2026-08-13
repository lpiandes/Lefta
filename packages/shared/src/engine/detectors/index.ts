import { detectDuplicates } from './duplicate';
import { detectExpiringCredits } from './expiringCredit';
import { detectPriceAdjustments } from './priceAdjustment';
import { detectPriceAnomalies } from './priceAnomaly';
import { detectRecurringSubscriptions } from './recurring';
import { detectRefundReturns } from './refundReturn';
import { detectSubscriptionInactivity } from './subscriptionInactivity';
import type { Detector } from './types';

/**
 * Ordered detector pipeline.
 * Rules find candidates → policy validates → AI explains (separate layer).
 */
export const DETECTORS: Detector[] = [
  detectDuplicates,
  detectSubscriptionInactivity,
  detectRecurringSubscriptions,
  detectPriceAnomalies,
  detectRefundReturns,
  detectPriceAdjustments,
  detectExpiringCredits,
];

export type { Detector, DetectorContext, OpportunityCandidate } from './types';
