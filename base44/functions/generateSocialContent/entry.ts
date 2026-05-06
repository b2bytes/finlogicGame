// generateSocialContent
// Genera variantes de copy para redes sociales basado en pillar editorial.
// Mandato §SocialMediaAgent · 4 pilares 40/30/20/10.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PILLARS = {
  derecho_hoy: {
    label: 'Tu Derecho de Hoy',
    intent: 'pregunta+respuesta+normativa real+CTA',
    weight: 40,
  },
  casos_reales: {
    label: 'Casos Reales',
    intent: 'storytelling 3 actos: problema → acción FinLogic → resolución',
    weight: 30,
  },
  alerta_financiera: {
    label: 'Alerta Financiera',
    intent: 'reactivo a CMF/SERNAC, urgencia + acción concreta',
    weight: 20,
  },
  detras_sistema: {
    label: 'Detrás del Sistema',
    intent: 'transparencia, AgentTrace, cómo decidió la IA',
    weight: 10,
  },
};

const PLATFORMS = {
  tiktok: { audience: 'Camila 22', tone: 'directo, tiktok hook primeros 3s', maxChars: 250 },
  instagram: { audience: 'María José 34', tone: 'aspiracional pero accionable', maxChars: 300 },
  linkedin: { audience: 'CTOs B2B', tone: 'profesional, ROI, datos', maxChars: 600 },
  whatsapp: { audience: 'Don Luis 68', tone: 'simple, cálido, sin jerga', maxChars: 200 },
  x: { audience: 'periodistas', tone: 'data-driven, claim verificable', maxChars: 280 },
};

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }

    const { pillar = 'derecho_hoy', platform = 'instagram', topic } = await req.json();

    const pillarInfo = PILLARS[pillar];
    const platformInfo = PLATFORMS[platform];

    if (!pillarInfo || !platformInfo) {
      return Response.json({ error: 'pillar o platform inválido' }, { status: 400 });
    }

    const prompt = `Eres el equipo creativo de FinLogic — el sistema operativo financiero del pueblo de Chile.

PILAR EDITORIAL: ${pillarInfo.label}
INTENT: ${pillarInfo.intent}

PLATAFORMA: ${platform.toUpperCase()}
AUDIENCIA: ${platformInfo.audience}
TONO: ${platformInfo.tone}
LÍMITE: ${platformInfo.maxChars} caracteres

${topic ? `TEMA ESPECÍFICO: ${topic}` : 'TEMA: libre, sobre derechos financieros chilenos vigentes (Ley 21.521, NCG 502, Ley 19.496, Ley 20.009, Ley 21.719).'}

REGLAS:
- Cita normativa solo si la conoces con certeza.
- Termina con un CTA concreto (link a /Consulta o /Casos).
- Voz cálida, accionable, nunca condescendiente.
- Genera 3 variantes distintas (A/B/C) para A/B testing.

Responde en JSON:`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          variants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'A, B o C' },
                copy: { type: 'string' },
                hashtags: { type: 'array', items: { type: 'string' } },
                cta: { type: 'string' },
                hook: { type: 'string', description: 'Primeros 3-5 palabras de gancho' },
              },
              required: ['label', 'copy', 'cta'],
            },
          },
        },
        required: ['variants'],
      },
    });

    return Response.json({
      pillar,
      platform,
      topic,
      variants: result.variants || [],
    });
  } catch (error) {
    console.error('generateSocialContent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});