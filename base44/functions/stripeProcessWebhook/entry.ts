// stripeProcessWebhook
// Webhook handler de Stripe — verifica firma y maneja:
// - customer.subscription.{created,updated,deleted}
// - invoice.payment_failed
// Mandato ValidatorAgent §5.10 — gap crítico de plataforma.
//
// Requiere secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || 'sk_test_dummy', {
  apiVersion: '2024-06-20',
});
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');

const PLAN_BY_AMOUNT_CLP = {
  3990: 'pro',
  490000: 'compliance_api',
};

function detectPlan(subscription) {
  const item = subscription?.items?.data?.[0];
  const price = item?.price;
  if (!price) return 'pro';
  const amount = (price.unit_amount || 0) / 100;
  return PLAN_BY_AMOUNT_CLP[amount] || 'pro';
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');
    const rawBody = await req.text();

    if (!WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET no configurado — webhook rechazado');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 401 });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('Firma Stripe inválida:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const base44 = createClientFromRequest(req);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userEmail = sub.metadata?.user_email;
        if (!userEmail) {
          console.warn('Subscription sin user_email en metadata:', sub.id);
          break;
        }

        const plan = detectPlan(sub);
        const priceClp = (sub.items?.data?.[0]?.price?.unit_amount || 0) / 100;

        const existing = await base44.asServiceRole.entities.Subscription.filter(
          { stripeSubscriptionId: sub.id },
          null,
          1
        );

        const data = {
          userId: userEmail,
          plan,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer,
          status: sub.status,
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: !!sub.cancel_at_period_end,
          priceClp,
        };

        if (existing?.[0]) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, data);
        } else {
          await base44.asServiceRole.entities.Subscription.create(data);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const existing = await base44.asServiceRole.entities.Subscription.filter(
          { stripeSubscriptionId: sub.id },
          null,
          1
        );
        if (existing?.[0]) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: 'canceled',
            cancelAtPeriodEnd: true,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await base44.asServiceRole.entities.FinancialAlert.create({
          alertType: 'payment_failed',
          severity: 'high',
          title: `Pago fallido · ${invoice.customer_email || invoice.customer}`,
          message: `Invoice ${invoice.id} por $${(invoice.amount_due || 0) / 100} ${(invoice.currency || 'clp').toUpperCase()} no pudo procesarse.`,
          amountAtRisk: (invoice.amount_due || 0) / 100,
        });
        break;
      }

      default:
        // Evento desconocido → 200 (Stripe deja de reintentar)
        break;
    }

    return Response.json({ received: true, type: event.type });
  } catch (error) {
    console.error('stripeProcessWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});