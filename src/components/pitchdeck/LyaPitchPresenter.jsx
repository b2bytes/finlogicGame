import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, List, Keyboard, Radio } from 'lucide-react';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import { PITCH_SCRIPT } from './LyaPitchScript';
import LyaPitchNav from './LyaPitchNav';
import StageScene from './StageScene';

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
  const [navOpen, setNavOpen] = useState(false);
  const [hintShown, setHintShown] = useState(false);
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

  const prev = useCallback(() => {
    stopAll();
    lastSpokenIdxRef.current = -1;
    setIdx((i) => Math.max(0, i - 1));
  }, [stopAll]);

  const jumpTo = useCallback((targetIdx) => {
    if (targetIdx < 0 || targetIdx >= total) return;
    stopAll();
    lastSpokenIdxRef.current = -1;
    setIdx(targetIdx);
    setPaused(false);
    setNavOpen(false);
  }, [stopAll, total]);

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

  // ─── Atajos de teclado tácticos ──────────────────────────────
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      // No interferir con campos de texto
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      } else if (e.key === 'Escape') {
        if (navOpen) setNavOpen(false);
        else close();
      } else if (e.key === 'l' || e.key === 'L') {
        setNavOpen((v) => !v);
      } else if (/^[1-9]$/.test(e.key)) {
        jumpTo(parseInt(e.key, 10) - 1);
      } else if (e.key === '0') {
        jumpTo(9);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, navOpen, next, prev, togglePause, close, jumpTo]);

  // Mostrar hint de teclado los primeros 6s
  useEffect(() => {
    if (!active) return;
    setHintShown(true);
    const t = setTimeout(() => setHintShown(false), 6000);
    return () => clearTimeout(t);
  }, [active]);

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
            Pitch público · 10 slides
          </span>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            Lya media entre Paula y el jurado
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
        {/* === BANNER ESCENARIO — Paula ←→ Lya (mediadora) ←→ Jurado === */}
        <div className="relative bg-gradient-to-br from-mint-600 via-mint-700 to-[hsl(152_85%_18%)] text-white px-5 pt-4 pb-6 overflow-hidden">
          {/* Patrón decorativo */}
          <div aria-hidden className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-mint-300 blur-2xl" />
          </div>

          {/* Top row: ON AIR + cerrar */}
          <div className="relative flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
              <Radio className="w-3 h-3 text-red-300" />
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-mono-editorial uppercase tracking-wider font-semibold">
                Pitch público · Slide {idx + 1}/{total}
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

          {/* Escena pública: Paula ←→ Lya ←→ Audiencia */}
          <div className="relative">
            <StageScene speaking={voice.speaking} />
          </div>
        </div>

        {/* === SECCIÓN SLIDE ACTUAL === */}
        <div className="px-5 pt-4 pb-3 border-b border-border/60 bg-mint-50/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-mint-700" />
            <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 font-semibold">
              Lya traduce a la audiencia
            </span>
          </div>
          <h3 className="mt-1 font-display tracking-tight text-base font-bold text-foreground">
            {current?.title}
          </h3>
          <p className="text-[10px] font-mono-editorial text-muted-foreground mt-0.5">
            Slide {String(idx + 1).padStart(2, '0')} de {String(total).padStart(2, '0')} · ~{current?.duration}s
          </p>
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

        {/* === CONTROLES TÁCTICOS === */}
        <div className="relative px-5 pb-3 pt-2 bg-card">
          {/* Popover índice (sale hacia arriba desde el botón) */}
          <LyaPitchNav
            open={navOpen}
            currentIdx={idx}
            onJump={jumpTo}
            onClose={() => setNavOpen(false)}
          />

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={idx === 0}
              aria-label="Slide anterior"
              title="Slide anterior (←)"
              className="h-11 w-11 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePause}
              aria-label={paused ? 'Reanudar pitch' : 'Pausar pitch'}
              title={paused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
              className="flex-1 h-11 rounded-full bg-foreground hover:bg-mint-700 text-background inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            >
              {paused ? <><Play className="w-4 h-4" /> Reanudar</> : <><Pause className="w-4 h-4" /> Pausar</>}
            </button>
            <button
              onClick={next}
              disabled={idx + 1 >= total}
              aria-label="Siguiente slide"
              title="Siguiente slide (→)"
              className="h-11 w-11 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => setNavOpen((v) => !v)}
              aria-label="Abrir índice de slides"
              aria-expanded={navOpen}
              title="Índice (L)"
              className={`h-11 w-11 rounded-full border inline-flex items-center justify-center transition-colors ${
                navOpen
                  ? 'bg-mint-600 border-mint-600 text-white'
                  : 'bg-secondary hover:bg-mint-50 border-border text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mini timeline interactiva — click para saltar */}
        <div className="px-5 pb-3 pt-1 bg-card">
          <div className="flex items-center gap-1">
            {PITCH_SCRIPT.map((s, i) => (
              <button
                key={s.id}
                onClick={() => jumpTo(i)}
                aria-label={`Saltar al slide ${i + 1}: ${s.title}`}
                title={`${i + 1}. ${s.title}`}
                className={`flex-1 h-1.5 rounded-full transition-all hover:h-2 ${
                  i < idx
                    ? 'bg-mint-600'
                    : i === idx
                    ? 'bg-mint-400 animate-pulse'
                    : 'bg-mint-100 hover:bg-mint-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Hint de atajos de teclado (auto-dismiss) */}
        <AnimatePresence>
          {hintShown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="px-5 pb-4 bg-card overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mint-50/60 border border-mint-100">
                <Keyboard className="w-3.5 h-3.5 text-mint-700 flex-shrink-0" />
                <p className="text-[10px] text-mint-700 leading-tight">
                  Atajos: <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">←</kbd> <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">→</kbd> navegar · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">Espacio</kbd> pausa · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">L</kbd> índice · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">1-9</kbd> ir a slide
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}