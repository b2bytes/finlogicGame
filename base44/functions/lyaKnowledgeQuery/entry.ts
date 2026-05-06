// lyaKnowledgeQuery
// Recuperación semántica del corpus normativo FinLogic (12 módulos).
// Mandato §3 Lya Integration · Knowledge Files sin vector DB.
// Retorna { response, sources, confidence, suggestedAction }.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const NORMATIVA_MAP = {
  ley_fintech_21521: 'Ley 21.521 Fintech · Open Finance · SFA · TPP',
  ncg_502_cmf: 'NCG 502 CMF · circulares regulatorias',
  ley_19496_sernac: 'Ley 19.496 SERNAC · derechos del consumidor',
  ley_20555: 'Ley 20.555 SERNAC Financiero · CAE/TIR/TER',
  ley_21719_datos: 'Ley 21.719 protección de datos personales · ARCO',
  ley_20009_fraude: 'Ley 20.009 fraude tarjetas · responsabilidad del banco',
  ley_21663_ciberseguridad: 'Ley 21.663 ciberseguridad · CSIRT',
  lir_propyme: 'LIR Pro-Pyme · regímenes tributarios',
  ley_21713_tributaria: 'Ley 21.713 reforma tributaria 2024',
  tributacion_cripto: 'Tributación de activos digitales · SII',
  open_finance: 'Open Finance · consentimiento · portabilidad',
  csirt: 'CSIRT · alertas · patrones de fraude',
};

const SISTEMA_LYA = `Eres Lya, asistente IA de FinLogic. Respondes en español chileno cálido y accionable.

REGLAS:
- NUNCA inventes artículos legales.
- Cita solo normativa que conozcas con certeza.
- Termina con una acción concreta que el usuario puede hacer HOY.
- Máximo 600 palabras (texto) / 800 caracteres (voz).
- Estructura: ⚖️ Derecho · 📋 Acción · ⏰ Plazo.`;

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { query, mode = 'text', userProfile = 'general' } = await req.json();

    if (!query || typeof query !== 'string') {
      return Response.json({ error: 'query requerido' }, { status: 400 });
    }

    const startTime = Date.now();

    // Detección heurística simple del módulo normativo
    const queryLower = query.toLowerCase();
    const detectedModules = [];
    if (/fraud|cargo|cobro|robo|tarjet/.test(queryLower)) detectedModules.push('ley_20009_fraude');
    if (/dato|arco|privacidad|borrar/.test(queryLower)) detectedModules.push('ley_21719_datos');
    if (/cae|tir|ter|cr[eé]dito|tasa/.test(queryLower)) detectedModules.push('ley_20555');
    if (/sernac|consumidor|reclamo/.test(queryLower)) detectedModules.push('ley_19496_sernac');
    if (/cmf|fintech|open finance/.test(queryLower)) detectedModules.push('ley_fintech_21521');
    if (/cyber|ciber|phishing|csirt/.test(queryLower)) detectedModules.push('csirt');
    if (/sii|impuesto|tribut|iva|f29/.test(queryLower)) detectedModules.push('ley_21713_tributaria');
    if (/cripto|bitcoin|ethereum/.test(queryLower)) detectedModules.push('tributacion_cripto');

    if (detectedModules.length === 0) {
      detectedModules.push('ley_19496_sernac', 'ley_fintech_21521');
    }

    const sources = detectedModules.map((k) => NORMATIVA_MAP[k]).filter(Boolean);

    // Profile-tuned system prompt
    const profileTone = {
      don_luis: 'Usuario adulto mayor (68a). Lenguaje muy simple, frases cortas, evita anglicismos.',
      camila: 'Estudiante 22a. Tono cercano, puede usar términos técnicos básicos con explicación.',
      maria_jose: 'Emprendedora 34a. Práctica, orientada a acción, contexto pyme.',
      roberto: 'Trabajador 45a. Directo, sin rodeos, foco en seguridad y fraude.',
      general: 'Adulto chileno bancarizado. Tono cálido y profesional.',
    }[userProfile] || 'Adulto chileno bancarizado.';

    const modeInstructions =
      mode === 'voice'
        ? 'MODO VOZ: máximo 800 caracteres, cero markdown, frases <20 palabras, vocabulario hablado.'
        : 'MODO TEXTO: usa **negritas** para derechos, listas numeradas, secciones ⚖️/📋/⏰.';

    const prompt = `${SISTEMA_LYA}

CONTEXTO USUARIO: ${profileTone}
${modeInstructions}

NORMATIVA DETECTADA RELEVANTE:
${sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CONSULTA DEL CIUDADANO:
${query}

Responde como Lya:`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          response: { type: 'string', description: 'Respuesta para el ciudadano' },
          confidence: { type: 'number', description: 'Confianza 0-1' },
          suggestedAction: { type: 'string', description: 'Acción concreta sugerida' },
          regulatoryBody: {
            type: 'string',
            enum: ['CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN', 'multiple', 'ninguno'],
          },
          detectedProfile: {
            type: 'string',
            enum: ['camila', 'don_luis', 'maria_jose', 'roberto', 'general'],
            description: 'Perfil ciudadano detectado para Skin Adaptativo',
          },
        },
        required: ['response', 'suggestedAction'],
      },
    });

    const latencyMs = Date.now() - startTime;

    return Response.json({
      response: llmResponse.response,
      sources,
      confidence: llmResponse.confidence ?? 0.85,
      suggestedAction: llmResponse.suggestedAction,
      regulatoryBody: llmResponse.regulatoryBody || 'ninguno',
      detectedProfile: llmResponse.detectedProfile || userProfile || 'general',
      modulesUsed: detectedModules,
      latencyMs,
    });
  } catch (error) {
    console.error('lyaKnowledgeQuery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});