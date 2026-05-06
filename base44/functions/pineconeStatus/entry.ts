// pineconeStatus — diagnóstico del índice Pinecone para admin /SystemMetrics
// Retorna: existencia del índice, host, dimensión, total vectores por namespace,
// distribución por módulo (sample), y test de query end-to-end.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-prod';
const EMBED_MODEL = 'multilingual-e5-large';

async function pineconeFetch(apiKey, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10',
      ...(options.headers || {}),
    },
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const apiKey = Deno.env.get('PINECONE_API_KEY');
    if (!apiKey) {
      return Response.json({
        configured: false,
        error: 'PINECONE_API_KEY no está configurada',
      });
    }

    // 1. Info del índice
    const idxRes = await pineconeFetch(apiKey, `${PINECONE_API}/indexes/${INDEX_NAME}`);
    if (!idxRes.ok) {
      return Response.json({
        configured: true,
        indexExists: false,
        indexName: INDEX_NAME,
        message: `Índice no encontrado (${idxRes.status}). Ejecuta seedKnowledgeBase para crearlo.`,
      });
    }
    const idxData = await idxRes.json();
    const host = idxData.host;

    // 2. Stats del índice (vectores totales por namespace)
    const statsRes = await pineconeFetch(apiKey, `https://${host}/describe_index_stats`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const stats = statsRes.ok ? await statsRes.json() : null;

    // 3. Test query end-to-end (latencia real)
    let queryTest = null;
    try {
      const qStart = Date.now();
      const embedRes = await pineconeFetch(apiKey, `${PINECONE_API}/embed`, {
        method: 'POST',
        body: JSON.stringify({
          model: EMBED_MODEL,
          inputs: [{ text: 'fraude tarjeta de crédito plazo banco' }],
          parameters: { input_type: 'query', truncate: 'END' },
        }),
      });
      const embedData = await embedRes.json();
      const embedLatency = Date.now() - qStart;

      const qStart2 = Date.now();
      const qRes = await pineconeFetch(apiKey, `https://${host}/query`, {
        method: 'POST',
        body: JSON.stringify({
          namespace: NAMESPACE,
          vector: embedData.data[0].values,
          topK: 3,
          includeMetadata: true,
        }),
      });
      const qData = await qRes.json();
      const queryLatency = Date.now() - qStart2;

      queryTest = {
        ok: qRes.ok,
        embedLatencyMs: embedLatency,
        queryLatencyMs: queryLatency,
        totalLatencyMs: embedLatency + queryLatency,
        topMatches: (qData.matches || []).map(m => ({
          id: m.id,
          score: Math.round(m.score * 1000) / 1000,
          lawReference: m.metadata?.lawReference,
          module: m.metadata?.module,
        })),
      };
    } catch (e) {
      queryTest = { ok: false, error: e.message };
    }

    return Response.json({
      configured: true,
      indexExists: true,
      indexName: INDEX_NAME,
      host,
      dimension: idxData.dimension,
      metric: idxData.metric,
      ready: idxData.status?.ready,
      cloud: idxData.spec?.serverless?.cloud,
      region: idxData.spec?.serverless?.region,
      embedModel: EMBED_MODEL,
      namespace: NAMESPACE,
      stats: stats ? {
        totalVectorCount: stats.totalVectorCount || stats.total_vector_count || 0,
        namespaces: stats.namespaces || {},
        dimension: stats.dimension,
        indexFullness: stats.indexFullness || stats.index_fullness || 0,
      } : null,
      queryTest,
    });
  } catch (error) {
    console.error('pineconeStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});