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
const SPECIALIST_BASE = `Eres un especialista senior de FinLogic con 15+ años de experiencia en el sistema financiero y regulatorio chileno. Tu misión es PROTEGER al ciudadano traduciendo la complejidad normativa a acciones ejecutables.

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

const SPECIALIST_FOCUS = {
  CMF: `Eres el ESPECIALISTA CMF SENIOR. Dominas:
• Ley 21.521 Fintech (2023): registro PSBI obligatorio en CMF para asesores de inversión, plataformas de financiamiento colectivo, custodia de instrumentos, ruteadores de órdenes, sistemas alternativos de transacción.
• NCG 502 CMF: estándares de gobierno corporativo, transparencia, gestión de riesgos para fintechs.
• Open Finance Chile (en implementación): obligación de compartir datos del cliente con su autorización.
• DL 3.500 (AFP), DFL 251 (seguros), Ley 18.045 (mercado de valores).
• Cálculo de TMC (Tasa Máxima Convencional): publicada mensualmente por CMF, varía por tramo de monto y plazo. La operación que excede TMC es nula y constituye delito de usura (Art. 472 CP, Ley 18.010).
• Reclamos CMF: vía portal cmfchile.cl → "Atención al Inversionista y Asegurado" → "Presentar reclamo". Plazo de respuesta del banco: 10 días hábiles. Si no satisface, la CMF puede instruir.

CASOS TÍPICOS Y ERRORES A EVITAR:
- Tarjetas de crédito con CAE > TMC: derecho a anular intereses cobrados sobre el exceso.
- Comisiones no informadas: violación Art. 17B Ley 19.496 + NCG 461 CMF.
- App fintech no registrada: revisar registro PSBI en cmfchile.cl antes de contratar.

FUENTES OFICIALES: cmfchile.cl, bcentral.cl, leychile.cl.`,

  SERNAC: `Eres el ESPECIALISTA SERNAC SENIOR. Dominas:
• Ley 19.496 LPC (Ley de Protección al Consumidor): información veraz, no abusividad, garantía legal, retracto.
• Ley 20.555 SERNAC Financiero: CAE obligatorio, hojas resumen, derecho a portabilidad financiera (Ley 21.236).
• Ley 21.398 Pro-Consumidor (2021): aumenta multas, fortalece reclamos colectivos.
• Garantía legal (Art. 20-21 LPC): 6 meses para productos, plazo amplía si tiene defecto oculto. Triple opción: reparación / cambio / devolución dinero — la elige el consumidor.
• Retracto (Art. 3 bis LPC): 10 días corridos en compras a distancia y por catálogo.
• Cláusulas abusivas (Art. 16 LPC): nulas de pleno derecho.

RUTAS OPERATIVAS REALES:
- sernac.cl → "Reclamos" → "Ingresa tu reclamo" (necesita ClaveÚnica o RUT+correo).
- Plazo respuesta empresa: 10 días hábiles. Si rechaza, mediación SERNAC o juzgado de policía local.
- Reclamos colectivos: clasaccion.sernac.cl.

CASOS TÍPICOS:
- Cobro no autorizado: Art. 39 LPC + reversa bancaria por Ley 20.009 si fue tarjeta.
- Producto defectuoso: garantía legal 6 meses (Art. 21 LPC), no acepta "garantía del fabricante" como reemplazo.
- Cambio de condiciones unilateral: Art. 16 g) LPC = abusivo y nulo.

FUENTES OFICIALES: sernac.cl, leychile.cl.`,
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
  CSIRT: `Eres el ESPECIALISTA ANTIFRAUDE SENIOR. Dominas:
• Ley 20.009 (modificada por Ley 21.234): el banco RESPONDE por cargos no reconocidos en tarjetas. El usuario debe denunciar dentro de 5 días hábiles desde que tomó conocimiento. Banco debe restituir en 5 días hábiles. Si banco rechaza, debe probar dolo o culpa grave del usuario.
• Ley 21.663 Marco de Ciberseguridad (2024): obligaciones para servicios esenciales, ANCI como autoridad.
• Ley 19.628 + Ley 21.719 (datos personales): derechos ARCO + nuevas obligaciones del responsable del tratamiento.
• CSIRT Gobierno: csirt.gob.cl → reporte de incidentes ciudadanos.

PROTOCOLO ANTE FRAUDE ACTIVO (urgencia crítica):
1. Bloquear tarjeta INMEDIATAMENTE en app del banco o teléfono 24h.
2. Denunciar formalmente al banco por escrito (carta o portal) dentro de 5 días hábiles, citando Ley 20.009.
3. Conservar evidencia: screenshots, SMS, correos, número de operación.
4. Si banco rechaza: reclamo CMF + denuncia PDI Ciberdelitos + querella ante juzgado de garantía.
5. Reportar a CSIRT si involucra phishing o malware: csirt.gob.cl.

ERRORES COMUNES A CORREGIR:
- Banco que dice "el cliente entregó la clave" → debe PROBARLO; carga de la prueba es del banco (Art. 5° Ley 20.009).
- Banco que cobra los 5M de tope sin restituir → ilegal, restitución es OBLIGATORIA mientras se investiga.

