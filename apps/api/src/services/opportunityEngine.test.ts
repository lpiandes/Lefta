import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildDemoTransactions, runOpportunityEngine } from '@find-money/shared';

describe('opportunity engine', () => {
  it('finds MVP opportunity types from demo transactions', () => {
    const opportunities = runOpportunityEngine({
      userId: 'user_demo',
      transactions: buildDemoTransactions(),
      now: new Date(),
    });

    assert.ok(opportunities.length >= 5, 'expected several opportunities');

    const detectors = new Set(opportunities.map((o) => o.detectorId));
    assert.ok(detectors.has('duplicate'));
    assert.ok(detectors.has('subscription_inactivity'));
    assert.ok(detectors.has('price_anomaly'));
    assert.ok(detectors.has('price_adjustment'));
    assert.ok(detectors.has('expiring_credit'));

    const total = opportunities.reduce((s, o) => s + o.potentialValue, 0);
    assert.ok(total > 200, `expected meaningful value, got ${total}`);
  });

  it('never invents opportunities without transactions', () => {
    const opportunities = runOpportunityEngine({
      userId: 'user_demo',
      transactions: [],
    });
    assert.equal(opportunities.length, 0);
  });
});
