import React, { useEffect, useState } from 'react';
import { useSmartNotifications } from '@/lib/useSmartNotifications.jsx';
import { useLyaPersistent } from '@/lib/LyaPersistentContext.jsx';
import { base44 } from '@/api/base44Client';

/**
 * SmartAlertsBridge — Puente entre las notificaciones inteligentes y Lya.
 * Montar UNA sola vez en App.jsx (junto a LyaActionBus). Sin UI propia.
 *
 *  - Suscribe al stream realtime de LiveAlert.
 *  - Si Lya está conectada por voz y la alerta lo pide, le inyecta el script
 *    como contextual update vía registerTools (queue de mensajes pendientes).
 */
export default function SmartAlertsBridge() {
  const [userEmail, setUserEmail] = useState(null);
  const lya = useLyaPersistent();

  useEffect(() => {
    base44.auth.me().then((u) => setUserEmail(u?.email || null)).catch(() => {});
  }, []);

  useSmartNotifications({
    userEmail,
    speakViaLya: (text) => {
      // Si Lya está conectada, encolamos un getPendingAlert que ella puede leer
      if (lya.status === 'connected') {
        lya.registerTools({
          getPendingAlert: () => text,
        });
      }
    },
  });

  return null;
}