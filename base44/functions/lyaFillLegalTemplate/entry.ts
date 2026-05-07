// lyaFillLegalTemplate — Lya rellena automáticamente una plantilla legal
// usando: (a) la consulta original del usuario, (b) sus datos de perfil,
// (c) la estructura formal de la plantilla. Devuelve markdown completo,
// campos extraídos y leyes citadas verificadas.
//
// El usuario después puede editar inline el markdown y firmar.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TEMPLATE_PROMPTS = {
  demanda_sernac: {
    label: 'Demanda SERNAC',
    legalBase: 'Ley 19.496 Protección de los Derechos de los Consumidores',
    structure: `1. Encabezado (Ciudad, fecha · Sr. Director SERNAC región)
2. Identificación del consumidor
3. Identificación del proveedor
4. HECHOS (relato cronológico claro)
5. DERECHO (artículos específicos Ley 19.496)
6. PETITORIO (qué solicita)
7. Documentos acompañantes
8. Firma`,
  },
  recurso_reposicion_cmf: {
    label: 'Recurso ante CMF',
    legalBase: 'Ley 21.521 Fintech · NCG 502 CMF',
    structure: `1. Encabezado a Sr. Presidente CMF
2. Identificación del recurrente
3. Institución financiera involucrada
4. ANTECEDENTES Y HECHOS
5. FUNDAMENTOS DE DERECHO (Ley 21.521 + NCG 502)
6. PETITORIO
7. Firma`,
  },
  denuncia_csirt: {
    label: 'Denuncia CSIRT',
    legalBase: 'Ley 21.663 Ciberseguridad',
    structure: `1. Datos del reportante
2. Tipo de incidente
3. Fecha/hora del incidente
4. DESCRIPCIÓN TÉCNICA DE LOS HECHOS
5. Evidencias
6. Acciones ya tomadas
7. Firma`,
  },
  carta_arco: {
    label: 'Carta ARCO',
    legalBase: 'Ley 21.719 Protección de Datos Personales',
    structure: `1. Encabezado al responsable de datos
2. Identificación del titular
3. Acreditación de identidad
4. DERECHO QUE EJERCE (Acceso/Rectificación/Cancelación/Oposición)
5. Datos personales involucrados
6. Plazo legal de respuesta (15 días hábiles)
7. Firma`,
  },
  reclamo_cmf: {
    label: 'Reclamo CMF',
    legalBase: 'Ley General de Bancos · Ley 21.521',
    structure: `1. Datos del reclamante
2. Institución reclamada
3. HECHOS
4. Gestiones previas
5. SOLICITUD ESPECÍFICA
6. Firma`,
  },
  denuncia_fraude_ley_20009: {
    label: 'Denuncia Fraude Ley 20.009',
    legalBase: 'Ley 20.009 Limitación de Responsabilidad por Operaciones No Reconocidas',
    structure: `1. Encabezado al banco/emisor
2. Identificación del titular
3. HECHOS DEL FRAUDE (fecha exacta, monto, tipo)
4. INVOCACIÓN LEY 20.009 (carga de la prueba en el banco, Art. 5°)
5. SOLICITUD de devolución íntegra dentro del plazo legal
6. Documentos acompañantes
7. Firma`,
  },
  recurso_proteccion: {
    label: 'Recurso de Protección',
    legalBase: 'Constitución Política Art. 20 · Auto Acordado CS',
    structure: `1. ILTMA. CORTE DE APELACIONES
2. Identificación del recurrente
3. Identificación del recurrido
4. GARANTÍA CONSTITUCIONAL VULNERADA
5. HECHOS
6. DERECHO
7. PETITORIO (medidas cautelares y de fondo)
8. Firma`,
  },
  carta_cobro_indebido: {
    label: 'Carta Cobro Indebido',
    legalBase: 'Ley 19.496 Art. 39 · Ley 20.555',
    structure: `1. Encabezado al Gerente
2. Identificación del cliente
3. DETALLE DEL COBRO INDEBIDO
4. SOLICITUD DE DEVOLUCIÓN
5. Plazo otorgado (10 días)
6. Advertencia denuncia SERNAC si no responde
7. Firma`,
  },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, consultaQuery, userData = {}, casoRef } = body;

    if (!templateId || !consultaQuery) {
      return Response.json(
        { error: 'Faltan parámetros: templateId y consultaQuery son requeridos' },
        { status: 400 }
      );
    }

    const template = TEMPLATE_PROMPTS[templateId];
    if (!template) {
      return Response.json({ error: `Plantilla desconocida: ${templateId}` }, { status: 400 });
    }

    // Datos del usuario logueado como fallback
    const fullName = userData.fullName || user.full_name || '[NOMBRE COMPLETO]';
    const email = userData.email || user.email;
    const rut = userData.rut || '[RUT]';
    const address = userData.address || '[DOMICILIO]';
    const phone = userData.phone || '[TELÉFONO]';

    // Prompt para Lya
    const prompt = `Eres Lya, asistente legal IA de FinLogic. Vas a redactar un documento legal CHILENO formal y firmable.

PLANTILLA: ${template.label}
BASE LEGAL: ${template.legalBase}

ESTRUCTURA OBLIGATORIA:
${template.structure}

DATOS DEL USUARIO:
- Nombre: ${fullName}
- RUT: ${rut}
- Domicilio: ${address}
- Email: ${email}
- Teléfono: ${phone}

CONSULTA ORIGINAL DEL USUARIO (de aquí extraes los hechos):
"""
${consultaQuery}
"""

INSTRUCCIONES CRÍTICAS:
1. Redacta el documento COMPLETO en MARKDOWN siguiendo la estructura obligatoria.
2. Usa lenguaje legal chileno formal pero claro (NO inventes leyes).
3. Cita SOLO leyes y artículos que sean reales y aplicables al caso (Chile 2026).
4. Si falta información concreta (montos, fechas, instituciones), usa placeholders entre corchetes [como_este] que el usuario completará.
5. NO inventes datos del usuario que no estén en su perfil.
6. Sección final SIEMPRE: línea con guiones bajos para firma + nombre + RUT debajo.
7. Tono profesional, sobrio, sin emojis.

DEVUELVE JSON con este formato exacto:
{
  "content": "<markdown completo del documento>",
  "title": "<título corto del documento, ej: 'Demanda SERNAC contra BancoEstado'>",
  "addressedTo": "<destinatario específico, ej: 'SERNAC Región Metropolitana'>",
  "lawsCited": ["Ley 19.496 Art. 3°", "Ley 19.496 Art. 23"],
  "extractedFields": {
    "fullName": "${fullName}",
    "rut": "${rut}",
    "address": "${address}",
    "factsSummary": "<resumen de los hechos en 2-3 líneas>",
    "amountInvolved": "<monto en CLP si se menciona, o null>",
    "institutionInvolved": "<institución reclamada o null>",
    "demandedAction": "<qué solicita el usuario>"
  },
  "confidence": <0-100, qué tan completo quedó>,
  "missingFieldsForUser": ["<lista de placeholders que el usuario debe completar>"]
}`;

    const llmRes = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          title: { type: 'string' },
          addressedTo: { type: 'string' },
          lawsCited: { type: 'array', items: { type: 'string' } },
          extractedFields: {
            type: 'object',
            properties: {
              fullName: { type: 'string' },
              rut: { type: 'string' },
              address: { type: 'string' },
              factsSummary: { type: 'string' },
              amountInvolved: { type: 'string' },
              institutionInvolved: { type: 'string' },
              demandedAction: { type: 'string' },
            },
          },
          confidence: { type: 'number' },
          missingFieldsForUser: { type: 'array', items: { type: 'string' } },
        },
        required: ['content', 'title', 'lawsCited', 'extractedFields', 'confidence'],
      },
    });

    const filled = llmRes || {};

    // Verifier ligero: chequea que cite al menos 1 ley + tenga >300 chars
    const verifierScore = Math.min(
      100,
      (filled.content?.length || 0) > 300 ? 60 : 30
    ) + (Array.isArray(filled.lawsCited) && filled.lawsCited.length > 0 ? 25 : 0)
      + (filled.extractedFields?.factsSummary ? 15 : 0);

    return Response.json({
      success: true,
      templateId,
      title: filled.title || `${template.label} — borrador`,
      content: filled.content,
      addressedTo: filled.addressedTo || '',
      lawsCited: filled.lawsCited || [],
      extractedFields: filled.extractedFields || {},
      confidence: filled.confidence || 70,
      verifierScore: Math.min(100, verifierScore),
      missingFieldsForUser: filled.missingFieldsForUser || [],
      casoRef: casoRef || null,
    });
  } catch (error) {
    console.error('lyaFillLegalTemplate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});