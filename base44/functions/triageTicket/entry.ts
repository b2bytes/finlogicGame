import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// triageTicket — SupportAgent (Carolina Muñoz Pérez) · Framework SACE
// Clasifica ticket entrante, detecta urgencia (deadline <72h → crítico)
// y genera respuesta automática adaptada al perfil.

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: [
        'latencia',
        'documento',
        'plazo_legal',
        'compliance_api',
        'credibilidad',
        'accesibilidad',
        'fraude_urgente',
        'billing',
        'otro',
      ],
    },
    detectedProfile: {
      type: 'string',
      enum: ['camila', 'don_luis', 'maria_jose', 'roberto', 'b2b_fintech', 'general'],
    },
    priority: { type: 'string', enum: ['critico', 'alto', 'medio', 'bajo'] },
    subject: { type: 'string', description: 'Asunto en 1 línea' },
    aiResponse: {
      type: 'string',
      description: 'Respuesta empática + 3 pasos accionables, adaptada al perfil',
    },
    escalationLevel: { type: 'number', minimum: 1, maximum: 3 },
    autoResolvable: {
      type: 'boolean',
      description: 'True si el ticket puede cerrarse con la respuesta sin intervención humana',
    },
  },
  required: ['category', 'priority', 'subject', 'aiResponse', 'escalationLevel'],
};

const SYSTEM_PROMPT = `Eres Carolina Muñoz Pérez, SupportAgent de FinLogic. Framework SACE: Segmentación → Accesibilidad → Contexto Legal → Escalamiento.

PERFILES y tono:
- Camila (22 universitaria): directo, digital, self-service primero
- Don Luis (68 jubilado): simple, sin jerga, pasos numerados, ofrece llamada/WhatsApp
- María José (34 emprendedora): práctico, orientado a impacto en su pyme
- Roberto (45 víctima fraude): empático, urgente, prioriza acción
- B2B fintech: técnico, breve, links a docs API

REGLAS:
- Si detectas plazo legal <72h → priority "critico", escalationLevel 3
- Si detectas fraude activo → priority "critico", deriva a CSIRT/banco
- Si es duda sobre Pro/precios → autoResolvable true
- NUNCA inventes normativa
- SIEMPRE termina con UNA acción concreta`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, channel = 'web', subject = '', linkedCaseId = null } = await req.json();
    if (!message || message.trim().length < 5) {
      return Response.json({ error: 'Mensaje demasiado corto' }, { status: 400 });
    }

    // Contexto: caso vinculado y plazo legal
    let caseContext = '';
    let deadlineDaysRemaining = null;
    let linkedLegalDeadlineId = null;

    if (linkedCaseId) {
      try {
        const caso = await base44.entities.MisCasos.get(linkedCaseId);
        if (caso) {
          caseContext = `\nCASO VINCULADO: ${caso.title} | Organismo: ${caso.regulatoryBody} | Estado: ${caso.status}`;
          if (typeof caso.daysRemaining === 'number') {
            deadlineDaysRemaining = caso.daysRemaining;
            caseContext += ` | Plazo: ${caso.daysRemaining}d`;
          }
          if (caso.legalDeadlineRef) {
            linkedLegalDeadlineId = caso.legalDeadlineRef;
          }
        }
      } catch (_) {
        // caso no accesible, continuar
      }
    }

    const triage = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}${caseContext}\n\nMENSAJE DEL USUARIO (canal: ${channel}):\n"${message}"\n\nClasifica y responde en JSON estricto.`,
      response_json_schema: TRIAGE_SCHEMA,
    });

    // Override: deadline crítico siempre eleva a crítico
    let priority = triage.priority;
    let escalationLevel = triage.escalationLevel || 1;
    if (typeof deadlineDaysRemaining === 'number' && deadlineDaysRemaining <= 3) {
      priority = 'critico';
      escalationLevel = Math.max(escalationLevel, 3);
    }

    const ticket = await base44.entities.SupportTicket.create({
      userProfile: triage.detectedProfile || 'general',
      channel,
      category: triage.category,
      subject: subject || triage.subject,
      message,
      priority,
      status: triage.autoResolvable ? 'resuelto' : 'abierto',
      linkedCaseId,
      linkedLegalDeadlineId,
      deadlineDaysRemaining,
      escalationLevel,
      autoResolved: !!triage.autoResolvable,
      aiResponse: triage.aiResponse,
      resolvedAt: triage.autoResolvable ? new Date().toISOString() : undefined,
    });

    return Response.json({
      success: true,
      ticketId: ticket.id,
      category: triage.category,
      priority,
      escalationLevel,
      autoResolved: !!triage.autoResolvable,
      response: triage.aiResponse,
      detectedProfile: triage.detectedProfile,
    });
  } catch (error) {
    console.error('triageTicket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});