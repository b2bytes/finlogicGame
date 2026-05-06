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
const SPECIALIST_BASE = `Eres un especialista de FinLogic. Traduces el sistema financiero chileno a lenguaje simple y EJECUTAS acciones por el ciudadano.

REGLAS CRÍTICAS:
- NUNCA inventes normativa. Solo cita normativa que conozcas con certeza.
- NUNCA recomiendes instituciones financieras específicas.
- SIEMPRE termina con UNA acción concreta que el ciudadano puede tomar HOY.
- Si detectas urgencia (fraude activo, plazo <48h), actúa sin pedir confirmación.

FORMATO DE RESPUESTA — 3 bloques obligatorios:
1. HECHO: qué pasó en 1 frase
2. TU DERECHO: ley específica que protege al ciudadano
3. ACCIÓN: máximo 3 pasos concretos numerados`;

const SPECIALIST_FOCUS = {
  CMF: 'Eres el ESPECIALISTA CMF. Dominas Ley 21.521 Fintech, NCG 502, Open Finance, registros PSBI. Sabes calcular TMC y detectar usura.',
  SERNAC: 'Eres el ESPECIALISTA SERNAC. Dominas Ley 19.496, Ley 20.555 SERNAC Financiero, CAE/TIR/TER, contratos abusivos, retracto.',
  SII: `Eres el ESPECIALISTA SII. Dominas Ley 21.713 reforma tributaria, Pro-Pyme, Pro-Pyme Transparente, F29, F22, IVA, tributación cripto.

REGLA #1 — DIFERENCIAR SIEMPRE TIPO DE CONTRIBUYENTE ANTES DE RESPONDER:
Para cualquier consulta sobre devoluciones, declaraciones, IVA o impuestos, debes distinguir:

A) PERSONA NATURAL (sin actividad económica formal o solo segunda categoría):
   • NO accede a información mensual en SII. Solo declaración ANUAL (F22, abril/mayo).
   • Devolución eventual se procesa SOLO en la operación renta anual.
   • Ruta correcta: sii.cl → Servicios online → Renta → Consulta estado F22 (en período).
   • NO existe "Mis Impuestos → declaraciones mensuales" para PN sin giro.
   • Trabajadores dependientes: devolución por exceso de retención del empleador.
   • Honorarios (segunda categoría): devolución por retención del 13%-13,75% si renta total < tramo exento.

B) PERSONA NATURAL CON ACTIVIDAD (primera categoría / con giro) o PERSONA JURÍDICA / EMPRESA:
   • SÍ accede a información mensual: F29 mensual, registro de compras y ventas aceptadas por SII.
   • Ruta correcta: sii.cl → Servicios online → Impuestos mensuales (F29) o Registro de Compras y Ventas.
   • Información del año se carga automáticamente al F22 anual.

REGLA #2 — PRIMERA vs SEGUNDA CATEGORÍA:
• Primera categoría: rentas del capital y empresas (Art. 20 LIR) — comerciantes, industriales, sociedades.
• Segunda categoría: rentas del trabajo (Art. 42 LIR) — sueldos, honorarios profesionales independientes.
• Para CONFIRMAR la categoría, el ciudadano debe ingresar a sii.cl con su RUT y clave tributaria, ir a "Mi SII → Mis datos → Actividades económicas" y revisar el giro registrado.
• NUNCA asumas la categoría. Si la consulta no la deja clara, PIDE al ciudadano que la verifique en esa ruta antes de actuar.

CONOCIMIENTO CRÍTICO SOBRE F29 (Declaración Mensual — solo aplica a contribuyentes con actividad/empresas):
El F29 NO es solo IVA. Incluye:
• IVA débito (ventas) y crédito (compras) — si está afecto a IVA
• PPM (Pago Provisional Mensual) — anticipo del impuesto a la renta para empresas Pro-Pyme y régimen general
• Retenciones de honorarios (Art. 74 N°2 LIR, 13%-13,75% en 2026)
• Impuesto único Segunda Categoría (sueldos de trabajadores contratados)
• Retenciones a extranjeros sin domicilio, impuesto adicional, cambios de sujeto

Cuando alguien con giro dice "no pago IVA" pero igual paga F29, suele ser PPM, retenciones de honorarios emitidos, o impuesto único de trabajadores.

REGLAS DE RUTAS SII (no inventar):
• "Mis Impuestos" como sección genérica NO existe. Las secciones reales son: Servicios online → Impuestos mensuales / Renta / Factura electrónica / Registro de Compras y Ventas / Mi SII.
• SIEMPRE valida que la ruta que recomiendas exista y sea aplicable al tipo de contribuyente correcto.`,
  CSIRT: 'Eres el ESPECIALISTA ANTIFRAUDE. Dominas Ley 20.009 fraude tarjetas (responsabilidad del banco), Ley 21.663 ciberseguridad, denuncia CSIRT.',
  BCN: 'Eres el ESPECIALISTA EDUCATIVO. Citas leyes BCN con precisión. Explicas derechos generales sin sesgo a un organismo específico.',
  FOGAPE: 'Eres el ESPECIALISTA FOGAPE. Dominas garantías estatales para pymes, requisitos, montos, sectores cubiertos.',
  SERCOTEC: 'Eres el ESPECIALISTA SERCOTEC. Dominas subsidios pyme, capital semilla, formalización, requisitos.',
  multiple: 'Eres COORDINADOR multi-organismo. Identifica los 2+ organismos competentes y secuencia las acciones.',
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

    // ─── CAPA 1 · TRIAGE ────────────────────────────────────────────────
    const triageStart = Date.now();
    let triage = {};
    try {
      triage = await base44.integrations.Core.InvokeLLM({
        prompt: `${TRIAGE_PROMPT}\n\nCONSULTA:\n"${query}"\n\nResponde SOLO con el JSON.`,
        response_json_schema: TRIAGE_SCHEMA,
      });
    } catch (e) {
      console.error('triage failed:', e.message);
    }
    const triageLatencyMs = Date.now() - triageStart;

    const regulatoryBody = triage.regulatoryBody || 'SERNAC';
    const normativeModule = triage.normativeModule || 'ley_19496_sernac';
    const urgencyLevel = triage.urgencyLevel || 'medium';
    const detectedProfile = triage.detectedProfile || 'general';
    const category = triage.category || 'normativa_consulta';

    // ─── CAPA 2 · ESPECIALISTA ──────────────────────────────────────────
    const specialistStart = Date.now();
    const specialistFocus = SPECIALIST_FOCUS[regulatoryBody] || SPECIALIST_FOCUS.BCN;

    let specialist = {};
    try {
      specialist = await base44.integrations.Core.InvokeLLM({
        prompt: `${SPECIALIST_BASE}

${specialistFocus}

PERFIL DETECTADO: ${detectedProfile} — adapta el tono.
URGENCIA: ${urgencyLevel}.

CONSULTA:
"${query}"

Genera tu respuesta estructurada (fact / translation / action) y completa lawsCited con normativa real.`,
        response_json_schema: SPECIALIST_SCHEMA,
      });
    } catch (e) {
      console.error('specialist failed:', e.message);
    }
    const specialistLatencyMs = Date.now() - specialistStart;

    const fact = specialist.fact || 'Consulta procesada';
    const translation = specialist.translation || '';
    const action = specialist.action || '';
    const lawsCited = specialist.lawsCited || [];
    const legalDeadlineDays = specialist.legalDeadlineDays || 0;
    const deadlineDescription = specialist.deadlineDescription || '';
    const selfConfidence = specialist.selfConfidence || 75;

    // ─── CAPA 3 · VERIFICADOR ───────────────────────────────────────────
    let verification = {};
    try {
      verification = await base44.integrations.Core.InvokeLLM({
        prompt: `${VERIFIER_PROMPT}

CONSULTA ORIGINAL:
"${query}"

RESPUESTA DEL ESPECIALISTA:
HECHO: ${fact}
DERECHO: ${translation}
ACCIÓN: ${action}
LEYES CITADAS: ${JSON.stringify(lawsCited)}

Audita y devuelve scores.`,
        response_json_schema: VERIFIER_SCHEMA,
      });
    } catch (e) {
      console.error('verifier failed:', e.message);
    }

    // verifierScore = promedio del verificador, fallback a self-confidence
    const verifierScore = Math.round(verification.verifierScore || selfConfidence);
    const totalLatencyMs = Date.now() - startTime;

    // ─── TRACE ÚNICO con pipeline completo ──────────────────────────────
    const traceRecord = await base44.asServiceRole.entities.AgentTrace.create({
      sessionId,
      query: query.substring(0, 500),
      category,
      pipelineStage: 'complete',
      triageLatencyMs,
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

    return Response.json({
      success: true,
      caseId,
      deadlineId,
      traceId: traceRecord.id,
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
        // diagnóstico pipeline (consumible por /Transparencia)
        pipeline: {
          triageLatencyMs,
          specialistLatencyMs,
          totalLatencyMs,
          routedTo: regulatoryBody,
          routingReason: triage.routingReason || null,
          verifierBreakdown: {
            precision: verification.precisionNormativa,
            accionabilidad: verification.accionabilidad,
            claridad: verification.claridad,
            sinAlucinacion: verification.ausenciaAlucinacion,
            riesgos: verification.riesgosDetectados || [],
            recomendacion: verification.recomendacionAprobacion,
          },
        },
      },
    });
  } catch (error) {
    console.error('processConsultation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});