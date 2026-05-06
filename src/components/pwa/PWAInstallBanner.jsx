import React, { useEffect, useState } from 'react';
import { Download, Bell, X } from 'lucide-react';
import { usePWA } from '@/lib/usePWA';

/**
 * Banner móvil discreto que invita a:
 *  1. Instalar FinLogic como app
 *  2. Activar notificaciones (plazos legales, novedades de caso)
 *
 * Aparece solo en mobile (sm:hidden), una vez, sin volver tras dismiss (sessionStorage).
 */
export default function PWAInstallBanner() {
  const { isInstallable, isInstalled, notifPermission, promptInstall, requestNotifications } = usePWA();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem('pwa_banner_dismissed') === '1');
  }, []);

  if (dismissed) return null;
  if (isInstalled && notifPermission === 'granted') return null;
  // Si no hay nada que ofrecer, no estorbes
  if (!isInstallable && notifPermission !== 'default') return null;

  const dismiss = () => {
    sessionStorage.setItem('pwa_banner_dismissed', '1');
    setDismissed(true);
  };

  const showInstall = isInstallable && !isInstalled;
  const showNotif = notifPermission === 'default';

  return (
    <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40 bg-foreground text-background rounded-3xl shadow-soft-lg p-3 pl-4 flex items-center gap-3 animate-fade-up">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          {showInstall ? 'Instala FinLogic' : 'Activa alertas'}
        </p>
        <p className="text-[11px] text-background/70 leading-snug mt-0.5">
          {showInstall
            ? 'Acceso rápido y notificaciones de plazos.'
            : 'Te avisamos cuando se acerquen tus plazos legales.'}
        </p>
      </div>
      {showInstall ? (
        <button
          onClick={promptInstall}
          className="h-9 px-3 rounded-full bg-mint-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 active:scale-95 transition-transform flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar
        </button>
      ) : showNotif ? (
        <button
          onClick={requestNotifications}
          className="h-9 px-3 rounded-full bg-mint-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 active:scale-95 transition-transform flex-shrink-0"
        >
          <Bell className="w-3.5 h-3.5" />
          Activar
        </button>
      ) : null}
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="w-8 h-8 rounded-full bg-background/10 inline-flex items-center justify-center flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}