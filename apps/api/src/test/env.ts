import { resetConfigForTests } from '../lib/config';

const TEST_ENCRYPTION_KEY = 'a1b2c3d4e5f6789012345678abcdef12a1b2c3d4e5f6789012345678abcdef12';

export function applyTestEnv(): void {
  process.env.FIND_MONEY_TEST = '1';
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-min-eight';
  process.env.JWT_ACCESS_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.ENCRYPTION_KEY = TEST_ENCRYPTION_KEY;
  process.env.BCRYPT_ROUNDS = '4';
  delete process.env.DATABASE_URL;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.PLAID_CLIENT_ID;
  delete process.env.PLAID_SECRET;
  delete process.env.PLAID_ENV;
  resetConfigForTests();
}
