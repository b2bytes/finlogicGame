import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, SkipForward, SkipBack, X, Sparkles, List, Keyboard,
  Radio, MessageCircleQuestion, Mic, Square, Loader2,
} from 'lucide-react';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import { base44 } from '@/api/base44Client';
import { PITCH_SCRIPT } from './LyaPitchScript';
import LyaPitchNav from './LyaPitchNav';
import StageScene from './StageScene';

/**
 * LyaPitchPresenter — Lya como mediadora pública del pitch.
 *
 * Posición: top-right (mano derecha superior), siempre visible.
 * Setup: Paula (humana) ←→ Lya (mediadora IA pública) ←→ Jurado/Público
 *
 * Capacidades:
 *  - Presenta los 10 slides con voz Camila es-CL (ElevenLabs studio-grade).
 *  - Auto-avanza solo cuando el audio termina realmente (sin timer fallback que corte voz).
 *  - Modo Q&A: pausa la presentación, escucha al público (STT) y responde
 *    consultando lyaKnowledgeQuery con la pregunta del jurado.
 *  - Navegación táctica: ← →, Espacio (pausa), L (índice), 1-9 (saltar), Esc.
 */
export default function LyaPitchPresenter() {
  const [active, setActive] = useState(false);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  // Q&A público
  const [qaOpen, setQaOpen] = useState(false);
  const [qaQuery, setQaQuery] = useState('');
  const [qaAnswer, setQaAnswer] = useState('');
  const [qaLoading, setQaLoading] = useState(false);

  const voice = useLyaVoice();
  const lastSpokenIdxRef = useRef(-1);
  const wasSpeakingRef = useRef(false);

  const total = PITCH_SCRIPT.length;
  const current = PITCH_SCRIPT[idx] || null;

  const stopAll = useCallback(() => {
    voice.stopSpeaking();
  }, [voice]);

  const close = useCallback(() => {
    stopAll();
    setActive(false);
    setIdx(0);
    setPaused(false);
    setQaOpen(false);
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

  // ─── Q&A modo público — Lya escucha al jurado ──────────────────
  const openQA = useCallback(() => {
    if (!paused) {
      stopAll();
      setPaused(true);
    }
    setQaAnswer('');
    setQaQuery('');
    setQaOpen(true);
  }, [paused, stopAll]);

  const closeQA = useCallback(() => {
    voice.stopListening?.();
    voice.stopSpeaking();
    setQaOpen(false);
    setQaAnswer('');
    setQaQuery('');
    setQaLoading(false);
  }, [voice]);

  const handlePublicQuestion = useCallback(async (transcript) => {
    if (!transcript || !transcript.trim()) return;
    setQaQuery(transcript);
    setQaLoading(true);
    setQaAnswer('');
    try {
      const res = await base44.functions.invoke('lyaKnowledgeQuery', {
        query: transcript,
        mode: 'text',
        userProfile: 'general',
      });
      const answer = res.data?.response || 'No pude procesar esa pregunta. ¿La puedes repetir?';
      setQaAnswer(answer);
      voice.speak(answer);
    } catch (e) {
      const fallback = 'Hubo un problema técnico. Paula puede responder esa pregunta directamente.';
      setQaAnswer(fallback);
      voice.speak(fallback);
    } finally {
      setQaLoading(false);
    }
  }, [voice]);

  const startListenPublic = useCallback(() => {
    voice.startListening?.((finalText) => handlePublicQuestion(finalText));
  }, [voice, handlePublicQuestion]);

  // ─── Scroll al slide actual ─────────────────────────────────────
  useEffect(() => {
    if (!active || !current || qaOpen) return;
    const el = document.getElementById(current.id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [active, idx, current, qaOpen]);

  // ─── Narración ─────────────────────────────────────────────────
  // Importante: NO usamos timer fallback que corte la voz. El audio termina
  // por sí mismo (onended → speaking=false → effect siguiente avanza).
  useEffect(() => {
    if (!active || !current || paused || qaOpen) return;
    if (lastSpokenIdxRef.current === idx) return;
    lastSpokenIdxRef.current = idx;

    const startDelay = setTimeout(() => {
      if (paused || qaOpen) return;
      voice.speak(current.narration);
    }, 900);

    return () => clearTimeout(startDelay);
  }, [active, idx, paused, current, qaOpen, voice]);

  // Auto-avance al terminar de hablar (transición real cuando el audio acaba)
  useEffect(() => {
    if (!active || paused || qaOpen) return;
    if (wasSpeakingRef.current && !voice.speaking) {
      const t = setTimeout(() => {
        if (!paused && active && !qaOpen) next();
      }, 1400);
      return () => clearTimeout(t);
    }
    wasSpeakingRef.current = voice.speaking;
  }, [voice.speaking, active, paused, qaOpen, next]);

  useEffect(() => () => stopAll(), [stopAll]);

  // ─── Atajos de teclado ─────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === ' ') { e.preventDefault(); togglePause(); }
      else if (e.key === 'Escape') {
        if (qaOpen) closeQA();
        else if (navOpen) setNavOpen(false);
        else close();
      }
      else if (e.key === 'l' || e.key === 'L') setNavOpen((v) => !v);
      else if (e.key === 'q' || e.key === 'Q') openQA();
      else if (/^[1-9]$/.test(e.key)) jumpTo(parseInt(e.key, 10) - 1);
      else if (e.key === '0') jumpTo(9);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, navOpen, qaOpen, next, prev, togglePause, close, jumpTo, openQA, closeQA]);

  useEffect(() => {
    if (!active) return;
    setHintShown(true);
    const t = setTimeout(() => setHintShown(false), 7000);
    return () => clearTimeout(t);
  }, [active]);

  // ─── FAB inicial · top-right ──────────────────────────────────
  if (!active) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={start}
        aria-label="Iniciar pitch presentado por Lya"
        className="fixed top-20 right-4 sm:right-6 z-40 group inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-card border border-border shadow-soft-lg hover:shadow-mint hover:border-mint-300 transition-all"
      >
        <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 via-mint-500 to-mint-700 ring-2 ring-mint-200">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-40" />
          <span className="relative font-editorial text-white text-xl font-bold leading-none">L</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700">
            Mediadora · IA · 10 slides
          </span>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            Activar a Lya en vivo
          </span>
        </div>
      </motion.button>
    );
  }

  // ─── Panel activo ─────────────────────────────────────────────
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
        initial={{ opacity: 0, y: -20, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        role="dialog"
        aria-label="Lya mediando el pitch"
        className="fixed top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[calc(100vh-6rem)] flex flex-col rounded-[28px] overflow-hidden shadow-soft-lg backdrop-blur-xl bg-card/95 border border-border"
      >
        {/* === BANNER ESCENARIO === */}
        <div className="relative bg-gradient-to-br from-mint-600 via-mint-700 to-[hsl(152_85%_18%)] text-white px-5 pt-4 pb-6 overflow-hidden flex-shrink-0">
          <div aria-hidden className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white blur-2xl" />
            <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-mint-300 blur-2xl" />
          </div>

          <div className="relative flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
              <Radio className="w-3 h-3 text-red-300" />
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[10px] font-mono-editorial uppercase tracking-wider font-semibold">
                {qaOpen ? 'Q&A público' : `Slide ${idx + 1}/${total}`}
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

          <div className="relative">
            <StageScene speaking={voice.speaking || voice.listening} />
          </div>
        </div>

        {/* === Contenido scrolleable === */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-card">
          <AnimatePresence mode="wait">
            {qaOpen ? (
              // ─── MODO Q&A PÚBLICO ───
              <motion.div
                key="qa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 py-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <MessageCircleQuestion className="w-3.5 h-3.5 text-mint-700" />
                  <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 font-semibold">
                    Lya escucha al público
                  </span>
                </div>

                {/* Estado de escucha */}
                {voice.listening && (
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[12px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-bold">Grabando pregunta del jurado…</p>
                      {voice.interim && <p className="italic mt-1">{voice.interim}</p>}
                    </div>
                  </div>
                )}

                {voice.processing && (
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground italic">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Transcribiendo pregunta del público…
                  </div>
                )}

                {/* Pregunta capturada */}
                {qaQuery && (
                  <div className="rounded-2xl bg-mint-50 border border-mint-200 px-4 py-3">
                    <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700 mb-1">
                      Pregunta del público
                    </p>
                    <p className="text-[13px] text-foreground italic">"{qaQuery}"</p>
                  </div>
                )}

                {/* Respuesta de Lya */}
                {qaLoading && !qaAnswer && (
                  <div className="flex items-center gap-2 text-[12px] text-mint-700">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Lya está consultando la normativa…
                  </div>
                )}

                {qaAnswer && (
                  <div className="rounded-2xl border border-border px-4 py-3">
                    <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-foreground/60 mb-1">
                      Lya responde
                    </p>
                    <p className="text-[13px] text-foreground/85 leading-relaxed">{qaAnswer}</p>
                  </div>
                )}

                {/* Controles Q&A */}
                <div className="flex items-center gap-2 pt-1">
                  {!voice.listening ? (
                    <button
                      onClick={startListenPublic}
                      disabled={voice.processing || qaLoading}
                      className="flex-1 h-11 rounded-full bg-mint-600 hover:bg-mint-700 text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      <Mic className="w-4 h-4" /> Escuchar pregunta
                    </button>
                  ) : (
                    <button
                      onClick={voice.stopListening}
                      className="flex-1 h-11 rounded-full bg-red-500 hover:bg-red-600 text-white inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors animate-pulse"
                    >
                      <Square className="w-4 h-4 fill-current" /> Detener grabación
                    </button>
                  )}
                  <button
                    onClick={closeQA}
                    className="h-11 px-4 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground text-sm font-semibold transition-colors"
                  >
                    Volver al pitch
                  </button>
                </div>
              </motion.div>
            ) : (
              // ─── MODO PRESENTACIÓN ───
              <motion.div
                key={`slide-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Sección slide actual */}
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

                {/* Transcripción */}
                <div className="px-5 py-4">
                  <p className="text-[13px] leading-relaxed text-foreground/85 first-letter:font-editorial first-letter:text-2xl first-letter:font-bold first-letter:text-mint-700 first-letter:mr-1 first-letter:float-left first-letter:leading-none first-letter:mt-0.5">
                    {current?.narration}
                  </p>
                  {!voice.ttsSupported && (
                    <p className="mt-3 text-[10px] text-muted-foreground italic">
                      Voz no disponible en este navegador.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === CONTROLES (solo modo presentación) === */}
        {!qaOpen && (
          <div className="flex-shrink-0 bg-card">
            <div className="relative px-5 pb-3 pt-2">
              <LyaPitchNav
                open={navOpen}
                currentIdx={idx}
                onJump={jumpTo}
                onClose={() => setNavOpen(false)}
              />

              <div className="flex items-center gap-1.5">
                <button
                  onClick={prev}
                  disabled={idx === 0}
                  aria-label="Slide anterior"
                  title="Slide anterior (←)"
                  className="h-11 w-11 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePause}
                  aria-label={paused ? 'Reanudar' : 'Pausar'}
                  title={paused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
                  className="flex-1 h-11 rounded-full bg-foreground hover:bg-mint-700 text-background inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
                >
                  {paused ? <><Play className="w-4 h-4" /> Reanudar</> : <><Pause className="w-4 h-4" /> Pausar</>}
                </button>
                <button
                  onClick={next}
                  disabled={idx + 1 >= total}
                  aria-label="Siguiente slide"
                  title="Siguiente (→)"
                  className="h-11 w-11 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setNavOpen((v) => !v)}
                  aria-label="Índice de slides"
                  aria-expanded={navOpen}
                  title="Índice (L)"
                  className={`h-11 w-11 rounded-full border inline-flex items-center justify-center transition-colors flex-shrink-0 ${
                    navOpen ? 'bg-mint-600 border-mint-600 text-white' : 'bg-secondary hover:bg-mint-50 border-border text-foreground'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Botón Q&A público — destacado */}
              {voice.sttSupported && (
                <button
                  onClick={openQA}
                  title="Recibir pregunta del público (Q)"
                  className="mt-2 w-full h-10 rounded-full bg-gradient-to-r from-mint-50 to-mint-100 hover:from-mint-100 hover:to-mint-200 border border-mint-300 text-mint-800 inline-flex items-center justify-center gap-2 text-[12px] font-bold transition-all"
                >
                  <MessageCircleQuestion className="w-4 h-4" />
                  Recibir pregunta del jurado
                </button>
              )}
            </div>

            {/* Mini timeline interactiva */}
            <div className="px-5 pb-3 pt-1">
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

            {/* Hint atajos */}
            <AnimatePresence>
              {hintShown && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-5 pb-4 overflow-hidden"
                >
                  <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-mint-50/60 border border-mint-100">
                    <Keyboard className="w-3.5 h-3.5 text-mint-700 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-mint-700 leading-relaxed">
                      <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">←</kbd> <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">→</kbd> · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">Espacio</kbd> pausa · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">Q</kbd> pregunta · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">L</kbd> índice · <kbd className="px-1 py-0.5 bg-white rounded border border-mint-200 font-mono-editorial text-[9px]">1-9</kbd> ir a slide
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
}