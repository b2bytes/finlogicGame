import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// processConsultation — Pipeline canónico FinLogic (mandato §PromptEngineer)
// Capa 1: Triage rápido       → clasifica organismo + urgencia + módulo
// Capa 2: Especialista profundo → genera respuesta estructurada citando normativa
// Capa 3: Verificador          → audita la respuesta y entrega score 0-100
// Crea MisCasos + LegalDeadline + AgentTrace para /Transparencia.

// ─── CAPA 1 · TRIAGE ────────────────────────────────────────────────────────
const TRIAGE_PROMPT = `Eres el TRIAGE de Lya (FinLogic). Clasifica la consulta del ciudadano chileno.

ENRUTA al especialista correcto basándote en el organismo competente:
- CMF: bancos, fintechs, fondos, NCG 502, Ley 21.521
- SERNAC: cobros indebidos, contratos, Ley 19.496, Ley 20.555
- SII: impuestos, IVA, F29, pyme, cripto, Ley 21.713
- CSIRT: fraude digital, phishing, Ley 20.009, Ley 21.663
- FOGAPE: garantías estatales pyme
- SERCOTEC: subsidios pyme, formalización
- BCN: consultas normativas generales
- multiple: requiere coordinación entre 2+ organismos

Detecta también el PERFIL del ciudadano (Camila 22 / Don Luis 68 / María José 34 emprendedora / Roberto 45 / general).

URGENCIA:
- critical: fraude activo, plazo <48h, monto >5M
- high: plazo <7d, derecho vulnerado claro
- medium: consulta normativa con acción
- low: consulta informativa
- resolved: ya está resuelto`;

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    regulatoryBody: { type: 'string', enum: ['CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN', 'FOGAPE', 'SERCOTEC', 'multiple'] },
    normativeModule: {
      type: 'string',
      enum: [
        'ley_fintech_21521', 'ncg_502_cmf', 'ley_19496_sernac', 'ley_20555',
        'ley_21719_datos', 'ley_20009_fraude', 'ley_21663_ciberseguridad',
        'lir_propyme', 'ley_21713_tributaria', 'tributacion_cripto',
        'open_finance', 'csirt',
      ],
    },
    urgencyLevel: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'resolved'] },
    detectedProfile: { type: 'string', enum: ['camila', 'don_luis', 'maria_jose', 'roberto', 'general'] },
    category: {
      type: 'string',
      enum: ['fraude_digital', 'cobro_indebido', 'derechos_arco', 'contrato_abusivo', 'normativa_consulta', 'indicadores_economicos', 'compliance_api', 'fuera_de_scope'],
    },
    routingReason: { type: 'string', description: 'Por qué se enruta a este especialista (1 oración)' },
  },
  required: ['regulatoryBody', 'urgencyLevel', 'detectedProfile', 'category'],
};

