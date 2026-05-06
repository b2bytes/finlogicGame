// getReferralStats — devuelve cuántos leads fueron referidos por el código del user actual.
// Mandato §GrowthMarketing.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function generateCode(email) {
  const seed = email || 'guest';
  const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0) * 31, 0);
  const base = Math.abs(hash).toString(36).toUpperCase().padStart(6, 'X').slice(0, 6);
  return `FL-${base}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = generateCode(user.email);
    const referredLeads = await base44.asServiceRole.entities.Lead.filter(
      { referredBy: code },
      '-created_date',
      500
    );

    const total = referredLeads?.length || 0;
    const activated = referredLeads?.filter(
      (l) => l.lifecycleStage === 'activated' || l.lifecycleStage === 'retained' || l.lifecycleStage === 'converted'
    ).length || 0;
    const converted = referredLeads?.filter((l) => l.convertedToPro).length || 0;

    let tier = 'Vecino';
    if (total >= 26) tier = 'Voz del barrio';
    else if (total >= 6) tier = 'Líder de cuadra';

    return Response.json({
      ok: true,
      code,
      total,
      activated,
      converted,
      tier,
    });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});