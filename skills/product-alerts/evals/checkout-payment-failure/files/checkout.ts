import Stripe from 'stripe';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const CheckoutInput = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['INR', 'USD']),
  paymentMethodId: z.string(),
});

export async function checkout(raw: unknown, userId: string) {
  const parsed = CheckoutInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: 'invalid input', issues: parsed.error.issues };
  }
  const input = parsed.data;

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency.toLowerCase(),
      payment_method: input.paymentMethodId,
      confirm: true,
      metadata: { orderId: input.orderId, userId },
    });
    if (intent.status !== 'succeeded') {
      return { ok: false, error: 'payment not completed', status: intent.status };
    }
    await markOrderPaid(input.orderId, intent.id);
    return { ok: true, intentId: intent.id };
  } catch (err) {
    console.error('checkout failed', err);
    return { ok: false, error: 'payment failed' };
  }
}

async function markOrderPaid(orderId: string, intentId: string) {
  const res = await fetch(`${process.env.ORDERS_API}/orders/${orderId}/paid`, {
    method: 'POST',
    body: JSON.stringify({ intentId }),
  });
  if (!res.ok) throw new Error(`orders api ${res.status}`);
}
