# Find Money — Architecture

## Product loop

```
Find Money → Explain Why → Take Action → Track Recovery
```

This is **not** a budgeting, investing, banking, or credit-score app.
The wedge is money recovery and assisted action — not Rocket Money feature parity.

## Monorepo layout

```
apps/
  mobile/                 Expo (React Native) consumer app
    src/
      components/         Reusable UI primitives
      navigation/         Stack + tab navigators + param types
      screens/
        onboarding/       Splash → connect → scan
        main/             Home, Found feed, Expiring, History
        opportunity/      Detail → plan → approve → track → success
        settings/         Accounts, privacy, delete data
      state/              AppState — API client + session
      theme/              Colors, type, spacing
      utils/              Formatting helpers
      theme/              Colors, type, spacing
      utils/              Formatting helpers
  api/                    Express + TypeScript API
    src/
      routes/             HTTP surface (accounts, scan, opportunities, actions, user)
      services/           Store, scan orchestration, action lifecycle
packages/
  shared/                 Domain types, formatters, demo data, detection engine
    src/
      categories.ts       Recover / Save / Claim / Prevent / Optimize / Investigate
      types.ts            Opportunity, Transaction, Action contracts
      data/               Demo transactions that exercise every MVP detector
      engine/
        detectors/        Deterministic opportunity detectors
        opportunityEngine.ts
        aiExplain.ts      Explanation layer (rules first, AI polish second)
```

## Opportunity Detection Engine

```
Transactions (normalized)
        ↓
Deterministic detectors (duplicate, inactivity, anomaly, refund, price adj, credits)
        ↓
Policy (drop invalid / de-dupe)
        ↓
AI explanation (MVP: structured polish; prod: LLM with evidence only)
        ↓
User approval
        ↓
Assisted / automated action (only where appropriate)
        ↓
Tracking → verified recovery
```

**Important:** Detectors find candidates. AI explains and drafts. Users approve.
The model must never invent disputes or move money autonomously.

## Security model (MVP)

- Read-only financial intelligence
- Provider tokens only (Plaid item refs) — never bank passwords
- Data minimization — store only what detectors need
- Disconnect + delete endpoints
- Success fee applies to **verified recovered cash**, not hypothetical savings

## API surface

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account (access JWT + rotating refresh token) |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Rotate refresh session |
| POST | `/api/auth/logout` | Revoke refresh sessions |
| GET | `/api/auth/me` | Current user + summary |
| POST | `/api/accounts/plaid/link-token` | Plaid Link token |
| POST | `/api/accounts/plaid/exchange` | Exchange public_token; store encrypted access token |
| POST | `/api/scan` | Sync (Plaid) + run detection engine |
| GET | `/api/opportunities` | Money Found feed |
| GET | `/api/opportunities/:id` | Detail + evidence |
| POST | `/api/actions/:id/plan` | Build action plan |
| POST | `/api/actions/:id/approve` | User approval gate (does not mark recovered) |
| POST | `/api/actions/:id/verify` | Confirm recovered cash; 20% Stripe fee |
| GET | `/api/user/privacy` | Privacy commitments |
| DELETE | `/api/accounts/data` | Delete user financial data |

## North-star metric

**Verified dollars recovered per active user**
