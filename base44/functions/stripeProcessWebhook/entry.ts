import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.5.0';

// stripeProcessWebhook — cierra GAP CRÍTICO ValidatorAgent.
// Verifica firma Stripe y sincroniza Subscription FinLogic (free/pro/compliance_api).
// Eventos: customer.subscription.{created,updated,deleted}, invoice.payment_failed.
//
// Endpoint público (Stripe llama sin auth de usuario). NO requiere base44.auth.me().

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'), {
  apiVersion: '2024-12-18.acacia',
});

const PRICE_TO_PLAN = {
  // Map price IDs → plan canónico FinLogic. Configura en dashboard.
  // Pro $3.990 CLP/mes → 'pro'
  // Compliance API base $490.000 CLP/mes → 'compliance_api'
};

function priceIdToPlan(priceId) {
  if (!priceId) return 'free';
  if (PRICE_TO_PLAN[priceId]) return PRICE_TO_PLAN[priceId];
  // Heurística por nickname/lookup_key del price (configurable sin redeploy)
  if (priceId.includes('compliance') || priceId.includes('490')) return 'compliance_api';
  if (priceId.includes('pro') || priceId.includes('3990')) return 'pro';
  return 'pro';
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return Response.json({ error: 'Missing signature or secret' }, { status: 401 });
    }

    const body = await req.text();
    const base44 = createClientFromRequest(req);

    let event;
    try {
      // Deno: SubtleCrypto async → constructEventAsync
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Stripe signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = event.data.object;

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const priceId = data.items?.data?.[0]?.price?.id;
        const plan = priceIdToPlan(priceId);
        const priceAmount = data.items?.data?.[0]?.price?.unit_amount || 0;

        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripeSubscriptionId: data.id,
        });

        const payload = {
          plan,
          stripeSubscriptionId: data.id,
          stripeCustomerId: data.customer,
          status: data.status,
          currentPeriodStart: new Date(data.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(data.current_period_end * 1000).toISOString(),
          cancelAtPeriodEnd: !!data.cancel_at_period_end,
          priceClp: Math.round(priceAmount / 100),
        };

        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, payload);
        } else {
          // userId se resuelve por customer email (Stripe lo provee)
          const customer = await stripe.customers.retrieve(data.customer);
          const userId = customer?.email || data.customer;
          await base44.asServiceRole.entities.Subscription.create({
            userId,
            ...payload,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const existing = await base44.asServiceRole.entities.Subscription.filter({
          stripeSubscriptionId: data.id,
        });
        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
            status: 'canceled',
            cancelAtPeriodEnd: false,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const subId = data.subscription;
        if (subId) {
          const existing = await base44.asServiceRole.entities.Subscription.filter({
            stripeSubscriptionId: subId,
          });
          if (existing && existing.length > 0) {
            await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
              status: 'past_due',
            });
          }
        }
        break;
      }

      default:
        // Evento desconocido → 200 silencioso (mandato ValidatorAgent)
        return Response.json({ received: true, ignored: event.type });
    }

    return Response.json({ received: true, type: event.type });
  } catch (error) {
    console.error('stripeProcessWebhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});