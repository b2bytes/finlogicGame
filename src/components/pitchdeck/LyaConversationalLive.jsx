import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Conversation } from '@elevenlabs/client';
import {
  Phone, PhoneOff, Mic, MicOff, Radio, Loader2, X,
  Sparkles, Volume2, MessageCircle, Navigation, ExternalLink,
  Zap, Search,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import StageScene from './StageScene';

// ─── Mapa de slides (id → label legible para mostrar al activarse) ──
const SLIDE_LABELS = {
  'slide-hero': 'Apertura',
  'slide-problema': 'El problema',
  'slide-perfiles': '4 perfiles',
  'slide-demo': 'Demo en vivo',
  'slide-casos': 'Casos resueltos',
  'slide-traccion': 'Tracción',
  'slide-api': 'Compliance API',
  'slide-sfa': 'Ventana SFA',
  'slide-equipo': 'Equipo',
  'slide-cierre': 'Cierre',
};

// ─── Métricas resaltables (id → selector + label) ───────────────────
const METRIC_TARGETS = {
  casos: { slide: 'slide-traccion', label: 'consultas resueltas' },
  score: { slide: 'slide-traccion', label: 'score verificador IA' },
  recuperado: { slide: 'slide-casos', label: 'CLP recuperados' },
  latencia: { slide: 'slide-demo', label: 'latencia <600ms' },
  alucinacion: { slide: 'slide-traccion', label: '0.4% alucinación' },
  sfa: { slide: 'slide-sfa', label: 'Ventana 4 julio' },
  pricing: { slide: 'slide-api', label: '$490.000 CLP/mes' },
};

/**
 * LyaConversationalLive — Conversación bidireccional en vivo con el Agente
 * Conversacional de ElevenLabs (Lya).
 *
 * Reemplaza el TTS unidireccional por una llamada real:
 *  - Lya escucha al jurado/Paula mediante WebRTC
 *  - Lya responde con voz studio en tiempo real
 *  - Es interrumpible (puedes cortarla a media frase)
 *  - Espera silencios naturales (Paula puede hablar sin que la corte)
 *
 * Posicionado top-right como mediadora pública del pitch.
 */
export default function LyaConversationalLive() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | error
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState([]); // [{role|action, text, ts, meta}]
  const [elapsed, setElapsed] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(null);
  const [activeMetric, setActiveMetric] = useState(null);

  const conversationRef = useRef(null);
  const startTimeRef = useRef(null);
  const transcriptScrollRef = useRef(null);
  const metricTimeoutRef = useRef(null);

  // ─── Client tools que el agente puede ejecutar EN VIVO ──────────
  const clientTools = useRef({
    navigateToSlide: ({ slideId }) => {
      const el = document.getElementById(slideId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurrentSlide(slideId);
        setTranscript((t) => [
          ...t,
          {
            role: 'action',
            tool: 'navigateToSlide',
            text: `Navegando a "${SLIDE_LABELS[slideId] || slideId}"`,
            ts: Date.now(),
          },
        ]);
        return `OK, mostrando slide ${SLIDE_LABELS[slideId] || slideId}`;
      }
      return `Slide ${slideId} no encontrado`;
    },
    openPage: ({ path, reason }) => {
      const url = `${window.location.origin}${path}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setTranscript((t) => [
        ...t,
        {
          role: 'action',
          tool: 'openPage',
          text: `Abriendo página ${path}${reason ? ` · ${reason}` : ''}`,
          ts: Date.now(),
        },
      ]);
      return `Página ${path} abierta en pestaña nueva`;
    },
    highlightMetric: ({ metric }) => {
      const target = METRIC_TARGETS[metric];
      if (target) {
        const el = document.getElementById(target.slide);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveMetric(metric);
        if (metricTimeoutRef.current) clearTimeout(metricTimeoutRef.current);
        metricTimeoutRef.current = setTimeout(() => setActiveMetric(null), 4000);
        setTranscript((t) => [
          ...t,
          {
            role: 'action',
            tool: 'highlightMetric',
            text: `Resaltando: ${target.label}`,
            ts: Date.now(),
          },
        ]);
        return `Métrica ${metric} resaltada`;
      }
      return `Métrica ${metric} no encontrada`;
    },
    queryFinLogic: async ({ question }) => {
      setTranscript((t) => [
        ...t,
        {
          role: 'action',
          tool: 'queryFinLogic',
          text: `Consultando pipeline IA: "${question.slice(0, 80)}…"`,
          ts: Date.now(),
        },
      ]);
      try {
        const res = await base44.functions.invoke('lyaKnowledgeQuery', {
          query: question,
          mode: 'voice',
          userProfile: 'general',
        });
        const data = res.data || {};
        const answer = data.response || 'Sin respuesta del pipeline';
        const score = data.verifierScore || data.confidence || null;
        const sources = (data.sources || []).slice(0, 2).join(', ');
        return `Respuesta verificada (score ${score ?? 'N/A'}): ${answer.slice(0, 600)}${sources ? `. Fuentes: ${sources}` : ''}`;
      } catch (err) {
        return `Error consultando pipeline: ${err.message}`;
      }
    },
  });

  // ─── Cronómetro de la sesión ────────────────────────────────────
  useEffect(() => {
    if (status !== 'connected') return;
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  // ─── Auto-scroll transcripción ──────────────────────────────────
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript]);

  // ─── Iniciar conversación ───────────────────────────────────────
  const startConversation = useCallback(async () => {
    setError(null);
    setStatus('connecting');
    setTranscript([]);
    startTimeRef.current = null;
    setElapsed(0);

    try {
      // 1. Permiso de micrófono
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // 2. Pedir signed URL al backend
      const res = await base44.functions.invoke('elevenLabsAgentSignedUrl', {});
      const signedUrl = res.data?.signedUrl;
      if (!signedUrl) throw new Error('No se pudo obtener la signed URL del agente');

      // 3. Iniciar sesión con el SDK de ElevenLabs (con client tools)
      const conversation = await Conversation.startSession({
        signedUrl,
        clientTools: clientTools.current,
        onConnect: () => {
          setStatus('connected');
        },
        onDisconnect: () => {
          setStatus('idle');
          setAgentSpeaking(false);
        },
        onError: (err) => {
          console.error('Conversation error:', err);
          setError(typeof err === 'string' ? err : err?.message || 'Error de conexión');
          setStatus('error');
        },
        onModeChange: (mode) => {
          // mode: 'speaking' | 'listening'
          setAgentSpeaking(mode?.mode === 'speaking');
        },
        onMessage: (msg) => {
          // msg: { source: 'user' | 'ai', message: '...' }
          if (!msg?.message) return;
          setTranscript((t) => [
            ...t,
            {
              role: msg.source === 'ai' ? 'lya' : 'public',
              text: msg.message,
              ts: Date.now(),
            },
          ]);
        },
      });

      conversationRef.current = conversation;
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(
        err?.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Habilítalo y vuelve a intentar.'
          : err?.message || 'No pude conectar con Lya. Intenta de nuevo.'
      );
      setStatus('error');
    }
  }, []);

  const endConversation = useCallback(async () => {
    try {
      await conversationRef.current?.endSession();
    } catch (_) { /* noop */ }
    conversationRef.current = null;
    setStatus('idle');
    setAgentSpeaking(false);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!conversationRef.current) return;
    const newMuted = !muted;
    try {
      conversationRef.current.setMicMuted?.(newMuted);
    } catch (_) { /* noop */ }
    setMuted(newMuted);
  }, [muted]);

  const close = useCallback(async () => {
    await endConversation();
    setActive(false);
    setTranscript([]);
    setError(null);
  }, [endConversation]);

  // Cleanup al desmontar
  useEffect(() => () => {
    endConversation();
    if (metricTimeoutRef.current) clearTimeout(metricTimeoutRef.current);
  }, [endConversation]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // ─── FAB de activación · top-right ─────────────────────────────
  if (!active) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={() => {
          setActive(true);
          // Auto-iniciar la conversación al abrir el panel para evitar el doble click
          setTimeout(() => startConversation(), 200);
        }}
        aria-label="Activar a Lya en vivo"
        className="fixed top-20 right-4 sm:right-6 z-40 group inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-card border border-border shadow-soft-lg hover:shadow-mint hover:border-mint-300 transition-all"
      >
        <span className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 via-mint-500 to-mint-700 ring-2 ring-mint-200">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-40" />
          <span className="relative font-editorial text-white text-xl font-bold leading-none">L</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        </span>
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-700">
            Conversación bidireccional
          </span>
          <span className="text-sm font-bold text-foreground whitespace-nowrap">
            Activar a Lya en vivo
          </span>
        </div>
      </motion.button>
    );
  }

  // ─── Panel activo ──────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      role="dialog"
      aria-label="Lya conversacional en vivo"
      className="fixed top-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[440px] max-h-[calc(100vh-6rem)] flex flex-col rounded-[28px] overflow-hidden shadow-soft-lg backdrop-blur-xl bg-card/95 border border-border"
    >
      {/* === HEADER ESCENARIO === */}
      <div className="relative bg-gradient-to-br from-mint-600 via-mint-700 to-[hsl(152_85%_18%)] text-white px-5 pt-4 pb-6 overflow-hidden flex-shrink-0">
        <div aria-hidden className="absolute inset-0 opacity-10">
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white blur-2xl" />
          <div className="absolute -bottom-12 -left-8 w-32 h-32 rounded-full bg-mint-300 blur-2xl" />
        </div>

        <div className="relative flex items-center justify-between mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20">
            <Radio className="w-3 h-3 text-red-300" />
            {status === 'connected' ? (
              <>
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                  <span className="relative w-1.5 h-1.5 rounded-full bg-red-500" />
                </span>
                <span className="text-[10px] font-mono-editorial uppercase tracking-wider font-semibold">
                  EN VIVO · {formatTime(elapsed)}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-mono-editorial uppercase tracking-wider font-semibold">
                {status === 'connecting' ? 'Conectando…' : status === 'error' ? 'Error' : 'Desconectada'}
              </span>
            )}
          </div>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 inline-flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <StageScene speaking={agentSpeaking} />
        </div>

        {/* Slide actual narrando */}
        {currentSlide && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-3 flex items-center justify-center gap-1.5"
          >
            <span className="text-[9px] font-mono-editorial uppercase tracking-wider text-mint-200">
              Slide actual
            </span>
            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-white/20 backdrop-blur">
              {SLIDE_LABELS[currentSlide]}
            </span>
          </motion.div>
        )}

        {/* Estado en banner */}
        <div className="relative mt-3 flex items-center justify-center gap-2 text-[11px] text-mint-50/90">
          {status === 'connected' && agentSpeaking && (
            <>
              <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              Lya está hablando — puedes interrumpirla
            </>
          )}
          {status === 'connected' && !agentSpeaking && !muted && (
            <>
              <Mic className="w-3.5 h-3.5" />
              Lya escucha · habla tú o el público
            </>
          )}
          {status === 'connected' && muted && (
            <>
              <MicOff className="w-3.5 h-3.5 text-amber-300" />
              Micrófono silenciado
            </>
          )}
          {status === 'connecting' && (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Estableciendo conexión con ElevenLabs…
            </>
          )}
        </div>
      </div>

      {/* === TRANSCRIPCIÓN EN VIVO === */}
      <div
        ref={transcriptScrollRef}
        className="flex-1 min-h-[160px] max-h-[280px] sm:max-h-[340px] overflow-y-auto bg-card px-5 py-4 space-y-2.5"
      >
        {status === 'idle' && transcript.length === 0 && (
          <button
            onClick={startConversation}
            className="w-full text-center py-8 space-y-3 rounded-2xl hover:bg-mint-50/40 active:bg-mint-50 transition-colors group cursor-pointer"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-mint-50 border border-mint-200 group-hover:bg-mint-100 group-hover:scale-105 transition-all">
              <Phone className="w-6 h-6 text-mint-600" />
            </div>
            <h4 className="font-display font-bold text-foreground">
              Toca aquí para iniciar
            </h4>
            <p className="text-[12px] text-muted-foreground leading-relaxed max-w-[300px] mx-auto">
              Lya escuchará al jurado y a Paula en tiempo real, responderá con voz studio y esperará silencios naturales.
            </p>
          </button>
        )}

        {status === 'error' && error && (
          <div className="rounded-2xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-[12px] text-destructive">
            <p className="font-bold mb-1">No pudimos conectar</p>
            <p>{error}</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {transcript.map((t, i) => {
            // Acciones de Lya (navegación, queries) → tarjeta especial
            if (t.role === 'action') {
              const Icon = t.tool === 'navigateToSlide' ? Navigation
                : t.tool === 'openPage' ? ExternalLink
                : t.tool === 'highlightMetric' ? Zap
                : Search;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-center"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-600 text-white text-[11px] font-mono-editorial shadow-soft">
                    <Icon className="w-3 h-3" />
                    <span>{t.text}</span>
                  </div>
                </motion.div>
              );
            }
            // Mensajes normales (Lya o público)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${t.role === 'lya' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-relaxed shadow-soft border ${
                    t.role === 'lya'
                      ? 'bg-mint-50 border-mint-100 text-foreground rounded-tl-md'
                      : 'bg-secondary border-border text-foreground rounded-tr-md'
                  }`}
                >
                  <p className="text-[9px] font-mono-editorial uppercase tracking-wider mb-0.5 opacity-60">
                    {t.role === 'lya' ? 'Lya · IA' : 'Público / Paula'}
                  </p>
                  <p>{t.text}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {status === 'connected' && transcript.length === 0 && (
          <div className="text-center py-6 text-[12px] text-muted-foreground italic flex flex-col items-center gap-2">
            <Sparkles className="w-4 h-4 text-mint-500" />
            Lya conectada · esperando primera intervención
          </div>
        )}
      </div>

      {/* === CONTROLES === */}
      <div className="flex-shrink-0 bg-card border-t border-border px-5 py-3">
        {status === 'idle' || status === 'error' ? (
          <button
            onClick={startConversation}
            className="w-full h-12 rounded-full bg-mint-600 hover:bg-mint-700 text-white inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors shadow-mint"
          >
            <Phone className="w-4 h-4" />
            {status === 'error' ? 'Reintentar conexión' : 'Iniciar conversación con Lya'}
          </button>
        ) : status === 'connecting' ? (
          <button
            disabled
            className="w-full h-12 rounded-full bg-muted text-muted-foreground inline-flex items-center justify-center gap-2 text-sm font-bold cursor-wait"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Conectando…
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={muted ? 'Activar micrófono' : 'Silenciar micrófono'}
              className={`h-12 w-12 rounded-full inline-flex items-center justify-center transition-colors flex-shrink-0 border ${
                muted
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-secondary border-border text-foreground hover:bg-mint-50'
              }`}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={endConversation}
              className="flex-1 h-12 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground inline-flex items-center justify-center gap-2 text-sm font-bold transition-colors"
            >
              <PhoneOff className="w-4 h-4" />
              Finalizar conversación
            </button>
          </div>
        )}

        <p className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
          <MessageCircle className="w-3 h-3" />
          Lya es interrumpible · respeta silencios para que Paula intervenga
        </p>
      </div>
    </motion.div>
  );
}