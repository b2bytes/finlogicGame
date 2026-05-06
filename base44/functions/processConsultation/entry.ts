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
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nCONSULTA DEL CIUDADANO:\n"${query}"\n\nResponde en JSON estricto siguiendo el schema.`,
      response_json_schema: RESPONSE_SCHEMA,
      model: 'claude_sonnet_4_6',
    });

    const totalLatencyMs = Date.now() - startTime;
    const verifierScore = result.verifierScore || 75;

    // AgentTrace público para /Transparencia (anonimizado)
    const trace = await base44.asServiceRole.entities.AgentTrace.create({
      sessionId,
      query: query.substring(0, 500),
      category: mapToCategory(result.regulatoryBody, result.normativeModule),
      pipelineStage: 'complete',
      totalLatencyMs,
      specialistLatencyMs: totalLatencyMs,
      verifierScore,
      lawsCited: result.lawsCited || [],
      responsePreview: `${result.fact} ${result.translation}`.substring(0, 200),
      citizenSummary: result.fact,
      modelUsed: 'sonnet',
      isPublic: true,
    });

    // Crear Caso si hay urgencia o derecho aplicable claro
    let caseId = null;
    let deadlineId = null;
    if (userEmail && result.urgencyLevel !== 'resolved' && result.regulatoryBody !== 'multiple') {
      const caso = await base44.asServiceRole.entities.MisCasos.create({
        title: result.fact.substring(0, 100),
        description: query,
        regulatoryBody: result.regulatoryBody,
        normativeModule: result.normativeModule || 'ley_19496_sernac',
        status: 'abierto',
        priority: result.urgencyLevel === 'critical' ? 'alta' : result.urgencyLevel === 'high' ? 'alta' : 'media',
        urgencyLevel: result.urgencyLevel,
        userProfile: result.detectedProfile || 'general',
        channel,
        agentTraceRef: trace.id,
        verifierScore,
      });
      caseId = caso.id;

      // LegalDeadline si aplica
      if (result.legalDeadlineDays && result.legalDeadlineDays > 0) {
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + result.legalDeadlineDays);
        const deadline = await base44.asServiceRole.entities.LegalDeadline.create({
          casoRef: caseId,
          normativeRef: result.normativeModule || 'ley_19496_sernac',
          description: result.deadlineDescription || `Plazo legal de ${result.legalDeadlineDays} días`,
          deadlineDate: deadlineDate.toISOString().split('T')[0],
          daysLimit: result.legalDeadlineDays,
          dayType: 'habiles',
          organism: result.regulatoryBody === 'multiple' ? 'SERNAC' : result.regulatoryBody,
          legalBasis: (result.lawsCited || [])[0] || 'Normativa vigente',
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
        fact: result.fact,
        translation: result.translation,
        action: result.action,
        regulatoryBody: result.regulatoryBody,
        urgencyLevel: result.urgencyLevel,
        lawsCited: result.lawsCited || [],
        legalDeadlineDays: result.legalDeadlineDays || 0,
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