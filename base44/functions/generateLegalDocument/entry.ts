import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// generateLegalDocument — Genera carta legal lista para enviar
// Tipos: carta_arco, denuncia_sernac, reporte_csirt, reclamo_cmf, declaracion_sii, carta_generica
// Usa Claude Sonnet 4.6 con prompts especializados por tipo de documento

const DOC_TEMPLATES = {
  carta_arco: {
    title: 'Solicitud de Derechos ARCO',
    addressedTo: 'Responsable de Datos Personales',
    legalBasis: 'Ley 21.719 sobre Protección de Datos Personales',
    instructions: `Redacta una carta formal de ejercicio de derechos ARCO (Acceso, Rectificación, Cancelación, Oposición) según Ley 21.719.
Debe incluir: identificación del titular, datos a acceder/rectificar/cancelar, fundamento legal (artículos específicos), plazo de respuesta legal (15 días hábiles), canal de respuesta solicitado.`,
  },
  denuncia_sernac: {
    title: 'Denuncia ante SERNAC',
    addressedTo: 'Servicio Nacional del Consumidor',
    legalBasis: 'Ley 19.496 sobre Protección de los Derechos del Consumidor',
    instructions: `Redacta una denuncia formal ante SERNAC. Debe incluir: identificación del consumidor, descripción cronológica de los hechos, identificación del proveedor, derecho infringido (citar artículos Ley 19.496), pretensión (qué pide el consumidor), pruebas adjuntas.`,
  },
  reclamo_cmf: {
    title: 'Reclamo ante la Comisión para el Mercado Financiero',
    addressedTo: 'Comisión para el Mercado Financiero (CMF)',
    legalBasis: 'Ley 21.521 Fintech y NCG 502 CMF',
    instructions: `Redacta un reclamo formal ante la CMF contra una entidad financiera. Debe incluir: identificación del reclamante, identificación de la entidad, hechos cronológicos, normativa infringida (Ley 21.521, NCG 502, Ley 20.555), gestiones previas con la entidad, pretensión.`,
  },
  reporte_csirt: {
    title: 'Reporte de Incidente de Ciberseguridad',
    addressedTo: 'CSIRT Nacional',
    legalBasis: 'Ley 21.663 Marco de Ciberseguridad',
    instructions: `Redacta un reporte formal al CSIRT Nacional. Debe incluir: descripción del incidente, vector de ataque sospechado (phishing, smishing, vishing, malware), montos involucrados, sistemas afectados, evidencia disponible, acciones tomadas. Tono técnico-formal.`,
  },
  declaracion_sii: {
    title: 'Presentación ante el SII',
    addressedTo: 'Servicio de Impuestos Internos',
    legalBasis: 'Ley 21.713 Cumplimiento Tributario y LIR',
    instructions: `Redacta una presentación formal al SII. Debe incluir: identificación del contribuyente con RUT, materia (rectificatoria, consulta, reclamo), hechos, fundamento legal, petición concreta.`,
  },
  carta_generica: {
    title: 'Carta Formal',
    addressedTo: 'A quien corresponda',
    legalBasis: 'Normativa vigente',
    instructions: 'Redacta una carta formal según la situación descrita.',
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { casoId, documentType, addressedTo: customAddressee } = await req.json();
    if (!casoId || !documentType) {
      return Response.json({ error: 'casoId y documentType requeridos' }, { status: 400 });
    }

    const template = DOC_TEMPLATES[documentType];
    if (!template) {
      return Response.json({ error: `documentType inválido: ${documentType}` }, { status: 400 });
    }

    // Cargar caso (RLS garantiza que solo el dueño accede)
    const caso = await base44.entities.MisCasos.get(casoId);
    if (!caso) {
      return Response.json({ error: 'Caso no encontrado' }, { status: 404 });
    }

    const prompt = `${template.instructions}

DATOS DEL CIUDADANO:
- Nombre: ${user.full_name || '[Nombre del titular]'}
- Email: ${user.email}

CASO:
- Título: ${caso.title}
- Descripción del ciudadano: ${caso.description}
- Organismo destinatario: ${customAddressee || template.addressedTo}
- Normativa aplicable: ${template.legalBasis}
- Monto involucrado (si aplica): ${caso.amountInvolved ? `$${caso.amountInvolved.toLocaleString('es-CL')} CLP` : 'No aplica'}

REGLAS:
- Formato markdown limpio.
- Tono formal pero claro, sin jerga innecesaria.
- Cita artículos legales específicos cuando corresponda.
- Incluye fecha actual (${new Date().toLocaleDateString('es-CL')}), encabezado, cuerpo, petición y firma.
- NO inventes datos. Si falta información, deja un placeholder entre [ ].
- Máximo 600 palabras.`;

    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string', description: 'Documento completo en markdown' },
        },
        required: ['title', 'content'],
      },
      model: 'claude_sonnet_4_6',
    });

    // Persistir documento
    const doc = await base44.entities.GeneratedDocument.create({
      casoRef: casoId,
      documentType,
      title: llmResult.title || template.title,
      content: llmResult.content,
      isPrivate: true,
      normativeModule: caso.normativeModule || 'ley_19496_sernac',
      addressedTo: customAddressee || template.addressedTo,
      version: 1,
    });

    // Actualizar estado del caso
    await base44.entities.MisCasos.update(casoId, {
      status: 'documento_generado',
      generatedDocRef: doc.id,
    });

    return Response.json({
      success: true,
      documentId: doc.id,
      title: doc.title,
      content: doc.content,
      addressedTo: doc.addressedTo,
    });
  } catch (error) {
    console.error('generateLegalDocument error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});