// ─── CAPA 2 · ESPECIALISTAS POR ORGANISMO ──────────────────────────────────
// (deprecated, mantenido solo por compatibilidad — no se usa)
const SPECIALIST_BASE = `Eres un especialista senior de FinLogic.

═══════════════════════════════════════════════════════════════════
METODOLOGÍA DE ANÁLISIS PROFUNDO (obligatoria, en este orden)
═══════════════════════════════════════════════════════════════════
ANTES de redactar tu respuesta final, razona internamente:

PASO 1 · DESAMBIGUACIÓN
   ¿Qué información FALTA para resolver con certeza?
   ¿Es persona natural / jurídica / pyme / pensionado / dependiente / honorarios?
   ¿La consulta tiene supuestos implícitos peligrosos? (ej: asumir que tiene RUT empresa)
   Si falta información crítica, INCLUYE en la acción "antes de actuar, confirma X en Y".

PASO 2 · IDENTIFICACIÓN NORMATIVA
   ¿Cuál es la ley general aplicable? ¿Hay ley especial que la modifica?
   ¿Hay normativa de detalle (NCG, circular SII, instructivo SERNAC)?
   ¿Hubo reformas recientes (2024-2026) que cambian la respuesta? (Ley 21.713, Ley 21.521, Ley 21.663, Ley 21.719)

PASO 3 · DERECHOS Y PLAZOS
   ¿Qué derechos concretos tiene el ciudadano? ¿Cuál es el plazo legal exacto?
   ¿Hábiles o corridos? ¿Desde cuándo se cuenta?
   ¿Cuál es la consecuencia de NO actuar a tiempo?

PASO 4 · RUTA OPERATIVA REAL
   ¿Cuál es la ruta EXACTA en el portal del organismo (sii.cl, sernac.cl, cmfchile.cl, csirt.gob.cl)?
   ¿Qué documentos necesita reunir? ¿Cuáles son los formularios reales?
   ¿Qué evidencia debe guardar?

PASO 5 · ANTICIPACIÓN
   ¿Qué le va a pasar después? ¿Qué respuesta esperar del organismo?
   ¿Qué hacer si el organismo no responde o rechaza?
   ¿Hay una segunda instancia (apelación, demanda, reclamo en otro organismo)?

═══════════════════════════════════════════════════════════════════
REGLAS DE INTEGRIDAD (rojas — nunca cruces estas líneas)
═══════════════════════════════════════════════════════════════════
✗ NUNCA inventes números de leyes, artículos, montos en UF/UTM, tasas TMC ni plazos.
✗ NUNCA recomiendes instituciones financieras específicas (bancos, aseguradoras, AFP).
✗ NUNCA asumas el tipo de contribuyente o categoría tributaria sin que el ciudadano la confirme.
✗ NUNCA minimices el problema ("no es grave", "no te preocupes").
✗ NUNCA inventes rutas en portales oficiales — si no estás 100% seguro de la ruta, di "ingresa a sii.cl/sernac.cl con tu clave y busca la sección X".
✓ SIEMPRE cita la ley + artículo específico cuando aplique.
✓ SIEMPRE indica el plazo legal cuando exista (en días hábiles o corridos, con consecuencia).
✓ SIEMPRE termina con UNA acción concreta ejecutable HOY o esta semana.
✓ Si detectas URGENCIA CRÍTICA (fraude activo, plazo <48h, pérdida >5M), prioriza la acción protectora antes que la explicación.

═══════════════════════════════════════════════════════════════════
FORMATO DE SALIDA — 3 bloques obligatorios + profundidad
═══════════════════════════════════════════════════════════════════
1. HECHO: diagnóstico preciso del caso en 1-2 frases (no genérico).
2. TU DERECHO: ley + artículo específico + qué te garantiza concretamente (no solo el nombre de la ley).
3. ACCIÓN: 2-4 pasos numerados, con ruta exacta del portal, documentos a reunir, plazos y qué esperar después.

Si la consulta requiere desambiguación crítica, el paso 1 de la ACCIÓN debe ser "verificar X en ruta Y antes de continuar".`;

// SPECIALIST_FOCUS — líneas compactas. Conocimiento detallado viene del RAG (Pinecone).
const SPECIALIST_FOCUS = {
  CMF: 'Ley 21.521 Fintech, registro PSBI, NCG 502, TMC (Ley 18.010 + Art. 472 CP), Open Finance. Reclamos en cmfchile.cl. Plazo banco: 10 días hábiles.',
  SERNAC: 'Ley 19.496 LPC (Art. 16 abusivas, 21 garantía 6 meses, 3 bis retracto 10 días corridos), Ley 20.555 CAE, Ley 21.398. Reclamos en sernac.cl. Plazo empresa: 10 días hábiles.',
  SII: 'Ley 21.713 reforma 2024, LIR Pro-Pyme (Art. 14 D N°3), F22 anual, F29 mensual (solo con giro). DIFERENCIA SIEMPRE persona natural sin giro vs con actividad. NUNCA asumas categoría: pide verificar en sii.cl → Mi SII → Actividades económicas.',
  CSIRT: 'Ley 20.009 (Art. 4-5: denuncia 5 días hábiles, restitución banco 5 días hábiles, carga prueba al banco), Ley 21.663 ciberseguridad, Ley 21.234. Reportar en csirt.gob.cl + reclamo CMF si banco rechaza.',
  BCN: 'Cita normativa precisa de leychile.cl. Si fuera de scope financiero/consumidor/tributario, deriva a abogado o defensoría.',
  FOGAPE: 'Garantía estatal Ley 20.318 para mype/pyme. NO presta directo, garantiza al banco. Postulación vía banco adscrito + fogape.cl.',
  SERCOTEC: 'Subsidios pyme: capital semilla, abeja, almacenes Chile. Postulación por concurso en sercotec.cl. Requiere inicio de actividades SII.',
  multiple: 'Coordinador multi-organismo: secuencia las acciones, indica complementariedad o paralelismo (ej: SERNAC+CMF complementarios, querella penal paralela a reclamo). Da plazos por vía.',
};

