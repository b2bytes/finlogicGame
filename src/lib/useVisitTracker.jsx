import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * useVisitTracker — Hook global que registra el recorrido del visitante
 * en la entidad VisitTrace (privada, solo admin lee).
 *
 * Estrategia "fail-silent":
 *  - Llama a la backend function `recordVisit` cuando cambia la ruta.
 *  - Acumula scroll y duración en la página actual y los envía al salir.
 *  - Se ejecuta UNA sola vez en App.jsx (montado en AuthenticatedApp).
 *  - Si `recordVisit` falla, la app NO se rompe (try/catch sin throw).
 *  - Excluye rutas /Embed (iframe externo) y bots.
 *
 * Privacidad: el sessionId es un nanoid local. Nunca se envía PII por
 * iniciativa propia. El email solo se asocia si el visitante se loguea.
 */

const STORAGE_KEY = 'finlogic_session_id';
const EXCLUDED_PREFIXES = ['/Embed'];

function newSessionId() {
  // sessionId estable y corto, persistido en localStorage
  const rnd = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `s_${ts}_${rnd}`;
}

function getOrCreateSessionId() {
  try {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = newSessionId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    // localStorage bloqueado (modo privado iOS) — usar fallback en memoria
    if (!window.__finlogic_session) window.__finlogic_session = newSessionId();
    return window.__finlogic_session;
  }
}

function readUtm(search) {
  const p = new URLSearchParams(search);
  return {
    source: p.get('utm_source') || undefined,
    medium: p.get('utm_medium') || undefined,
    campaign: p.get('utm_campaign') || undefined,
  };
}

export function useVisitTracker() {
  const location = useLocation();
  const sessionIdRef = useRef(null);
  const arrivedAtRef = useRef(Date.now());
  const maxScrollRef = useRef(0);
  const errorsRef = useRef(0);
  const lyaInteractedRef = useRef(false);
  const isFirstHitRef = useRef(true);
  const utmRef = useRef({});
  const referrerRef = useRef('');

  // Inicializar sessionId + capturar UTMs UNA vez
  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    utmRef.current = readUtm(window.location.search);
    referrerRef.current = document.referrer || '';
  }, []);

  // Escuchar errores JS globales para incrementar contador
  useEffect(() => {
    const onErr = () => { errorsRef.current += 1; };
    const onRej = () => { errorsRef.current += 1; };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);

  // Detectar interacción con Lya (eventos custom)
  useEffect(() => {
    const onLya = () => { lyaInteractedRef.current = true; };
    window.addEventListener('lya:open-chat', onLya);
    window.addEventListener('lya:toast', onLya);
    return () => {
      window.removeEventListener('lya:open-chat', onLya);
      window.removeEventListener('lya:toast', onLya);
    };
  }, []);

  // Tracker de scroll depth máximo en la página actual
  useEffect(() => {
    maxScrollRef.current = 0;
    const onScroll = () => {
      const h = document.documentElement;
      const max = (h.scrollHeight - h.clientHeight) || 1;
      const pct = Math.round((window.scrollY / max) * 100);
      if (pct > maxScrollRef.current) maxScrollRef.current = pct;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [location.pathname]);

  // Ping al cambiar de ruta: cierra el hit anterior + abre el nuevo
  useEffect(() => {
    const path = location.pathname;
    if (EXCLUDED_PREFIXES.some((p) => path.startsWith(p))) return;

    const sessionId = sessionIdRef.current;
    if (!sessionId) return;

    // 1. Cerrar el hit ANTERIOR con duración real (si no era el primero)
    if (!isFirstHitRef.current) {
      const previousPath = window.__finlogic_prev_path || path;
      const durationSec = Math.round((Date.now() - arrivedAtRef.current) / 1000);
      base44.functions
        .invoke('recordVisit', {
          sessionId,
          path: previousPath,
          title: document.title,
          durationSec,
          scrollDepthPct: maxScrollRef.current,
          errors: errorsRef.current,
          interactedWithLya: lyaInteractedRef.current,
        })
        .catch(() => {});
    }

    // 2. Abrir el NUEVO hit con duración=0 (se cerrará al salir)
    base44.functions
      .invoke('recordVisit', {
        sessionId,
        path,
        title: document.title,
        durationSec: 0,
        scrollDepthPct: 0,
        errors: 0,
        referrer: isFirstHitRef.current ? referrerRef.current : '',
        utm: isFirstHitRef.current ? utmRef.current : undefined,
        language: navigator.language || '',
        isFirstHit: isFirstHitRef.current,
      })
      .catch(() => {});

    // Reset contadores para la nueva página
    arrivedAtRef.current = Date.now();
    errorsRef.current = 0;
    isFirstHitRef.current = false;
    window.__finlogic_prev_path = path;
  }, [location.pathname]);

  // Cerrar último hit al salir de la app (visibility change + beforeunload)
  useEffect(() => {
    const flush = () => {
      const sessionId = sessionIdRef.current;
      if (!sessionId) return;
      const path = window.__finlogic_prev_path || location.pathname;
      const durationSec = Math.round((Date.now() - arrivedAtRef.current) / 1000);
      const body = JSON.stringify({
        sessionId,
        path,
        title: document.title,
        durationSec,
        scrollDepthPct: maxScrollRef.current,
        errors: errorsRef.current,
        interactedWithLya: lyaInteractedRef.current,
      });
      try {
        const url = `/functions/recordVisit`;
        // sendBeacon es ideal para unload: no bloquea + sobrevive al cierre
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' });
          navigator.sendBeacon(url, blob);
        } else {
          base44.functions.invoke('recordVisit', JSON.parse(body)).catch(() => {});
        }
      } catch {
        // fail-silent
      }
    };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}