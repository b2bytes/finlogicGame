import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '@elevenlabs/client';
import { Mic, MicOff, X, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LyaVoiceWaves from './LyaVoiceWaves';

/**
 * LyaVoiceCard — Card flotante de voz con Lya estética glassmorphism dark.
 * Inspirado en "Daily Design Challenge · Day 14": card oscura con ondas
 * sonoras, mic central, transcripción mínima en la parte superior.
 *
 * Compacto (~300px), no obstaculiza la vista, transcripción de la última
 * línea hablada. Posicionado bottom-left para no chocar con LyaChatWidget
 * (bottom-right).
 *
 * Acepta `pitchMode=true` para activar tools de navegación de slides.
 */

const SLIDE_LABELS = {
  'slide-hero': 'Apertura', 'slide-problema': 'Problema',
  'slide-perfiles': 'Perfiles', 'slide-demo': 'Demo',
  'slide-casos': 'Casos', 'slide-traccion': 'Tracción',
  'slide-api': 'API', 'slide-sfa': 'SFA',
  'slide-equipo': 'Equipo', 'slide-cierre': 'Cierre',
};

export default function LyaVoiceCard({ pitchMode = false, position = 'bottom-left' }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null); // { role, text }
  const [currentSlide, setCurrentSlide] = useState(null);

  const conversationRef = useRef(null);

  // Tools (solo se usan cuando pitchMode=true)
  const clientTools = useRef({
    navigateToSlide: ({ slideId }) => {
      const el = document.getElementById(slideId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentSlide(slideId);
        return `OK, mostrando ${SLIDE_LABELS[slideId] || slideId}`;
      }
      return `Slide ${slideId} no encontrado`;
    },
    openPage: ({ path, reason }) => {
      window.open(`${window.location.origin}${path}`, '_blank', 'noopener,noreferrer');
      return `Página ${path} abierta${reason ? ` · ${reason}` : ''}`;
    },
    highlightMetric: ({ metric }) => `Métrica ${metric} resaltada`,
    queryFinLogic: async ({ question }) => {
      try {
        const res = await base44.functions.invoke('lyaKnowledgeQuery', {
          query: question, mode: 'voice', userProfile: 'general',
        });
        const data = res.data || {};
        const answer = data.response || 'Sin respuesta';
        const score = data.verifierScore || data.confidence || null;
        return `Respuesta verificada (score ${score ?? 'N/A'}): ${answer.slice(0, 600)}`;
      } catch (err) {
        return `Error: ${err.message}`;
      }
    },
  });

  const startConversation = useCallback(async () => {
    setError(null);
    setStatus('connecting');
    setLastMessage(null);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await base44.functions.invoke('elevenLabsAgentSignedUrl', {});
      const signedUrl = res.data?.signedUrl;
      if (!signedUrl) throw new Error('No se pudo obtener signed URL');

      const conversation = await Conversation.startSession({
        signedUrl,
        ...(pitchMode ? { clientTools: clientTools.current } : {}),
        onConnect: () => setStatus('connected'),
        onDisconnect: () => { setStatus('idle'); setAgentSpeaking(false); },
        onError: (err) => {
          setError(typeof err === 'string' ? err : err?.message || 'Error de conexión');
          setStatus('error');
        },
        onModeChange: (mode) => setAgentSpeaking(mode?.mode === 'speaking'),
        onMessage: (msg) => {
          if (!msg?.message) return;
          setLastMessage({
            role: msg.source === 'ai' ? 'lya' : 'user',
            text: msg.message,
          });
        },
      });
      conversationRef.current = conversation;
    } catch (err) {
      setError(
        err?.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado'
          : err?.message || 'No pude conectar con Lya'
      );
      setStatus('error');
    }
  }, [pitchMode]);

  const endConversation = useCallback(async () => {
    try { await conversationRef.current?.endSession(); } catch (_) { /* noop */ }
    conversationRef.current = null;
    setStatus('idle');
    setAgentSpeaking(false);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!conversationRef.current) return;
    const newMuted = !muted;
    try { conversationRef.current.setMicMuted?.(newMuted); } catch (_) { /* noop */ }
    setMuted(newMuted);
  }, [muted]);

  const close = useCallback(async () => {
    await endConversation();
    setOpen(false);
    setLastMessage(null);
    setError(null);
  }, [endConversation]);

  // Cleanup al desmontar
  useEffect(() => () => { endConversation(); }, [endConversation]);

  // Posicionamiento
  const positionClass = position === 'top-right'
    ? 'top-20 right-4 sm:right-6'
    : position === 'bottom-left'
      ? 'bottom-5 left-4 sm:left-6'
      : 'bottom-5 right-4 sm:right-6';

  // ─── FAB cerrado · pequeño botón flotante ─────────────────────
  if (!open) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={() => {
          setOpen(true);
          setTimeout(() => startConversation(), 200);
        }}
        aria-label="Hablar con Lya"
        style={{
          bottom: position === 'bottom-left' ? 'max(1.25rem, env(safe-area-inset-bottom))' : undefined,
          left: position === 'bottom-left' ? 'max(1rem, env(safe-area-inset-left))' : undefined,
        }}
        className={`fixed ${positionClass} z-40 group inline-flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-white/10 shadow-soft-lg hover:border-mint-300/40 hover:shadow-mint transition-all`}
      >
        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-mint-400 to-mint-600 ring-1 ring-white/20">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-30" />
          <Mic className="relative w-3.5 h-3.5 text-white" />
        </span>
        <span className="text-[11px] font-bold text-white whitespace-nowrap tracking-tight">
          Hablar con Lya
        </span>
      </motion.button>
    );
  }

  // ─── Card abierta · estética glassmorphism dark ───────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      role="dialog"
      aria-label="Lya voz"
      style={{
        bottom: position === 'bottom-left' ? 'max(1.25rem, env(safe-area-inset-bottom))' : undefined,
        left: position === 'bottom-left' ? 'max(1rem, env(safe-area-inset-left))' : undefined,
        transformOrigin: position === 'bottom-left' ? 'bottom left' : 'top right',
      }}
      className={`fixed ${positionClass} z-50 w-[300px] sm:w-[320px] rounded-[28px] overflow-hidden`}
    >
      {/* Glow exterior tipo aurora */}
      <div aria-hidden className="absolute -inset-8 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-mint-400/20 to-cyan-400/30 blur-2xl rounded-full" />
      </div>

      {/* Card interior · vidrio oscuro */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[28px] p-4 shadow-2xl">
        {/* Botón cerrar */}
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors z-10"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Texto: último mensaje o estado */}
        <div className="min-h-[80px] pr-8 pb-2">
          {status === 'error' && error ? (
            <p className="text-[13px] text-red-300 leading-snug">
              <span className="font-bold">Error:</span> {error}
            </p>
          ) : status === 'connecting' ? (
            <p className="text-[13px] text-white/70 leading-snug flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Conectando con Lya…
            </p>
          ) : lastMessage ? (
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-mint-300/80 mb-1">
                {lastMessage.role === 'lya' ? 'Lya' : 'Tú'}
              </p>
              <p className="text-[13px] text-white/95 leading-snug line-clamp-3">
                {lastMessage.role === 'lya' ? (
                  <>
                    {lastMessage.text.length > 140
                      ? lastMessage.text.slice(0, 140) + '…'
                      : lastMessage.text}
                  </>
                ) : (
                  lastMessage.text
                )}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[9px] font-mono uppercase tracking-wider text-mint-300/80 mb-1">
                Lya · IA legal
              </p>
              <p className="text-[13px] text-white/95 leading-snug">
                Hola, soy <span className="text-mint-300 font-semibold">Lya</span>. Hazme tu consulta sobre{' '}
                <span className="text-mint-300 font-semibold italic">tus derechos…</span>
              </p>
            </div>
          )}

          {/* Slide actual (solo pitchMode) */}
          {pitchMode && currentSlide && (
            <span className="inline-block mt-2 text-[9px] font-mono uppercase tracking-wider text-mint-300 px-2 py-0.5 rounded-full bg-mint-500/15 border border-mint-400/20">
              {SLIDE_LABELS[currentSlide]}
            </span>
          )}
        </div>

        {/* Ondas sonoras animadas */}
        <div className="my-2 -mx-1">
          <LyaVoiceWaves active={status === 'connected' && (agentSpeaking || !muted)} />
        </div>

        {/* Mic button central */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {status === 'connected' ? (
            <>
              <button
                onClick={toggleMute}
                aria-label={muted ? 'Activar mic' : 'Silenciar'}
                className={`w-11 h-11 rounded-full inline-flex items-center justify-center transition-all border ${
                  muted
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
                    : 'bg-white/95 border-white/20 text-slate-900 hover:bg-white shadow-lg'
                }`}
              >
                {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={endConversation}
                className="px-4 h-11 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-[12px] font-bold transition-colors shadow-lg"
              >
                Finalizar
              </button>
            </>
          ) : status === 'connecting' ? (
            <button
              disabled
              className="w-11 h-11 rounded-full bg-white/10 text-white/40 inline-flex items-center justify-center cursor-wait"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </button>
          ) : (
            <button
              onClick={startConversation}
              aria-label="Iniciar conversación"
              className="relative w-12 h-12 rounded-full bg-white inline-flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            >
              <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-30" />
              <Mic className="relative w-5 h-5 text-slate-900" />
            </button>
          )}
        </div>

        {/* Estado footer minimal */}
        <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-white/50 font-mono uppercase tracking-wider">
          {status === 'connected' && agentSpeaking ? (
            <><Sparkles className="w-2.5 h-2.5 text-mint-300" /> Hablando…</>
          ) : status === 'connected' && !muted ? (
            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Escuchando</>
          ) : status === 'connected' && muted ? (
            <>Mic silenciado</>
          ) : (
            <>Toca el mic para hablar</>
          )}
        </div>
      </div>
    </motion.div>
  );
}