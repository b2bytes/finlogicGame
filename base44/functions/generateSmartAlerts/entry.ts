// generateSmartAlerts — CRON nocturno que escanea LegalDeadline y TaxAlert
// y crea registros LiveAlert (con sus mensajes en lenguaje ciudadano y script
// de voz para Lya) cuando un plazo se acerca.
//
// Flujo:
//   1. Lee LegalDeadline pendientes con deadlineDate ≤ +7 días.
//   2. Determina la ventana (7d, 3d, 1d, vencido) y crea una LiveAlert.
//   3. Hace lo mismo para TaxAlert (vencimiento_iva, ppm, renta).
//   4. Idempotente: no crea duplicados si ya existe LiveAlert para el mismo
//      relatedEntityId + alertType del día.
//
// Solo admin puede ejecutarlo manualmente (también se puede automatizar con
// scheduled automation diaria).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const DAY_MS = 86400000;

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / DAY_MS);
}

function bucketLegal(days) {
  if (days < 0) return 'legal_deadline_overdue';
  if (days <= 1) return 'legal_deadline_1d';
  if (days <= 3) return 'legal_deadline_3d';
  if (days <= 7) return 'legal_deadline_7d';
  return null;
}

function bucketTax(alertType, days) {
  if (days == null || days > 7) return null;
  if (alertType === 'vencimiento_iva') return 'tax_iva_upcoming';
  if (alertType === 'declaracion_renta') return 'tax_renta_due';
  return 'tax_f29_due';
}

function severityForDays(days) {
  if (days < 0) return 'critical';
  if (days <= 1) return 'critical';
  if (days <= 3) return 'high';
  return 'medium';
}

function legalCopy({ deadline, days }) {
  const overdue = days < 0;
  const orgLabel = deadline.organism || 'el organismo';
  const desc = deadline.description || 'tu plazo legal';
  if (overdue) {
    return {
      title: `⚠️ Plazo vencido · ${orgLabel}`,
      message: `${desc}. Aún puedes presentarlo, pero con riesgo. ${deadline.legalBasis || ''}`.trim(),
      lyaScript: `Atención. Tu plazo legal con ${orgLabel} venció hace ${Math.abs(days)} días. Es ${desc}. Aunque está fuera de plazo, puedes presentarlo argumentando el ${deadline.legalBasis || 'fundamento legal'}. ¿Te ayudo a redactar la carta ahora?`,
    };
  }
  if (days <= 1) {
    return {
      title: `🚨 Vence mañana · ${orgLabel}`,
      message: `${desc}. ${deadline.legalBasis || ''}`.trim(),
      lyaScript: `Aviso urgente. Tu plazo con ${orgLabel} vence en menos de 24 horas. Se trata de ${desc}. La base legal es ${deadline.legalBasis || 'la normativa vigente'}. ¿Generamos el documento ahora mismo?`,
    };
  }
  return {
    title: `📅 Plazo en ${days} días · ${orgLabel}`,
    message: `${desc}. ${deadline.legalBasis || ''}`.trim(),
    lyaScript: `Recordatorio. En ${days} días vence tu plazo con ${orgLabel} para ${desc}. Te recomiendo iniciar el trámite hoy. ¿Quieres que abra la página del caso?`,
  };
}

