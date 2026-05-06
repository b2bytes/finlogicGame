// aggregateWeeklyFeedback
// CRON semanal §Lya §SupportAgent — agrega CSAT + scoring del verificador
// y dispara OperationalAlert si baja del baseline (72/100 score, 4.0 CSAT).
// Genera resumen ejecutivo en lenguaje natural para el dashboard admin.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCORE_BASELINE = 72;
const SCORE_TARGET = 85;
const CSAT_BASELINE = 4.0;
const FAQ_DEFLECTION_TARGET = 65;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Fetch en paralelo
    const [traces, consultations, faqs, tickets] = await Promise.all([
      base44.asServiceRole.entities.AgentTrace.filter(
        { created_date: { $gte: sevenDaysAgo } },
        '-created_date',
        500
      ).catch(() => []),
      base44.asServiceRole.entities.ConsultationHistory.filter(
        { created_date: { $gte: sevenDaysAgo } },
        '-created_date',
        500
      ).catch(() => []),
      base44.asServiceRole.entities.FAQInteraction.filter(
        { created_date: { $gte: sevenDaysAgo } },
        '-created_date',
        500
      ).catch(() => []),
      base44.asServiceRole.entities.SupportTicket.filter(
        { created_date: { $gte: sevenDaysAgo } },
        '-created_date',
        500
      ).catch(() => []),
    ]);

    // Métricas score
    const scores = traces.map((t) => t.verifierScore).filter((s) => typeof s === 'number');
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Métricas latencia
    const latencies = traces.map((t) => t.totalLatencyMs).filter((l) => typeof l === 'number');
    const avgLatencyMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    // CSAT
    const ratings = consultations
      .map((c) => c.userSatisfactionRating)
      .filter((r) => typeof r === 'number');
    const avgCSAT = ratings.length
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : 0;

    // FAQ deflection
    const faqDeflected = faqs.filter((f) => f.deflectionSuccess).length;
    const faqDeflectionRate = faqs.length ? Math.round((faqDeflected / faqs.length) * 100) : 0;

    // Tickets resolución
    const ticketsAutoResolved = tickets.filter((t) => t.autoResolved).length;
    const ticketsResolvedRate = tickets.length
      ? Math.round((ticketsAutoResolved / tickets.length) * 100)
      : 0;

    // Detectar regresiones y crear alertas
    const alertsCreated = [];

    if (avgScore > 0 && avgScore < SCORE_BASELINE) {
      const a = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: avgScore < SCORE_BASELINE - 10 ? 'critical' : 'high',
        title: `Score verificador semanal en ${avgScore}/100`,
        description: `Promedio últimos 7 días bajó del baseline ${SCORE_BASELINE}/100. Target ${SCORE_TARGET}/100. Sample: ${scores.length} trazas.`,
        affectedEntity: 'AgentTrace',
        metricValue: avgScore,
        status: 'open',
      });
      alertsCreated.push(a.id);
    }

    if (avgCSAT > 0 && avgCSAT < CSAT_BASELINE) {
      const a = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: avgCSAT < 3.5 ? 'critical' : 'medium',
        title: `CSAT semanal en ${avgCSAT}/5`,
        description: `Satisfacción ciudadana bajó del baseline ${CSAT_BASELINE}/5. Sample: ${ratings.length} ratings.`,
        affectedEntity: 'ConsultationHistory',
        metricValue: avgCSAT,
        status: 'open',
      });
      alertsCreated.push(a.id);
    }

    if (faqs.length >= 50 && faqDeflectionRate < 40) {
      const a = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: 'medium',
        title: `FAQ deflection en ${faqDeflectionRate}%`,
        description: `Tasa de auto-resolución por debajo de 40% (target ${FAQ_DEFLECTION_TARGET}%). Revisar contenido FAQ y keywords.`,
        affectedEntity: 'FAQInteraction',
        metricValue: faqDeflectionRate,
        status: 'open',
      });
      alertsCreated.push(a.id);
    }

    // Resumen ejecutivo (LLM)
    let executiveSummary = '';
    try {
      const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Eres analista de FinLogic Chile. Resume en 3 frases (lenguaje ejecutivo, sin emojis) el desempeño semanal del sistema:
- Score verificador: ${avgScore}/100 (baseline ${SCORE_BASELINE}, target ${SCORE_TARGET})
- Latencia media: ${(avgLatencyMs / 1000).toFixed(1)}s
- CSAT: ${avgCSAT}/5 sobre ${ratings.length} ratings
- FAQ deflection: ${faqDeflectionRate}% sobre ${faqs.length} interacciones
- Tickets auto-resueltos: ${ticketsResolvedRate}% sobre ${tickets.length} tickets
- Trazas analizadas: ${traces.length}
- Alertas generadas esta corrida: ${alertsCreated.length}

Identifica si vamos en línea, mejorando o regresando vs targets del mandato.`,
      });
      executiveSummary = typeof llm === 'string' ? llm : llm?.content || '';
    } catch (e) {
      executiveSummary = `Score ${avgScore}/100 · CSAT ${avgCSAT}/5 · FAQ ${faqDeflectionRate}% · Tickets auto ${ticketsResolvedRate}%.`;
    }

    return Response.json({
      ok: true,
      window: '7d',
      metrics: {
        avgScore,
        avgLatencyMs,
        avgCSAT,
        faqDeflectionRate,
        ticketsResolvedRate,
        sample: {
          traces: traces.length,
          consultations: consultations.length,
          faqs: faqs.length,
          tickets: tickets.length,
        },
      },
      alertsCreated,
      executiveSummary,
    });
  } catch (error) {
    console.error('aggregateWeeklyFeedback error:', error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});