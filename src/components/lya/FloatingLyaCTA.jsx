import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

/**
 * Botón flotante global "Habla con Lya" — solo mobile.
 * Mandato §North Star: minimizar time-to-first-victory.
 * Se oculta automáticamente en /AsistenteLya y /Consulta para no estorbar.
 */
export default function FloatingLyaCTA() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem('lya_fab_dismissed') === '1');
  }, []);

  const hideOn = ['/AsistenteLya', '/Consulta'];
  if (hideOn.some((p) => location.pathname.startsWith(p))) return null;
  if (dismissed) return null;

  const close = (e) => {
    e.preventDefault();
    e.stopPropagation();
    sessionStorage.setItem('lya_fab_dismissed', '1');
    setDismissed(true);
  };

  return (
    <Link
      to="/AsistenteLya"
      aria-label="Hablar con Lya, asistente IA"
      className="md:hidden fixed bottom-5 right-4 z-50 group inline-flex items-center gap-2 pl-4 pr-2 py-2.5 rounded-full bg-foreground text-background shadow-soft-lg active:scale-95 transition-transform"
    >
      <span className="relative flex w-2 h-2">
        <span className="absolute inset-0 rounded-full bg-mint-400 animate-pulse-soft" />
        <span className="relative w-2 h-2 rounded-full bg-mint-400" />
      </span>
      <Sparkles className="w-4 h-4 text-mint-300" />
      <span className="text-sm font-semibold">Habla con Lya</span>
      <button
        onClick={close}
        aria-label="Ocultar"
        className="w-7 h-7 rounded-full bg-background/15 hover:bg-background/25 inline-flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </Link>
  );
}