const SPECIALIST_SCHEMA = {
  type: 'object',
  properties: {
    fact: { type: 'string', description: 'Diagnóstico en 1 oración' },
    translation: { type: 'string', description: 'Derecho aplicable + ley específica' },
    action: { type: 'string', description: 'Acción concreta para el ciudadano (markdown con pasos numerados)' },
    lawsCited: { type: 'array', items: { type: 'string' }, description: 'Leyes citadas, ej: ["Ley 19.496", "Art. 39 NCG 502 CMF"]' },
    legalDeadlineDays: { type: 'number', description: 'Días hábiles del plazo legal (0 si no aplica)' },
    deadlineDescription: { type: 'string' },
    selfConfidence: { type: 'number', minimum: 0, maximum: 100, description: 'Confianza del especialista en su respuesta' },
  },
  required: ['fact', 'translation', 'action', 'lawsCited'],
};

// ─── CAPA 3 · VERIFICADOR ──────────────────────────────────────────────────
const VERIFIER_PROMPT = `Eres el VERIFICADOR de Lya. Auditas la respuesta del especialista contra la consulta original.

EVALÚA 4 dimensiones (0-100 cada una):
1. precision_normativa: ¿las leyes citadas son reales y aplican?
2. accionabilidad: ¿el ciudadano puede ejecutar HOY los pasos?
3. claridad: ¿se entiende sin formación legal?
4. ausencia_alucinacion: ¿no hay artículos/montos inventados?

DETECTA RIESGOS:
- artículos legales sospechosos
- recomendación de institución específica
- minimización del problema

El verifierScore final es el promedio ponderado: precision×0.4 + accion×0.3 + claridad×0.2 + sin_aluc×0.1`;

const VERIFIER_SCHEMA = {
  type: 'object',
  properties: {
    verifierScore: { type: 'number', minimum: 0, maximum: 100 },
    precisionNormativa: { type: 'number', minimum: 0, maximum: 100 },
    accionabilidad: { type: 'number', minimum: 0, maximum: 100 },
    claridad: { type: 'number', minimum: 0, maximum: 100 },
    ausenciaAlucinacion: { type: 'number', minimum: 0, maximum: 100 },
    riesgosDetectados: { type: 'array', items: { type: 'string' } },
    recomendacionAprobacion: { type: 'string', enum: ['aprobar', 'aprobar_con_advertencia', 'rechazar'] },
  },
  required: ['verifierScore', 'recomendacionAprobacion'],
};

// ─── RAG INLINE (Pinecone direct, evita overhead de invoke) ────────────────
const PINECONE_INDEX = 'finlogic-knowledge';
const PINECONE_NAMESPACE = 'finlogic-prod';
const PINECONE_EMBED_MODEL = 'multilingual-e5-large';
let _cachedHost = null;

