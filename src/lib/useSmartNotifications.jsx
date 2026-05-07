import { useEffect, useRef, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useSmartNotifications — Hook de notificaciones inteligentes en tiempo real.
 *
 * Usa la suscripción nativa de Base44 (base44.entities.LiveAlert.subscribe)
 * — internamente WebSocket-style, sin Firebase ni infra extra.
 *
 * Funciones:
 *  1. Escucha eventos `create` sobre LiveAlert.
 *  2. Filtra por usuario actual (o broadcast si userEmail vacío).
 *  3. Dispara toast vía evento global `lya:toast`.
 *  4. Si `lyaShouldSpeak` y la voz está activa, encola para que Lya lo lea.
 *  5. Marca la alerta como `delivered`.
 *
 * Args:
 *  - userEmail (opcional): email del usuario logueado para filtrar.
 *  - onAlert(alert): callback opcional para que el consumidor reaccione (e.g. abrir card).
 *  - speakViaLya(text): callback que escribe al script de voz si Lya está conectada.
 */

const SEVERITY_TO_TOAST_VARIANT = {
  critical: 'error',
  high: 'error',
  medium: 'lya',
  low: 'info',
  info: 'info',
};

export function useSmartNotifications({ userEmail, onAlert, speakViaLya } = {}) {
  const seenIdsRef = useRef(new Set());

  const handleEvent = useCallback(async (event) => {
    if (event.type !== 'create') return;
    const alert = event.data;
    if (!alert?.id || seenIdsRef.current.has(alert.id)) return;
    seenIdsRef.current.add(alert.id);

    // Filtro por usuario / broadcast
    const isBroadcast = !alert.userEmail || alert.userEmail === '';
    const isMine = userEmail && alert.userEmail === userEmail;
    if (!isBroadcast && !isMine) return;

    // 1. Toast visual
    window.dispatchEvent(new CustomEvent('lya:toast', {
      detail: {
        message: alert.title,
        variant: SEVERITY_TO_TOAST_VARIANT[alert.severity] || 'lya',
      },
    }));

    // 2. Voz vía Lya (si aplica)
    if (alert.lyaShouldSpeak && alert.lyaScript && typeof speakViaLya === 'function') {
      try { speakViaLya(alert.lyaScript); } catch (_) {}
    }

    // 3. Callback al consumidor
    if (typeof onAlert === 'function') {
      try { onAlert(alert); } catch (_) {}
    }

    // 4. Marcar como delivered (best-effort)
    try {
      await base44.entities.LiveAlert.update(alert.id, {
        status: 'delivered',
        deliveredAt: new Date().toISOString(),
      });
    } catch (_) { /* RLS o ya actualizado */ }
  }, [userEmail, onAlert, speakViaLya]);

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = base44.entities.LiveAlert.subscribe(handleEvent);
    } catch (e) {
      // Si el SDK no soporta subscribe en este ambiente, no rompemos la app.
      console.warn('[useSmartNotifications] subscribe no disponible:', e?.message);
    }
    return () => { try { unsubscribe?.(); } catch (_) {} };
  }, [handleEvent]);

  // Carga inicial: alertas pendientes de los últimos 60 minutos para este user
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const recent = await base44.entities.LiveAlert.filter(
          { status: 'pending' },
          '-created_date',
          5
        );
        if (cancelled) return;
        recent.forEach((a) => handleEvent({ type: 'create', data: a, id: a.id }));
      } catch (_) { /* sin permisos o vacío */ }
    })();
    return () => { cancelled = true; };
  }, [handleEvent]);
}