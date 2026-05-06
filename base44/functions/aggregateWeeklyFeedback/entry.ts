// aggregateWeeklyFeedback
// CRON semanal lunes 06:00 UTC.
// Agrega CSAT (ConsultationHistory.userSatisfactionRating), score promedio (AgentTrace.verifierScore),
// y deflection FAQ (FAQInteraction.deflectionSuccess) de los últimos 7 días.
// Si score baja >5 puntos vs semana anterior, o CSAT promedio <3.8, o deflection <40%,
// crea OperationalAlert severidad alta.
// Mandato §Lya — calidad continua + §SupportAgent KPI 65% deflection D+90.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Solo admin o cron interno
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const now = Date.now();
    const week1Start = new Date(now - SEVEN_DAYS_MS).toISOString();
    const week2Start = new Date(now - 2 * SEVEN_DAYS_MS).toISOString();

    // Last 14 días en una sola fetch (200 cubre ~2 semanas en uso real)
    const [traces, history, faqs] = await Promise.all([
      base44.asServiceRole.entities.AgentTrace.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.ConsultationHistory.list('-created_date', 500).catch(() => []),
      base44.asServiceRole.entities.FAQInteraction.list('-created_date', 500).catch(() => []),
    ]);

    const inWindow = (createdDate, start, end = null) => {
      if (!createdDate) return false;
      const d = new Date(createdDate).toISOString();
      if (end) return d >= start && d < end;
      return d >= start;
    };

    // Semana actual (last 7 días)
    const tracesW1 = traces.filter((t) => inWindow(t.created_date, week1Start));
    const historyW1 = history.filter((h) => inWindow(h.created_date, week1Start));
    const faqsW1 = faqs.filter((f) => inWindow(f.created_date, week1Start));

    // Semana anterior (7-14 días atrás)
    const tracesW2 = traces.filter((t) => inWindow(t.created_date, week2Start, week1Start));

    // Métricas
    const avgScore = (arr) => {
      const scores = arr.filter((t) => typeof t.verifierScore === 'number').map((t) => t.verifierScore);
      return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    };

    const scoreW1 = avgScore(tracesW1);
    const scoreW2 = avgScore(tracesW2);
    const scoreDelta = scoreW1 - scoreW2;

    const ratings = historyW1
      .filter((h) => typeof h.userSatisfactionRating === 'number')
      .map((h) => h.userSatisfactionRating);
    const csat = ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    const totalFaq = faqsW1.length;
    const deflectedFaq = faqsW1.filter((f) => f.deflectionSuccess).length;
    const deflectionRate = totalFaq ? Math.round((deflectedFaq / totalFaq) * 100) : 0;

    // Detectar problemas y crear alertas
    const alertsCreated = [];

    if (scoreDelta < -5 && scoreW2 > 0) {
      const alert = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: scoreDelta < -10 ? 'critical' : 'high',
        title: `Score verificador bajó ${Math.abs(scoreDelta)} puntos esta semana`,
        description: `Semana actual: ${scoreW1}/100 vs semana anterior: ${scoreW2}/100. Revisar Knowledge Files y prompts del especialista.`,
        affectedEntity: 'AgentTrace',
        metricValue: scoreW1,
        status: 'open',
      });
      alertsCreated.push(alert.id);
    }

    if (csat !== null && csat < 3.8) {
      const alert = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: csat < 3 ? 'critical' : 'high',
        title: `CSAT semanal en ${csat}/5 (target ≥4.2)`,
        description: `${ratings.length} ratings recibidos. Revisar respuestas con rating bajo y refinar tono/claridad.`,
        affectedEntity: 'ConsultationHistory',
        metricValue: csat,
        status: 'open',
      });
      alertsCreated.push(alert.id);
    }

    if (totalFaq >= 20 && deflectionRate < 40) {
      const alert = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: 'medium',
        title: `Deflection FAQ en ${deflectionRate}% (target ≥65% D+90)`,
        description: `${deflectedFaq}/${totalFaq} FAQs auto-resueltas. Revisar keywords y agregar FAQs faltantes a autoResolveFAQ.`,
        affectedEntity: 'FAQInteraction',
        metricValue: deflectionRate,
        status: 'open',
      });
      alertsCreated.push(alert.id);
    }

    return Response.json({
      ok: true,
      window: { weekStart: week1Start, now: new Date(now).toISOString() },
      metrics: {
        scoreW1,
        scoreW2,
        scoreDelta,
        csat,
        ratingsCount: ratings.length,
        deflectionRate,
        totalFaq,
        deflectedFaq,
        tracesCount: tracesW1.length,
      },
      alertsCreated,
    });
  } catch (error) {
    console.error('aggregateWeeklyFeedback error:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});