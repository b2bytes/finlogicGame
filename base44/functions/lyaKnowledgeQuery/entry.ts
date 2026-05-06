// lyaKnowledgeQuery — Lya conversacional con RAG Pinecone + verificador anti-alucinación.
// Mandato §3 Lya Integration · pipeline robusto en 3 capas:
//   1. RAG: recupera chunks normativos verificados de Pinecone
//   2. LLM: genera respuesta SOLO sobre el contexto RAG (grounded generation)
//   3. Verificador: audita citas legales y detecta alucinaciones antes de responder
// Retorna { response, sources, confidence, verifierScore, hallucinationRisk, suggestedAction }.

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

// Whitelist de leyes/normativas conocidas y verificadas en el corpus FinLogic.
// Si Lya menciona una ley fuera de este set Y no está en los chunks RAG → es alucinación.
const KNOWN_LAWS = new Set([
  '18.010', '19.496', '20.009', '20.318', '20.555', '21.234', '21.398',
  '21.521', '21.663', '21.713', '21.719', // Leyes
  'NCG 461', 'NCG 502', // CMF
  'F22', 'F29', // SII
  'LIR', 'LPC', 'CP', // Códigos
]);

const SISTEMA_LYA = `Eres Lya, asistente IA de FinLogic. Hablas como una amiga abogada chilena: cálida, directa, sin tecnicismos.

CÓMO HABLAS:
- Tuteas al usuario. Empatía primero ("Entiendo, esto pasa mucho…", "Tranquila, tienes derechos claros aquí").
- Frases cortas. Evita jerga legal — si la usas, explícala entre paréntesis.
- Cero burocracia. Nada de "el suscrito", "se hace presente", "la normativa señala".
- Las leyes se mencionan al final como respaldo, no al principio.

REGLAS DURAS ANTI-ALUCINACIÓN:
- ⚠️ SOLO puedes citar leyes/artículos que aparezcan EXPLÍCITAMENTE en el CONTEXTO RAG provisto.
- ⚠️ Si el contexto RAG está vacío o no cubre la consulta, NO inventes. Di: "Para darte la cita exacta necesito verificar X en [organismo]".
- ⚠️ NUNCA inventes números de artículos, montos UF/UTM, tasas TMC ni plazos.
- ⚠️ NUNCA recomiendes instituciones financieras específicas (bancos, AFP, aseguradoras).
- ⚠️ Si no estás 100% seguro de la ruta exacta en un portal oficial, di "ingresa a sii.cl/sernac.cl con tu clave y busca la sección X".
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

_Ley 20.009 · Ley 19.496_  ← solo al final, en cursiva, separadas por · (SOLO leyes que estén en el RAG)`;

// ─── Verificador anti-alucinación ─────────────────────────────────────────
// Extrae las leyes citadas en la respuesta y las contrasta con:
//   1. Las leyes presentes en los chunks RAG (verificadas)
//   2. La whitelist KNOWN_LAWS (conocidas pero no en RAG → riesgo medio)
//   3. Si una ley no está en ninguna → ALUCINACIÓN (riesgo alto)
function extractCitedLaws(text) {
  if (!text) return [];
  const found = new Set();
  // Patrones: "Ley 21.521", "Ley N° 19.496", "Ley Nº 20.009"
  const lawPattern = /Ley\s+(?:N[°º]\s*)?(\d{1,2}\.\d{3})/gi;
  // Patrones: "NCG 502", "NCG N° 461"
  const ncgPattern = /NCG\s+(?:N[°º]\s*)?(\d{2,4})/gi;
  // Artículos: "Art. 16", "Artículo 5°"
  const artPattern = /(?:Art\.?|Artículo)\s*(\d+)/gi;

  let m;
  while ((m = lawPattern.exec(text)) !== null) found.add(m[1]);
  while ((m = ncgPattern.exec(text)) !== null) found.add(`NCG ${m[1]}`);
  while ((m = artPattern.exec(text)) !== null) found.add(`Art. ${m[1]}`);
  return [...found];
}