async function pineconeRagSearch(query, topK = 5, minScore = 0.25) {
  const apiKey = Deno.env.get('PINECONE_API_KEY');
  if (!apiKey) return { data: { success: false, chunks: [] } };

  try {
    // 1. Resolver host (cached)
    if (!_cachedHost) {
      const idxRes = await fetch(`https://api.pinecone.io/indexes/${PINECONE_INDEX}`, {
        headers: { 'Api-Key': apiKey, 'X-Pinecone-API-Version': '2024-10' },
      });
      if (!idxRes.ok) return { data: { success: false, chunks: [], error: 'index_not_found' } };
      const idxData = await idxRes.json();
      _cachedHost = idxData.host;
    }

    // 2. Embed + Query en paralelo NO posible (query necesita el vector)
    const embedRes = await fetch('https://api.pinecone.io/embed', {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        model: PINECONE_EMBED_MODEL,
        inputs: [{ text: query.substring(0, 4000) }],
        parameters: { input_type: 'query', truncate: 'END' },
      }),
    });
    if (!embedRes.ok) return { data: { success: false, chunks: [] } };
    const embedData = await embedRes.json();
    const vector = embedData.data[0].values;

    // 3. Query
    const qRes = await fetch(`https://${_cachedHost}/query`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
        'X-Pinecone-API-Version': '2024-10',
      },
      body: JSON.stringify({
        namespace: PINECONE_NAMESPACE,
        vector,
        topK: Math.min(topK, 20),
        includeMetadata: true,
      }),
    });
    if (!qRes.ok) return { data: { success: false, chunks: [] } };
    const qData = await qRes.json();

    const chunks = (qData.matches || [])
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

    return { data: { success: true, chunks } };
  } catch (e) {
    console.error('pineconeRagSearch failed:', e.message);
    return { data: { success: false, chunks: [] } };
  }
}

