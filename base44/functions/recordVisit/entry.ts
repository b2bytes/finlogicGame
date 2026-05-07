// recordVisit — endpoint público que registra hits de página y los acumula
// en una entidad VisitTrace por sessionId. NUNCA falla la página: si hay
// problema persistiendo, devuelve 200 con success:false silenciosamente.
//
// Estrategia:
//   - Una sola fila por sessionId. Hits se concatenan en el array `hits`.
//   - Throttle implícito: el frontend solo llama 1 vez por cambio de ruta
//     más 1 vez al unload con duración. Si hay más de 100 hits, se trunca.
//   - Detección de bot por userAgent básico para no inflar datos.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_HITS_PER_SESSION = 200;
const BOT_REGEX = /bot|crawler|spider|crawling|preview|prerender|lighthouse|headless/i;

function detectDevice(ua = '') {
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile';
  if (/ipad|tablet/i.test(ua)) return 'tablet';
  if (ua) return 'desktop';
  return 'unknown';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST required' }, { status: 405 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ success: false, error: 'invalid_json' }, { status: 200 });
  }

  const {
    sessionId,
    path,
    title,
    durationSec = 0,
    scrollDepthPct = 0,
    errors = 0,
    referrer = '',
    utm = {},
    language = '',
    interactedWithLya = false,
    isFirstHit = false,
  } = payload || {};

  if (!sessionId || !path) {
    return Response.json({ success: false, error: 'missing_fields' }, { status: 200 });
  }

  const userAgent = req.headers.get('user-agent') || '';
  if (BOT_REGEX.test(userAgent)) {
    return Response.json({ success: true, skipped: 'bot' }, { status: 200 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Capturamos info del user si está logueado (no requerido)
    let userEmail = null;
    let userRole = 'anonymous';
    try {
      const me = await base44.auth.me();
      if (me?.email) {
        userEmail = me.email;
        userRole = me.role || 'user';
      }
    } catch (_) {
      // anónimo, OK
    }

    const country =
      req.headers.get('cf-ipcountry') ||
      req.headers.get('x-vercel-ip-country') ||
      req.headers.get('x-country') ||
      '';

    // Buscamos sesión existente
    const existing = await base44.asServiceRole.entities.VisitTrace.filter({ sessionId });
    const now = new Date().toISOString();

    const newHit = {
      path: String(path).slice(0, 200),
      title: String(title || '').slice(0, 200),
      ts: now,
      durationSec: Math.max(0, Math.min(3600, Number(durationSec) || 0)),
      scrollDepthPct: Math.max(0, Math.min(100, Number(scrollDepthPct) || 0)),
      errors: Math.max(0, Number(errors) || 0),
    };

    if (existing && existing.length > 0) {
      const trace = existing[0];
      const hits = Array.isArray(trace.hits) ? trace.hits : [];

      // Si el último hit es la misma ruta y vino con duración, ACTUALIZA en vez de duplicar
      const lastHit = hits[hits.length - 1];
      let updatedHits;
      if (lastHit && lastHit.path === newHit.path && newHit.durationSec > 0 && !isFirstHit) {
        updatedHits = [
          ...hits.slice(0, -1),
          {
            ...lastHit,
            durationSec: Math.max(lastHit.durationSec || 0, newHit.durationSec),
            scrollDepthPct: Math.max(lastHit.scrollDepthPct || 0, newHit.scrollDepthPct),
            errors: (lastHit.errors || 0) + newHit.errors,
          },
        ];
      } else {
        updatedHits = [...hits, newHit].slice(-MAX_HITS_PER_SESSION);
      }

      const uniquePaths = new Set(updatedHits.map((h) => h.path)).size;
      const totalDuration = updatedHits.reduce((s, h) => s + (h.durationSec || 0), 0);
      const errorsTotal = updatedHits.reduce((s, h) => s + (h.errors || 0), 0);

      await base44.asServiceRole.entities.VisitTrace.update(trace.id, {
        lastSeenAt: now,
        totalPageviews: updatedHits.length,
        totalDurationSec: Math.round(totalDuration),
        uniquePaths,
        exitPath: newHit.path,
        hits: updatedHits,
        errorsTotal,
        ...(interactedWithLya ? { interactedWithLya: true } : {}),
        ...(userEmail && !trace.userEmail ? { userEmail, userRole } : {}),
      });
      return Response.json({ success: true, action: 'updated', sessionId });
    }

    // Crear nueva sesión
    await base44.asServiceRole.entities.VisitTrace.create({
      sessionId,
      userEmail,
      userRole,
      firstSeenAt: now,
      lastSeenAt: now,
      totalPageviews: 1,
      totalDurationSec: newHit.durationSec,
      uniquePaths: 1,
      entryPath: newHit.path,
      exitPath: newHit.path,
      referrer: String(referrer).slice(0, 300),
      utmSource: utm.source ? String(utm.source).slice(0, 80) : undefined,
      utmMedium: utm.medium ? String(utm.medium).slice(0, 80) : undefined,
      utmCampaign: utm.campaign ? String(utm.campaign).slice(0, 80) : undefined,
      userAgent: userAgent.slice(0, 300),
      deviceType: detectDevice(userAgent),
      language: String(language).slice(0, 20),
      country: String(country).slice(0, 10),
      hits: [newHit],
      errorsTotal: newHit.errors,
      interactedWithLya: !!interactedWithLya,
    });

    return Response.json({ success: true, action: 'created', sessionId });
  } catch (err) {
    console.error('recordVisit error:', err.message);
    return Response.json({ success: false, error: err.message }, { status: 200 });
  }
});