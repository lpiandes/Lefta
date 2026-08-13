import type { OpportunityCandidate } from './detectors/types';

/**
 * AI layer (MVP): deterministic polish + structured explanation.
 * Production: call an LLM with candidate + evidence only — never let the model
 * invent new opportunities or auto-dispute without rules + user approval.
 */
export function explainCandidate(candidate: OpportunityCandidate): OpportunityCandidate {
  const confidencePhrase =
    candidate.confidence === 'high'
      ? 'High confidence based on clear matching signals.'
      : candidate.confidence === 'medium'
        ? 'Medium confidence — worth reviewing before you act.'
        : 'Lower confidence — treat this as a lead, not a guarantee.';

  return {
    ...candidate,
    whyFlagged: `${candidate.whyFlagged} ${confidencePhrase}`,
    summary: candidate.summary.trim(),
  };
}
