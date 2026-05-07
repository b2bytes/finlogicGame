import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Volume2 } from 'lucide-react';
import { PITCH_SCRIPT } from './LyaPitchScript';

/**
 * LyaPitchNav — índice táctico de slides.
 * Permite saltar a cualquier slide del pitch con un click. Muestra estado
 * (completado / actual / pendiente) y duración estimada.
 * Renderiza como popover desplegable desde el panel del presenter.
 */
export default function LyaPitchNav({ open, currentIdx, onJump, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          role="menu"
          aria-label="Saltar a un slide del pitch"
          className="absolute bottom-full mb-2 left-0 right-0 max-h-[320px] overflow-y-auto rounded-2xl bg-card border border-border shadow-soft-lg overflow-hidden"
        >
          <div className="sticky top-0 px-4 py-2.5 bg-card border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 font-bold">
              Índice del pitch · {PITCH_SCRIPT.length} slides
            </span>
            <button
              onClick={onClose}
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              aria-label="Cerrar índice"
            >
              Cerrar
            </button>
          </div>
          <ul className="py-1">
            {PITCH_SCRIPT.map((slide, i) => {
              const isCurrent = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <li key={slide.id}>
                  <button
                    onClick={() => onJump(i)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-mint-50 transition-colors ${
                      isCurrent ? 'bg-mint-50' : ''
                    }`}
                    role="menuitem"
                  >
                    <span className="flex-shrink-0 mt-0.5">
                      {isCurrent ? (
                        <span className="relative flex w-4 h-4 items-center justify-center">
                          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-60" />
                          <Volume2 className="relative w-4 h-4 text-mint-700" />
                        </span>
                      ) : isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-mint-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/40" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-editorial text-muted-foreground tabular-nums">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className={`text-[13px] font-semibold truncate ${isCurrent ? 'text-mint-700' : 'text-foreground'}`}>
                          {slide.title}
                        </span>
                      </span>
                      <span className="block text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {slide.narration.slice(0, 90)}…
                      </span>
                    </span>
                    <span className="flex-shrink-0 text-[10px] font-mono-editorial text-muted-foreground tabular-nums mt-0.5">
                      {slide.duration}s
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}