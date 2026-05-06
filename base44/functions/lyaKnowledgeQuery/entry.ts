// lyaKnowledgeQuery — Lya conversacional con RAG Pinecone.
// Mandato §3 Lya Integration · ahora compartiendo el mismo corpus que processConsultation.
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

const SISTEMA_LYA = `Eres Lya, asistente IA de FinLogic. Hablas como una amiga abogada chilena: cálida, directa, sin tecnicismos.

CÓMO HABLAS:
- Tuteas al usuario. Empatía primero ("Entiendo, esto pasa mucho…", "Tranquila, tienes derechos claros aquí").
- Frases cortas. Evita jerga legal — si la usas, explícala entre paréntesis.
- Cero burocracia. Nada de "el suscrito", "se hace presente", "la normativa señala".
- Las leyes se mencionan al final como respaldo, no al principio.

REGLAS DURAS:
- NUNCA inventes artículos legales. Solo cita lo que está en el CONTEXTO RAG.
- Termina SIEMPRE con UN solo paso concreto que pueda hacer hoy.
- Máximo 220 palabras (texto). 800 caracteres (voz).

FORMATO TEXTO (markdown ligero, fácil de leer en móvil):
**Lo que te pasó**
1-2 frases reformulando el problema con empatía.

**Tu derecho**
La idea central en lenguaje simple. Una frase. **Negritas** en lo importante.

**Qué hacer ahora**
- Paso 1 muy concreto
- Paso 2
- Paso 3 (máx 3)

**Plazo**
Una línea con el plazo legal si aplica (ej: "Tienes 5 días hábiles desde hoy").

_Ley 20.009 · Ley 19.496_  ← solo al final, en cursiva, separadas por ·`;

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { query, mode = 'text', userProfile = 'general' } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return Response.json({ error: 'query requerido (mín 3 caracteres)' }, { status: 400 });
    }

    const startTime = Date.now();

    // ─── RAG · Pinecone (compartido con processConsultation) ─────────────
    let ragChunks = [];
    let ragLatencyMs = 0;
    const ragStart = Date.now();
    try {
      const ragRes = await base44.functions.invoke('vectorSearch', {
        query,
        topK: 4,
        minScore: 0.25,
        diversify: true,
      });
      if (ragRes.data?.success) ragChunks = ragRes.data.chunks || [];
    } catch (e) {
      console.error('Lya RAG failed:', e.message);
    }
    ragLatencyMs = Date.now() - ragStart;

    // Si RAG vacío, fallback heurístico para mantener experiencia
    let modulesUsed = ragChunks.map(c => c.module).filter(Boolean);
    if (modulesUsed.length === 0) {
      const queryLower = query.toLowerCase();
      if (/fraud|cargo|cobro|robo|tarjet/.test(queryLower)) modulesUsed.push('ley_20009_fraude');
      if (/dato|arco|privacidad|borrar/.test(queryLower)) modulesUsed.push('ley_21719_datos');
      if (/cae|tir|ter|cr[eé]dito|tasa/.test(queryLower)) modulesUsed.push('ley_20555');
      if (/sernac|consumidor|reclamo/.test(queryLower)) modulesUsed.push('ley_19496_sernac');
      if (/cmf|fintech|open finance/.test(queryLower)) modulesUsed.push('ley_fintech_21521');
      if (/cyber|ciber|phishing|csirt/.test(queryLower)) modulesUsed.push('csirt');
      if (/sii|impuesto|tribut|iva|f29/.test(queryLower)) modulesUsed.push('ley_21713_tributaria');
      if (/cripto|bitcoin|ethereum/.test(queryLower)) modulesUsed.push('tributacion_cripto');
      if (modulesUsed.length === 0) modulesUsed = ['ley_19496_sernac', 'ley_fintech_21521'];
    }
    modulesUsed = [...new Set(modulesUsed)];

    const sources = ragChunks.length > 0
      ? ragChunks.map(c => `${c.lawReference} — ${c.title}`)
      : modulesUsed.map(k => NORMATIVA_MAP[k]).filter(Boolean);

    const ragContext = ragChunks.length > 0
      ? `\n\n═══ NORMATIVA VERIFICADA (corpus FinLogic) ═══\n${ragChunks.map((c, i) => `[${i + 1}] ${c.lawReference} — ${c.title}\n${c.content}`).join('\n\n')}\n═══════════════════════════════════════════════════════`
      : `\n\nNORMATIVA RELEVANTE DETECTADA: ${modulesUsed.map(k => NORMATIVA_MAP[k]).filter(Boolean).join(' · ')}`;

    // Profile-tuned tone
    const profileTone = {
      don_luis: 'Usuario adulto mayor (68a). Lenguaje muy simple, frases cortas, evita anglicismos.',
      camila: 'Estudiante 22a. Tono cercano, puede usar términos técnicos básicos con explicación.',
      maria_jose: 'Emprendedora 34a. Práctica, orientada a acción, contexto pyme.',
      roberto: 'Trabajador 45a. Directo, sin rodeos, foco en seguridad y fraude.',
      general: 'Adulto chileno bancarizado. Tono cálido y profesional.',
    }[userProfile] || 'Adulto chileno bancarizado.';

    const modeInstructions =
      mode === 'voice'
        ? 'MODO VOZ: máximo 800 caracteres, CERO markdown ni símbolos, frases <20 palabras, vocabulario hablado natural.'
        : 'MODO TEXTO: sigue el FORMATO TEXTO definido arriba (Lo que te pasó / Tu derecho / Qué hacer ahora / Plazo / leyes en cursiva al final). Usa **negritas** y guiones para listas. NUNCA emojis decorativos al inicio de líneas.';

    const prompt = `${SISTEMA_LYA}

CONTEXTO USUARIO: ${profileTone}
${modeInstructions}
${ragContext}

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
      confidence: llmResponse.confidence ?? (ragChunks.length > 0 ? 0.92 : 0.78),
      suggestedAction: llmResponse.suggestedAction,
      regulatoryBody: llmResponse.regulatoryBody || 'ninguno',
      detectedProfile: llmResponse.detectedProfile || userProfile || 'general',
      modulesUsed,
      ragChunksFound: ragChunks.length,
      ragLatencyMs,
      latencyMs,
    });
  } catch (error) {
    console.error('lyaKnowledgeQuery error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});