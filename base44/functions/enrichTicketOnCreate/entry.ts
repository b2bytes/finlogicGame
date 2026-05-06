import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// enrichTicketOnCreate — Entity Automation handler
// Trigger: SupportTicket.create
// Mandato §SupportAgent (Carolina Muñoz · Framework SACE):
//   - Clasifica ticket nuevo (categoría, prioridad, perfil)
//   - Genera respuesta automática empática + accionable
//   - Si autoResolvable → marca como resuelto (deflection D+90 = 65%)
//   - Override: deadline <72h siempre eleva a crítico/N3

const TRIAGE_SCHEMA = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['latencia', 'documento', 'plazo_legal', 'compliance_api', 'credibilidad', 'accesibilidad', 'fraude_urgente', 'billing', 'otro'],
    },
    detectedProfile: {
      type: 'string',
      enum: ['camila', 'don_luis', 'maria_jose', 'roberto', 'b2b_fintech', 'general'],
    },
    priority: { type: 'string', enum: ['critico', 'alto', 'medio', 'bajo'] },
    subject: { type: 'string' },
    aiResponse: { type: 'string' },
    escalationLevel: { type: 'number', minimum: 1, maximum: 3 },
    autoResolvable: { type: 'boolean' },
  },
  required: ['category', 'priority', 'subject', 'aiResponse', 'escalationLevel'],
};

const SYSTEM_PROMPT = `Eres Carolina Muñoz Pérez, SupportAgent de FinLogic. Framework SACE.
PERFILES:
- camila (universitaria): directo, digital, self-service
- don_luis (jubilado): simple, sin jerga, pasos numerados, ofrece WhatsApp
- maria_jose (emprendedora): práctico, impacto en pyme
- roberto (víctima fraude): empático, urgente, acción inmediata
- b2b_fintech: técnico, breve, links docs
REGLAS:
- Plazo <72h → priority crítico, escalationLevel 3
- Fraude activo → crítico, deriva CSIRT/banco
- Duda Pro/precios → autoResolvable true
- NUNCA inventes normativa
- Termina con UNA acción concreta`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    if (!data || !data.id) {
      return Response.json({ skipped: true, reason: 'no_data' });
    }

    // Skip si ya fue triajeado (evita loops cuando este mismo handler haga update)
    if (data.aiResponse) {
      return Response.json({ skipped: true, reason: 'already_triaged' });
    }

    const message = data.message;
    if (!message || message.trim().length < 5) {
      return Response.json({ skipped: true, reason: 'message_too_short' });
    }

    // Contexto opcional del caso vinculado
    let caseContext = '';
    let deadlineDaysRemaining = null;
    let linkedLegalDeadlineId = null;

    if (data.linkedCaseId) {
      try {
        const caso = await base44.asServiceRole.entities.MisCasos.get(data.linkedCaseId);
        if (caso) {
          caseContext = `\nCASO: ${caso.title} | ${caso.regulatoryBody} | ${caso.status}`;
          if (typeof caso.daysRemaining === 'number') {
            deadlineDaysRemaining = caso.daysRemaining;
            caseContext += ` | Plazo: ${caso.daysRemaining}d`;
          }
          if (caso.legalDeadlineRef) linkedLegalDeadlineId = caso.legalDeadlineRef;
        }
      } catch (_) {
        // caso inaccesible, continuar
      }
    }

    const channel = data.channel || 'web';
    const triage = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}${caseContext}\n\nMENSAJE (${channel}):\n"${message}"\n\nResponde JSON estricto.`,
      response_json_schema: TRIAGE_SCHEMA,
    });

    // Override de deadline
    let priority = triage.priority;
    let escalationLevel = triage.escalationLevel || 1;
    if (typeof deadlineDaysRemaining === 'number' && deadlineDaysRemaining <= 3) {
      priority = 'critico';
      escalationLevel = Math.max(escalationLevel, 3);
    }

    const updates = {
      userProfile: data.userProfile && data.userProfile !== 'general' ? data.userProfile : (triage.detectedProfile || 'general'),
      category: data.category && data.category !== 'otro' ? data.category : triage.category,
      subject: data.subject || triage.subject,
      priority,
      escalationLevel,
      aiResponse: triage.aiResponse,
      autoResolved: !!triage.autoResolvable,
      status: triage.autoResolvable ? 'resuelto' : (data.status || 'abierto'),
      ...(linkedLegalDeadlineId ? { linkedLegalDeadlineId } : {}),
      ...(deadlineDaysRemaining !== null ? { deadlineDaysRemaining } : {}),
      ...(triage.autoResolvable ? { resolvedAt: new Date().toISOString() } : {}),
    };

    await base44.asServiceRole.entities.SupportTicket.update(data.id, updates);

    return Response.json({
      success: true,
      ticketId: data.id,
      autoResolved: !!triage.autoResolvable,
      priority,
      escalationLevel,
    });
  } catch (error) {
    console.error('enrichTicketOnCreate error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});