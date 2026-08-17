import Stripe from 'stripe';
import { calculateSuccessFee } from '@find-money/shared';
import { loadConfig, stripeIsConfigured } from '../lib/config';
import { AppError } from '../lib/errors';

export function stripeConfigured(): boolean {
  return stripeIsConfigured();
}

function client(): Stripe {
  const { stripeSecretKey } = loadConfig();
  if (!stripeSecretKey) {
    throw new AppError('Stripe is not configured', 501, 'STRIPE_NOT_CONFIGURED');
  }
  return new Stripe(stripeSecretKey);
}

export async function createSuccessFeeCheckout(input: {
  userId: string;
  opportunityId: string;
  recoveredAmount: number;
}): Promise<{
  paymentIntentId: string;
  clientSecret: string | null;
  checkoutUrl: string | null;
  feeAmount: number;
} | null> {
  const feeAmount = calculateSuccessFee(input.recoveredAmount);
  if (feeAmount <= 0) return null;
  if (!stripeConfigured()) {
    return { paymentIntentId: '', clientSecret: null, checkoutUrl: null, feeAmount };
  }

  const origin = loadConfig().publicAppUrl;
  if (!origin) {
    throw new AppError('PUBLIC_APP_URL is required to collect the success fee', 500, 'CONFIG');
  }

  const session = await client().checkout.sessions.create({
    mode: 'payment',
    success_url: `${origin}/fee-complete?opportunity=${encodeURIComponent(input.opportunityId)}`,
    cancel_url: `${origin}/fee-cancel?opportunity=${encodeURIComponent(input.opportunityId)}`,
    client_reference_id: input.opportunityId,
    metadata: {
      userId: input.userId,
      opportunityId: input.opportunityId,
      recoveredAmount: String(input.recoveredAmount),
      feeType: 'verified_recovery_success_fee',
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(feeAmount * 100),
          product_data: {
            name: 'Find Money success fee',
            description: '20% of verified recovered cash only — not hypothetical savings',
          },
        },
      },
    ],
  });

  return {
    paymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.id,
    clientSecret: null,
    checkoutUrl: session.url,
    feeAmount,
  };
}

export function constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
  const secret = loadConfig().stripeWebhookSecret;
  if (!secret) throw new AppError('STRIPE_WEBHOOK_SECRET is not set', 501, 'STRIPE_NOT_CONFIGURED');
  return client().webhooks.constructEvent(rawBody, signature, secret);
}

export async function markIntentPaid(paymentIntentId: string): Promise<boolean> {
  if (!stripeConfigured() || !paymentIntentId) return false;
  try {
    const intent = await client().paymentIntents.retrieve(paymentIntentId);
    return intent.status === 'succeeded';
  } catch {
    return false;
  }
}