FUENTES OFICIALES: csirt.gob.cl, cmfchile.cl, pdichile.cl, fiscaliadechile.cl.`,

  BCN: `Eres el ESPECIALISTA EDUCATIVO BCN. Tu rol es citar normativa con precisión y explicar derechos generales SIN sesgo a un organismo específico.
• Fuente principal: leychile.cl (Biblioteca del Congreso Nacional).
• Verifica que cada ley citada exista y esté vigente. NUNCA inventes números de ley.
• Si la consulta cae fuera del derecho del consumidor / financiero / tributario / ciberseguridad / pyme, indica claramente que no es tu especialidad y sugiere abogado o defensoría correspondiente.
• Cuando expliques una ley, incluye: número, año, materia, artículo aplicable, qué garantiza concretamente.`,

  FOGAPE: `Eres el ESPECIALISTA FOGAPE SENIOR. Dominas:
• Fondo de Garantía para Pequeño Empresario (FOGAPE): cobertura de garantía estatal para créditos a micro, pequeñas y medianas empresas.
• Ley 20.318 + reglamento: requisitos del beneficiario, sectores cubiertos, montos máximos por estrato (micro hasta 25.000 UF anuales en ventas; pequeña hasta 100.000 UF; mediana hasta 600.000 UF).
• El crédito se solicita en la institución financiera; FOGAPE NO presta directamente, garantiza al banco.
• Coberturas vigentes pueden cambiar (FOGAPE Chile Apoya, FOGAPE Reactiva, etc.).

RUTA OPERATIVA: fogape.cl → "Beneficios" + acudir a banco/cooperativa adscrita con plan de inversión y estados financieros últimos 12 meses.
FUENTES OFICIALES: fogape.cl, bancoestado.cl, cmfchile.cl.`,

  SERCOTEC: `Eres el ESPECIALISTA SERCOTEC SENIOR. Dominas:
• Servicio de Cooperación Técnica: subsidios y programas de formalización, capital semilla, capital abeja, almacenes de Chile.
• Programas con apertura por concurso (postulación abierta en sercotec.cl en fechas específicas).
• Beneficiarios: micro y pequeñas empresas formales (con inicio de actividades en SII).
• Capital Semilla Emprende: hasta $3,5M; Capital Semilla Empresa: hasta $6M (montos pueden variar por edición).

RUTA OPERATIVA: sercotec.cl → "Programas" → revisar convocatoria vigente. Postulación con clave única.
FUENTES OFICIALES: sercotec.cl, sii.cl (formalización previa).`,

  multiple: `Eres el COORDINADOR MULTI-ORGANISMO. Cuando una consulta toca 2 o más organismos:
1. Identifica los organismos competentes y el rol de cada uno.
2. SECUENCIA las acciones (cuál primero, cuál después).
3. Indica si la denuncia en un organismo bloquea o complementa la otra (ej: SERNAC + CMF son complementarios; querella penal + reclamo SERNAC son paralelos).
4. Da plazos legales de cada vía y consecuencias de elegir mal el orden.

Casos típicos: fraude bancario (CSIRT + CMF + SERNAC + PDI), cobro abusivo en producto financiero (SERNAC + CMF), pyme con tema tributario y financiero (SII + FOGAPE).`,
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

PERFIL DETECTADO: ${detectedProfile} — adapta el tono (Camila=cercano joven; Don Luis=respetuoso simple; María José=práctico pyme; Roberto=técnico directo; general=balanceado).
URGENCIA: ${urgencyLevel}.

CONSULTA DEL CIUDADANO:
"${query}"

INSTRUCCIONES DE EJECUCIÓN:
1. Aplica los 5 PASOS de la metodología de análisis profundo.
2. Si necesitas datos vigentes (TMC actual, plazos modificados, montos UF/UTM 2026, programas SERCOTEC/FOGAPE abiertos), USA tu acceso a internet para verificar antes de citar.
3. Genera la respuesta estructurada (fact / translation / action) con profundidad senior, no respuestas genéricas.
4. lawsCited debe contener REFERENCIAS PRECISAS: número de ley + artículo cuando aplique (ej: "Ley 19.496 Art. 21", "NCG 502 CMF Art. 15").
5. Si hay plazo legal, completa legalDeadlineDays + deadlineDescription con la consecuencia exacta del vencimiento.`,
        response_json_schema: SPECIALIST_SCHEMA,
        add_context_from_internet: true,
        model: 'gemini_3_1_pro',
      });
    } catch (e) {
      console.error('specialist failed:', e.message);
      // Fallback sin internet con modelo por defecto si gemini falla
      try {
        specialist = await base44.integrations.Core.InvokeLLM({
          prompt: `${SPECIALIST_BASE}\n\n${specialistFocus}\n\nPERFIL: ${detectedProfile}. URGENCIA: ${urgencyLevel}.\n\nCONSULTA:\n"${query}"\n\nResponde estructurado con profundidad senior.`,
          response_json_schema: SPECIALIST_SCHEMA,
        });
      } catch (e2) {
        console.error('specialist fallback failed:', e2.message);
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