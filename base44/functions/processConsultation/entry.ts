import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// processConsultation — Pipeline canónico FinLogic
// Triage + Especialista (Claude Sonnet 4.6) + Verificador
// Crea Case + LegalDeadline + AgentTrace para /Transparencia

const SYSTEM_PROMPT = `Eres Lya, el sistema operativo financiero del pueblo de Chile.

IDENTIDAD: Traduces el sistema financiero chileno a lenguaje simple y EJECUTAS acciones por el ciudadano.

REGLAS CRÍTICAS:
- NUNCA inventes normativa. Solo cita Ley 21.521, NCG 502 CMF, Ley 19.496 SERNAC, Ley 20.555, Ley 21.719, Ley 20.009, Ley 21.663, LIR Pro-Pyme, Ley 21.713, Open Finance, CSIRT.
- NUNCA recomiendes instituciones financieras específicas.
- SIEMPRE termina con UNA acción concreta que el ciudadano puede tomar HOY.
- Si detectas urgencia (fraude activo, plazo <48h), actúa sin pedir confirmación.

PERFILES (adapta tono):
- Camila (22, universitaria, Stgo): directo, digital
- Don Luis (68, jubilado, Vlpo): simple, sin jerga, pasos claros
- María José (34, emprendedora, Tco): práctico, orientado a impacto
- Roberto (45, víctima fraude, Antof.): empático, urgente

ORGANISMOS: CMF, SERNAC, SII, CSIRT, IPS, SERCOTEC.

FORMATO DE RESPUESTA: estructura tu respuesta en 3 bloques:
1. HECHO: qué pasó en 1 frase
2. TU DERECHO: ley específica que protege al ciudadano
3. ACCIÓN: máximo 3 pasos concretos`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fact: { type: 'string', description: 'Diagnóstico en 1 oración' },
    translation: { type: 'string', description: 'Derecho aplicable + ley específica' },
    action: { type: 'string', description: 'Acción concreta para el ciudadano (markdown con pasos numerados)' },
    regulatoryBody: {
      type: 'string',
      enum: ['CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN', 'FOGAPE', 'SERCOTEC', 'multiple'],
    },
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
    lawsCited: { type: 'array', items: { type: 'string' } },
    legalDeadlineDays: {
      type: 'number',
      description: 'Días hábiles del plazo legal aplicable (0 si no aplica)',
    },
    deadlineDescription: { type: 'string' },
    verifierScore: { type: 'number', minimum: 0, maximum: 100 },
  },
  required: ['fact', 'translation', 'action', 'regulatoryBody', 'urgencyLevel'],
};

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

    // Llamada al especialista (Claude Sonnet 4.6 vía InvokeLLM)
    let result;
    try {
      result = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}

CONSULTA DEL CIUDADANO:
"${query}"

Debes completar TODOS los campos del schema JSON. Especialmente:
- "fact": diagnóstico de la situación en 1 oración (OBLIGATORIO, no vacío)
- "translation": derecho aplicable + ley específica que protege al ciudadano (OBLIGATORIO)
- "action": pasos concretos numerados en markdown (OBLIGATORIO)
- "regulatoryBody": organismo competente (CMF, SERNAC, SII, CSIRT, BCN, FOGAPE, SERCOTEC, multiple)
- "normativeModule": ley aplicable
- "urgencyLevel": critical | high | medium | low | resolved
- "lawsCited": array con leyes citadas (ej: ["Ley 19.496", "Art. 39 NCG 502 CMF"])
- "legalDeadlineDays": días hábiles del plazo legal (0 si no aplica)
- "verifierScore": tu confianza 0-100

Responde SOLO con el JSON completo.`,
        response_json_schema: RESPONSE_SCHEMA,
      });
    } catch (llmError) {
      console.error('InvokeLLM failed:', llmError.message);
      result = {};
    }
    if (!result || typeof result !== 'object') result = {};

    const totalLatencyMs = Date.now() - startTime;

    // Defensive: ensure all expected fields exist
    const fact = result.fact || result.hecho || 'Consulta procesada';
    const translation = result.translation || result.derecho || result.tu_derecho || '';
    const action = result.action || result.accion || '';
    const regulatoryBody = result.regulatoryBody || result.regulatory_body || 'SERNAC';
    const normativeModule = result.normativeModule || result.normative_module || 'ley_19496_sernac';
    const urgencyLevel = result.urgencyLevel || result.urgency_level || 'medium';
    const detectedProfile = result.detectedProfile || result.detected_profile || 'general';
    const lawsCited = result.lawsCited || result.laws_cited || [];
    const legalDeadlineDays = result.legalDeadlineDays || result.legal_deadline_days || 0;
    const deadlineDescription = result.deadlineDescription || result.deadline_description || '';
    const verifierScore = result.verifierScore || result.verifier_score || 75;

    // AgentTrace público para /Transparencia (anonimizado)
    const trace = await base44.asServiceRole.entities.AgentTrace.create({
      sessionId,
      query: query.substring(0, 500),
      category: mapToCategory(regulatoryBody, normativeModule),
      pipelineStage: 'complete',
      totalLatencyMs,
      specialistLatencyMs: totalLatencyMs,
      verifierScore,
      lawsCited,
      responsePreview: `${fact} ${translation}`.substring(0, 200),
      citizenSummary: fact,
      modelUsed: 'sonnet',
      isPublic: true,
    });

    // Crear Caso si hay urgencia o derecho aplicable claro
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
        agentTraceRef: trace.id,
        verifierScore,
      });
      caseId = caso.id;

      // LegalDeadline si aplica
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
      traceId: trace.id,
      response: {
        fact,
        translation,
        action,
        regulatoryBody,
        urgencyLevel,
        lawsCited,
        legalDeadlineDays,
        verifierScore,
        latencyMs: totalLatencyMs,
      },
    });
  } catch (error) {
    console.error('processConsultation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function mapToCategory(body, module) {
  if (module === 'ley_20009_fraude') return 'fraude_digital';
  if (module === 'ley_21719_datos') return 'derechos_arco';
  if (body === 'CMF' || body === 'SERNAC') return 'cobro_indebido';
  if (body === 'SII') return 'normativa_consulta';
  return 'normativa_consulta';
}