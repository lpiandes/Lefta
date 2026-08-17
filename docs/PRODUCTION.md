# Production path

Find Money makes money by taking **20% of verified recovered cash** via Stripe. It never holds user bank funds. Do not add demo bank data or hardcoded institutions.

## Phase A — hosted backend (required)

1. Postgres (`DATABASE_URL`)
2. `JWT_SECRET` (32+ random characters) and `ENCRYPTION_KEY` (32 random bytes as 64 hex chars, not zeros)
3. Host `apps/api` with the root `Dockerfile` or `render.yaml` (TLS on the host)
4. Point the app at it: `EXPO_PUBLIC_API_URL=https://api.yourdomain.com` in `apps/mobile/.env`
5. Stripe webhook: `POST /api/billing/webhook`
6. TestFlight / internal Android build (Expo Go’s blue gear is not the product)

## Phase B — real transactions (required to find real money)

1. Create a Plaid company account
2. Set `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV=sandbox`
3. Use existing Link flow in `plaidService.ts` + `PlaidLinkScreen.tsx`
4. Switch `PLAID_ENV=production` after Plaid production approval

Detectors already run on stored transactions. No new UI required.

## Phase C — collect the 20% (required to make money)

1. Stripe account + `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_APP_URL`
2. Checkout after `POST /api/actions/:id/verify`
3. Charge only `calculateSuccessFee(verifiedAmount)` — never hypothetical savings
4. Public TOS + privacy that match disconnect/delete
5. Counsel: success-fee SaaS, not a money transmitter (no custody of recovered funds)

## Phase D — recovery beyond “user confirmed cash”

Keep assisted + self-serve guidance. Add dispute **templates and tracking**. Do not auto-file disputes.

## Phase E — email receipts (later)

Gmail / Microsoft OAuth with receipt-only scopes is an app-review project. Do not block A–C.

Email connect and bill upload in the app are honest placeholders until Phase E.
