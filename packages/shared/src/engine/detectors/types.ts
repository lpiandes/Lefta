import type { OpportunityCategoryId } from '../../categories';
import type {
  ConfidenceLevel,
  DetectorId,
  EffortLevel,
  OpportunityEvidence,
  Transaction,
} from '../../types';

/** Raw candidate before persistence / AI explanation polish */
export interface OpportunityCandidate {
  detectorId: DetectorId;
  category: OpportunityCategoryId;
  title: string;
  summary: string;
  whyFlagged: string;
  potentialValue: number;
  confidence: ConfidenceLevel;
  effort: EffortLevel;
  merchantName: string;
  evidence: OpportunityEvidence[];
  relatedTransactionIds: string[];
  expiresAt?: string;
  actionMode?: 'assisted' | 'automated' | 'self_serve';
}

export interface DetectorContext {
  userId: string;
  transactions: Transaction[];
  now: Date;
}

export type Detector = (ctx: DetectorContext) => OpportunityCandidate[];
