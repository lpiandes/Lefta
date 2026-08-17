import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { MemoryStore } from '../db/memoryStore';
import { setStoreForTests } from '../db/store';
import { loginAccount, refreshSession, registerAccount } from '../services/authService';
import { applyTestEnv } from '../test/env';
import { verifyAccessToken } from '../lib/jwt';

describe('auth sessions', () => {
  beforeEach(() => {
    applyTestEnv();
    setStoreForTests(new MemoryStore());
  });

  it('registers, issues access + refresh, and rotates refresh', async () => {
    const registered = await registerAccount({
      email: 'pat@example.com',
      name: 'Pat',
      password: 'password12',
    });
    assert.ok(registered.token);
    assert.ok(registered.refreshToken);
    assert.equal(registered.user.email, 'pat@example.com');
    const access = verifyAccessToken(registered.token);
    assert.equal(access.sub, registered.user.id);

    const rotated = await refreshSession(registered.refreshToken);
    assert.notEqual(rotated.refreshToken, registered.refreshToken);
    await assert.rejects(() => refreshSession(registered.refreshToken), /Session expired/);

    const loggedIn = await loginAccount({ email: 'pat@example.com', password: 'password12' });
    assert.equal(loggedIn.user.id, registered.user.id);
  });

  it('rejects a duplicate email', async () => {
    await registerAccount({ email: 'pat@example.com', name: 'Pat', password: 'password12' });
    await assert.rejects(
      () => registerAccount({ email: 'pat@example.com', name: 'Pat', password: 'password12' }),
      /already exists/,
    );
  });
});
