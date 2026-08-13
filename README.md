# Find Money

**Your money-finding agent.**

Find Money scans the financial information you choose to connect, continuously finds legitimate opportunities to save or recover money, and gives you a one-tap way to act — with approval before anything consequential happens.

```
Find → Explain → Take Action → Track Recovery
```

Not a budgeting app. Not Rocket Money with AI. The product is **money recovery**.

## Quick start

```bash
# install
npm install

# build shared domain + engine
npm run build:shared

# API (http://localhost:4000)
npm run dev:api

# Mobile (Expo)
npm run dev:mobile
```

## What’s in the MVP

- Onboarding + trust/security screens
- Simulated Plaid bank connect (read-only)
- Opportunity Detection Engine:
  - duplicate charges
  - unused subscriptions
  - unusual bill increases
  - refund/return windows
  - price adjustments
  - expiring credits
- Home “We found $X” dashboard
- Found feed with category filters
- Opportunity detail → Do it for me → approval → tracking → success
- Recovery history + privacy settings
- Success-based fee model (20% of verified recovered cash)

## Repo map

| Path | Role |
|------|------|
| `apps/mobile` | Expo React Native app |
| `apps/api` | Node/Express API |
| `packages/shared` | Types, demo data, detectors, formatters |
| `docs/ARCHITECTURE.md` | System design |

## Demo path

1. Open the app → **Find My Money**
2. Connect a bank (any listed institution)
3. Review permissions + security
4. Watch the scan
5. Tap an opportunity → **Do it for me**
6. Approve → simulate recovery → share loop

## Tests

```bash
npm test
```

## Stack

- Mobile: Expo + React Navigation + Fraunces / DM Sans
- API: Express + TypeScript
- Shared engine: deterministic detectors + explanation layer
- Production targets: Plaid, Postgres, Clerk/Supabase Auth, Stripe, APNs/FCM
