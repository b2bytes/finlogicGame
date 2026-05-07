import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * crmRegisterLead — Pipeline de recepción inteligente CRM FinLogic.
 *
 * Triggered por lyaKnowledgeQuery (y otros endpoints conversacionales) para
 * registrar/actualizar de manera idempotente al lead/persona en el CRM
 * unificado. Implementa el principio §GrowthMarketing "Zero-Login First":
 * cualquier visitante que escriba a Lya queda registrado AUTOMÁTICAMENTE
 * (anónimo si no tiene email) y se enriquece a medida que avanza.
 *
 * Estrategia de identidad (orden de precedencia):
 *   1. email (si existe → match por email)
 *   2. phone (si existe → match por phone)
 *   3. sessionId (anónimo: match por sessionId)
 *
 * Lifecycle:
 *   visitor → primer mensaje
 *   activated → respondido por Lya con éxito (1ra victoria)
 *   engaged → 3+ mensajes
 *   retained → vuelve >24h después
 *   converted → Pro/B2B (lo setea otro flow)
 *
 * Body POST esperado:
 *   {
 *     sessionId: string (obligatorio),
 *     query: string,
 *     email?: string,
 *     phone?: string,
 *     fullName?: string,
 *     accountType?: 'b2c'|'b2b_fintech'|'b2g_institucional'|'pyme'|'prensa'|'otro',
 *     archetype?: 'camila'|'don_luis'|'maria_jose'|'roberto'|'general',
 *     source?: string,
 *     regulatoryBody?: string,
 *     utm?: { campaign, medium, source },
 *     event?: 'message' | 'case_created' | 'doc_generated' | 'pro_trigger',
 *   }
 */

function calcLifecycle(prev, currentMessages, hadFirstVictory) {
  const stages = ['visitor', 'lead', 'activated', 'engaged', 'retained', 'converted', 'churned'];
  const prevIdx = stages.indexOf(prev?.lifecycleStage || 'visitor');
  let next = 'lead';
  if (hadFirstVictory) next = 'activated';
  if (currentMessages >= 3) next = 'engaged';
  // Retained: si vuelve después de 24h
  if (prev?.lastContactAt) {
    const last = new Date(prev.lastContactAt).getTime();
    if (Date.now() - last > 24 * 60 * 60 * 1000 && currentMessages >= 2) {
      next = 'retained';
    }
  }
  // Converted no se downgradea
  if (prev?.convertedToPro) next = 'converted';

  const nextIdx = stages.indexOf(next);
  return nextIdx > prevIdx ? next : prev?.lifecycleStage || next;
}

function calcPriority(payload, prevScore = 0) {
  let score = prevScore;
  const q = (payload.query || '').toLowerCase();
  // Urgencias
  if (/fraude|robaron|me clonaron|phishing|estafa/.test(q)) score = Math.max(score, 85);
  if (/plazo|vence|urgente|hoy|mañana/.test(q)) score = Math.max(score, 70);
  if (/cobro indebido|cobr[oó].*no reconoz/.test(q)) score = Math.max(score, 60);
  // Eventos
  if (payload.event === 'case_created') score = Math.min(100, score + 15);
  if (payload.event === 'doc_generated') score = Math.min(100, score + 20);
  // B2B siempre alto
  if (payload.accountType === 'b2b_fintech') score = Math.max(score, 75);
  return score;
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const {
      sessionId,
      query = '',
      email,
      phone,
      fullName,
      accountType,
      archetype,
      source = 'lya_widget',
      regulatoryBody,
      utm = {},
      event = 'message',
    } = payload;

    if (!sessionId && !email && !phone) {
      return Response.json({ error: 'sessionId, email o phone requerido' }, { status: 400 });
    }

    // ─── 1. Buscar lead existente con precedencia email > phone > sessionId ─
    // Email y phone son campos de identidad fuerte: usamos filter() directo.
    // sessionId puede no estar indexado tras schema-update reciente: hacemos
    // list() reciente y match en memoria (el volumen de leads activos en una
    // ventana corta es bajo).
    let existing = null;
    const tryFind = async (q, label) => {
      try {
        const arr = await base44.asServiceRole.entities.Lead.filter(q, '-updated_date', 1);
        return Array.isArray(arr) && arr.length ? arr[0] : null;
      } catch (e) {
        console.warn(`[crmRegisterLead] filter ${label} error:`, e.message);
        return null;
      }
    };

    if (email) existing = await tryFind({ email }, 'email');
    if (!existing && phone) existing = await tryFind({ phone }, 'phone');

    if (!existing && sessionId) {
      // Match por sessionId en memoria (resiliente a indexación)
      try {
        const recent = await base44.asServiceRole.entities.Lead.list('-updated_date', 200);
        existing = (Array.isArray(recent) ? recent : []).find((l) => l.sessionId === sessionId) || null;
      } catch (e) {
        console.warn('[crmRegisterLead] list for sessionId match error:', e.message);
      }
    }

    const now = new Date().toISOString();
    const isFirstVictory = event === 'case_created' || event === 'doc_generated';

    // ─── 2. Construir update ──────────────────────────────────────────────
    const messagesCount = (existing?.messagesCount || 0) + (event === 'message' ? 1 : 0);
    const casesCount = (existing?.casesCount || 0) + (event === 'case_created' ? 1 : 0);
    const documentsCount = (existing?.documentsCount || 0) + (event === 'doc_generated' ? 1 : 0);

    const lifecycleStage = calcLifecycle(existing, messagesCount, !!existing?.firstVictoryAt || isFirstVictory);
    const priorityScore = calcPriority(payload, existing?.priorityScore || 0);

    const data = {
      // Identidad
      ...(fullName && { fullName }),
      ...(email && { email }),
      ...(phone && { phone }),
      sessionId: sessionId || existing?.sessionId,
      // Clasificación
      accountType: accountType || existing?.accountType || 'b2c',
      archetype: archetype || existing?.archetype || 'general',
      source: existing?.source || source,
      ...(utm.campaign && { utmCampaign: utm.campaign }),
      ...(utm.medium && { utmMedium: utm.medium }),
      ...(utm.source && { utmSource: utm.source }),
      // Conversación
      firstQuery: existing?.firstQuery || (query ? query.substring(0, 500) : undefined),
      lastQuery: query ? query.substring(0, 500) : existing?.lastQuery,
      lastContactAt: now,
      messagesCount,
      casesCount,
      documentsCount,
      // Pipeline
      lifecycleStage,
      priorityScore,
      ...(regulatoryBody && regulatoryBody !== 'ninguno' && { regulatoryBodyMostUsed: regulatoryBody }),
      ...(isFirstVictory && !existing?.firstVictoryAt && { firstVictoryAt: now }),
    };

    // ─── 3. Upsert ────────────────────────────────────────────────────────
    let lead;
    if (existing) {
      lead = await base44.asServiceRole.entities.Lead.update(existing.id, data);
    } else {
      lead = await base44.asServiceRole.entities.Lead.create(data);
    }

    return Response.json({
      ok: true,
      leadId: lead.id,
      created: !existing,
      lifecycleStage: data.lifecycleStage,
      priorityScore: data.priorityScore,
      messagesCount: data.messagesCount,
    });
  } catch (error) {
    console.error('crmRegisterLead error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});