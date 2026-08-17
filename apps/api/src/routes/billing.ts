import type { Request, Response } from 'express';
import { markFeePaid } from '../services/actionService';
import { constructWebhookEvent } from '../services/stripeService';

export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  const signature = req.headers['stripe-signature'];
  if (!signature || Array.isArray(signature)) {
    res.status(400).json({ error: 'Missing Stripe signature' });
    return;
  }
  if (!Buffer.isBuffer(req.body)) {
    res.status(400).json({ error: 'Webhook requires raw body' });
    return;
  }

  try {
    const event = constructWebhookEvent(req.body, signature);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const opportunityId = session.metadata?.opportunityId ?? session.client_reference_id;
      if (userId && opportunityId) {
        await markFeePaid(userId, opportunityId);
      }
    }
    res.json({ received: true });
  } catch {
    res.status(400).json({ error: 'Invalid webhook' });
  }
}
