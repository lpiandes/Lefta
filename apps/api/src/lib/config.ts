/**
 * Single source of runtime configuration. No secrets or vendor IDs live in source.
 */
export type AppConfig = {
  port: number;
  nodeEnv: string;
  isTest: boolean;
  jwtSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  encryptionKey: string;
  databaseUrl: string | undefined;
  corsOrigins: string[];
  bcryptRounds: number;
  passwordMinLength: number;
  authRateLimitMax: number;
  authRateLimitWindowMs: number;
  plaidClientId: string | undefined;
  plaidSecret: string | undefined;
  plaidEnv: 'sandbox' | 'development' | 'production';
  plaidTransactionDays: number;
  stripeSecretKey: string | undefined;
  stripeWebhookSecret: string | undefined;
  publicAppUrl: string | undefined;
};

let cached: AppConfig | undefined;

function required(name: string, value: string | undefined, opts?: { minLength?: number }): string {
  if (!value || !value.trim()) {
    throw new Error(`${name} is required. Set it in your environment (see .env.example).`);
  }
  const trimmed = value.trim();
  if (opts?.minLength && trimmed.length < opts.minLength) {
    throw new Error(`${name} must be at least ${opts.minLength} characters`);
  }
  return trimmed;
}

function optional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function loadConfig(): AppConfig {
  if (cached) return cached;

  const isTest = process.env.NODE_ENV === 'test' || process.env.FIND_MONEY_TEST === '1';
  const jwtSecret = required('JWT_SECRET', process.env.JWT_SECRET, { minLength: isTest ? 8 : 32 });
  const encryptionKey = required('ENCRYPTION_KEY', process.env.ENCRYPTION_KEY);
  if (!/^[0-9a-fA-F]{64}$/.test(encryptionKey) || /^0+$/i.test(encryptionKey)) {
    throw new Error('ENCRYPTION_KEY must be 32 cryptographically random bytes encoded as 64 hex characters');
  }

  const plaidClientId = optional(process.env.PLAID_CLIENT_ID);
  const plaidSecret = optional(process.env.PLAID_SECRET);
  if ((plaidClientId && !plaidSecret) || (!plaidClientId && plaidSecret)) {
    throw new Error('PLAID_CLIENT_ID and PLAID_SECRET must both be set, or both omitted.');
  }

  let plaidEnv: AppConfig['plaidEnv'] = 'sandbox';
  if (plaidClientId && plaidSecret) {
    const plaidEnvRaw = required('PLAID_ENV', process.env.PLAID_ENV);
    if (plaidEnvRaw !== 'sandbox' && plaidEnvRaw !== 'development' && plaidEnvRaw !== 'production') {
      throw new Error('PLAID_ENV must be sandbox, development, or production');
    }
    plaidEnv = plaidEnvRaw;
  }

  const stripeSecretKey = optional(process.env.STRIPE_SECRET_KEY);
  const stripeWebhookSecret = optional(process.env.STRIPE_WEBHOOK_SECRET);
  const publicAppUrl = optional(process.env.PUBLIC_APP_URL);
  if (stripeSecretKey && (!stripeWebhookSecret || !publicAppUrl)) {
    throw new Error('When STRIPE_SECRET_KEY is set, STRIPE_WEBHOOK_SECRET and PUBLIC_APP_URL are required.');
  }

  cached = {
    port: Number(process.env.PORT ?? 4000),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    isTest,
    jwtSecret,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? process.env.JWT_EXPIRES_IN ?? '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    encryptionKey,
    databaseUrl: optional(process.env.DATABASE_URL),
    corsOrigins: (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    passwordMinLength: Number(process.env.PASSWORD_MIN_LENGTH ?? 8),
    authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
    authRateLimitWindowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    plaidClientId,
    plaidSecret,
    plaidEnv,
    plaidTransactionDays: Number(process.env.PLAID_TRANSACTION_DAYS ?? 90),
    stripeSecretKey,
    stripeWebhookSecret,
    publicAppUrl,
  };

  if (!isTest && !cached.databaseUrl) {
    throw new Error('DATABASE_URL is required (Postgres). Start it with docker compose or set the URL.');
  }

  return cached;
}

export function resetConfigForTests(): void {
  cached = undefined;
}

export function plaidIsConfigured(config = loadConfig()): boolean {
  return Boolean(config.plaidClientId && config.plaidSecret);
}

export function stripeIsConfigured(config = loadConfig()): boolean {
  return Boolean(config.stripeSecretKey);
}
