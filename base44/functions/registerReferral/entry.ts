// registerReferral — registra que un usuario llegó vía referralCode.
// Crea o actualiza Lead con referredBy. Idempotente: si ya tiene referredBy, no lo sobreescribe.
// Mandato §GrowthMarketing.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { referralCode } = await req.json();
    if (!referralCode || !/^FL-[A-Z0-9]{4,10}$/.test(referralCode)) {
      return Response.json({ ok: false, error: 'invalid_code' }, { status: 400 });
    }

    const existing = await base44.asServiceRole.entities.Lead.filter(
      { email: user.email },
      '-created_date',
      1
    );
    const lead = existing?.[0];

    if (lead) {
      if (lead.referredBy) {
        return Response.json({ ok: true, skipped: 'already_attributed' });
      }
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        referredBy: referralCode,
      });
    } else {
      await base44.asServiceRole.entities.Lead.create({
        email: user.email,
        segment: 'ciudadano',
        source: 'referral',
        referredBy: referralCode,
        lifecycleStage: 'visitor',
      });
    }

    return Response.json({ ok: true, referralCode });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});