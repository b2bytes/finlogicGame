// vectorSearch — Búsqueda vectorial nativa FinLogic (estilo Pinecone, sin dependencia externa).
// Genera embedding de la query con OpenAI text-embedding-3-small y calcula similitud coseno
// contra los KnowledgeChunk vigentes. Retorna top-K más relevantes para alimentar al especialista.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIM = 1536;

// Similitud coseno entre dos vectores
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Genera embedding usando OpenAI directamente (text-embedding-3-small)
async function generateEmbedding(text) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.substring(0, 8000), // límite del modelo
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embeddings failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
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

    const startTime = Date.now();

    // 1. Embedding de la query
    let queryEmbedding;
    try {
      queryEmbedding = await generateEmbedding(query);
    } catch (e) {
      console.error('embedding generation failed:', e.message);
      return Response.json({
        success: false,
        error: 'embedding_failed',
        message: e.message,
        chunks: [],
      }, { status: 200 });
    }

    // 2. Cargar chunks activos (filtros opcionales)
    const filter = { active: true };
    if (moduleFilter) filter.module = moduleFilter;
    if (regulatoryBody) filter.regulatoryBody = regulatoryBody;

    const allChunks = await base44.asServiceRole.entities.KnowledgeChunk.filter(filter, '-created_date', 500);

    if (allChunks.length === 0) {
      return Response.json({
        success: true,
        chunks: [],
        totalScanned: 0,
        latencyMs: Date.now() - startTime,
        message: 'Base de conocimiento vacía. Ejecuta seedKnowledgeBase primero.',
      });
    }

    // 3. Calcular similitud coseno y ordenar
    const scored = allChunks
      .filter(c => Array.isArray(c.embedding) && c.embedding.length === EMBEDDING_DIM)
      .map(c => ({
        id: c.id,
        title: c.title,
        content: c.content,
        lawReference: c.lawReference,
        module: c.module,
        regulatoryBody: c.regulatoryBody,
        sourceUrl: c.sourceUrl,
        score: cosineSimilarity(queryEmbedding, c.embedding),
      }))
      .filter(c => c.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return Response.json({
      success: true,
      chunks: scored,
      totalScanned: allChunks.length,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('vectorSearch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});