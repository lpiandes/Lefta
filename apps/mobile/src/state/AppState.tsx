import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from 'react';
import type {
  Account,
  ActionStep,
  CategoryFilter,
  FinancialConnection,
  MoneySummary,
  Opportunity,
  RecoveryAction,
  ScanProgressStep,
} from '@find-money/shared';
import {
  DEMO_ACCOUNTS,
  DEMO_CONNECTION,
  DEMO_USER,
  buildDemoTransactions,
  calculateSuccessFee,
  getScanStepsTemplate,
  runOpportunityEngine,
} from '@find-money/shared';

type AppStateValue = {
  hasOnboarded: boolean;
  bankConnected: boolean;
  hasScanned: boolean;
  connections: FinancialConnection[];
  accounts: Account[];
  opportunities: Opportunity[];
  actions: RecoveryAction[];
  scanSteps: ScanProgressStep[];
  filter: CategoryFilter;
  setFilter: (f: CategoryFilter) => void;
  summary: MoneySummary;
  activeOpportunities: Opportunity[];
  connectBank: () => void;
  runScan: () => Promise<ScanProgressStep[]>;
  getOpportunity: (id: string) => Opportunity | undefined;
  getAction: (opportunityId: string) => RecoveryAction | undefined;
  planAction: (opportunityId: string) => RecoveryAction;
  approveAction: (opportunityId: string) => RecoveryAction;
  completeRecovery: (opportunityId: string) => RecoveryAction;
  ignoreOpportunity: (opportunityId: string) => void;
  disconnectAll: () => void;
  deleteData: () => void;
  completeOnboarding: () => void;
  userName: string;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function emptySummary(): MoneySummary {
  return { totalFound: 0, opportunityCount: 0, recovered: 0, pending: 0, ignored: 0 };
}

function computeSummary(opportunities: Opportunity[]): MoneySummary {
  const active = opportunities.filter((o) => o.status !== 'ignored');
  const recovered = opportunities
    .filter((o) => o.status === 'recovered')
    .reduce((s, o) => s + o.potentialValue, 0);
  const pending = opportunities
    .filter((o) =>
      ['submitted', 'waiting', 'awaiting_approval', 'action_planned'].includes(o.status),
    )
    .reduce((s, o) => s + o.potentialValue, 0);
  const ignored = opportunities
    .filter((o) => o.status === 'ignored')
    .reduce((s, o) => s + o.potentialValue, 0);
  const found = active
    .filter((o) => o.status !== 'recovered')
    .reduce((s, o) => s + o.potentialValue, 0);

  return {
    totalFound: Math.round((found + recovered) * 100) / 100,
    opportunityCount: active.filter((o) => !['recovered', 'ignored'].includes(o.status)).length,
    recovered: Math.round(recovered * 100) / 100,
    pending: Math.round(pending * 100) / 100,
    ignored: Math.round(ignored * 100) / 100,
  };
}

function buildSteps(mode: Opportunity['actionMode']): ActionStep[] {
  if (mode === 'self_serve') {
    return [
      { id: '1', label: 'Verify opportunity', status: 'complete' },
      { id: '2', label: 'Prepare guidance', status: 'complete' },
      { id: '3', label: 'User takes action', status: 'current' },
      { id: '4', label: 'Confirm result', status: 'pending' },
    ];
  }
  return [
    { id: '1', label: 'Verify transaction', status: 'complete' },
    { id: '2', label: 'Prepare request', status: 'complete' },
    { id: '3', label: 'User approval', status: 'current' },
    { id: '4', label: 'Submit / request action', status: 'pending' },
    { id: '5', label: 'Track response', status: 'pending' },
  ];
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [bankConnected, setBankConnected] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [connections, setConnections] = useState<FinancialConnection[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [scanSteps, setScanSteps] = useState<ScanProgressStep[]>(getScanStepsTemplate());
  const [filter, setFilter] = useState<CategoryFilter>('all');

  const summary = useMemo(() => computeSummary(opportunities), [opportunities]);

  const activeOpportunities = useMemo(() => {
    const list = opportunities.filter((o) => !['recovered', 'ignored'].includes(o.status));
    if (filter === 'all') return list;
    return list.filter((o) => o.category === filter);
  }, [opportunities, filter]);

  const connectBank = useCallback(() => {
    setConnections([{ ...DEMO_CONNECTION, connectedAt: new Date().toISOString() }]);
    setAccounts(DEMO_ACCOUNTS.map((a) => ({ ...a })));
    setBankConnected(true);
  }, []);

  const runScan = useCallback(async () => {
    const steps = getScanStepsTemplate();
    setScanSteps(steps);

    for (let i = 0; i < steps.length; i += 1) {
      await new Promise((r) => setTimeout(r, 450));
      steps[i] = { ...steps[i], done: true };
      setScanSteps([...steps]);
    }

    const found = runOpportunityEngine({
      userId: DEMO_USER.id,
      transactions: buildDemoTransactions(),
    });
    setOpportunities(found);
    setHasScanned(true);
    return steps;
  }, []);

  const getOpportunity = useCallback(
    (id: string) => opportunities.find((o) => o.id === id),
    [opportunities],
  );

  const getAction = useCallback(
    (opportunityId: string) => actions.find((a) => a.opportunityId === opportunityId),
    [actions],
  );

  const planAction = useCallback(
    (opportunityId: string) => {
      const existing = actions.find((a) => a.opportunityId === opportunityId);
      if (existing) return existing;
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) throw new Error('Opportunity not found');

      const action: RecoveryAction = {
        id: `act_${opportunityId}`,
        opportunityId,
        mode: opportunity.actionMode,
        status: 'action_planned',
        steps: buildSteps(opportunity.actionMode),
        sharedInfo: [
          'Name',
          'Transaction date',
          'Transaction amount',
          'Relevant account information',
        ],
      };

      setActions((prev) => [...prev, action]);
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, status: 'action_planned', updatedAt: new Date().toISOString() }
            : o,
        ),
      );
      return action;
    },
    [actions, opportunities],
  );

  const approveAction = useCallback(
    (opportunityId: string) => {
      const action = planAction(opportunityId);
      const next: RecoveryAction = {
        ...action,
        status: 'waiting',
        submittedAt: new Date().toISOString(),
        steps: action.steps.map((step) => {
          if (step.id === '3' || step.id === '4') return { ...step, status: 'complete' };
          if (step.id === '5') return { ...step, status: 'current' };
          return step;
        }),
      };
      setActions((prev) => prev.map((a) => (a.opportunityId === opportunityId ? next : a)));
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, status: 'waiting', updatedAt: new Date().toISOString() }
            : o,
        ),
      );
      return next;
    },
    [planAction],
  );

  const completeRecovery = useCallback(
    (opportunityId: string) => {
      const opportunity = opportunities.find((o) => o.id === opportunityId);
      if (!opportunity) throw new Error('Opportunity not found');
      const action = actions.find((a) => a.opportunityId === opportunityId) ?? planAction(opportunityId);
      const recoveredAmount = opportunity.potentialValue;
      const next: RecoveryAction = {
        ...action,
        status: 'recovered',
        recoveredAt: new Date().toISOString(),
        recoveredAmount,
        feeAmount: calculateSuccessFee(recoveredAmount),
        steps: action.steps.map((s) => ({ ...s, status: 'complete' })),
      };
      setActions((prev) => {
        const exists = prev.some((a) => a.opportunityId === opportunityId);
        return exists
          ? prev.map((a) => (a.opportunityId === opportunityId ? next : a))
          : [...prev, next];
      });
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === opportunityId
            ? { ...o, status: 'recovered', updatedAt: new Date().toISOString() }
            : o,
        ),
      );
      return next;
    },
    [actions, opportunities, planAction],
  );

  const ignoreOpportunity = useCallback((opportunityId: string) => {
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId
          ? { ...o, status: 'ignored', updatedAt: new Date().toISOString() }
          : o,
      ),
    );
  }, []);

  const disconnectAll = useCallback(() => {
    setConnections([]);
    setAccounts([]);
    setBankConnected(false);
  }, []);

  const deleteData = useCallback(() => {
    setConnections([]);
    setAccounts([]);
    setOpportunities([]);
    setActions([]);
    setBankConnected(false);
    setHasScanned(false);
    setScanSteps(getScanStepsTemplate());
    setFilter('all');
  }, []);

  const value: AppStateValue = {
    hasOnboarded,
    bankConnected,
    hasScanned,
    connections,
    accounts,
    opportunities,
    actions,
    scanSteps,
    filter,
    setFilter,
    summary: hasScanned ? summary : emptySummary(),
    activeOpportunities,
    connectBank,
    runScan,
    getOpportunity,
    getAction,
    planAction,
    approveAction,
    completeRecovery,
    ignoreOpportunity,
    disconnectAll,
    deleteData,
    completeOnboarding: () => setHasOnboarded(true),
    userName: DEMO_USER.name,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
