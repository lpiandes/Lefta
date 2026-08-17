import type { User } from '@find-money/shared';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getStore } from '../db/store';
import type { StoredUser } from '../db/types';
import { loadConfig } from '../lib/config';
import { hashToken, randomToken } from '../lib/crypto';
import { parseDurationMs } from '../lib/duration';
import { AppError } from '../lib/errors';
import { createId } from '../lib/ids';
import { signAccessToken } from '../lib/jwt';

export const registerBodySchema = z.object({
  email: z.string().email().max(254).transform((value) => value.trim().toLowerCase()),
  name: z.string().min(1).max(80).transform((value) => value.trim()),
  password: z.string().min(8).max(128),
});

export const loginBodySchema = z.object({
  email: z.string().email().max(254).transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1).max(128),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(16).max(512),
});

export type AuthTokens = {
  token: string;
  refreshToken: string;
  user: User;
};

export function toPublicUser(user: StoredUser): User {
  return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
}

async function passwordsMatch(password: string, passwordHash: string | undefined): Promise<boolean> {
  if (!passwordHash) {
    await bcrypt.hash(password, loadConfig().bcryptRounds);
    return false;
  }
  return bcrypt.compare(password, passwordHash);
}

async function issueSession(user: StoredUser): Promise<AuthTokens> {
  const db = await getStore();
  const config = loadConfig();
  const refreshToken = randomToken();
  await db.createRefreshSession({
    id: createId('sess'),
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + parseDurationMs(config.jwtRefreshExpiresIn)).toISOString(),
  });
  return {
    token: signAccessToken({ userId: user.id, email: user.email }),
    refreshToken,
    user: toPublicUser(user),
  };
}

export async function registerAccount(input: z.infer<typeof registerBodySchema>): Promise<AuthTokens> {
  const config = loadConfig();
  if (input.password.length < config.passwordMinLength) {
    throw new AppError(`Password must be at least ${config.passwordMinLength} characters`, 400, 'VALIDATION');
  }

  const db = await getStore();
  const existing = await db.findUserByEmail(input.email);
  if (existing) {
    throw new AppError('An account with that email already exists', 409, 'EMAIL_TAKEN');
  }

  const user = await db.createUser({
    email: input.email,
    name: input.name,
    passwordHash: await bcrypt.hash(input.password, config.bcryptRounds),
  });
  await db.writeAudit(user.id, 'user.register', {});
  return issueSession(user);
}

export async function loginAccount(input: z.infer<typeof loginBodySchema>): Promise<AuthTokens> {
  const db = await getStore();
  const user = await db.findUserByEmail(input.email);
  if (!(await passwordsMatch(input.password, user?.passwordHash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }
  await db.writeAudit(user!.id, 'user.login', {});
  return issueSession(user!);
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const db = await getStore();
  const session = await db.findRefreshSessionByHash(hashToken(refreshToken));
  if (!session || session.revokedAt || new Date(session.expiresAt).getTime() <= Date.now()) {
    throw new AppError('Session expired. Sign in again.', 401, 'SESSION_EXPIRED');
  }

  const user = await db.findUserById(session.userId);
  if (!user) {
    throw new AppError('Session expired. Sign in again.', 401, 'SESSION_EXPIRED');
  }

  await db.revokeRefreshSession(session.id);
  await db.writeAudit(user.id, 'user.refresh', {});
  return issueSession(user);
}

export async function logoutAccount(userId: string): Promise<void> {
  const db = await getStore();
  await db.revokeRefreshSessionsForUser(userId);
  await db.writeAudit(userId, 'user.logout', {});
}
