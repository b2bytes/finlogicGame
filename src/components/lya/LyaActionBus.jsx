import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

/**
 * LyaActionBus — Bus visual para acciones de Lya en vivo.
 * Escucha el evento `lya:toast` y muestra un toast flotante elegante.
 *
 * Montar UNA sola vez (en App.jsx) — no afecta lógica existente.
 */

const VARIANT_STYLES = {
  success: {
    bg: 'bg-emerald-500/95',
    icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-500/95',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-slate-900/95',
    icon: Info,
  },
  lya: {
    bg: 'bg-mint-600/95',
    icon: Sparkles,
  },
};

export default function LyaActionBus() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const message = e.detail?.message;
      const variant = e.detail?.variant || 'lya';
      if (!message) return;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    window.addEventListener('lya:toast', handler);
    return () => window.removeEventListener('lya:toast', handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const cfg = VARIANT_STYLES[t.variant] || VARIANT_STYLES.lya;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`${cfg.bg} text-white px-4 py-2.5 rounded-full shadow-soft-lg backdrop-blur-md border border-white/20 inline-flex items-center gap-2 text-sm font-medium pointer-events-auto`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="max-w-[420px] truncate">{t.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}