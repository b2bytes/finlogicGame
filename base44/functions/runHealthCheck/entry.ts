// runHealthCheck — ejecuta una batería de chequeos de salud sobre los
// componentes críticos de FinLogic: secrets, conectividad de Pinecone,
// entidades clave, ElevenLabs, GitHub. Solo admin.
//
// El objetivo es detectar rápido qué backend está roto SIN hacer click
// página por página.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function timed(fn) {
  const t0 = Date.now();
  try {
    const result = await fn();
    return { ok: true, latencyMs: Date.now() - t0, result };
  } catch (e) {
    return { ok: false, latencyMs: Date.now() - t0, error: e.message };
  }
}

async function checkPinecone(apiKey) {
  if (!apiKey) return { status: 'fail', message: 'PINECONE_API_KEY no configurada' };
  const t = await timed(async () => {
    const r = await fetch('https://api.pinecone.io/indexes/finlogic-knowledge', {
      headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
    });
    if (!r.ok) throw new Error(`Pinecone HTTP ${r.status}`);
    return r.json();
  });
  return t.ok
    ? { status: 'pass', latencyMs: t.latencyMs, message: `Índice OK (host ${t.result?.host?.slice(0, 30)}…)` }
    : { status: 'fail', latencyMs: t.latencyMs, message: 'Pinecone no responde', errorDetails: t.error };
}

