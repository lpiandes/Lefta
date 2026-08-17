# Find Money

**Your money-finding agent.**

Find Money scans the financial information you choose to connect, continuously finds legitimate opportunities to save or recover money, and gives you a one-tap way to act — with approval before anything consequential happens.

```
Find → Explain → Take Action → Track Recovery
```

Not a budgeting app. Not Rocket Money with AI. The product is **money recovery**.

## Quick start

```bash
npm install
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
# Fill required values in both files (see below).

docker compose up -d
npm run db:push
npm run build:shared
npm run dev:api
npm run dev:mobile
```

Create an account in the app, connect a bank with Plaid Link, then scan. There is no demo bank path — Plaid credentials are required to connect accounts.

## What’s in the product

- Account create / login (short-lived access JWT + rotating refresh sessions)
- Onboarding + trust/security screens
- Plaid Link bank connect (encrypted provider tokens only)
- Opportunity Detection Engine on the user’s transactions
- Home “We found $X” dashboard
- Found feed with category filters
- Opportunity detail → Do it for me → approval → tracking
- Recovery is verified only when cash is confirmed
- 20% success fee on verified recovered cash (Stripe Checkout when Stripe is configured)
- Disconnect + delete stored financial data
- Face ID / device passcode unlock when the device supports it

## Repo map

| Path | Role |
|------|------|
| `apps/mobile` | Expo React Native app |
| `apps/api` | Node/Express API |
| `packages/shared` | Types, test fixtures, detectors, formatters |
| `docs/ARCHITECTURE.md` | System design |
| `docs/PRODUCTION.md` | How to go live: host, Plaid, Stripe |

## Tests

```bash
npm test
```

## Stack

- Mobile: Expo + React Navigation + Fraunces / DM Sans
- API: Express + TypeScript + Postgres
- Shared engine: deterministic detectors + explanation layer
- Auth: email/password, bcrypt, access JWT + hashed refresh sessions
- Production targets: Plaid, Postgres, Stripe