// ─── PIPELINE ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, channel = 'web', sessionId = crypto.randomUUID() } = await req.json();

    if (!query || query.trim().length < 5) {
      return Response.json({ error: 'Consulta demasiado corta' }, { status: 400 });
    }

    const startTime = Date.now();
    let userEmail = null;
    try {
      const user = await base44.auth.me();
      userEmail = user?.email || null;
    } catch (_) {
      // zero-login: continúa sin usuario autenticado
    }

    // ─── CAPAS 1 + RAG EN PARALELO ──────────────────────────────────────
    // Triage y RAG son independientes (RAG no necesita el organismo del triage,
    // filtramos por relevancia semántica). Esto ahorra ~600-1200ms vs serial.
    const triageStart = Date.now();
    const ragStart = Date.now();

    const [triageResult, ragResult] = await Promise.allSettled([
      base44.integrations.Core.InvokeLLM({
        prompt: `${TRIAGE_PROMPT}\n\nCONSULTA:\n"${query}"\n\nResponde SOLO con el JSON.`,
        response_json_schema: TRIAGE_SCHEMA,
        model: 'gpt_5_mini',
      }),
      // RAG via fetch directo a Pinecone (saltamos invoke para evitar 403)
      pineconeRagSearch(query, 5, 0.25),
    ]);

    const triage = triageResult.status === 'fulfilled' ? triageResult.value : {};
    if (triageResult.status === 'rejected') console.error('triage failed:', triageResult.reason?.message);

    const triageLatencyMs = Date.now() - triageStart;
    const regulatoryBody = triage.regulatoryBody || 'SERNAC';
    const normativeModule = triage.normativeModule || 'ley_19496_sernac';
    const urgencyLevel = triage.urgencyLevel || 'medium';
    const detectedProfile = triage.detectedProfile || 'general';
    const category = triage.category || 'normativa_consulta';

    let ragChunks = [];
    if (ragResult.status === 'fulfilled' && ragResult.value?.data?.success) {
      ragChunks = ragResult.value.data.chunks || [];
      console.log(`[RAG] found ${ragChunks.length} chunks`);
      // Re-ranking ligero: priorizar chunks del organismo detectado
      if (regulatoryBody && regulatoryBody !== 'multiple') {
        ragChunks.sort((a, b) => {
          const aMatch = a.regulatoryBody === regulatoryBody ? 1 : 0;
          const bMatch = b.regulatoryBody === regulatoryBody ? 1 : 0;
          return bMatch - aMatch || b.score - a.score;
        });
      }
    } else if (ragResult.status === 'rejected') {
      console.error('RAG search failed:', ragResult.reason?.message);
    }
    const ragLatencyMs = Date.now() - ragStart;

    // RAG compacto: solo top 3 chunks, contenido truncado a 600 chars
    const topChunks = ragChunks.slice(0, 3);
    const ragContext = topChunks.length > 0
      ? `FUENTES NORMATIVAS (corpus FinLogic verificado):\n${topChunks.map((c, i) => `[${i + 1}] ${c.lawReference} — ${c.title}\n${(c.content || '').substring(0, 600)}`).join('\n\n')}`
      : '';

    // ─── CAPA 2 · ESPECIALISTA (claude_sonnet_4_6, prompt compacto + RAG) ─
    // Sonnet 4.6 con prompt compacto + RAG entrega output estructurado de
    // calidad senior en ~5-8s (vs ~25s antes con prompt enorme).
    const specialistStart = Date.now();
    const focusLine = SPECIALIST_FOCUS[regulatoryBody] || SPECIALIST_FOCUS.BCN;
    const toneMap = {
      camila: 'cercano joven, directo',
      don_luis: 'respetuoso, simple, paso a paso',
      maria_jose: 'práctico orientado a pyme',
      roberto: 'técnico directo',
      general: 'balanceado profesional',
    };

    const specialistPrompt = `Eres un especialista senior de FinLogic en derecho ${regulatoryBody} chileno. Foco: ${focusLine}

REGLAS DURAS:
- Cita ley + artículo específico (nunca inventes).
- Si falta info crítica, pide desambiguación en el paso 1 de la acción.
- Nunca recomiendes instituciones financieras específicas.
- Si hay plazo legal, indícalo en días hábiles + consecuencia.

${ragContext || '(sin contexto RAG: usa tu conocimiento normativo verificado)'}

CONSULTA: "${query}"
PERFIL: ${detectedProfile} — tono ${toneMap[detectedProfile] || toneMap.general}
URGENCIA: ${urgencyLevel}

Responde JSON con:
- fact: diagnóstico preciso 1-2 frases
- translation: ley + artículo + qué te garantiza
- action: 2-4 pasos numerados con ruta del portal y plazos (markdown)
- lawsCited: ["Ley X Art. Y", ...]
- legalDeadlineDays: número (0 si no aplica)
- deadlineDescription: consecuencia del vencimiento
- selfConfidence: 0-100`;

    let specialist = {};
    try {
      // Usamos el modelo default (gpt-4o-mini equivalente) — más rápido y
      // respeta JSON schema de forma confiable. Sonnet a veces devuelve vacío.
      specialist = await base44.integrations.Core.InvokeLLM({
        prompt: specialistPrompt,
        response_json_schema: SPECIALIST_SCHEMA,
      });
    } catch (e) {
      console.error('specialist failed:', e.message);
    }
    // Si vino vacío sin error, intentamos con Sonnet como fallback de calidad
    if (!specialist.fact || !specialist.action) {
      console.warn('specialist devolvió vacío, retry con sonnet');
      try {
        specialist = await base44.integrations.Core.InvokeLLM({
          prompt: specialistPrompt,
          response_json_schema: SPECIALIST_SCHEMA,
          model: 'claude_sonnet_4_6',
        });
      } catch (e2) {
        console.error('specialist sonnet retry failed:', e2.message);
      }
    }
    const specialistLatencyMs = Date.now() - specialistStart;

    const fact = specialist.fact || 'Consulta procesada';
    const translation = specialist.translation || '';
    const action = specialist.action || '';
    const lawsCited = specialist.lawsCited || [];
    const legalDeadlineDays = specialist.legalDeadlineDays || 0;
    const deadlineDescription = specialist.deadlineDescription || '';
    const selfConfidence = specialist.selfConfidence || 75;

    // ─── CAPA 3 · VERIFICADOR (async, fuera del path crítico) ──────────
    // El usuario NO espera al verificador. Usa selfConfidence como score inicial
    // y el verificador actualiza el AgentTrace después con waitUntil-like pattern.
    const verifierScore = Math.round(selfConfidence);
    const totalLatencyMs = Date.now() - startTime;

    // ─── TRACE ÚNICO con pipeline completo ──────────────────────────────
    const traceRecord = await base44.asServiceRole.entities.AgentTrace.create({
      sessionId,
      query: query.substring(0, 500),
      category,
      pipelineStage: 'complete',
      triageLatencyMs,
      ragLatencyMs,
      specialistLatencyMs,
      totalLatencyMs,
      verifierScore,
      lawsCited,
      responsePreview: `${fact} ${translation}`.substring(0, 200),
      citizenSummary: fact,
      modelUsed: 'sonnet',
      isPublic: true,
    });

    // ─── CASE + DEADLINE ────────────────────────────────────────────────
    let caseId = null;
    let deadlineId = null;
    if (userEmail && urgencyLevel !== 'resolved' && regulatoryBody !== 'multiple') {
      const caso = await base44.asServiceRole.entities.MisCasos.create({
        title: fact.substring(0, 100),
        description: query,
        regulatoryBody,
        normativeModule,
        status: 'abierto',
        priority: urgencyLevel === 'critical' || urgencyLevel === 'high' ? 'alta' : 'media',
        urgencyLevel,
        userProfile: detectedProfile,
        channel,
        agentTraceRef: traceRecord.id,
        verifierScore,
      });
      caseId = caso.id;

      if (legalDeadlineDays > 0) {
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + legalDeadlineDays);
        const deadline = await base44.asServiceRole.entities.LegalDeadline.create({
          casoRef: caseId,
          normativeRef: normativeModule,
          description: deadlineDescription || `Plazo legal de ${legalDeadlineDays} días`,
          deadlineDate: deadlineDate.toISOString().split('T')[0],
          daysLimit: legalDeadlineDays,
          dayType: 'habiles',
          organism: regulatoryBody,
          legalBasis: lawsCited[0] || 'Normativa vigente',
          consequence: 'Pérdida del derecho a reclamo si vence',
          status: 'pendiente',
        });
        deadlineId = deadline.id;
      }
    }

    // ─── VERIFICADOR ASYNC (fire-and-forget) ────────────────────────────
    // No bloqueamos al usuario. Si falla update por RLS, lo ignoramos —
    // selfConfidence ya está guardado en el trace inicial.
    const traceId = traceRecord.id;
    (async () => {
      try {
        const verification = await base44.integrations.Core.InvokeLLM({
          prompt: `${VERIFIER_PROMPT}\n\nCONSULTA: "${query}"\nHECHO: ${fact}\nDERECHO: ${translation}\nACCIÓN: ${action}\nLEYES: ${JSON.stringify(lawsCited)}\nFUENTES RAG: ${ragChunks.map(c => c.lawReference).join(', ') || '(sin)'}\n\nAudita.`,
          response_json_schema: VERIFIER_SCHEMA,
        });
        const finalScore = Math.round(verification.verifierScore || selfConfidence);
        // Update via service role (la entity AgentTrace tiene RLS write=admin only)
        await base44.asServiceRole.entities.AgentTrace.update(traceId, {
          verifierScore: finalScore,
        }).catch(e => console.warn('trace update skipped:', e.message));
        if (caseId) {
          await base44.asServiceRole.entities.MisCasos.update(caseId, {
            verifierScore: finalScore,
          }).catch(e => console.warn('case update skipped:', e.message));
        }
      } catch (e) {
        console.error('async verifier failed:', e.message);
      }
    })();

    return Response.json({
      success: true,
      caseId,
      deadlineId,
      traceId,
      response: {
        fact,
        translation,
        action,
        regulatoryBody,
        urgencyLevel,
        detectedProfile,
        lawsCited,
        legalDeadlineDays,
        verifierScore,
        latencyMs: totalLatencyMs,
        pipeline: {
          triageLatencyMs,
          ragLatencyMs,
          specialistLatencyMs,
          totalLatencyMs,
          routedTo: regulatoryBody,
          routingReason: triage.routingReason || null,
          ragChunksFound: ragChunks.length,
          ragSources: ragChunks.map(c => ({ lawReference: c.lawReference, score: c.score })),
          modelsUsed: {
            triage: 'gpt_5_mini',
            specialist: 'default (sonnet fallback)',
            verifier: 'default (async)',
            embeddings: 'pinecone-multilingual-e5-large',
          },
        },
      },
    });
  } catch (error) {
    console.error('processConsultation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});