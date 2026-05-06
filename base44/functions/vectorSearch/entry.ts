// vectorSearch — RAG con Pinecone Serverless + Inference API (multilingual-e5-large).
// Solo necesita PINECONE_API_KEY. El índice "finlogic-knowledge" se crea automáticamente
// vía seedKnowledgeBase. Embeddings nativos Pinecone (espa\u00f1ol-optimizado, sin OpenAI).

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-prod';
const EMBED_MODEL = 'multilingual-e5-large';

// Resuelve el host del índice (cacheado en memoria por contenedor)
let cachedHost = null;
async function getIndexHost(apiKey) {
  if (cachedHost) return cachedHost;
  const res = await fetch(`${PINECONE_API}/indexes/${INDEX_NAME}`, {
    headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
  });
  if (!res.ok) throw new Error(`Pinecone índice no encontrado (${res.status}). Ejecuta seedKnowledgeBase primero.`);
  const data = await res.json();
  cachedHost = data.host;
  return cachedHost;
}

// Embedding de la query con Pinecone Inference (no requiere OpenAI)
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
      inputs: [{ text: text.substring(0, 4000) }],
      parameters: { input_type: 'query', truncate: 'END' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone embed failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.data[0].values;
}

Deno.serve(async (req) => {
  try {
    // No requerimos auth (búsqueda vectorial es servicio interno)
    const {
      query,
      topK = 5,
      module: moduleFilter = null,
      regulatoryBody = null,
      minScore = 0.25,
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

    // 1. Embedding de la query
    let queryEmbedding;
    try {
      queryEmbedding = await embedQuery(apiKey, query);
    } catch (e) {
      console.error('embedding failed:', e.message);
      return Response.json({
        success: false,
        error: 'embedding_failed',
        message: e.message,
        chunks: [],
      }, { status: 200 });
    }

    // 2. Resolver host del índice
    let host;
    try {
      host = await getIndexHost(apiKey);
    } catch (e) {
      return Response.json({
        success: false,
        error: 'index_not_found',
        message: e.message,
        chunks: [],
      }, { status: 200 });
    }

    // 3. Query a Pinecone (con filtro opcional)
    const pineconeFilter = {};
    if (moduleFilter) pineconeFilter.module = { $eq: moduleFilter };
    if (regulatoryBody) pineconeFilter.regulatoryBody = { $eq: regulatoryBody };

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
        topK: Math.min(topK, 20),
        includeMetadata: true,
        ...(Object.keys(pineconeFilter).length > 0 ? { filter: pineconeFilter } : {}),
      }),
    });

    if (!queryRes.ok) {
      const err = await queryRes.text();
      throw new Error(`Pinecone query failed: ${queryRes.status} ${err}`);
    }

    const queryData = await queryRes.json();
    const matches = queryData.matches || [];

    // 4. Mapear matches al formato esperado por processConsultation
    const chunks = matches
      .filter(m => m.score >= minScore)
      .map(m => ({
        id: m.id,
        title: m.metadata?.title || '',
        content: m.metadata?.content || '',
        lawReference: m.metadata?.lawReference || '',
        module: m.metadata?.module || '',
        regulatoryBody: m.metadata?.regulatoryBody || '',
        sourceUrl: m.metadata?.sourceUrl || '',
        score: m.score,
      }));

    return Response.json({
      success: true,
      chunks,
      totalScanned: matches.length,
      latencyMs: Date.now() - startTime,
      provider: 'pinecone',
      embedModel: EMBED_MODEL,
    });
  } catch (error) {
    console.error('vectorSearch error:', error);
    return Response.json({
      success: false,
      error: error.message,
      chunks: [],
    }, { status: 200 });
  }
});