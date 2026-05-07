import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Volume2, ChevronRight, Loader2 } from 'lucide-react';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import { PITCH_SCRIPT } from './LyaPitchScript';

/**
 * LyaPitchPresenter — Lya como co-presentadora del pitch (junto a Paula Garcés humana).
 *
 * Comportamiento:
 *  - FAB inicial "🎤 Pitch con Lya" en bottom-left del PitchDeck.
 *  - Al iniciar: Lya recorre los 10 slides del guion oficial.
 *  - Por cada slide: hace scroll al ancla, narra con voz Camila (ElevenLabs), y al
 *    terminar pasa al siguiente automáticamente.
 *  - Controles: pausar / reanudar / saltar / cerrar.
 *  - Panel flotante muestra: avatar Lya animado, slide actual / total, transcripción,
 *    timeline de progreso.
 */
export default function LyaPitchPresenter() {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const voice = useLyaVoice();
  const advanceTimerRef = useRef(null);
  const lastSpokenIdxRef = useRef(-1);

  const total = PITCH_SCRIPT.length;
  const current = PITCH_SCRIPT[idx] || null;

  // Cleanup global al cerrar
  const stopAll = useCallback(() => {
    voice.stopSpeaking();
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, [voice]);

  const close = useCallback(() => {
    stopAll();
    setActive(false);
    setIdx(0);
    setPaused(false);
    lastSpokenIdxRef.current = -1;
  }, [stopAll]);

  const start = useCallback(() => {
    setActive(true);
    setIdx(0);
    setPaused(false);
    lastSpokenIdxRef.current = -1;
  }, []);

  const next = useCallback(() => {
    stopAll();
    setIdx((i) => {
      if (i + 1 >= total) {
        // Fin del pitch — cerramos panel y dejamos a la audiencia con la slide de cierre
        setTimeout(() => close(), 600);
        return i;
      }
      return i + 1;
    });
  }, [stopAll, total, close]);

  const togglePause = useCallback(() => {
    if (paused) {
      // Reanudar → vuelve a hablar el slide actual desde el inicio
      setPaused(false);
      lastSpokenIdxRef.current = -1;
    } else {
      stopAll();
      setPaused(true);
    }
  }, [paused, stopAll]);

  // Scroll al slide actual
  useEffect(() => {
    if (!active || !current) return;
    const el = document.getElementById(current.id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [active, idx, current]);

  // Narración + auto-avance
  useEffect(() => {
    if (!active || !current || paused) return;
    if (lastSpokenIdxRef.current === idx) return;
    lastSpokenIdxRef.current = idx;

    // Damos un pequeño respiro al scroll antes de hablar
    const startDelay = setTimeout(() => {
      voice.speak(current.narration);

      // Fallback: si el TTS falla o no dispara onend, avanzamos con timer basado en duration
      const fallbackMs = (current.duration || 25) * 1000 + 4000;
      advanceTimerRef.current = setTimeout(() => {
        if (!paused && active) next();
      }, fallbackMs);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [active, idx, paused, current, voice, next]);

  // Cuando termina de hablar (speaking pasa de true → false), avanzamos al siguiente.
  // Esto da timing natural sin depender del fallback.
  const wasSpeakingRef = useRef(false);
  useEffect(() => {
    if (!active || paused) return;
    if (wasSpeakingRef.current && !voice.speaking) {
      // Terminó de hablar este slide — avanzamos en 1.2s
      const t = setTimeout(() => {
        if (!paused && active) next();
      }, 1200);
      return () => clearTimeout(t);
    }
    wasSpeakingRef.current = voice.speaking;
  }, [voice.speaking, active, paused, next]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => stopAll();
  }, [stopAll]);

  // ─── FAB inicial ─────────────────────────────────────────
  if (!active) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={start}
        aria-label="Iniciar pitch presentado por Lya"
        className="fixed bottom-6 left-6 z-40 group inline-flex items-center gap-2.5 pl-3 pr-5 py-3 rounded-full bg-foreground text-background hover:bg-mint-700 shadow-soft-lg transition-colors"
      >
        <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-mint-500 ring-2 ring-mint-300/50">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-50" />
          <Volume2 className="relative w-4 h-4 text-white" />
        </span>
        <span className="text-sm font-semibold whitespace-nowrap">
          Pitch presentado por Lya
        </span>
        <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
      </motion.button>
    );
  }

  // ─── Panel activo ────────────────────────────────────────
  const progress = ((idx + 1) / total) * 100;

  return (
    <>
      {/* Indicador lateral fino de progreso (no bloquea contenido) */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 h-1 bg-mint-500/20 z-50"
      >
        <motion.div
          className="h-full bg-mint-600"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        role="dialog"
        aria-label="Lya presentando el pitch"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 sm:w-[420px] bg-foreground text-background rounded-3xl border border-mint-700/40 shadow-soft-lg overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-white/10">
          <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center flex-shrink-0">
            <span className="font-editorial text-white text-xl font-bold leading-none">L</span>
            {voice.speaking && (
              <span className="absolute -inset-1 rounded-full ring-2 ring-mint-300 animate-ping opacity-50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-sm">Lya</p>
              <span className="text-[10px] font-mono-editorial text-mint-300 px-1.5 py-0.5 rounded bg-white/5">
                {idx + 1}/{total}
              </span>
            </div>
            <p className="text-[11px] text-white/60 truncate">
              Junto a Paula Garcés · {current?.title}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Detener presentación"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transcripción */}
        <div className="px-5 py-4 max-h-[180px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-[13px] leading-relaxed text-white/85"
            >
              {current?.narration}
            </motion.p>
          </AnimatePresence>

          {!voice.ttsSupported && (
            <p className="mt-3 text-[10px] text-mint-300 italic">
              Voz no disponible en este navegador. Avanzando con tiempo estimado.
            </p>
          )}
          {voice.processing && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] text-mint-300">
              <Loader2 className="w-3 h-3 animate-spin" />
              Sintetizando voz Camila…
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            onClick={togglePause}
            aria-label={paused ? 'Reanudar pitch' : 'Pausar pitch'}
            className="flex-1 h-11 rounded-full bg-mint-600 hover:bg-mint-500 text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            {paused ? (
              <>
                <Play className="w-4 h-4" /> Reanudar
              </>
            ) : (
              <>
                <Pause className="w-4 h-4" /> Pausar
              </>
            )}
          </button>
          <button
            onClick={next}
            disabled={idx + 1 >= total}
            aria-label="Saltar al siguiente slide"
            className="h-11 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white inline-flex items-center gap-1.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" /> Saltar
          </button>
        </div>
      </motion.div>
    </>
  );
}