import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// CRON canónico FinLogic — corre 1x/día
// 1) Recalcula daysRemaining en MisCasos abiertos
// 2) Marca casos vencidos
// 3) Dispara alertas por email a 7d, 3d y 1d antes del vencimiento

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlines = await base44.asServiceRole.entities.LegalDeadline.filter({
      status: 'pendiente',
    });

    let processed = 0;
    let alertsSent = 0;
    let overdueMarked = 0;

    for (const dl of deadlines) {
      const deadlineDate = new Date(dl.deadlineDate);
      deadlineDate.setHours(0, 0, 0, 0);
      const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      // Sync daysRemaining en el caso vinculado
      if (dl.casoRef) {
        await base44.asServiceRole.entities.MisCasos.update(dl.casoRef, {
          daysRemaining,
          legalDeadlineRef: dl.id,
          ...(daysRemaining < 0 ? { status: 'vencido' } : {}),
        });
      }

      // Vencido
      if (daysRemaining < 0) {
        await base44.asServiceRole.entities.LegalDeadline.update(dl.id, {
          status: 'vencido',
        });
        overdueMarked++;
        processed++;
        continue;
      }

      // Determinar si toca alerta
      let alertWindow = null;
      let updateField = null;
      if (daysRemaining <= 1 && !dl.alertSent1d) {
        alertWindow = '1 día';
        updateField = 'alertSent1d';
      } else if (daysRemaining <= 3 && !dl.alertSent3d) {
        alertWindow = '3 días';
        updateField = 'alertSent3d';
      } else if (daysRemaining <= 7 && !dl.alertSent7d) {
        alertWindow = '7 días';
        updateField = 'alertSent7d';
      }

      if (alertWindow && dl.casoRef) {
        const caso = await base44.asServiceRole.entities.MisCasos.get(dl.casoRef).catch(() => null);
        if (caso?.created_by) {
          // Verificar que el destinatario exista como usuario de la app
          // (SendEmail rechaza correos a no-usuarios). Si no existe, marcamos
          // el alert como enviado para no reintentar en cada CRON.
          const userExists = await base44.asServiceRole.entities.User.filter({
            email: caso.created_by,
          }).then(u => u.length > 0).catch(() => false);

          if (userExists) {
            try {
              const subject = `⏰ FinLogic: tu plazo vence en ${alertWindow}`;
              const body = buildAlertEmail(caso, dl, daysRemaining);
              await base44.asServiceRole.integrations.Core.SendEmail({
                from_name: 'FinLogic',
                to: caso.created_by,
                subject,
                body,
              });
              alertsSent++;
            } catch (e) {
              console.warn(`email failed for ${caso.created_by}:`, e.message);
            }
          }
          // Siempre marcamos el alert window para no reintentar
          await base44.asServiceRole.entities.LegalDeadline.update(dl.id, {
            [updateField]: true,
            status: 'alertado',
          });
        }
      }

      processed++;
    }

    return Response.json({
      success: true,
      processed,
      alertsSent,
      overdueMarked,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('checkLegalDeadlines error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildAlertEmail(caso, deadline, daysRemaining) {
  const urgency = daysRemaining <= 1 ? '🚨 URGENTE' : daysRemaining <= 3 ? '⚠️ ALTA PRIORIDAD' : '📅 Recordatorio';
  return `
<div style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
  <div style="background: #f4f7f4; padding: 24px; border-radius: 24px;">
    <p style="color: #2d7a5f; font-weight: 700; font-size: 12px; letter-spacing: 1px; margin: 0 0 8px;">FINLOGIC · ${urgency}</p>
    <h1 style="font-size: 24px; color: #1a1a2e; margin: 0 0 12px;">Tu plazo legal vence en ${daysRemaining === 0 ? 'HOY' : daysRemaining + ' días'}</h1>
    <p style="color: #4a4a5e; line-height: 1.6; margin: 0 0 16px;">
      Caso: <strong>${caso.title}</strong>
    </p>
    <div style="background: white; padding: 16px; border-radius: 16px; border-left: 4px solid #2d9d7c;">
      <p style="margin: 0 0 6px; font-size: 13px; color: #6b6b7e;">Plazo legal:</p>
      <p style="margin: 0 0 12px; color: #1a1a2e; font-weight: 600;">${deadline.description}</p>
      <p style="margin: 0 0 6px; font-size: 13px; color: #6b6b7e;">Fundamento:</p>
      <p style="margin: 0; color: #1a1a2e; font-size: 14px;">${deadline.legalBasis}</p>
    </div>
    <p style="color: #4a4a5e; line-height: 1.6; margin: 16px 0;">
      <strong>Si no actúas:</strong> ${deadline.consequence}
    </p>
    <a href="https://finlogic.one/MisCasos" style="display: inline-block; background: #2d9d7c; color: white; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: 600;">
      Ver mi caso
    </a>
  </div>
  <p style="text-align: center; color: #9b9bae; font-size: 11px; margin-top: 16px;">
    Recibes esto porque tienes un caso abierto en FinLogic · El sistema operativo financiero del pueblo de Chile
  </p>
</div>`.trim();
}