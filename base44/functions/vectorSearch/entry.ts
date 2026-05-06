// vectorSearch — RAG con Pinecone Serverless + Inference API (multilingual-e5-large).
// Solo necesita PINECONE_API_KEY (PINECONE_INDEX_NAME y PINECONE_NAMESPACE opcionales).
// El índice "finlogic-knowledge" se crea automáticamente vía seedKnowledgeBase.
// Embeddings nativos Pinecone (español-optimizado, sin OpenAI).
//
// Mejoras profesionales:
//   • Retry con backoff exponencial en llamadas Pinecone (resiliencia ante 429/5xx).
//   • MMR-lite: diversifica resultados por lawReference para no repetir misma ley.
//   • Validación robusta de inputs y respuestas.
//   • Cache en memoria del host del índice (evita re-fetch en cada query).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = Deno.env.get('PINECONE_INDEX_NAME') || 'finlogic-knowledge';
const NAMESPACE = Deno.env.get('PINECONE_NAMESPACE') || 'finlogic-prod';
const EMBED_MODEL = 'multilingual-e5-large';
const EMBED_DIM = 1024;

// Cache en memoria del host (re-resuelto si falla)
let cachedHost = null;

// Retry con backoff exponencial (200ms, 600ms, 1.4s)
async function fetchWithRetry(url, options, maxRetries = 2) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // Retryable: 429, 500, 502, 503, 504
      if (![429, 500, 502, 503, 504].includes(res.status) || attempt === maxRetries) {
        return res;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
      if (attempt === maxRetries) throw e;
    }
    const delay = 200 * Math.pow(3, attempt);
    await new Promise(r => setTimeout(r, delay));
  }
  throw lastErr;
}

async function getIndexHost(apiKey) {
  if (cachedHost) return cachedHost;
  const fixed = Deno.env.get('PINECONE_INDEX_HOST');
  if (fixed && fixed !== 'auto') {
    cachedHost = fixed.replace(/^https?:\/\//, '');
    return cachedHost;
  }
  const res = await fetchWithRetry(`${PINECONE_API}/indexes/${INDEX_NAME}`, {
    headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
  });
  if (!res.ok) {
    throw new Error(`Pinecone índice "${INDEX_NAME}" no encontrado (${res.status}). Ejecuta seedKnowledgeBase primero.`);
  }
  const data = await res.json();
  if (!data.host) throw new Error(`Índice "${INDEX_NAME}" sin host (estado: ${data.status?.state})`);
  cachedHost = data.host;
  return cachedHost;
}

async function embedQuery(apiKey, text) {
  const res = await fetchWithRetry(`${PINECONE_API}/embed`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10',
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      inputs: [{ text: text.substring(0, 4000) }],
      parameters: { input_type: 'query', truncate: 'END' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone embed failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  const values = data.data?.[0]?.values;
  if (!Array.isArray(values) || values.length !== EMBED_DIM) {
    throw new Error(`Embedding inválido (esperado ${EMBED_DIM}d, recibido ${values?.length})`);
  }
  return values;
}

// MMR-lite: garantiza diversidad por lawReference (no más de N chunks por misma ley)
function diversifyByLaw(matches, maxPerLaw = 2) {
  const counts = {};
  const out = [];
  for (const m of matches) {
    const law = m.metadata?.lawReference || '_';
    counts[law] = counts[law] || 0;
    if (counts[law] < maxPerLaw) {
      out.push(m);
      counts[law]++;
    }
  }
  return out;
}

Deno.serve(async (req) => {
  try {
    const _base44 = createClientFromRequest(req);
    const {
      query,
      topK = 5,
      module: moduleFilter = null,
      regulatoryBody = null,
      minScore = 0.25,
      diversify = true,
    } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return Response.json({ error: 'query requerida (mín 3 caracteres)' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PINECONE_API_KEY');
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'pinecone_not_configured',
        chunks: [],
      }, { status: 200 });
    }

    const startTime = Date.now();

    // 1. Embedding + host en paralelo
    let queryEmbedding, host;
    try {
      [queryEmbedding, host] = await Promise.all([
        embedQuery(apiKey, query),
        getIndexHost(apiKey),
      ]);
    } catch (e) {
      console.error('vectorSearch setup failed:', e.message);
      cachedHost = null;
      return Response.json({
        success: false,
        error: 'setup_failed',
        message: e.message,
        chunks: [],
      }, { status: 200 });
    }

    // 2. Query Pinecone con filtro de metadata
    const pineconeFilter = {};
    if (moduleFilter) pineconeFilter.module = { $eq: moduleFilter };
    if (regulatoryBody) pineconeFilter.regulatoryBody = { $eq: regulatoryBody };

    // Pedimos 2x para tener margen de diversificación
    const requestedTopK = Math.min(topK * 2, 20);

    const queryRes = await fetchWithRetry(`https://${host}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        namespace: NAMESPACE,
        vector: queryEmbedding,
        topK: requestedTopK,
        includeMetadata: true,
        ...(Object.keys(pineconeFilter).length > 0 ? { filter: pineconeFilter } : {}),
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.text();
      throw new Error(`Pinecone query failed: ${queryRes.status} ${err}`);
    }

    const queryData = await queryRes.json();
    const rawMatches = (queryData.matches || []).filter(m => m.score >= minScore);

    // 3. Diversificación + corte a topK
    const finalMatches = diversify ? diversifyByLaw(rawMatches, 2).slice(0, topK) : rawMatches.slice(0, topK);

    const chunks = finalMatches.map(m => ({
      id: m.id,
      title: m.metadata?.title || '',
      content: m.metadata?.content || '',
      lawReference: m.metadata?.lawReference || '',
      module: m.metadata?.module || '',
      regulatoryBody: m.metadata?.regulatoryBody || '',
      sourceUrl: m.metadata?.sourceUrl || '',
      score: Number(m.score.toFixed(4)),
    }));

    return Response.json({
      success: true,
      chunks,
      totalScanned: rawMatches.length,
      latencyMs: Date.now() - startTime,
      provider: 'pinecone',
      embedModel: EMBED_MODEL,
      diversified: diversify,
    });
  } catch (error) {
    console.error('vectorSearch error:', error);
    cachedHost = null;
    return Response.json({
      success: false,
      error: error.message,
      chunks: [],
    }, { status: 200 });
  }
});