function verifyCitations(responseText, ragChunks) {
  const cited = extractCitedLaws(responseText);
  if (cited.length === 0) {
    return { verifierScore: 90, hallucinationRisk: 'none', verified: [], unverified: [], cited: [] };
  }

  // Construir set de leyes verificadas desde RAG (lawReference + content)
  const ragText = ragChunks.map(c => `${c.lawReference || ''} ${c.title || ''} ${c.content || ''}`).join(' ');
  const verified = [];
  const unverified = [];
  const articles = cited.filter(c => c.startsWith('Art.'));
  const lawNumbers = cited.filter(c => !c.startsWith('Art.'));

  for (const law of lawNumbers) {
    const inRag = ragText.includes(law);
    const inWhitelist = KNOWN_LAWS.has(law);
    // ESTRICTO: si RAG tiene contenido pero la ley no aparece allí, es no-verificada
    // aunque esté en whitelist (el RAG es la fuente de verdad para esta consulta).
    if (inRag) verified.push(law);
    else if (inWhitelist && ragChunks.length === 0) verified.push(law); // RAG vacío + whitelist = ok con riesgo low
    else unverified.push(law);
  }
  // Artículos: validar que aparezcan literalmente en algún chunk
  for (const art of articles) {
    if (ragText.includes(art)) verified.push(art);
    else unverified.push(art);
  }

  let hallucinationRisk = 'none';
  let verifierScore = 100;
  if (unverified.length > 0) {
    hallucinationRisk = unverified.length >= 2 ? 'high' : 'medium';
    verifierScore = Math.max(40, 100 - unverified.length * 25);
  } else if (verified.length > 0 && ragChunks.length === 0) {
    // Citó leyes pero RAG vacío → confiamos en whitelist pero advertimos
    hallucinationRisk = 'low';
    verifierScore = 75;
  }

  return { verifierScore, hallucinationRisk, verified, unverified, cited };
}

// Detecta jerga prohibida en respuestas (debe ser ciudadana)
function detectJargon(text) {
  if (!text) return [];
  const jargon = [
    'el suscrito', 'se hace presente', 'la normativa señala',
    'tenga a bien', 'cúmplase', 'sírvase', 'por la presente',
  ];
  return jargon.filter(j => text.toLowerCase().includes(j));
}

// ─── RAG INLINE · Pinecone direct (evita overhead + bug de invoke 403) ────
const PINECONE_INDEX = 'finlogic-knowledge';
const PINECONE_NAMESPACE = 'finlogic-prod';
const PINECONE_EMBED_MODEL = 'multilingual-e5-large';
let _cachedHost = null;

