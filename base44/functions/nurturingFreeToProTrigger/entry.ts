// nurturingFreeToProTrigger
// Entity Trigger sobre MisCasos (create) — detecta el "Momento Pro":
// 1) segundo caso del usuario, 2) plazo legal <5d, 3) documento generado.
// Envía email con CTA a /Pro?trigger=...
// Mandato §GrowthMarketing — KPI conversión Free→Pro objetivo 1.5%→2.5%

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PRO_URL = 'https://finlogic.one/Pro';

const TEMPLATES = {
  second_case: {
    subject: 'Acabas de abrir tu segundo caso · te toca FinLogic Pro',
    headline: 'Vas en serio.',
    body: (name) =>
      `Hola ${name || ''}, acabas de abrir tu <strong>segundo caso</strong> en FinLogic. Eso ya es defender tu derecho a otro nivel.<br/><br/>FinLogic Pro suma <strong>memoria persistente entre consultas</strong>, alertas <strong>WhatsApp 7d/3d/1d</strong> antes de cada plazo legal, y prioridad en generación de PDFs. Por <strong>$3.990 CLP/mes</strong>.`,
    trigger: 'second_case',
  },
  deadline_critical: {
    subject: 'Tu plazo legal vence pronto · activa Pro y no lo pierdas',
    headline: 'Plazo crítico detectado.',
    body: (name) =>
      `Hola ${name || ''}, uno de tus casos tiene un plazo legal a menos de 5 días. Con <strong>FinLogic Pro</strong> recibes alertas WhatsApp 7d/3d/1d antes y un aliado legal de respaldo. <strong>$3.990 CLP/mes</strong>, primer mes gratis.`,
    trigger: 'deadline_critical',
  },
  document_generated: {
    subject: 'Generaste tu primer documento · siguiente nivel: Pro',
    headline: 'Acabas de defender tu derecho.',
    body: (name) =>
      `Hola ${name || ''}, FinLogic ya generó un documento para ti. Imagina hacerlo cada vez con <strong>memoria persistente</strong>, <strong>asesoría 1:1 trimestral</strong> y alertas WhatsApp en tu plazo legal. <strong>$3.990 CLP/mes</strong>.`,
    trigger: 'document_generated',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    const event = payload?.event;
    if (!event || event.type !== 'create' || event.entity_name !== 'MisCasos') {
      return Response.json({ ok: true, skipped: 'wrong_event' });
    }

    const caso = payload.data;
    if (!caso || !caso.created_by) {
      return Response.json({ ok: true, skipped: 'no_user' });
    }

    const userEmail = caso.created_by;

    // Determinar trigger principal
    let triggerKey = null;

    // Trigger 1 — segundo caso del usuario
    const userCases = await base44.asServiceRole.entities.MisCasos.filter(
      { created_by: userEmail },
      '-created_date',
      10
    );
    if (Array.isArray(userCases) && userCases.length === 2) {
      triggerKey = 'second_case';
    }

    // Trigger 2 — caso con documento generado
    if (!triggerKey && caso.generatedDocRef) {
      triggerKey = 'document_generated';
    }

    // Trigger 3 — plazo crítico (daysRemaining <= 5)
    if (!triggerKey && typeof caso.daysRemaining === 'number' && caso.daysRemaining <= 5 && caso.daysRemaining >= 0) {
      triggerKey = 'deadline_critical';
    }

    if (!triggerKey) {
      return Response.json({ ok: true, skipped: 'no_trigger_match' });
    }

    // Verificar si ya recibió este trigger antes (evitar spam)
    const existingLeads = await base44.asServiceRole.entities.Lead.filter(
      { email: userEmail },
      '-created_date',
      1
    );
    const lead = existingLeads?.[0];
    if (lead?.proTriggerShownAt) {
      return Response.json({ ok: true, skipped: 'already_triggered' });
    }

    // Enviar email
    const tmpl = TEMPLATES[triggerKey];
    const userName = (userEmail || '').split('@')[0];

    const emailBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a2332;">
        <div style="font-size: 24px; font-weight: 800; color: #2DA66D; margin-bottom: 24px;">FinLogic</div>
        <h1 style="font-size: 28px; font-weight: 800; line-height: 1.15; margin: 0 0 16px;">${tmpl.headline}</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin: 0 0 24px;">${tmpl.body(userName)}</p>
        <a href="${PRO_URL}?trigger=${tmpl.trigger}" style="display: inline-block; background: #2DA66D; color: white; padding: 14px 28px; border-radius: 999px; font-weight: 600; text-decoration: none; font-size: 15px;">Probar Pro 7 días gratis →</a>
        <p style="font-size: 12px; color: #94a3b8; margin: 32px 0 0;">Cancelable cuando quieras · Ley 21.521 · finlogic.one</p>
      </div>
    `;

    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'FinLogic',
        to: userEmail,
        subject: tmpl.subject,
        body: emailBody,
      });
    } catch (mailErr) {
      // Email puede fallar si el user fue eliminado o no es app user (test).
      // No bloqueamos la automation: registramos y seguimos para no marcar failed.
      console.warn('nurturingFreeToProTrigger email skipped:', mailErr.message);
      return Response.json({
        ok: true,
        trigger: triggerKey,
        skipped: 'email_unavailable',
        reason: mailErr.message,
      });
    }

    // Registrar en Lead
    if (lead) {
      await base44.asServiceRole.entities.Lead.update(lead.id, {
        proTriggerShownAt: new Date().toISOString(),
        casesCount: userCases.length,
      });
    } else {
      await base44.asServiceRole.entities.Lead.create({
        email: userEmail,
        segment: 'ciudadano',
        source: 'direct',
        casesCount: userCases.length,
        proTriggerShownAt: new Date().toISOString(),
        lifecycleStage: 'activated',
      });
    }

    return Response.json({
      ok: true,
      trigger: triggerKey,
      sentTo: userEmail,
      casesCount: userCases.length,
    });
  } catch (error) {
    console.error('nurturingFreeToProTrigger error:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});