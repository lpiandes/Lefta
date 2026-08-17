import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type {
  Account,
  CategoryFilter,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  ScanProgressStep,
  User,
} from '@find-money/shared';
import { getScanStepsTemplate } from '@find-money/shared';
import { api, ApiRequestError } from '../api/client';
import { clearToken, getToken } from '../api/session';

function emptySummary(): MoneySummary {
  return { totalFound: 0, opportunityCount: 0, recovered: 0, pending: 0, ignored: 0 };
}

type AppStateValue = {
  ready: boolean;
  sessionExpired: boolean;
  user: User | null;
  hasOnboarded: boolean;
  bankConnected: boolean;
  hasScanned: boolean;
  plaidConfigured: boolean;
  connections: FinancialConnection[];
  accounts: Account[];
  opportunities: Opportunity[];
  actions: RecoveryAction[];
  scanSteps: ScanProgressStep[];
  filter: CategoryFilter;
  setFilter: (f: CategoryFilter) => void;
  summary: MoneySummary;
  activeOpportunities: Opportunity[];
  register: (input: { email: string; name: string; password: string }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  completePlaidLink: (input: {
    publicToken: string;
    institutionName?: string;
    institutionId?: string;
  }) => Promise<void>;
  runScan: () => Promise<ScanProgressStep[]>;
  getOpportunity: (id: string) => Opportunity | undefined;
  getAction: (opportunityId: string) => RecoveryAction | undefined;
  planAction: (opportunityId: string, selfServe?: boolean) => Promise<RecoveryAction>;
  approveAction: (opportunityId: string) => Promise<RecoveryAction>;
  verifyRecovery: (opportunityId: string) => Promise<RecoveryAction>;
  ignoreOpportunity: (opportunityId: string) => Promise<void>;
  disconnectAll: () => Promise<void>;
  deleteData: () => Promise<void>;
  completeOnboarding: () => void;
  userName: string;
  lastStripeClientSecret: string | null;
};

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [plaidConfigured, setPlaidConfigured] = useState(false);
  const [connections, setConnections] = useState<FinancialConnection[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanSteps, setScanSteps] = useState<ScanProgressStep[]>(getScanStepsTemplate());
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [summary, setSummary] = useState<MoneySummary>(emptySummary());
  const [lastStripeClientSecret, setLastStripeClientSecret] = useState<string | null>(null);

  const handleAuthError = useCallback(async (err: unknown) => {
    if (err instanceof ApiRequestError && (err.status === 401 || err.code === 'SESSION_EXPIRED')) {
      await clearToken();
      setUser(null);
      setSessionExpired(true);
      setConnections([]);
      setAccounts([]);
      setOpportunities([]);
      setActions([]);
      setHasScanned(false);
    }
    throw err;
  }, []);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setReady(true);
      return;
    }
    try {
      const [me, accts, opps, acts, plaid] = await Promise.all([
        api.me(),
        api.accounts(),
        api.opportunities(),
        api.actions(),
        api.plaidStatus().catch(() => ({ configured: false, env: 'sandbox' })),
      ]);
      setUser(me.user);
      setSummary(opps.summary);
      setConnections(accts.connections);
      setAccounts(accts.accounts);
      setOpportunities(opps.opportunities);
      setActions(acts.actions);
      setHasScanned(me.hasScanned);
      setHasOnboarded(true);
      setPlaidConfigured(plaid.configured);
      setSessionExpired(false);
    } catch (err) {
      if (err instanceof ApiRequestError && err.status === 401) {
        await clearToken();
        setUser(null);
        setSessionExpired(true);
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const register = useCallback(
    async (input: { email: string; name: string; password: string }) => {
      const { user: next } = await api.register(input);
      setUser(next);
      setHasOnboarded(true);
      setSessionExpired(false);
      await refresh();
    },
    [refresh],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      await api.login(input);
      setHasOnboarded(true);
      setSessionExpired(false);
      await refresh();
    },
    [refresh],
  );

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
    setConnections([]);
    setAccounts([]);
    setOpportunities([]);
    setActions([]);
    setHasScanned(false);
    setSummary(emptySummary());
  }, []);

  const completePlaidLink = useCallback(
    async (input: { publicToken: string; institutionName?: string; institutionId?: string }) => {
      try {
        const result = await api.exchangePlaid(input);
        setConnections((prev) => [...prev.filter((c) => c.id !== result.connection.id), result.connection]);
        setAccounts(result.accounts);
      } catch (err) {
        await handleAuthError(err);
      }
    },
    [handleAuthError],
  );

  const runScan = useCallback(async () => {
    const steps = getScanStepsTemplate();
    setScanSteps(steps);
    for (let i = 0; i < steps.length; i += 1) {
      await new Promise((r) => setTimeout(r, 400));
      steps[i] = { ...steps[i], done: true };
      setScanSteps([...steps]);
    }
    try {
      const result = await api.scan();
      setOpportunities(result.opportunities);
      setHasScanned(true);
      setSummary({
        totalFound: result.potentialValue,
        opportunityCount: result.opportunityCount,
        recovered: 0,
        pending: 0,
        ignored: 0,
      });
      const opps = await api.opportunities();
      setSummary(opps.summary);
      setOpportunities(opps.opportunities);
      return result.steps;
    } catch (err) {
      await handleAuthError(err);
      return steps;
    }
  }, [handleAuthError]);

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.id === id),
    [opportunities],
  );

  const getAction = useCallback(
    (opportunityId: string) => actions.find((a) => a.opportunityId === opportunityId),
    [actions],
  );

  const planAction = useCallback(
    async (opportunityId: string, selfServe?: boolean) => {
      try {
        const { action } = await api.planAction(opportunityId, selfServe);
        setActions((prev) => {
          const rest = prev.filter((a) => a.opportunityId !== opportunityId);
          return [...rest, action];
        });
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === opportunityId ? { ...o, status: action.status, updatedAt: new Date().toISOString() } : o,
          ),
        );
        return action;
      } catch (err) {
        await handleAuthError(err);
        throw err;
      }
    },
    [handleAuthError],
  );

  const approveAction = useCallback(
    async (opportunityId: string) => {
      try {
        const { action } = await api.approveAction(opportunityId);
        setActions((prev) => prev.map((a) => (a.opportunityId === opportunityId ? action : a)));
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opportunityId ? { ...o, status: action.status } : o)),
        );
        return action;
      } catch (err) {
        await handleAuthError(err);
        throw err;
      }
    },
    [handleAuthError],
  );

  const verifyRecovery = useCallback(
    async (opportunityId: string) => {
      try {
        const { action, stripeClientSecret, stripeCheckoutUrl } = await api.verifyRecovery(opportunityId);
        setLastStripeClientSecret(stripeClientSecret);
        const next = { ...action, stripeCheckoutUrl: stripeCheckoutUrl ?? action.stripeCheckoutUrl };
        setActions((prev) => {
          const exists = prev.some((a) => a.opportunityId === opportunityId);
          return exists
            ? prev.map((a) => (a.opportunityId === opportunityId ? next : a))
            : [...prev, next];
        });
        const opps = await api.opportunities();
        setSummary(opps.summary);
        setOpportunities(opps.opportunities);
        return next;
      } catch (err) {
        await handleAuthError(err);
        throw err;
      }
    },
    [handleAuthError],
  );

  const ignoreOpportunity = useCallback(
    async (opportunityId: string) => {
      try {
        await api.ignoreOpportunity(opportunityId);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opportunityId ? { ...o, status: 'ignored' } : o)),
        );
      } catch (err) {
        await handleAuthError(err);
      }
    },
    [handleAuthError],
  );

  const disconnectAll = useCallback(async () => {
    try {
      for (const connection of connections) {
        await api.disconnect(connection.id);
      }
      setConnections([]);
      setAccounts([]);
    } catch (err) {
      await handleAuthError(err);
    }
  }, [connections, handleAuthError]);

  const deleteData = useCallback(async () => {
    try {
      await api.deleteData();
    } catch (err) {
      if (!(err instanceof ApiRequestError && err.status === 401)) {
        await handleAuthError(err);
      }
    }
    await clearToken();
    setUser(null);
    setConnections([]);
    setAccounts([]);
    setOpportunities([]);
    setActions([]);
    setHasScanned(false);
    setScanSteps(getScanStepsTemplate());
    setFilter('all');
    setSummary(emptySummary());
  }, [handleAuthError]);

  const activeOpportunities = useMemo(() => {
    const list = opportunities.filter((o) => !['recovered', 'ignored'].includes(o.status));
    if (filter === 'all') return list;
    return list.filter((o) => o.category === filter);
  }, [opportunities, filter]);

  const value: AppStateValue = {
    ready,
    sessionExpired,
    user,
    hasOnboarded,
    bankConnected: connections.length > 0,
    hasScanned,
    plaidConfigured,
    connections,
    accounts,
    opportunities,
    actions,
    scanSteps,
    filter,
    setFilter,
    summary: hasScanned ? summary : emptySummary(),
    activeOpportunities,
    register,
    login,
    logout,
    refresh,
    completePlaidLink,
    runScan,
    getOpportunity,
    getAction,
    planAction,
    approveAction,
    verifyRecovery,
    ignoreOpportunity,
    disconnectAll,
    deleteData,
    completeOnboarding: () => setHasOnboarded(true),
    userName: user?.name ?? 'there',
    lastStripeClientSecret,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
