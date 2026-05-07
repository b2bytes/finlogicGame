import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, X, Mic, Sparkles, Radio } from 'lucide-react';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import { PITCH_SCRIPT } from './LyaPitchScript';

/**
 * LyaPitchPresenter — Lya como mediadora del pitch.
 *
 * Setup escénico (mandato del usuario):
 *   Lya (IA) ↔ Paula Garcés (humana, producto/auditoría) ↔ Cliente/Jurado
 *
 * Diseño:
 *   - FAB inicial editorial con avatar Lya y CTA claro.
 *   - Panel "estudio de transmisión": header con los 3 actores en línea,
 *     avatar Lya con ondas sonoras animadas durante TTS, transcripción
 *     en bloque editorial, slide indicator, controles premium.
 *   - Glassmorphism sobre fondo crema, no panel oscuro pegado.
 *   - Mobile-first responsive.
 */
export default function LyaPitchPresenter() {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const voice = useLyaVoice();
  const advanceTimerRef = useRef(null);
  const lastSpokenIdxRef = useRef(-1);
  const wasSpeakingRef = useRef(false);

  const total = PITCH_SCRIPT.length;
  const current = PITCH_SCRIPT[idx] || null;

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
        setTimeout(() => close(), 800);
        return i;
      }
      return i + 1;
    });
  }, [stopAll, total, close]);

  const togglePause = useCallback(() => {
    if (paused) {
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
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active, idx, current]);

  // Narración + fallback timer
  useEffect(() => {
    if (!active || !current || paused) return;
    if (lastSpokenIdxRef.current === idx) return;
    lastSpokenIdxRef.current = idx;

    const startDelay = setTimeout(() => {
      voice.speak(current.narration);
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

  // Auto-avance al terminar de hablar
  useEffect(() => {
    if (!active || paused) return;
    if (wasSpeakingRef.current && !voice.speaking) {
      const t = setTimeout(() => {
        if (!paused && active) next();
      }, 1200);
      return () => clearTimeout(t);
    }
    wasSpeakingRef.current = voice.speaking;
  }, [voice.speaking, active, paused, next]);

  useEffect(() => () => stopAll(), [stopAll]);

  // ─── FAB inicial editorial ─────────────────────────────────────
  if (!active) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={start}
        aria-label="Iniciar pitch presentado por Lya"
        className="fixed bottom-6 left-6 z-40 group inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-card border border-border shadow-soft-lg hover:shadow-mint hover:border-mint-300 transition-all"
      >
        {/* Avatar Lya con halo */}
        <span className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-mint-400 via-mint-500 to-mint-700 ring-2 ring-mint-200">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-40" />
          <span className="relative font-editorial text-white text-lg font-bold leading-none">L</span>
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700">
            Pitch en vivo · 10 slides
          </span>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            Lya presenta junto a Paula
          </span>
        </div>
      </motion.button>
    );
  }

  // ─── Panel activo · Estudio de transmisión ─────────────────────
  const progress = ((idx + 1) / total) * 100;

  return (
    <>
      {/* Barra superior fina de progreso global */}
      <div aria-hidden className="fixed top-0 left-0 right-0 h-[3px] bg-mint-100 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-mint-500 to-mint-700"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        role="dialog"
        aria-label="Lya presentando el pitch junto a Paula Garcés"
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 sm:w-[460px] rounded-[28px] overflow-hidden shadow-soft-lg backdrop-blur-xl bg-card/95 border border-border"
      >
        {/* === BANNER ESTUDIO — 3 actores en escena === */}
        <div className="relative bg-gradient-to-br from-mint-600 via-mint-700 to-[hsl(152_85%_18%)] text-white px-5 pt-4 pb-5 overflow-hidden">
          {/* Patrón decorativo */}
          <div aria-hidden className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-mint-300 blur-2xl" />
          </div>

          {/* Top row: ON AIR + cerrar */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                <span className="relative w-2 h-2 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-mono-editorial uppercase tracking-wider font-semibold">
                En vivo · Slide {idx + 1}/{total}
              </span>
            </div>
            <button
              onClick={close}
              aria-label="Detener presentación"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 inline-flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Línea de actores: Lya ↔ Paula ↔ Jurado */}
          <div className="relative flex items-end justify-between gap-2">
            {/* Lya — IA mediadora */}
            <ActorAvatar
              variant="lya"
              label="Lya"
              role="IA · Mediadora"
              speaking={voice.speaking}
              prominent
            />
            {/* Conector */}
            <Connector active={voice.speaking} />
            {/* Paula */}
            <ActorAvatar
              variant="paula"
              label="Paula"
              role="Humana · Auditoría"
            />
            {/* Conector */}
            <Connector />
            {/* Jurado/Cliente */}
            <ActorAvatar
              variant="jurado"
              label="Jurado"
              role="Audiencia"
            />
          </div>
        </div>

        {/* === SECCIÓN SLIDE ACTUAL === */}
        <div className="px-5 pt-4 pb-3 border-b border-border/60 bg-mint-50/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-mint-700" />
            <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 font-semibold">
              Hablando ahora
            </span>
          </div>
          <h3 className="mt-1 font-display tracking-tight text-base font-bold text-foreground">
            {current?.title}
          </h3>
        </div>

        {/* === TRANSCRIPCIÓN EDITORIAL === */}
        <div className="px-5 py-4 max-h-[200px] overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="text-[13px] leading-relaxed text-foreground/85 first-letter:font-editorial first-letter:text-2xl first-letter:font-bold first-letter:text-mint-700 first-letter:mr-1 first-letter:float-left first-letter:leading-none first-letter:mt-0.5"
            >
              {current?.narration}
            </motion.p>
          </AnimatePresence>

          {!voice.ttsSupported && (
            <p className="mt-3 text-[10px] text-muted-foreground italic">
              Voz no disponible en este navegador. Avanzando con tiempo estimado.
            </p>
          )}
        </div>

        {/* === CONTROLES === */}
        <div className="px-5 pb-5 pt-2 flex items-center gap-2 bg-card">
          <button
            onClick={togglePause}
            aria-label={paused ? 'Reanudar pitch' : 'Pausar pitch'}
            className="flex-1 h-11 rounded-full bg-foreground hover:bg-mint-700 text-background inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
          >
            {paused ? <><Play className="w-4 h-4" /> Reanudar</> : <><Pause className="w-4 h-4" /> Pausar</>}
          </button>
          <button
            onClick={next}
            disabled={idx + 1 >= total}
            aria-label="Saltar al siguiente slide"
            className="h-11 px-4 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground inline-flex items-center gap-1.5 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SkipForward className="w-4 h-4" /> Siguiente
          </button>
        </div>

        {/* Mini timeline de slides — 10 puntos */}
        <div className="px-5 pb-4 pt-1 bg-card flex items-center gap-1">
          {PITCH_SCRIPT.map((s, i) => (
            <span
              key={s.id}
              aria-hidden
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < idx
                  ? 'bg-mint-600'
                  : i === idx
                  ? 'bg-mint-400 animate-pulse'
                  : 'bg-mint-100'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
}

// ─── Avatar de actor en escena ─────────────────────────────────
function ActorAvatar({ variant, label, role, speaking = false, prominent = false }) {
  const styles = {
    lya: {
      bg: 'bg-gradient-to-br from-mint-200 to-mint-400',
      ring: 'ring-mint-200',
      icon: <span className="font-editorial text-mint-800 text-xl font-bold leading-none">L</span>,
    },
    paula: {
      bg: 'bg-gradient-to-br from-[hsl(28_80%_75%)] to-[hsl(28_80%_60%)]',
      ring: 'ring-[hsl(28_80%_85%)]/40',
      icon: <span className="font-editorial text-white text-lg font-bold leading-none">P</span>,
    },
    jurado: {
      bg: 'bg-gradient-to-br from-[hsl(280_50%_75%)] to-[hsl(280_50%_55%)]',
      ring: 'ring-[hsl(280_50%_85%)]/40',
      icon: <span className="text-white text-base font-bold leading-none">★</span>,
    },
  };
  const s = styles[variant];
  const size = prominent ? 'w-14 h-14' : 'w-11 h-11';

  return (
    <div className="flex flex-col items-center gap-1 min-w-0">
      <div className={`relative ${size} rounded-full ${s.bg} ring-2 ${s.ring} flex items-center justify-center flex-shrink-0`}>
        {/* Halo de "hablando" solo en Lya */}
        {speaking && variant === 'lya' && (
          <>
            <span className="absolute -inset-1 rounded-full ring-2 ring-white/60 animate-ping opacity-75" />
            <span className="absolute -inset-2 rounded-full ring ring-mint-200/40 animate-pulse" />
          </>
        )}
        {s.icon}
        {/* Mic indicator solo en Lya cuando habla */}
        {speaking && variant === 'lya' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 ring-2 ring-mint-700 flex items-center justify-center">
            <Mic className="w-2.5 h-2.5 text-white" />
          </span>
        )}
      </div>
      <div className="text-center min-w-0">
        <p className={`font-bold leading-none truncate ${prominent ? 'text-[12px]' : 'text-[11px]'}`}>
          {label}
        </p>
        <p className="text-[9px] font-mono-editorial uppercase tracking-wider text-white/60 leading-tight mt-0.5 truncate">
          {role}
        </p>
      </div>
    </div>
  );
}

// ─── Conector entre actores ────────────────────────────────────
function Connector({ active = false }) {
  return (
    <div className="flex-1 flex items-center justify-center pb-6 px-1 min-w-0">
      <span
        aria-hidden
        className={`block h-px w-full ${active ? 'bg-gradient-to-r from-mint-200 via-white to-mint-200' : 'bg-white/20'} transition-colors`}
      />
    </div>
  );
}