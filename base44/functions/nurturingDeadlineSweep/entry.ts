// nurturingDeadlineSweep
// CRON diario: detecta casos abiertos con plazo legal <=5 días y dispara
// el email "Momento Pro · deadline_critical" (una vez por usuario).
// Complementa nurturingFreeToProTrigger (que solo corre on-create).
// Mandato §GrowthMarketing — KPI conversión Free→Pro 1.5%→2.5%.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PRO_URL = 'https://finlogic.one/Pro';

const TEMPLATE = {
  subject: 'Tu plazo legal vence pronto · activa Pro y no lo pierdas',
  headline: 'Plazo crítico detectado.',
  body: (name, days) =>
    `Hola ${name || ''}, uno de tus casos en FinLogic tiene un plazo legal a <strong>${days} día${days === 1 ? '' : 's'}</strong>. Con <strong>FinLogic Pro</strong> recibes alertas WhatsApp 7d/3d/1d antes de vencer y prioridad en la cola. <strong>$3.990 CLP/mes</strong>, primer mes gratis.`,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Solo admin puede ejecutar manualmente
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Casos abiertos con plazo crítico (0-5 días)
    const casos = await base44.asServiceRole.entities.MisCasos.filter(
      { status: 'abierto' },
      '-created_date',
      500
    );

    const critical = (casos || []).filter(
      (c) => typeof c.daysRemaining === 'number' && c.daysRemaining >= 0 && c.daysRemaining <= 5
    );

    let sent = 0;
    let skipped = 0;

    for (const caso of critical) {
      const userEmail = caso.created_by;
      if (!userEmail) {
        skipped++;
        continue;
      }

      // Evitar spam: si ya recibió cualquier trigger Pro, skip
      const existingLeads = await base44.asServiceRole.entities.Lead.filter(
        { email: userEmail },
        '-created_date',
        1
      );
      const lead = existingLeads?.[0];
      if (lead?.proTriggerShownAt) {
        skipped++;
        continue;
      }

      const userName = (userEmail || '').split('@')[0];
      const days = caso.daysRemaining;

      const emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a2332;">
          <div style="font-size: 24px; font-weight: 800; color: #2DA66D; margin-bottom: 24px;">FinLogic</div>
          <h1 style="font-size: 28px; font-weight: 800; line-height: 1.15; margin: 0 0 16px;">${TEMPLATE.headline}</h1>
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 24px;">${TEMPLATE.body(userName, days)}</p>
          <a href="${PRO_URL}?trigger=deadline_critical" style="display: inline-block; background: #2DA66D; color: white; padding: 14px 28px; border-radius: 999px; font-weight: 600; text-decoration: none; font-size: 15px;">Probar Pro 7 días gratis →</a>
          <p style="font-size: 12px; color: #94a3b8; margin: 32px 0 0;">Cancelable cuando quieras · Ley 21.521 · finlogic.one</p>
        </div>
      `;

      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'FinLogic',
        to: userEmail,
        subject: TEMPLATE.subject,
        body: emailBody,
      });

      // Registrar trigger en Lead
      if (lead) {
        await base44.asServiceRole.entities.Lead.update(lead.id, {
          proTriggerShownAt: new Date().toISOString(),
        });
      } else {
        await base44.asServiceRole.entities.Lead.create({
          email: userEmail,
          segment: 'ciudadano',
          source: 'direct',
          casesCount: 1,
          proTriggerShownAt: new Date().toISOString(),
          lifecycleStage: 'activated',
        });
      }

      sent++;
    }

    return Response.json({
      ok: true,
      casesScanned: casos?.length || 0,
      criticalFound: critical.length,
      emailsSent: sent,
      skipped,
    });
  } catch (error) {
    console.error('nurturingDeadlineSweep error:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});