function taxCopy({ alert, days }) {
  const overdue = days < 0;
  const action = alert.actionRequired || 'presentar la declaración';
  const formRef = alert.siiFormReference ? ` (${alert.siiFormReference})` : '';
  if (overdue) {
    return {
      title: `⚠️ ${alert.title || 'Vencimiento SII'} vencido`,
      message: `Acción urgente${formRef}: ${action}. Multa estimada: $${(alert.amountAtRisk || 0).toLocaleString('es-CL')}.`,
      lyaScript: `Tu vencimiento tributario${formRef} venció hace ${Math.abs(days)} días. La acción es ${action}. Hay un monto en riesgo de ${(alert.amountAtRisk || 0).toLocaleString('es-CL')} pesos. Te recomiendo regularizar hoy.`,
    };
  }
  if (days <= 2) {
    return {
      title: `💸 Vence en ${days} día${days === 1 ? '' : 's'}${formRef}`,
      message: `${action}. ${alert.legalBasis || ''}`.trim(),
      lyaScript: `Aviso tributario. En ${days} día${days === 1 ? '' : 's'} vence tu obligación SII${formRef}. Necesitas ${action}. ¿Quieres que abra tu perfil pyme?`,
    };
  }
  return {
    title: `📅 SII en ${days} días${formRef}`,
    message: `${action}. ${alert.legalBasis || ''}`.trim(),
    lyaScript: `Recordatorio tributario. En ${days} días debes ${action}${formRef}. Mejor adelantarse.`,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const created = [];
    const skipped = [];

    // 1. Plazos legales
    const deadlines = await base44.asServiceRole.entities.LegalDeadline.filter(
      { status: 'pendiente' }, '-deadlineDate', 200
    ).catch(() => []);

    for (const d of deadlines) {
      const days = daysUntil(d.deadlineDate);
      if (days == null || days > 7) { skipped.push({ id: d.id, reason: 'fuera de ventana' }); continue; }
      const alertType = bucketLegal(days);
      if (!alertType) continue;

      // Idempotencia: evitar duplicados del mismo día
      const existing = await base44.asServiceRole.entities.LiveAlert.filter({
        relatedEntityId: d.id, alertType,
      }, '-created_date', 1).catch(() => []);
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      if (existing.length > 0 && new Date(existing[0].created_date) >= todayStart) {
        skipped.push({ id: d.id, reason: 'ya alertado hoy' }); continue;
      }

      const copy = legalCopy({ deadline: d, days });
      const newAlert = await base44.asServiceRole.entities.LiveAlert.create({
        userEmail: d.created_by || '',
        alertType,
        severity: severityForDays(days),
        title: copy.title,
        message: copy.message,
        actionLabel: 'Ver caso',
        actionPath: d.casoRef ? `/MisCasos/${d.casoRef}` : '/MisCasos',
        lyaShouldSpeak: days <= 3,
        lyaScript: copy.lyaScript,
        relatedEntity: 'LegalDeadline',
        relatedEntityId: d.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        channel: 'realtime',
      });
      created.push(newAlert.id);
    }

    // 2. Alertas tributarias pyme
    const taxAlerts = await base44.asServiceRole.entities.TaxAlert.filter(
      { status: 'pendiente' }, '-deadline', 200
    ).catch(() => []);

    for (const t of taxAlerts) {
      const days = daysUntil(t.deadline);
      if (days == null || days > 7) continue;
      const alertType = bucketTax(t.alertType, days);
      if (!alertType) continue;

      const existing = await base44.asServiceRole.entities.LiveAlert.filter({
        relatedEntityId: t.id, alertType,
      }, '-created_date', 1).catch(() => []);
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
      if (existing.length > 0 && new Date(existing[0].created_date) >= todayStart) continue;

      const copy = taxCopy({ alert: t, days });
      const newAlert = await base44.asServiceRole.entities.LiveAlert.create({
        userEmail: t.created_by || '',
        alertType,
        severity: severityForDays(days),
        title: copy.title,
        message: copy.message,
        actionLabel: 'Ver pyme',
        actionPath: '/Pyme',
        lyaShouldSpeak: days <= 2,
        lyaScript: copy.lyaScript,
        relatedEntity: 'TaxAlert',
        relatedEntityId: t.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        channel: 'realtime',
      });
      created.push(newAlert.id);
    }

    return Response.json({
      success: true,
      legalDeadlinesScanned: deadlines.length,
      taxAlertsScanned: taxAlerts.length,
      alertsCreated: created.length,
      skipped: skipped.length,
      createdIds: created,
    });
  } catch (error) {
    console.error('generateSmartAlerts error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});