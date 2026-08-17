import jwt from 'jsonwebtoken';
import { loadConfig } from './config';

export type AccessPayload = { sub: string; email: string; typ: 'access' };

export function signAccessToken(input: { userId: string; email: string }): string {
  const { jwtSecret, jwtAccessExpiresIn } = loadConfig();
  return jwt.sign(
    { sub: input.userId, email: input.email, typ: 'access' },
    jwtSecret,
    { expiresIn: jwtAccessExpiresIn as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, loadConfig().jwtSecret);
  if (
    typeof decoded !== 'object' ||
    !decoded ||
    decoded.typ !== 'access' ||
    typeof decoded.sub !== 'string'
  ) {
    throw new Error('Invalid access token');
  }
  return { sub: decoded.sub, email: String(decoded.email ?? ''), typ: 'access' };
}
