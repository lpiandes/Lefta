import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import bcrypt from 'bcryptjs';
import { MemoryStore } from '../db/memoryStore';
import { setStoreForTests } from '../db/store';
import { approveAction, planAction, verifyRecovery } from './actionService';
import { scanConnectedAccounts } from './opportunityEngine';
import {
  DEMO_ACCOUNTS,
  DEMO_CONNECTION,
  buildDemoTransactions,
} from '@find-money/shared';
import { applyTestEnv } from '../test/env';

describe('assisted recovery lifecycle', () => {
  beforeEach(() => {
    applyTestEnv();
    setStoreForTests(new MemoryStore());
  });

  it('plans, approves without recovering, then verifies cash and records a 20% fee', async () => {
    const { getStore } = await import('../db/store');
    const db = await getStore();
    const user = await db.createUser({
      email: 'pat@example.com',
      name: 'Pat',
      passwordHash: await bcrypt.hash('password12', 4),
    });

    const connection = { ...DEMO_CONNECTION, id: 'conn_1', connectedAt: new Date().toISOString() };
    await db.createConnection(user.id, connection);
    await db.replaceAccounts(user.id, connection.id, DEMO_ACCOUNTS);
    await db.seedTransactions(user.id, buildDemoTransactions());

    const scan = await scanConnectedAccounts(user.id);
    assert.ok(scan.opportunityCount >= 5);

      const duplicate = scan.opportunities.find((o: { detectorId: string }) => o.detectorId === 'duplicate');
    assert.ok(duplicate);

    const planned = await planAction(user.id, duplicate!.id);
    assert.equal(planned.status, 'action_planned');
    assert.ok(planned.guidance && planned.guidance.length > 0);

    const approved = await approveAction(user.id, duplicate!.id);
    assert.equal(approved.status, 'waiting');
    assert.equal(approved.recoveredAmount, undefined);

    const afterApprove = await db.getOpportunity(user.id, duplicate!.id);
    assert.equal(afterApprove?.status, 'waiting');

    const { action } = await verifyRecovery(user.id, duplicate!.id);
    assert.equal(action.status, 'recovered');
    assert.equal(action.feeAmount, Math.round(duplicate!.potentialValue * 0.2 * 100) / 100);
    assert.equal(action.feeStatus, 'owed');
  });
});
