import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Lista canónica de integraciones críticas a monitorear (mandato FinLogic)
const INTEGRATIONS = [
  { id: 'mindicador', name: 'mindicador.cl', url: 'https://mindicador.cl/api', timeout: 5000 },
  { id: 'cmf_bank_info', name: 'CMF Bank Info', url: 'https://api.cmfchile.cl/api-sbifv3/recursos_api/uf', timeout: 5000 },
];

async function checkIntegration(integration) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), integration.timeout);
    const res = await fetch(integration.url, { signal: controller.signal });
    clearTimeout(timeoutId);
    const latency = Date.now() - start;
    return {
      id: integration.id,
      name: integration.name,
      ok: res.ok,
      status: res.status,
      latencyMs: latency,
    };
  } catch (err) {
    return {
      id: integration.id,
      name: integration.name,
      ok: false,
      status: 0,
      latencyMs: Date.now() - start,
      error: err.message,
    };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verificación admin para invocación manual; CRON puede invocar directo
    const user = await base44.auth.me().catch(() => null);
    const isCron = req.headers.get('x-base44-source') === 'automation';
    if (!isCron && user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const results = await Promise.all(INTEGRATIONS.map(checkIntegration));
    const failed = results.filter((r) => !r.ok);
    const slow = results.filter((r) => r.ok && r.latencyMs > 3000);

    // Crear OperationalAlert por cada integración caída
    const alertsCreated = [];
    for (const f of failed) {
      const alert = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'integration_failure',
        severity: 'high',
        title: `Integración caída: ${f.name}`,
        description: `${f.name} respondió con status ${f.status}. ${f.error || ''}`.trim(),
        affectedEntity: f.id,
        metricValue: f.latencyMs,
        status: 'open',
      });
      alertsCreated.push(alert.id);
    }

    // Alerta media para integraciones lentas
    for (const s of slow) {
      const alert = await base44.asServiceRole.entities.OperationalAlert.create({
        alertType: 'pipeline_latency',
        severity: 'medium',
        title: `Latencia alta: ${s.name}`,
        description: `${s.name} respondió en ${s.latencyMs}ms (umbral 3000ms).`,
        affectedEntity: s.id,
        metricValue: s.latencyMs,
        status: 'open',
      });
      alertsCreated.push(alert.id);
    }

    return Response.json({
      checked: results.length,
      failed: failed.length,
      slow: slow.length,
      alertsCreated: alertsCreated.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});