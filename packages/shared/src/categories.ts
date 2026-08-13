/**
 * Opportunity categories — every finding maps to exactly one of these.
 * Colors are shared so mobile and marketing stay consistent.
 */
export const OPPORTUNITY_CATEGORIES = {
  recover: {
    id: 'recover',
    label: 'Recover',
    shortLabel: 'Recover',
    description: 'Money you may be entitled to receive.',
    color: '#1FA67A',
    emoji: '🟢',
  },
  save: {
    id: 'save',
    label: 'Save',
    shortLabel: 'Save',
    description: 'Money you can stop wasting.',
    color: '#2B6CB0',
    emoji: '🔵',
  },
  claim: {
    id: 'claim',
    label: 'Claim',
    shortLabel: 'Claim',
    description: 'Benefits you’ve earned but haven’t used.',
    color: '#7C3AED',
    emoji: '🟣',
  },
  prevent: {
    id: 'prevent',
    label: 'Prevent',
    shortLabel: 'Prevent',
    description: 'Money you’re about to lose.',
    color: '#D97706',
    emoji: '🟠',
  },
  optimize: {
    id: 'optimize',
    label: 'Optimize',
    shortLabel: 'Optimize',
    description: 'Money you could save with a better option.',
    color: '#CA8A04',
    emoji: '🟡',
  },
  investigate: {
    id: 'investigate',
    label: 'Investigate',
    shortLabel: 'Investigate',
    description: 'Something unusual that needs attention.',
    color: '#DC2626',
    emoji: '🔴',
  },
} as const;

export type OpportunityCategoryId = keyof typeof OPPORTUNITY_CATEGORIES;

export const CATEGORY_FILTERS = [
  'all',
  ...Object.keys(OPPORTUNITY_CATEGORIES),
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
