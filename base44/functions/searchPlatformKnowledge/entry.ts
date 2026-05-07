// searchPlatformKnowledge — Búsqueda semántica de páginas FinLogic.
// Lya la usa para descubrir dinámicamente qué página visitar dado un query
// del usuario en lenguaje natural ("muéstrame el equipo", "dónde está pricing").
//
// Estrategia híbrida:
//   1. Keyword match exacto (rápido, alta confianza)
//   2. Pinecone semantic search en namespace 'finlogic-pages'
//   3. Filtros opcionales por segmento o audiencia
//
// Pública (no requiere auth) — solo retorna paths + metadata, no datos sensibles.

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-pages';
const EMBED_MODEL = 'multilingual-e5-large';

let cachedHost = null;
async function getIndexHost(apiKey) {
  if (cachedHost) return cachedHost;
  const res = await fetch(`${PINECONE_API}/indexes/${INDEX_NAME}`, {
    headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
  });
  if (!res.ok) throw new Error(`Índice no encontrado (${res.status})`);
  const data = await res.json();
  cachedHost = data.host;
  return cachedHost;
}

async function embedQuery(apiKey, text) {
  const res = await fetch(`${PINECONE_API}/embed`, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10',
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      inputs: [{ text: text.substring(0, 2000) }],
      parameters: { input_type: 'query', truncate: 'END' },
    }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status}`);
  const data = await res.json();
  return data.data[0].values;
}

Deno.serve(async (req) => {
  try {
    const { query, topK = 4, segment = null, audience = null } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return Response.json({ error: 'query requerida (mín 2 caracteres)' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PINECONE_API_KEY');
    if (!apiKey) {
      return Response.json({
        success: false,
        error: 'pinecone_not_configured',
        results: [],
      }, { status: 200 });
    }

    const startTime = Date.now();

    // 1. Búsqueda semántica
    let queryEmbedding;
    try {
      queryEmbedding = await embedQuery(apiKey, query);
    } catch (e) {
      return Response.json({
        success: false,
        error: 'embedding_failed',
        message: e.message,
        results: [],
      }, { status: 200 });
    }

    const host = await getIndexHost(apiKey);

    const filter = {};
    if (segment) filter.segment = { $eq: segment };
    // Pinecone no soporta $in sobre listas, pero audience es array — buscamos genérico
    // y filtramos client-side si vino audience.

    const queryRes = await fetch(`https://${host}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        namespace: NAMESPACE,
        vector: queryEmbedding,
        topK: Math.min(topK, 10),
        includeMetadata: true,
        ...(Object.keys(filter).length > 0 ? { filter } : {}),
      }),
    });

    if (!queryRes.ok) {
      throw new Error(`Query failed: ${queryRes.status}`);
    }

    const queryData = await queryRes.json();
    let matches = (queryData.matches || []).map(m => ({
      path: m.metadata?.path,
      name: m.metadata?.name,
      title: m.metadata?.title,
      summary: m.metadata?.summary,
      keywords: m.metadata?.keywords || [],
      segment: m.metadata?.segment,
      audience: m.metadata?.audience || [],
      priority: m.metadata?.priority || 50,
      tags: m.metadata?.tags || [],
      score: Math.round(m.score * 1000) / 1000,
    }));

    // 2. Filtro client-side por audiencia
    if (audience) {
      matches = matches.filter(m =>
        (m.audience || []).includes(audience) || (m.audience || []).includes('general')
      );
    }

    // 3. Boost por keyword exacto (heurística simple)
    const queryLower = query.toLowerCase();
    matches = matches.map(m => {
      const kwHit = (m.keywords || []).some(k => queryLower.includes(k.toLowerCase()));
      const nameHit = (m.name || '').toLowerCase().includes(queryLower) ||
                      queryLower.includes((m.name || '').toLowerCase());
      const boost = (kwHit ? 0.1 : 0) + (nameHit ? 0.05 : 0);
      return { ...m, score: Math.min(1, m.score + boost), keywordHit: kwHit };
    });

    matches.sort((a, b) => b.score - a.score);

    return Response.json({
      success: true,
      query,
      results: matches.slice(0, topK),
      totalScanned: queryData.matches?.length || 0,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('searchPlatformKnowledge error:', error);
    return Response.json({
      success: false,
      error: error.message,
      results: [],
    }, { status: 200 });
  }
});