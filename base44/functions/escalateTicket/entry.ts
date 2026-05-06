// escalateTicket — Mandato §SupportAgent
// Eleva nivel de escalamiento de un ticket: N1 → N2 (SupportAgent) → N3 (Especialista).
// Crea OperationalAlert si severidad alta. Notifica al equipo.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    const base44 = createClientFromRequest(req);

    const { ticketId, reason = 'Usuario solicita escalamiento' } = await req.json();
    if (!ticketId) return Response.json({ error: 'ticketId requerido' }, { status: 400 });

    const ticket = await base44.entities.SupportTicket.get(ticketId);
    if (!ticket) return Response.json({ error: 'Ticket no encontrado' }, { status: 404 });

    const newLevel = Math.min((ticket.escalationLevel || 1) + 1, 3);
    const newPriority =
      ticket.category === 'fraude_urgente' || ticket.deadlineDaysRemaining < 2
        ? 'critico'
        : newLevel === 3
        ? 'alto'
        : ticket.priority || 'medio';

    await base44.entities.SupportTicket.update(ticketId, {
      escalationLevel: newLevel,
      priority: newPriority,
      status: 'en_proceso',
    });

    // Si nivel 3 o crítico → OperationalAlert
    if (newLevel === 3 || newPriority === 'critico') {
      try {
        await base44.asServiceRole.entities.OperationalAlert.create({
          alertType: ticket.category === 'fraude_urgente' ? 'deadline_approaching' : 'sla_breach',
          severity: newPriority === 'critico' ? 'critical' : 'high',
          title: `Ticket escalado N${newLevel}: ${ticket.subject || ticket.category}`,
          description: `${reason}. Categoría: ${ticket.category}. Días plazo: ${ticket.deadlineDaysRemaining ?? '—'}.`,
          affectedEntity: 'SupportTicket',
          affectedId: ticketId,
        });
      } catch (e) {
        console.warn('OperationalAlert create error:', e?.message);
      }
    }

    return Response.json({
      success: true,
      ticketId,
      escalationLevel: newLevel,
      priority: newPriority,
      operationalAlertCreated: newLevel === 3 || newPriority === 'critico',
    });
  } catch (error) {
    console.error('escalateTicket error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});