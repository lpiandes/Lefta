import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDisputeDraft } from '@find-money/shared';

describe('dispute draft', () => {
  it('builds a sendable letter without claiming auto-filing', () => {
    const draft = buildDisputeDraft({
      userName: 'Alex Rivera',
      opportunity: {
        detectorId: 'duplicate',
        merchantName: 'Adobe Creative Cloud',
        potentialValue: 84.99,
        title: 'Possible duplicate charge',
      },
      evidence: [{ label: 'Amount', value: '$84.99' }],
    });
    assert.match(draft, /Adobe Creative Cloud/);
    assert.match(draft, /does not file disputes/);
    assert.match(draft, /84.99/);
  });
});
