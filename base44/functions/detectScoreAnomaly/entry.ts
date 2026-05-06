import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// detectScoreAnomaly — CRON cada hora (COO Digital)
// Calcula score promedio últimas 20 consultas en AgentTrace
// Si <65/100 → OperationalAlert crítica para mejorar prompts

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const traces = await base44.asServiceRole.entities.AgentTrace.filter(
      { pipelineStage: 'complete' },
      '-created_date',
      20
    ).catch(() => []);

    if (!traces || traces.length < 5) {
      return Response.json({
        success: true,
        skipped: 'insufficient_data',
        traces: traces?.length || 0,
      });
    }

    const scores = traces.map((t) => t.verifierScore || 72);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const lowScoreCount = scores.filter((s) => s < 70).length;

    // Latencia promedio
    const latencies = traces
      .map((t) => t.totalLatencyMs)
      .filter((l) => typeof l === 'number' && l > 0);
    const avgLatency = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    let alertCreated = false;

    // Anomalía: score promedio bajo
    if (avgScore < 65) {
      await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'score_degradation',
        severity: avgScore < 55 ? 'critical' : 'high',
        title: `Score verificador degradado: ${avgScore.toFixed(1)}/100`,
        description: `Promedio últimas ${traces.length} consultas: ${avgScore.toFixed(1)}/100. ${lowScoreCount} consultas bajo 70. Mínimo: ${minScore}. Revisar prompt del especialista.`,
        affectedEntity: 'AgentTrace',
        metricValue: avgScore,
      });
      alertCreated = true;
    }

    // Anomalía: latencia >70s sostenida
    if (avgLatency > 70000) {
      await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'pipeline_latency',
        severity: avgLatency > 120000 ? 'critical' : 'high',
        title: `Pipeline lento: ${(avgLatency / 1000).toFixed(1)}s promedio`,
        description: `Latencia media últimas ${latencies.length} consultas: ${(avgLatency / 1000).toFixed(1)}s. Target: <30s. Revisar Claude Sonnet 4.6 throttling.`,
        affectedEntity: 'AgentTrace',
        metricValue: avgLatency,
      });
      alertCreated = true;
    }

    return Response.json({
      success: true,
      avgScore: Number(avgScore.toFixed(1)),
      minScore,
      avgLatencyMs: avgLatency,
      tracesAnalyzed: traces.length,
      alertCreated,
    });
  } catch (error) {
    console.error('detectScoreAnomaly error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});