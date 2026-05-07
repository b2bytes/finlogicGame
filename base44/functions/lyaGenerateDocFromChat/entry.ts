// lyaGenerateDocFromChat — Lya genera un documento legal listo para firma
// directamente desde la conversación del chat, sin requerir un MisCasos previo.
// Pipeline:
//   1. Recibe historial del chat + tipo de doc sugerido (o lo detecta).
//   2. Extrae datos clave (hechos, montos, fechas, contraparte) con LLM.
//   3. Aplica el mismo template que generateLegalDocument para mantener calidad.
//   4. Devuelve markdown + título + destinatario para que el frontend genere el PDF.
// NO persiste GeneratedDocument: el ciudadano descarga directo desde el chat
// (uso ligero, sin caso formal). Si quiere caso formal va por /Consulta.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
  cotizacion: {
    title: 'Cotización FinLogic',
    addressedTo: 'Cliente',
    legalBasis: 'Documento comercial — sin valor tributario',
    instructions: `Redacta una cotización profesional FinLogic. Debe incluir EN ESTE ORDEN, en formato markdown limpio:
## Cliente
(nombre, RUT si lo hay, contacto)
## Detalle
Una tabla simple con: Ítem · Descripción · Cantidad · Precio unitario CLP · Subtotal CLP. Mínimo 1 ítem, máximo 8.
## Totales
Subtotal · IVA 19% · **Total CLP**
## Condiciones
Validez de la cotización (30 días por defecto), forma de pago, plazo de entrega.
NO inventes precios si el usuario no los dio: usa [precio a confirmar]. NO inventes RUT.`,
  },
  correo_formal: {
    title: 'Correo formal',
    addressedTo: 'Destinatario',
    legalBasis: 'Comunicación formal',
    instructions: `Redacta un correo formal claro, breve y profesional. Debe incluir:
**Asunto:** una línea, máx 80 chars
**Saludo** cordial
**Cuerpo** en 2-4 párrafos cortos, una idea por párrafo
**Cierre** con CTA específico (qué espera de respuesta)
**Firma** con nombre, cargo si lo hay, email
Tono cálido pero ejecutivo. Cero relleno.`,
  },
  carta_comercial: {
    title: 'Carta comercial',
    addressedTo: 'Empresa destinataria',
    legalBasis: 'Documento comercial',
    instructions: `Redacta una carta comercial profesional (propuesta, agradecimiento, seguimiento, cobro o presentación según el contexto). Estructura: encabezado con destinatario y fecha, asunto en bold, cuerpo en párrafos claros, cierre con CTA y firma del emisor.`,
  },
};

// Heurística para sugerir el tipo si el cliente no lo manda
function detectDocType(text) {
  const t = (text || '').toLowerCase();
  if (/(cotizaci[oó]n|presupuesto|quote|valor.+servicio|cu[aá]nto.+cobra)/.test(t)) return 'cotizacion';
  if (/(correo|email|mail formal|escribir.+correo|env[ií]a.+correo)/.test(t)) return 'correo_formal';
  if (/(arco|borrar.+dato|rectific|acces.+dato|cancelar.+dato|protecci[oó]n.+dato)/.test(t)) return 'carta_arco';
  if (/(cmf|fintech|banco.*reclamo|reclam.+banco|sfa)/.test(t)) return 'reclamo_cmf';
  if (/(phishing|hacke|cyber|ciber|robo.+cuenta|csirt|fraude.+digital)/.test(t)) return 'reporte_csirt';
  if (/(sii|impuesto|f29|f22|iva|renta|tribut)/.test(t)) return 'declaracion_sii';
  if (/(sernac|consumidor|cobro.+indebido|garant[ií]a|retracto|cargo.+no.+reconoc)/.test(t)) return 'denuncia_sernac';
  if (/(carta comercial|propuesta comercial|cotizar|seguimiento.+cliente)/.test(t)) return 'carta_comercial';
  return 'carta_generica';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { history = [], documentType: requestedType, addressedTo: customAddressee } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return Response.json({ error: 'history requerido (array de mensajes)' }, { status: 400 });
    }

    // Concatenar conversación (limitada a últimos 12 turnos para no inflar prompt)
    const convo = history
      .slice(-12)
      .filter((h) => h && h.role && h.content)
      .map((h) => `${h.role === 'assistant' ? 'Lya' : 'Usuario'}: ${String(h.content).substring(0, 800)}`)
      .join('\n');

    if (convo.length < 30) {
      return Response.json({ error: 'Conversación muy corta para generar documento' }, { status: 400 });
    }

    const documentType = requestedType && DOC_TEMPLATES[requestedType]
      ? requestedType
      : detectDocType(convo);
    const template = DOC_TEMPLATES[documentType];

    // Identificación del usuario (si está logueado, usa nombre real; si no, placeholder)
    let userName = '[Nombre del titular]';
    let userEmail = '[email del titular]';
    try {
      const me = await base44.auth.me();
      if (me) {
        userName = me.full_name || userName;
        userEmail = me.email || userEmail;
      }
    } catch (_) {
      // Usuario anónimo — usamos placeholders
    }

    const prompt = `${template.instructions}

CONVERSACIÓN ENTRE LYA (asistente) Y EL USUARIO — extrae los hechos relevantes:
${convo}

DATOS DEL CIUDADANO:
- Nombre: ${userName}
- Email: ${userEmail}
- Organismo destinatario: ${customAddressee || template.addressedTo}
- Normativa aplicable: ${template.legalBasis}
- Fecha: ${new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}

REGLAS:
- Markdown limpio, tono formal pero claro.
- Cita artículos legales específicos solo si están claramente fundados.
- Incluye encabezado, cuerpo, petición concreta y firma.
- Si falta un dato (RUT, fecha exacta, monto, número de cuenta), déjalo como placeholder entre [ ] para que el ciudadano lo complete antes de firmar.
- NO inventes datos personales ni montos.
- Máximo 600 palabras.`;

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string', description: 'Documento completo en markdown, mínimo 200 palabras' },
        },
        required: ['title', 'content'],
      },
    });

    const safeContent = llmResult?.content?.trim();
    const safeTitle = llmResult?.title?.trim() || template.title;
    console.log('[lyaGenerateDoc] type=', documentType, 'len=', safeContent?.length, 'preview=', safeContent?.substring(0, 100));
    if (!safeContent || safeContent.length < 80) {
      return Response.json(
        { error: 'No pudimos redactar el documento. Cuéntale a Lya un poco más de detalle e intenta de nuevo.' },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      documentType,
      title: safeTitle,
      content: safeContent,
      addressedTo: customAddressee || template.addressedTo,
      legalBasis: template.legalBasis,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('lyaGenerateDocFromChat error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});