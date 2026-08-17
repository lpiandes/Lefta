import type {
  Account,
  CategoryFilter,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  ScanProgressStep,
  ScanResult,
  User,
} from '@find-money/shared';
import { clearToken, getRefreshToken, getToken, setSession } from './session';

function apiUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new ApiRequestError(
      'EXPO_PUBLIC_API_URL is not set. Add it to .env (see .env.example).',
      0,
      'CONFIG',
    );
  }
  return url.replace(/\/$/, '');
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

type AuthPayload = { token: string; refreshToken: string; user: User };

let refreshInFlight: Promise<boolean> | null = null;

async function persistAuth(data: AuthPayload): Promise<AuthPayload> {
  await setSession({ token: data.token, refreshToken: data.refreshToken });
  return data;
}

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return false;
    try {
      const res = await fetch(`${apiUrl()}/api/auth/refresh`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok || !data.token || !data.refreshToken) {
        await clearToken();
        return false;
      }
      await persistAuth(data);
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

async function request<T>(path: string, init: RequestInit = {}, didRefresh = false): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${apiUrl()}${path}`, { ...init, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  const skipRefresh =
    path === '/api/auth/login' ||
    path === '/api/auth/register' ||
    path === '/api/auth/refresh' ||
    path === '/api/auth/logout';
  if (!res.ok) {
    const expired = res.status === 401 && data.code === 'SESSION_EXPIRED';
    if (expired && !didRefresh && !skipRefresh) {
      const ok = await tryRefresh();
      if (ok) return request<T>(path, init, true);
    }
    throw new ApiRequestError(data.error ?? 'Request failed', res.status, data.code);
  }
  return data as T;
}

export const api = {
  health: () => request<{ ok: boolean; persistence: string }>('/health'),

  register: async (body: { email: string; name: string; password: string }) => {
    const data = await request<AuthPayload>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return persistAuth(data);
  },

  login: async (body: { email: string; password: string }) => {
    const data = await request<AuthPayload>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return persistAuth(data);
  },

  logout: async () => {
    try {
      await request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' });
    } catch {
      // still clear local session
    }
    await clearToken();
  },

  me: () =>
    request<{
      user: User;
      summary: MoneySummary;
      connections: FinancialConnection[];
      hasScanned: boolean;
      session?: { accessExpiresIn: string; refreshExpiresIn: string };
    }>('/api/auth/me'),

  accounts: () =>
    request<{
      connections: FinancialConnection[];
      accounts: Account[];
      plaidConfigured: boolean;
    }>('/api/accounts'),

  plaidStatus: () =>
    request<{ configured: boolean; env: string | null }>('/api/accounts/plaid/status'),

  createLinkToken: () => request<{ linkToken: string }>('/api/accounts/plaid/link-token', { method: 'POST' }),

  exchangePlaid: (body: { publicToken: string; institutionName?: string; institutionId?: string }) =>
    request<{ connection: FinancialConnection; accounts: Account[]; transactionCount: number }>(
      '/api/accounts/plaid/exchange',
      { method: 'POST', body: JSON.stringify(body) },
    ),

  disconnect: (connectionId: string) =>
    request<{ ok: boolean }>(`/api/accounts/disconnect/${connectionId}`, { method: 'POST' }),

  deleteData: () => request<{ ok: boolean }>('/api/accounts/data', { method: 'DELETE' }),

  scan: () => request<ScanResult>('/api/scan', { method: 'POST' }),

  scanSteps: () => request<{ steps: ScanProgressStep[] }>('/api/scan/steps'),

  opportunities: (category?: CategoryFilter) =>
    request<{ summary: MoneySummary; opportunities: Opportunity[] }>(
      `/api/opportunities${category && category !== 'all' ? `?category=${category}` : ''}`,
    ),

  ignoreOpportunity: (id: string) =>
    request<{ opportunity: Opportunity }>(`/api/opportunities/${id}/ignore`, { method: 'POST' }),

  planAction: (opportunityId: string, selfServe?: boolean) =>
    request<{ action: RecoveryAction }>(`/api/actions/${opportunityId}/plan`, {
      method: 'POST',
      body: JSON.stringify({ selfServe }),
    }),

  approveAction: (opportunityId: string) =>
    request<{ action: RecoveryAction }>(`/api/actions/${opportunityId}/approve`, { method: 'POST' }),

  verifyRecovery: (opportunityId: string, recoveredAmount?: number) =>
    request<{
      action: RecoveryAction;
      stripeClientSecret: string | null;
      stripeCheckoutUrl: string | null;
      remainingFound: number;
    }>(`/api/actions/${opportunityId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ recoveredAmount }),
    }),

  actions: () => request<{ actions: RecoveryAction[] }>('/api/actions'),

  privacy: () => request<{ title: string; commitments: string[] }>('/api/user/privacy'),
};
