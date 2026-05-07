import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Mic, MicOff, Loader2, MessageSquare } from 'lucide-react';
import LyaCyberAvatar from './LyaCyberAvatar';
import LyaDocumentCard from './LyaDocumentCard';
import LyaSuggestionChips from './LyaSuggestionChips';

/**
 * LyaConversationModal — Modal de conversación tipo chat completo con Lya.
 * Muestra el HISTORIAL completo de la sesión de voz, mensajes apilados,
 * tarjetas de documentos generados con descarga PDF y envío por correo.
 *
 * Diseñado para usuarios mayores (Don Luis 68): tipografía 14-15px base,
 * burbujas amplias, contraste alto, áreas táctiles ≥48px.
 *
 * Props:
 *  - open, onClose
 *  - history: array de { id, role: 'lya'|'user', text, ts, doc? }
 *  - status, agentSpeaking, muted, error
 *  - onToggleMute, onEnd, onStart
 *  - userEmail?: string — pre-llena envío por correo si está logueado
 */
export default function LyaConversationModal({
  open,
  onClose,
  history = [],
  status,
  agentSpeaking,
  muted,
  error,
  onToggleMute,
  onEnd,
  onStart,
  userEmail = '',
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const listening = status === 'connected' && !muted && !agentSpeaking;
  const connected = status === 'connected';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm z-[60]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            role="dialog"
            aria-label="Conversación con Lya"
            style={{
              bottom: 'max(1rem, env(safe-area-inset-bottom))',
              right: 'max(1rem, env(safe-area-inset-right))',
            }}
            className="fixed z-[61] w-[calc(100vw-1.5rem)] max-w-[440px] h-[min(86svh,720px)] md:w-[440px] bg-card border border-border rounded-3xl shadow-soft-lg overflow-hidden flex flex-col"
          >
            {/* Header glass dark */}
            <div className="relative flex-shrink-0 px-4 py-3 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white">
              <div className="flex items-center gap-3">
                <LyaCyberAvatar size={44} speaking={agentSpeaking} listening={listening} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-bold leading-none">Lya</p>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-mint-300/95 px-1.5 py-0.5 rounded-full bg-mint-500/15 border border-mint-400/25">
                      IA legal
                    </span>
                  </div>
                  <p className="text-[11px] text-white/65 mt-0.5 leading-tight">
                    {agentSpeaking ? 'Hablando…' :
                     muted && connected ? 'Mic silenciado' :
                     connected ? 'Escuchando' :
                     status === 'connecting' ? 'Conectando…' :
                     'Toca el mic para hablar'}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center text-white/85 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-4 space-y-3 bg-background/60"
            >
              {history.length === 0 && status !== 'connecting' && (
                <div className="text-center py-10 px-4">
                  <div className="w-14 h-14 rounded-full bg-mint-50 border border-mint-200 mx-auto mb-3 inline-flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-mint-600" />
                  </div>
                  <p className="text-[15px] text-foreground/85 font-medium leading-snug">
                    Hola, soy <span className="text-mint-700 font-bold">Lya</span>.
                  </p>
                  <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                    Pídeme una <strong>cotización</strong>, una <strong>carta</strong>,
                    un <strong>correo formal</strong> o consultas sobre tus derechos.
                    Te lo entrego aquí mismo, listo para descargar o enviar.
                  </p>
                </div>
              )}

              {status === 'connecting' && (
                <div className="flex items-center justify-center gap-2 py-6 text-[13px] text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando con Lya…
                </div>
              )}

              {error && status === 'error' && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-3.5 py-2.5 text-[13px] text-destructive">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {history.map((m, idx) => (
                <ChatTurn
                  key={m.id}
                  message={m}
                  userEmail={userEmail}
                  isLastLyaTurn={
                    m.role === 'lya' &&
                    !history.slice(idx + 1).some((next) => next.role === 'lya')
                  }
                  onSuggestionNavigate={onClose}
                />
              ))}
            </div>

            {/* Footer · controles de voz grandes */}
            <div className="flex-shrink-0 border-t border-border bg-card px-4 py-3">
              <div className="flex items-center justify-center gap-2.5">
                {connected ? (
                  <>
                    <button
                      onClick={onToggleMute}
                      aria-label={muted ? 'Activar mic' : 'Silenciar'}
                      className={`min-w-[52px] min-h-[52px] rounded-full inline-flex items-center justify-center transition-all border-2 ${
                        muted
                          ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-mint-400 shadow-soft'
                      }`}
                    >
                      {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={onEnd}
                      className="flex-1 min-h-[52px] px-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-[14px] font-bold transition-colors shadow-soft"
                    >
                      Finalizar conversación
                    </button>
                  </>
                ) : status === 'connecting' ? (
                  <button disabled className="w-full min-h-[52px] rounded-full bg-muted text-muted-foreground inline-flex items-center justify-center cursor-wait text-[14px] font-semibold">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Conectando…
                  </button>
                ) : (
                  <button
                    onClick={onStart}
                    aria-label="Iniciar conversación"
                    className="w-full min-h-[52px] rounded-full bg-mint-600 hover:bg-mint-700 text-white text-[15px] font-bold inline-flex items-center justify-center gap-2 shadow-soft transition-colors"
                  >
                    <Mic className="w-5 h-5" /> Hablar con Lya
                  </button>
                )}
              </div>
              {connected && agentSpeaking && (
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-mint-700 font-mono uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" /> En vivo · interrumpible
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Burbuja individual: mensaje + tarjeta de doc adjunta opcional + chips
// contextuales (solo en el último turno de Lya, para no saturar el chat).
function ChatTurn({ message, userEmail, isLastLyaTurn, onSuggestionNavigate }) {
  const isUser = message.role === 'user';

  return (
    <div className="space-y-2">
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-soft break-words [overflow-wrap:anywhere] ${
              isUser
                ? 'bg-mint-600 text-white rounded-tr-md'
                : 'bg-card border border-border text-foreground/95 rounded-tl-md'
            }`}
          >
            {!isUser && (
              <p className="text-[10px] font-mono uppercase tracking-wider text-mint-700 mb-1 leading-none">
                Lya
              </p>
            )}
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Si el turno trae documento, mostrar tarjeta brandeada */}
      {message.doc && (
        <div className="pl-1 pr-1">
          <LyaDocumentCard doc={message.doc} defaultEmail={userEmail} />
        </div>
      )}

      {/* Chips contextuales: solo en el último turno de Lya, sobre lo que dijo */}
      {!isUser && isLastLyaTurn && message.text && (
        <LyaSuggestionChips
          text={message.text}
          onNavigate={onSuggestionNavigate}
          currentPath={typeof window !== 'undefined' ? window.location.pathname : null}
        />
      )}
    </div>
  );
}