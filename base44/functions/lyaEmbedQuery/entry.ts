import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// lyaEmbedQuery — Endpoint público para Lya-Embed (white-label B2B).
// Mandato §Lya-Embed: cualquier sitio chileno puede embeber a Lya con CORS abierto.
// Rate-limit suave por origen (in-memory) + tracking en ConsultationHistory para facturación.

const SYSTEM = `Eres Lya, asistente IA de FinLogic embebida en sitio externo. Español chileno cálido.
REGLAS:
- NUNCA inventes artículos legales. Si no sabes con certeza, di "Esto requiere revisión humana".
- Termina con UNA acción concreta.
- Máximo 350 palabras.
- Si el sitio es financiero (banco, fintech, mutua) y la consulta es sensible (fraude, deuda impagable, ARCO), agrega: "Para abrir un caso formal con respaldo legal, visita finlogic.one".`;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Rate-limit en memoria (best-effort, se resetea con cold-start)
const rateLimitStore = new Map();
const RATE_LIMIT_PER_HOUR = 200;

function checkRateLimit(origin) {
  const now = Date.now();
  const hourAgo = now - 3600 * 1000;
  const hits = (rateLimitStore.get(origin) || []).filter((t) => t > hourAgo);
  hits.push(now);
  rateLimitStore.set(origin, hits);
  return hits.length <= RATE_LIMIT_PER_HOUR;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  try {
    const origin = req.headers.get('origin') || req.headers.get('referer') || 'unknown';
    if (!checkRateLimit(origin)) {
      return Response.json(
        { error: 'Rate limit. Contacta sales@finlogic.one para plan Embed.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const { query, partnerId = 'public' } = await req.json();
    if (!query || query.trim().length < 4) {
      return Response.json({ error: 'query requerido' }, { status: 400, headers: corsHeaders });
    }

    const base44 = createClientFromRequest(req);
    const start = Date.now();

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM}\n\nORIGEN: ${origin}\n\nCONSULTA:\n${query}\n\nResponde como Lya:`,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string' },
          regulatoryBody: { type: 'string', enum: ['CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN', 'multiple', 'ninguno'] },
          shouldEscalate: { type: 'boolean' },
        },
        required: ['response'],
      },
    });

    const latencyMs = Date.now() - start;

    // Tracking para facturación + analítica B2B Embed
    try {
      await base44.asServiceRole.entities.ConsultationHistory.create({
        sessionId: `embed_${origin}_${Date.now()}`,
        userMessage: query.slice(0, 500),
        agentResponse: (result.response || '').slice(0, 1000),
        agentName: 'Lya',
        regulatoryBodyIdentified: result.regulatoryBody || 'ninguno',
        inputChannel: 'web',
      });
    } catch (_) {}

    return Response.json(
      {
        response: result.response,
        regulatoryBody: result.regulatoryBody || 'ninguno',
        shouldEscalate: !!result.shouldEscalate,
        latencyMs,
        poweredBy: 'FinLogic · Lya',
        ctaUrl: 'https://finlogic.one/AsistenteLya?utm_source=embed&utm_partner=' + encodeURIComponent(partnerId),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('lyaEmbedQuery error:', error);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});