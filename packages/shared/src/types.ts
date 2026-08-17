import type { OpportunityCategoryId } from './categories';

/** Lifecycle of a detected opportunity */
export type OpportunityStatus =
  | 'new'
  | 'reviewed'
  | 'action_planned'
  | 'awaiting_approval'
  | 'submitted'
  | 'waiting'
  | 'recovered'
  | 'ignored'
  | 'failed';

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export type EffortLevel = 'low' | 'medium' | 'high';

export type ActionMode = 'assisted' | 'automated' | 'self_serve';

export type DetectorId =
  | 'duplicate'
  | 'recurring'
  | 'price_anomaly'
  | 'subscription_inactivity'
  | 'refund_return'
  | 'expiring_credit'
  | 'price_adjustment'
  | 'rewards';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface FinancialConnection {
  id: string;
  provider: 'plaid' | 'email' | 'upload';
  institutionName: string;
  status: 'active' | 'disconnected' | 'error';
  /** Provider item/connection reference — never bank credentials */
  providerItemId: string;
  connectedAt: string;
}

export interface Account {
  id: string;
  connectionId: string;
  institutionName: string;
  name: string;
  type: 'depository' | 'credit' | 'other';
  /** Masked last-4 only */
  mask: string;
  currentBalance?: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  merchantName: string;
  amount: number;
  date: string;
  category: string;
  pending: boolean;
  /** Optional receipt / email enrichment */
  orderNumber?: string;
  metadata?: Record<string, string>;
}

export interface OpportunityEvidence {
  label: string;
  value: string;
}

export interface Opportunity {
  id: string;
  userId: string;
  category: OpportunityCategoryId;
  detectorId: DetectorId;
  title: string;
  summary: string;
  whyFlagged: string;
  potentialValue: number;
  confidence: ConfidenceLevel;
  effort: EffortLevel;
  status: OpportunityStatus;
  actionMode: ActionMode;
  merchantName: string;
  evidence: OpportunityEvidence[];
  relatedTransactionIds: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface ActionStep {
  id: string;
  label: string;
  status: 'pending' | 'complete' | 'current' | 'skipped';
  description?: string;
}

export type FeeStatus = 'none' | 'owed' | 'pending' | 'paid' | 'waived';

export interface RecoveryAction {
  id: string;
  opportunityId: string;
  mode: ActionMode;
  status: OpportunityStatus;
  steps: ActionStep[];
  sharedInfo: string[];
  /** Self-serve instructions — never auto-dispute */
  guidance?: string[];
  submittedAt?: string;
  recoveredAt?: string;
  recoveredAmount?: number;
  feeAmount?: number;
  feeStatus?: FeeStatus;
  stripePaymentIntentId?: string;
  stripeCheckoutUrl?: string;
  notes?: string;
  /** Copy-paste merchant/issuer request. Never auto-sent. */
  disputeDraft?: string;
}

export interface MoneySummary {
  totalFound: number;
  opportunityCount: number;
  recovered: number;
  pending: number;
  ignored: number;
}

export interface ScanProgressStep {
  id: string;
  label: string;
  done: boolean;
}

export interface ScanResult {
  transactionCount: number;
  opportunityCount: number;
  potentialValue: number;
  opportunities: Opportunity[];
  steps: ScanProgressStep[];
}

export interface ApiError {
  error: string;
  code?: string;
}