async function checkElevenLabs(apiKey, agentId) {
  if (!apiKey || !agentId) {
    return { status: 'warn', message: 'ELEVENLABS_API_KEY o AGENT_ID faltantes' };
  }
  const t = await timed(async () => {
    const r = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
      headers: { 'xi-api-key': apiKey },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
  return t.ok
    ? { status: 'pass', latencyMs: t.latencyMs, message: `Agente "${t.result?.name || 'Lya'}" OK` }
    : { status: 'fail', latencyMs: t.latencyMs, message: 'ElevenLabs no responde', errorDetails: t.error };
}

async function checkEntity(base44, name) {
  const t = await timed(async () => {
    const list = await base44.asServiceRole.entities[name].list(undefined, 1);
    return Array.isArray(list) ? list.length : 0;
  });
  return t.ok
    ? { status: 'pass', latencyMs: t.latencyMs, message: `Entity ${name} accesible` }
    : { status: 'fail', latencyMs: t.latencyMs, message: `Entity ${name} no responde`, errorDetails: t.error };
}

async function checkPineconeQuery(apiKey) {
  // Smoke test directo: embed query + búsqueda mínima en namespace páginas
  const t = await timed(async () => {
    const embRes = await fetch('https://api.pinecone.io/embed', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        model: 'multilingual-e5-large',
        inputs: [{ text: 'pricing test' }],
        parameters: { input_type: 'query' },
      }),
    });
    if (!embRes.ok) throw new Error(`Embed HTTP ${embRes.status}`);
    const embData = await embRes.json();
    const vector = embData.data?.[0]?.values;
    if (!vector) throw new Error('Sin vector embedding');

    const idxRes = await fetch('https://api.pinecone.io/indexes/finlogic-knowledge', {
      headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
    });
    const idxData = await idxRes.json();
    const host = idxData.host;
    const qRes = await fetch(`https://${host}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        namespace: 'finlogic-pages',
        vector,
        topK: 1,
        includeMetadata: true,
      }),
    });
    if (!qRes.ok) throw new Error(`Query HTTP ${qRes.status}`);
    const qData = await qRes.json();
    return qData.matches?.length || 0;
  });
  return t.ok
    ? { status: 'pass', latencyMs: t.latencyMs, message: `Query Pinecone OK (${t.result} match)` }
    : { status: 'fail', latencyMs: t.latencyMs, message: 'Query Pinecone falló', errorDetails: t.error };
}

async function checkPageKnowledgeIndexed(base44) {
  const t = await timed(async () => {
    const list = await base44.asServiceRole.entities.PageKnowledge.list();
    if (!Array.isArray(list) || list.length < 10) {
      throw new Error(`Solo ${list?.length || 0} páginas indexadas (esperaba ≥10)`);
    }
    return list.length;
  });
  return t.ok
    ? { status: 'pass', latencyMs: t.latencyMs, message: `${t.result} páginas en PageKnowledge` }
    : { status: 'warn', latencyMs: t.latencyMs, message: 'PageKnowledge incompleto', errorDetails: t.error };
}

async function checkVisitTracesWriting(base44) {
  // Verifica que el sistema de tracking esté escribiendo
  const t = await timed(async () => {
    const list = await base44.asServiceRole.entities.VisitTrace.list('-lastSeenAt', 1);
    return list?.length || 0;
  });
  return t.ok
    ? {
        status: t.result > 0 ? 'pass' : 'warn',
        latencyMs: t.latencyMs,
        message: t.result > 0 ? 'VisitTrace registra sesiones' : 'Sin sesiones aún',
      }
    : { status: 'fail', latencyMs: t.latencyMs, message: 'VisitTrace inaccesible', errorDetails: t.error };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (me?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const startedAt = new Date().toISOString();
    const t0 = Date.now();
    const checks = [];

    // 1. SECRETS configurados
    const secrets = ['PINECONE_API_KEY', 'ELEVENLABS_API_KEY', 'ELEVENLABS_AGENT_ID', 'ELEVENLABS_VOICE_ID'];
    for (const s of secrets) {
      const val = Deno.env.get(s);
      checks.push({
        name: `Secret · ${s}`,
        category: 'config',
        status: val ? 'pass' : 'fail',
        latencyMs: 0,
        message: val ? 'Configurado' : 'FALTA',
      });
    }

    // 2. Integraciones externas
    const pcResult = await checkPinecone(Deno.env.get('PINECONE_API_KEY'));
    checks.push({ name: 'Pinecone API', category: 'integration', ...pcResult });

    const elResult = await checkElevenLabs(
      Deno.env.get('ELEVENLABS_API_KEY'),
      Deno.env.get('ELEVENLABS_AGENT_ID')
    );
    checks.push({ name: 'ElevenLabs Agent', category: 'integration', ...elResult });

    // 3. Entidades críticas accesibles
    const criticalEntities = [
      'MisCasos', 'GeneratedDocument', 'AgentTrace', 'PageKnowledge',
      'KnowledgeChunk', 'Lead', 'VisitTrace',
    ];
    for (const e of criticalEntities) {
      const r = await checkEntity(base44, e);
      checks.push({ name: `Entity · ${e}`, category: 'entity', ...r });
    }

    // 4. Smoke tests funcionales (lógica equivalente, no invocan a otras fns
    // server-to-server porque eso es propenso a fallos sin info útil)
    const pcQ = await checkPineconeQuery(Deno.env.get('PINECONE_API_KEY'));
    checks.push({ name: 'Pinecone · query test', category: 'backend', ...pcQ });

    const pkIdx = await checkPageKnowledgeIndexed(base44);
    checks.push({ name: 'PageKnowledge · cobertura', category: 'backend', ...pkIdx });

    const vt = await checkVisitTracesWriting(base44);
    checks.push({ name: 'VisitTrace · tracking activo', category: 'backend', ...vt });

    // 5. Resumen
    const passed = checks.filter((c) => c.status === 'pass').length;
    const warnings = checks.filter((c) => c.status === 'warn').length;
    const failed = checks.filter((c) => c.status === 'fail').length;
    const overallStatus =
      failed === 0 && warnings === 0 ? 'healthy'
      : failed === 0 ? 'degraded'
      : 'critical';

    const completedAt = new Date().toISOString();
    const runId = `hc_${Date.now().toString(36)}`;

    // Persistir
    const saved = await base44.asServiceRole.entities.HealthCheckRun.create({
      runId,
      startedAt,
      completedAt,
      totalChecks: checks.length,
      passed,
      warnings,
      failed,
      overallStatus,
      checks,
    });

    return Response.json({
      success: true,
      runId,
      id: saved.id,
      durationMs: Date.now() - t0,
      summary: { totalChecks: checks.length, passed, warnings, failed, overallStatus },
      checks,
    });
  } catch (error) {
    console.error('runHealthCheck error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});