async function pineconeRagSearch(query, topK = 5, minScore = 0.3) {
  const apiKey = Deno.env.get('PINECONE_API_KEY');
  if (!apiKey) return [];
  try {
    if (!_cachedHost) {
      const idxRes = await fetch(`https://api.pinecone.io/indexes/${PINECONE_INDEX}`, {
        headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
      });
      if (!idxRes.ok) return [];
      const idxData = await idxRes.json();
      _cachedHost = idxData.host;
    }
    const embedRes = await fetch('https://api.pinecone.io/embed', {
      method: 'POST',
      headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json', 'X-Pinecone-API-Version': '2024-10' },
      body: JSON.stringify({
        model: PINECONE_EMBED_MODEL,
        inputs: [{ text: query.substring(0, 4000) }],
        parameters: { input_type: 'query', truncate: 'END' },
      }),
    });
    if (!embedRes.ok) return [];
    const embedData = await embedRes.json();
    const vector = embedData.data[0].values;
    const qRes = await fetch(`https://${_cachedHost}/query`, {
      method: 'POST',
      headers: { 'Api-Key': apiKey, 'Content-Type': 'application/json', 'X-Pinecone-API-Version': '2024-10' },
      body: JSON.stringify({ namespace: PINECONE_NAMESPACE, vector, topK: Math.min(topK, 20), includeMetadata: true }),
    });
    if (!qRes.ok) return [];
    const qData = await qRes.json();
    return (qData.matches || [])
      .filter(m => m.score >= minScore)
      .map(m => ({
        id: m.id,
        score: m.score,
        title: m.metadata?.title || '',
        content: m.metadata?.content || '',
        lawReference: m.metadata?.lawReference || '',
        module: m.metadata?.module || '',
        regulatoryBody: m.metadata?.regulatoryBody || '',
        sourceUrl: m.metadata?.sourceUrl || '',
      }));
  } catch (e) {
    console.error('pineconeRagSearch failed:', e.message);
    return [];
  }
}

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

    // ─── RAG · Pinecone INLINE (evita 403 de invoke entre funciones) ─────
    const ragStart = Date.now();
    const ragChunks = await pineconeRagSearch(query, 5, 0.3);
    const ragLatencyMs = Date.now() - ragStart;
    console.log(`[Lya RAG] chunks=${ragChunks.length} latency=${ragLatencyMs}ms`);

    // Heurística de módulos para fallback (si RAG vacío)
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
      if (modulesUsed.length === 0) modulesUsed = ['ley_19496_sernac'];
    }
    modulesUsed = [...new Set(modulesUsed)];

    const sources = ragChunks.length > 0
      ? ragChunks.map(c => `${c.lawReference} — ${c.title}`)
      : modulesUsed.map(k => NORMATIVA_MAP[k]).filter(Boolean);

    // ─── Construcción del CONTEXTO RAG con fuentes claramente delimitadas
    const ragContext = ragChunks.length > 0
      ? `\n\n═══ NORMATIVA VERIFICADA (corpus FinLogic · ÚNICA fuente válida para citar) ═══\n${ragChunks.map((c, i) => `[${i + 1}] ${c.lawReference} — ${c.title}\n${c.content}`).join('\n\n')}\n═══════════════════════════════════════════════════════\n\nIMPORTANTE: SOLO puedes citar leyes/artículos que aparezcan ARRIBA. Si la consulta requiere normativa que no está en este contexto, dilo honestamente y deriva al organismo correspondiente.`
      : `\n\n⚠️ SIN CONTEXTO RAG DISPONIBLE\nNo cites artículos específicos ni números de leyes. Da orientación general y deriva al organismo competente (sernac.cl, cmfchile.cl, sii.cl, csirt.gob.cl) para verificación normativa exacta.`;

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

    let responseText = llmResponse.response || '';

    // ─── VERIFICADOR ANTI-ALUCINACIÓN ────────────────────────────────────
    const verification = verifyCitations(responseText, ragChunks);
    const jargonDetected = detectJargon(responseText);

    // Si hay riesgo ALTO de alucinación, agregar disclaimer transparente
    if (verification.hallucinationRisk === 'high') {
      console.warn(`[Lya] Alucinación detectada — leyes no verificadas: ${verification.unverified.join(', ')}`);
      responseText += `\n\n_⚠️ Algunas referencias legales en esta respuesta no pude verificarlas en mi corpus. Te recomiendo confirmarlas en ${
        llmResponse.regulatoryBody === 'SII' ? 'sii.cl' :
        llmResponse.regulatoryBody === 'CMF' ? 'cmfchile.cl' :
        llmResponse.regulatoryBody === 'CSIRT' ? 'csirt.gob.cl' :
        'sernac.cl'
      } o leychile.cl antes de actuar._`;
    }

    const latencyMs = Date.now() - startTime;

    return Response.json({
      response: responseText,
      sources,
      confidence: llmResponse.confidence ?? (ragChunks.length > 0 ? 0.92 : 0.7),
      verifierScore: verification.verifierScore,
      hallucinationRisk: verification.hallucinationRisk,
      citationsVerified: verification.verified,
      citationsUnverified: verification.unverified,
      jargonDetected,
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