import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, ArrowUpRight, Loader2, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import LyaShareWhatsApp from '@/components/lya/LyaShareWhatsApp';
import LyaTrustBadge from '@/components/lya/LyaTrustBadge';
import LyaGenerateDocButton from '@/components/lya/LyaGenerateDocButton';
import LyaVoiceControls from '@/components/lya/LyaVoiceControls';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';

/**
 * LyaChatWidget — widget de chat flotante global de Lya (FinLogic).
 * - Diseño UI/UX 2026: glassmorphism, gradiente mint, micro-animaciones spring,
 *   ícono "L" con halo animado, mensajes con burbujas y citas RAG.
 * - Backend: lyaKnowledgeQuery (Pinecone RAG + LLM).
 * - Acompaña todas las páginas excepto las de chat dedicado (/AsistenteLya, /Consulta, /Embed).
 * - Mobile: full-screen sheet · Desktop: popover 380px bottom-right.
 */

const SUGGESTIONS = [
  'Cobro no reconocido en mi tarjeta',
  'Quiero retractarme de una compra online',
  'Régimen tributario para mi pyme',
  'Mis derechos ARCO',
];

const HIDDEN_ROUTES = ['/AsistenteLya', '/Consulta', '/Embed', '/PitchDeck'];

export default function LyaChatWidget() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const sessionIdRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const voice = useLyaVoice();

  const shouldHide = HIDDEN_ROUTES.some((p) => location.pathname.startsWith(p));

  // Cerrar el widget al cambiar de ruta para no bloquear contenido
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Foco al abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [open]);

  // ESC cierra
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (shouldHide) return null;

  const sendQuery = async (text) => {
    const query = (text ?? input).trim();
    if (!query || loading) return;
    setInput('');
    setHasInteracted(true);
    const userMsg = { role: 'user', content: query, ts: Date.now() };
    // Snapshot del historial ANTES de añadir el mensaje nuevo (eso es el contexto previo)
    const priorHistory = messages.slice(-6).map((m) => ({
      role: m.role === 'lya' ? 'assistant' : 'user',
      content: m.content,
    }));
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const res = await base44.functions.invoke('lyaKnowledgeQuery', {
        query,
        mode: 'text',
        userProfile: 'general',
        history: priorHistory,
        sessionId: sessionIdRef.current || undefined,
      });
      const data = res.data || {};
      // Persistir sessionId para agrupar todos los turnos en /Transparencia
      if (data.sessionId && !sessionIdRef.current) {
        sessionIdRef.current = data.sessionId;
      }
      const lyaContent = data.response || 'No pude procesar tu consulta. Intenta nuevamente.';
      setMessages((m) => [
        ...m,
        {
          role: 'lya',
          content: lyaContent,
          sources: data.sources || [],
          confidence: data.confidence,
          verifierScore: data.verifierScore,
          hallucinationRisk: data.hallucinationRisk,
          regulatoryBody: data.regulatoryBody,
          suggestedAction: data.suggestedAction,
          ts: Date.now(),
        },
      ]);
      if (autoSpeak && voice.ttsSupported) voice.speak(lyaContent);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: 'lya',
          content: 'Hubo un problema técnico. Por favor intenta de nuevo en unos segundos.',
          error: true,
          ts: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendQuery();
  };

  return (
    <>
      {/* ─── FAB · Botón flotante (Apple-style premium) ──────────────── */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            onClick={() => setOpen(true)}
            aria-label="Abrir chat con Lya"
            style={{
              bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
              right: 'max(1rem, env(safe-area-inset-right))',
            }}
            className="fixed md:!bottom-6 md:!right-6 z-50 group outline-none"
          >
            {/* Halo de respiración (slow pulse) */}
            <motion.span
              aria-hidden
              animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.55, 0.35] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-mint-400/50 blur-xl"
            />

            {/* Anillo gradient sutil */}
            <span
              aria-hidden
              className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-mint-300 via-mint-500 to-mint-700 opacity-90 group-hover:opacity-100 transition-opacity"
              style={{
                boxShadow:
                  '0 8px 24px -4px hsl(var(--mint-600) / 0.45), 0 4px 12px -2px hsl(var(--mint-600) / 0.3)',
              }}
            />

            {/* Cuerpo del botón — círculo mint con avatar Lya */}
            <span className="relative flex items-center justify-center w-16 h-16 md:w-[72px] md:h-[72px] rounded-full bg-gradient-to-br from-mint-500 via-mint-600 to-mint-700 ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-[1.04] group-active:scale-95 overflow-hidden">
              {/* Brillo Apple-style superior */}
              <span
                aria-hidden
                className="absolute inset-x-3 top-1.5 h-3 rounded-full bg-white/35 blur-md"
              />

              {/* Avatar Lya: ondas sonoras (asistente IA conversacional) */}
              <svg
                viewBox="0 0 48 48"
                className="relative w-9 h-9 md:w-11 md:h-11 text-white"
                fill="none"
                aria-hidden
              >
                {/* Onda izquierda corta */}
                <rect x="9" y="20" width="3.5" height="8" rx="1.75" fill="currentColor" opacity="0.7">
                  <animate attributeName="height" values="8;14;8" dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="y" values="20;17;20" dur="1.4s" repeatCount="indefinite" />
                </rect>
                {/* Onda media-izquierda */}
                <rect x="16" y="15" width="3.5" height="18" rx="1.75" fill="currentColor" opacity="0.9">
                  <animate attributeName="height" values="18;26;18" dur="1.2s" repeatCount="indefinite" />
                  <animate attributeName="y" values="15;11;15" dur="1.2s" repeatCount="indefinite" />
                </rect>
                {/* Onda central alta */}
                <rect x="23" y="11" width="3.5" height="26" rx="1.75" fill="currentColor">
                  <animate attributeName="height" values="26;34;26" dur="1s" repeatCount="indefinite" />
                  <animate attributeName="y" values="11;7;11" dur="1s" repeatCount="indefinite" />
                </rect>
                {/* Onda media-derecha */}
                <rect x="30" y="15" width="3.5" height="18" rx="1.75" fill="currentColor" opacity="0.9">
                  <animate attributeName="height" values="18;24;18" dur="1.3s" repeatCount="indefinite" />
                  <animate attributeName="y" values="15;12;15" dur="1.3s" repeatCount="indefinite" />
                </rect>
                {/* Onda derecha corta */}
                <rect x="37" y="20" width="3.5" height="8" rx="1.75" fill="currentColor" opacity="0.7">
                  <animate attributeName="height" values="8;12;8" dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="y" values="20;18;20" dur="1.5s" repeatCount="indefinite" />
                </rect>
              </svg>

              {/* Dot online verde — anclado afuera del círculo */}
              <span
                aria-hidden
                className="absolute bottom-1 right-1 flex items-center justify-center"
              >
                <span className="absolute w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-60" />
                <span className="relative w-3 h-3 rounded-full bg-emerald-500 ring-[2.5px] ring-white" />
              </span>
            </span>

            {/* Pill "Pregunta a Lya" — solo primer load desktop */}
            {!hasInteracted && (
              <motion.span
                initial={{ opacity: 0, x: 12, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 20 }}
                className="hidden md:flex absolute right-[80px] top-1/2 -translate-y-1/2 items-center gap-2 pl-3 pr-4 py-2 rounded-full bg-foreground/95 backdrop-blur text-background text-[13px] font-semibold whitespace-nowrap shadow-soft-lg pointer-events-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-mint-300" />
                Pregunta a Lya
                {/* Triángulo apuntando al botón */}
                <span
                  aria-hidden
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-foreground/95"
                />
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Panel de chat ──────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop solo mobile */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="md:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40"
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.94 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              role="dialog"
              aria-label="Chat con Lya"
              style={{
                // Ancla el panel a la esquina inferior derecha (donde está el FAB)
                // tanto en mobile como en desktop, con safe-area en iOS.
                bottom: 'max(1rem, env(safe-area-inset-bottom))',
                right: 'max(0.75rem, env(safe-area-inset-right))',
                transformOrigin: 'bottom right',
              }}
              className="fixed z-50 bg-card border border-border shadow-soft-lg overflow-hidden flex flex-col
                         w-[calc(100vw-1.5rem)] max-w-[400px]
                         h-[min(85svh,640px)]
                         rounded-3xl
                         md:w-[400px] md:h-auto md:max-h-[min(640px,calc(100vh-6rem))]"
            >
              {/* Header */}
              <div className="relative px-4 md:px-5 py-3.5 bg-gradient-to-br from-mint-500 to-mint-700 text-white flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full bg-white/95 flex items-center justify-center shadow-inner overflow-hidden">
                  <svg viewBox="0 0 48 48" className="w-6 h-6 text-mint-700" fill="none" aria-hidden>
                    <rect x="9" y="20" width="3.5" height="8" rx="1.75" fill="currentColor" opacity="0.6" />
                    <rect x="16" y="15" width="3.5" height="18" rx="1.75" fill="currentColor" opacity="0.85" />
                    <rect x="23" y="11" width="3.5" height="26" rx="1.75" fill="currentColor" />
                    <rect x="30" y="15" width="3.5" height="18" rx="1.75" fill="currentColor" opacity="0.85" />
                    <rect x="37" y="20" width="3.5" height="8" rx="1.75" fill="currentColor" opacity="0.6" />
                  </svg>
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-mint-300 ring-2 ring-mint-600 animate-pulse-soft" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">Lya</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-mint-100" />
                  </div>
                  <p className="text-[11px] text-mint-50/90 leading-tight">
                    Asistente legal IA · FinLogic
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar chat"
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 inline-flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body messages */}
              <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 md:px-5 py-4 space-y-3.5 bg-background/50"
              >
                {messages.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <div className="rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3 text-sm text-foreground/90 leading-relaxed shadow-soft">
                      Hola, soy <strong>Lya</strong> 👋 Te ayudo a entender tus derechos
                      financieros y normativa chilena. ¿Qué te pasó?
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => sendQuery(s)}
                          className="text-xs px-3 py-1.5 rounded-full bg-mint-50 text-mint-700 border border-mint-200 hover:bg-mint-100 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {messages.map((m, i) => {
                  // El último mensaje del usuario es el que produjo la respuesta más reciente de Lya.
                  const lastUserBefore = messages.slice(0, i).reverse().find((x) => x.role === 'user');
                  // ¿Es la última respuesta de Lya? → mostrar botón de generar doc
                  const isLastLya =
                    m.role === 'lya' &&
                    !m.error &&
                    i === messages.length - 1;
                  return (
                    <ChatBubble
                      key={i}
                      message={m}
                      userQuery={lastUserBefore?.content}
                      historyForDoc={isLastLya ? messages.map((mm) => ({
                        role: mm.role === 'lya' ? 'assistant' : 'user',
                        content: mm.content,
                      })) : null}
                    />
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Lya está consultando la normativa...
                  </div>
                )}
              </div>

              {/* Footer · Input + CTA full-page */}
              <div className="border-t border-border bg-card px-3 md:px-4 py-3 space-y-2">
                <LyaVoiceControls
                  sttSupported={voice.sttSupported}
                  ttsSupported={voice.ttsSupported}
                  listening={voice.listening}
                  speaking={voice.speaking}
                  autoSpeak={autoSpeak}
                  voiceName={voice.voiceName}
                  interim={voice.interim}
                  disabled={loading}
                  onToggleAutoSpeak={() => setAutoSpeak((v) => !v)}
                  onStopSpeaking={voice.stopSpeaking}
                  onStopListening={voice.stopListening}
                  onStartListening={() => {
                    if (!autoSpeak) setAutoSpeak(true);
                    voice.startListening((finalText) => sendQuery(finalText));
                  }}
                />
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu consulta..."
                    disabled={loading}
                    className="flex-1 h-11 px-4 rounded-full bg-muted/60 border border-transparent focus:border-mint-400 focus:bg-card outline-none text-sm transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    aria-label="Enviar"
                    className="flex-shrink-0 w-11 h-11 rounded-full bg-mint-600 hover:bg-mint-700 text-white inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-soft"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <Link
                  to="/AsistenteLya"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-mint-700 transition-colors"
                >
                  Abrir conversación completa
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────
function ChatBubble({ message, userQuery, historyForDoc }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <div translate="no" className="notranslate max-w-[82%] rounded-2xl rounded-tr-md bg-mint-600 text-white px-4 py-2.5 text-sm shadow-soft break-words [overflow-wrap:anywhere]">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-2 max-w-[92%] min-w-0"
    >
      <div
        translate="no"
        className={`notranslate rounded-2xl rounded-tl-md px-4 py-3 text-sm leading-relaxed shadow-soft border break-words [overflow-wrap:anywhere] ${
          message.error
            ? 'bg-destructive/5 border-destructive/20 text-destructive'
            : 'bg-card border-border text-foreground/90'
        }`}
      >
        {message.error ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-2.5 last:mb-0 text-foreground/90">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground block mt-3 first:mt-0 text-[13px]">
                  {children}
                </strong>
              ),
              ul: ({ children }) => (
                <ul className="my-2 space-y-1.5 pl-0 list-none">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="my-2 space-y-1.5 pl-0 list-none counter-reset-[step]">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="flex gap-2 text-foreground/85">
                  <span className="text-mint-600 font-bold leading-relaxed flex-shrink-0">·</span>
                  <span className="flex-1">{children}</span>
                </li>
              ),
              em: ({ children }) => (
                <em className="not-italic text-[11px] font-mono-editorial text-mint-700 inline-block mt-2 px-2 py-0.5 rounded-full bg-mint-50 border border-mint-100">
                  {children}
                </em>
              ),
              a: ({ children, href }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mint-700 underline underline-offset-2 hover:text-mint-800"
                >
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-mint-50 text-mint-700 text-[12px] font-mono-editorial">
                  {children}
                </code>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {/* Trust badge (verificador anti-alucinación) + Sources (RAG) */}
      {(typeof message.verifierScore === 'number' || (message.sources && message.sources.length > 0)) && (
        <div className="flex flex-wrap gap-1.5 pl-1 max-w-full items-center">
          <LyaTrustBadge
            verifierScore={message.verifierScore}
            hallucinationRisk={message.hallucinationRisk}
          />
          {message.sources && message.sources.slice(0, 2).map((src, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded-full bg-mint-50 text-mint-700 border border-mint-200 font-mono-editorial max-w-full truncate"
            >
              {src.length > 42 ? `${src.substring(0, 42)}…` : src}
            </span>
          ))}
        </div>
      )}

      {/* Compartir respuesta por WhatsApp (viralidad ciudadana §SocialMedia) */}
      {!message.error && message.content && userQuery && (
        <LyaShareWhatsApp
          query={userQuery}
          response={message.content}
          sources={message.sources || []}
        />
      )}

      {/* Generar documento PDF firmable (solo en última respuesta de Lya) */}
      {historyForDoc && <LyaGenerateDocButton history={historyForDoc} />}

      {/* Suggested action */}
      {message.suggestedAction && (
        <Link
          to="/Consulta"
          className="self-start inline-flex items-center gap-1.5 text-[11px] text-mint-700 hover:text-mint-800 font-medium px-2.5 py-1 rounded-full bg-mint-50 border border-mint-200 transition-colors max-w-full"
        >
          <Sparkles className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {message.suggestedAction.length > 60
              ? `${message.suggestedAction.substring(0, 60)}…`
              : message.suggestedAction}
          </span>
        </Link>
      )}
    </motion.div>
  );
}