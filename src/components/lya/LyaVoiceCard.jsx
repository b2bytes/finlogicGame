import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, X, Loader2, Sparkles, Maximize2, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import LyaVoiceWaves from './LyaVoiceWaves';
import LyaCyberAvatar from './LyaCyberAvatar';
import LyaConversationModal from './LyaConversationModal';
import { useLyaPersistent } from '@/lib/LyaPersistentContext.jsx';
import { useAuth } from '@/lib/AuthContext';
import {
  LYA_PAGES,
  LYA_SLIDES,
  scrollToElement,
  scrollToPosition,
  scrollToText,
  navigateToPath,
  goBackHistory,
  goForwardHistory,
  reloadPage,
  fillField,
  clickByLyaAction,
  clickByText,
  triggerLyaToast,
  openLyaChat,
  describeCurrentPage,
  listInteractiveElements,
} from '@/lib/lyaNavigationTools';

/**
 * LyaVoiceCard — Card flotante de voz con Lya estética glassmorphism dark.
 * Estética cibernética femenina: avatar SVG, ondas sonoras, mic central.
 *
 * Props:
 *  - position: 'bottom-right' (default) · 'bottom-left' · 'top-right'
 *  - stackOffset: px adicionales del bottom (para apilarse encima del LyaChatWidget)
 *  - pitchMode: bool — habilita modo pitch (slides labels en UI)
 */

const SLIDE_LABEL_MAP = LYA_SLIDES.reduce((acc, s) => {
  acc[s.id] = s.label;
  return acc;
}, {});

export default function LyaVoiceCard({
  pitchMode = false,
  position = 'bottom-right',
  stackOffset = 0,
}) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // modal expandido tipo chat
  const [currentSlide, setCurrentSlide] = useState(null);
  const [actionLabel, setActionLabel] = useState(null); // breve confirmación visual
  const actionTimeoutRef = useRef(null);

  // ─── Estado y control desde el Provider persistente ──────────
  const {
    status,
    agentSpeaking,
    muted,
    error,
    lastMessage,
    history,
    pushHistory,
    startConversation,
    endConversation,
    toggleMute,
    registerTools,
  } = useLyaPersistent();

  // Email del usuario (si está logueado) para pre-llenar envío de docs
  const auth = useAuth();
  const userEmail = auth?.user?.email || '';

  const showAction = useCallback((label) => {
    setActionLabel(label);
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
    actionTimeoutRef.current = setTimeout(() => setActionLabel(null), 3000);
  }, []);

  // ─── Tools que el agente ejecuta en vivo ──────────────────────
  // Disponibles SIEMPRE (no solo en pitchMode): Lya navega cualquier página
  // y hace scroll a cualquier sección de la app.
  const clientToolsObj = {
    // Navegar a CUALQUIER página de la plataforma — sin lista cerrada.
    // Acepta paths absolutos (/Pricing), relativos (Pricing), con hash (/#stats)
    // o URLs externas (https://…). El sistema NUNCA bloquea por path desconocido.
    navigateToPage: ({ path, openInNewTab = false, reason }) => {
      if (!path) return 'Falta el parámetro "path"';
      navigateToPath(path, openInNewTab);
      const pageName = LYA_PAGES.find((p) => p.path === path)?.name || path;
      showAction(`→ ${pageName}`);
      return `Navegando a ${pageName}${reason ? ` para ${reason}` : ''}`;
    },

    // Scroll suave a un elemento por id, selector CSS o por TEXTO VISIBLE.
    // Si "target" no calza como selector, intenta buscar por texto del DOM.
    scrollToSection: ({ target, reason }) => {
      let ok = scrollToElement(target);
      if (!ok) ok = scrollToText(target);
      if (ok) {
        showAction(`↓ ${target}`);
        return `OK, scroll a "${target}"${reason ? ` (${reason})` : ''}`;
      }
      return `No encontré "${target}" en esta página. Prueba con texto visible exacto o un id.`;
    },

    // Scroll a posición vertical (top, bottom, número)
    scrollToPosition: ({ position: pos }) => {
      const ok = scrollToPosition(pos);
      if (ok) {
        showAction(pos === 'top' ? '↑ Inicio' : pos === 'bottom' ? '↓ Final' : `↕ ${pos}px`);
        return `Scroll a ${pos}`;
      }
      return `Posición ${pos} inválida`;
    },

    // Navegar a un slide del pitch (solo aplica en /PitchDeck)
    navigateToSlide: ({ slideId }) => {
      const ok = scrollToElement(slideId);
      if (ok) {
        setCurrentSlide(slideId);
        showAction(`▶ ${SLIDE_LABEL_MAP[slideId] || slideId}`);
        return `OK, mostrando ${SLIDE_LABEL_MAP[slideId] || slideId}`;
      }
      return `Slide ${slideId} no encontrado (¿estás en /PitchDeck?)`;
    },

    // Resaltar una métrica clave (visual feedback)
    highlightMetric: ({ metric }) => {
      showAction(`★ ${metric}`);
      return `Métrica ${metric} resaltada`;
    },

    // Consultar pipeline IA real (RAG + Pinecone) para responder con datos verificados
    queryFinLogic: async ({ question }) => {
      showAction('🔎 Consultando pipeline IA…');
      try {
        const res = await base44.functions.invoke('lyaKnowledgeQuery', {
          query: question,
          mode: 'voice',
          userProfile: 'general',
        });
        const data = res.data || {};
        const answer = data.response || 'Sin respuesta verificada';
        const score = data.verifierScore || data.confidence || null;
        const sources = (data.sources || []).slice(0, 2).join(', ');
        return `Respuesta verificada (score ${score ?? 'N/A'}/100): ${answer.slice(0, 600)}${sources ? `. Fuentes: ${sources}` : ''}`;
      } catch (err) {
        return `Error consultando pipeline: ${err.message}`;
      }
    },

    // ─── Fase 1 · Tools nuevas ─────────────────────────────────────
    // Abrir el chat widget global, opcionalmente pre-llenar consulta
    openLyaChat: ({ prefilledQuery }) => {
      openLyaChat(prefilledQuery);
      showAction(prefilledQuery ? '💬 Chat abierto con consulta' : '💬 Chat abierto');
      return prefilledQuery
        ? `Chat abierto con consulta: "${prefilledQuery.slice(0, 80)}"`
        : 'Chat abierto, listo para escribir';
    },

    // Llenar un campo de formulario en la página actual
    fillFormField: ({ fieldName, value }) => {
      const ok = fillField(fieldName, value);
      if (ok) {
        showAction(`✏️ ${fieldName}`);
        return `Campo "${fieldName}" rellenado`;
      }
      return `No encontré el campo "${fieldName}" en esta página`;
    },

    // Click sobre un botón: primero por data-lya-action/id, luego por texto visible.
    clickButton: ({ target, reason }) => {
      let ok = clickByLyaAction(target);
      if (!ok) ok = clickByText(target);
      if (ok) {
        showAction(`👆 ${target}`);
        return `Click ejecutado en "${target}"${reason ? ` (${reason})` : ''}`;
      }
      return `No encontré el botón "${target}" en esta página`;
    },

    // ─── Navegación de historial ───────────────────────────────────
    goBack: () => { goBackHistory(); showAction('← Atrás'); return 'Volviendo a la página anterior'; },
    goForward: () => { goForwardHistory(); showAction('→ Adelante'); return 'Avanzando en el historial'; },
    reloadPage: () => { showAction('↻ Recargando'); reloadPage(); return 'Página recargada'; },

    // ─── Inspección de la página actual ───────────────────────────
    // Le dice a Lya qué tiene delante para que decida sin adivinar.
    describeCurrentPage: () => {
      const info = describeCurrentPage();
      return `Página actual: ${info.path} ("${info.h1 || info.title}"). Secciones: ${info.headings.join(' · ') || 'sin h2/h3'}. Anclas disponibles: ${info.anchors.join(', ') || 'ninguna'}.`;
    },

    // Lista los botones y links visibles para que Lya pueda hacer click certero.
    listInteractiveElements: ({ limit = 15 } = {}) => {
      const items = listInteractiveElements(limit);
      if (items.length === 0) return 'No hay elementos interactivos visibles';
      return items.map((it) => {
        const tag = it.kind === 'link' ? `[link "${it.label}"${it.href ? ` → ${it.href}` : ''}]`
                                       : `[button "${it.label}"${it.action ? ` action=${it.action}` : ''}]`;
        return tag;
      }).join('\n');
    },

    // Mostrar toast visual (notificación elegante)
    showToast: ({ message, variant = 'lya' }) => {
      triggerLyaToast(message, variant);
      return `Toast mostrado: ${message}`;
    },

    // ─── Generación de documentos profesionales ──────────────────
    // Lya genera cotizaciones, cartas, correos formales, denuncias, etc.,
    // los inserta como tarjeta en el chat con botones DESCARGAR PDF y ENVIAR POR CORREO.
    generateDocument: async ({ documentType, addressedTo }) => {
      // Aseguramos modal de chat abierto para que el usuario vea la tarjeta
      setChatOpen(true);
      showAction('📄 Generando documento…');
      try {
        // Convertimos historial actual al formato que espera el endpoint
        const chatHistory = (history || []).map((m) => ({
          role: m.role === 'lya' ? 'assistant' : 'user',
          content: m.text || '',
        }));
        if (chatHistory.length === 0) {
          return 'Necesito que primero conversemos sobre el documento que quieres. Cuéntame los detalles y luego lo genero.';
        }
        const res = await base44.functions.invoke('lyaGenerateDocFromChat', {
          history: chatHistory,
          documentType,
          addressedTo,
        });
        const data = res.data || {};
        if (!data.success) {
          return `No pude generar el documento: ${data.error || 'razón desconocida'}`;
        }
        // Insertamos en el historial un turno de Lya con la tarjeta del doc adjunta
        pushHistory({
          role: 'lya',
          text: `Listo. Generé tu ${data.documentType.replace('_', ' ')}. Puedes descargarlo o enviármelo por correo desde la tarjeta.`,
          doc: {
            title: data.title,
            content: data.content,
            addressedTo: data.addressedTo,
            legalBasis: data.legalBasis,
            documentType: data.documentType,
          },
        });
        showAction(`✓ ${data.title}`);
        return `Documento "${data.title}" generado correctamente. El usuario lo verá en su chat con botones para descargar PDF o enviar por correo.`;
      } catch (e) {
        return `Error generando documento: ${e.message}`;
      }
    },

    // Enviar el último documento generado al correo indicado.
    sendDocumentByEmail: async ({ to, subject }) => {
      // Buscamos el último mensaje con doc en el historial
      const lastDocMsg = [...(history || [])].reverse().find((m) => m.doc);
      if (!lastDocMsg?.doc) {
        return 'No hay documento generado aún. Primero usa generateDocument.';
      }
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return 'Necesito un correo válido para enviar el documento.';
      }
      showAction(`📧 Enviando a ${to}…`);
      try {
        await base44.functions.invoke('lyaSendDocByEmail', {
          to,
          subject,
          title: lastDocMsg.doc.title,
          content: lastDocMsg.doc.content,
          addressedTo: lastDocMsg.doc.addressedTo,
          legalBasis: lastDocMsg.doc.legalBasis,
          documentType: lastDocMsg.doc.documentType,
        });
        showAction(`✓ Enviado a ${to}`);
        return `Documento "${lastDocMsg.doc.title}" enviado a ${to}.`;
      } catch (e) {
        return `Error enviando correo: ${e.message}`;
      }
    },

    // Abrir el modal de conversación tipo chat (donde se ve historial completo)
    openConversationModal: () => {
      setChatOpen(true);
      showAction('💬 Chat abierto');
      return 'Modal de conversación abierto, el usuario puede ver el historial completo.';
    },

    // ─── Búsqueda inteligente de páginas vía Pinecone ─────────────
    // Lya descubre dinámicamente qué página visitar dado un query
    // en lenguaje natural ("muéstrame al equipo", "dónde está el pricing").
    searchPlatformKnowledge: async ({ query, segment, audience }) => {
      try {
        const res = await base44.functions.invoke('searchPlatformKnowledge', {
          query, topK: 4, segment, audience,
        });
        const results = res.data?.results || [];
        if (results.length === 0) {
          return `No encontré páginas relevantes para "${query}". Páginas disponibles: ${LYA_PAGES.map(p => p.name).join(', ')}`;
        }
        const top = results[0];
        return `Mejor match: "${top.name}" (ruta ${top.path}, score ${top.score}). ${top.summary}. Otras opciones: ${results.slice(1, 3).map(r => `${r.name} (${r.path})`).join(', ')}`;
      } catch (e) {
        return `Error en búsqueda: ${e.message}`;
      }
    },
  };

  // Registra las tools en el Provider persistente para que sobrevivan
  // a navegaciones SPA y queden disponibles SIEMPRE para Lya.
  useEffect(() => {
    registerTools(clientToolsObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerTools]);

  const close = useCallback(async () => {
    await endConversation();
    setOpen(false);
  }, [endConversation]);

  useEffect(() => () => {
    if (actionTimeoutRef.current) clearTimeout(actionTimeoutRef.current);
  }, []);

  // Si Lya ya está conectada (sobrevivió una navegación), abrimos el card auto.
  useEffect(() => {
    if (status === 'connected' && !open) setOpen(true);
  }, [status, open]);

  // ─── Posicionamiento + apilado ────────────────────────────────
  const baseStyle = (() => {
    const safeBottom = `max(1.25rem, env(safe-area-inset-bottom))`;
    const safeRight = `max(1rem, env(safe-area-inset-right))`;
    const safeLeft = `max(1rem, env(safe-area-inset-left))`;
    if (position === 'top-right') {
      return { top: '5rem', right: safeRight };
    }
    if (position === 'bottom-left') {
      return { bottom: `calc(${safeBottom} + ${stackOffset}px)`, left: safeLeft };
    }
    return { bottom: `calc(${safeBottom} + ${stackOffset}px)`, right: safeRight };
  })();

  const transformOrigin =
    position === 'top-right' ? 'top right'
    : position === 'bottom-left' ? 'bottom left'
    : 'bottom right';

  const listening = status === 'connected' && !muted && !agentSpeaking;

  // ─── FAB cerrado ──────────────────────────────────────────────
  if (!open) {
    return (
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 320, damping: 22 }}
        onClick={() => {
          setOpen(true);
          setTimeout(() => startConversation(clientToolsObj), 200);
        }}
        aria-label="Hablar con Lya"
        style={baseStyle}
        className="fixed z-40 group inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-soft-lg hover:border-mint-300/40 hover:shadow-mint transition-all"
      >
        <span className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-mint-400/30 to-mint-700/30 ring-1 ring-mint-300/30 overflow-hidden">
          <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-25" />
          <LyaCyberAvatar size={32} />
        </span>
        <span className="text-[11px] font-bold text-white whitespace-nowrap tracking-tight">
          Hablar con Lya
        </span>
      </motion.button>
    );
  }

  // ─── Card abierta ─────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      role="dialog"
      aria-label="Lya voz"
      style={{ ...baseStyle, transformOrigin }}
      className="fixed z-50 w-[280px] sm:w-[300px] rounded-[26px] overflow-visible"
    >
      {/* Glow exterior aurora */}
      <div aria-hidden className="absolute -inset-6 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/25 via-mint-400/20 to-cyan-400/25 blur-2xl rounded-full" />
      </div>

      {/* Card · vidrio oscuro */}
      <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-[26px] p-3.5 shadow-2xl">
        {/* Header con avatar + cerrar */}
        <div className="flex items-start gap-2.5 mb-2">
          <LyaCyberAvatar size={44} speaking={agentSpeaking} listening={listening} />
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5">
              <p className="text-[12px] font-bold text-white leading-none">Lya</p>
              <span className="text-[8px] font-mono uppercase tracking-wider text-mint-300/90 px-1.5 py-0.5 rounded-full bg-mint-500/15 border border-mint-400/20">
                IA legal
              </span>
            </div>
            <p className="text-[10px] text-white/55 mt-0.5 leading-tight">
              {status === 'connected' && agentSpeaking ? 'Hablando…'
                : status === 'connected' && muted ? 'Mic silenciado'
                : status === 'connected' ? 'Escuchando'
                : status === 'connecting' ? 'Conectando…'
                : 'Toca el mic para hablar'}
            </p>
          </div>
          <button
            onClick={() => setChatOpen(true)}
            aria-label="Abrir chat completo"
            title="Ver conversación completa"
            className="w-7 h-7 rounded-full bg-mint-500/20 hover:bg-mint-500/30 inline-flex items-center justify-center text-mint-200 hover:text-white transition-colors flex-shrink-0 border border-mint-400/30"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={close}
            aria-label="Cerrar"
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 inline-flex items-center justify-center text-white/80 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Texto: último mensaje, error o estado */}
        <div className="min-h-[60px] mb-1">
          {status === 'error' && error ? (
            <p className="text-[12px] text-red-300 leading-snug">
              <span className="font-bold">Error:</span> {error}
            </p>
          ) : status === 'connecting' ? (
            <p className="text-[12px] text-white/70 leading-snug flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Conectando con Lya…
            </p>
          ) : lastMessage ? (
            <div>
              <p className="text-[8px] font-mono uppercase tracking-wider text-mint-300/80 mb-0.5">
                {lastMessage.role === 'lya' ? 'Lya' : 'Tú'}
              </p>
              <p className="text-[12px] text-white/95 leading-snug line-clamp-3">
                {lastMessage.text.length > 130
                  ? lastMessage.text.slice(0, 130) + '…'
                  : lastMessage.text}
              </p>
            </div>
          ) : (
            <p className="text-[12px] text-white/85 leading-snug">
              Hola, soy <span className="text-mint-300 font-semibold">Lya</span>. Pregúntame por{' '}
              <span className="text-mint-300 italic">tus derechos</span> o pídeme navegar la plataforma.
            </p>
          )}

          {/* Etiqueta breve de acción ejecutada */}
          {actionLabel && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mt-1.5 text-[9px] font-mono text-mint-200 px-2 py-0.5 rounded-full bg-mint-500/15 border border-mint-400/20"
            >
              {actionLabel}
            </motion.span>
          )}

          {pitchMode && currentSlide && (
            <span className="inline-block mt-1.5 ml-1 text-[9px] font-mono uppercase tracking-wider text-mint-300 px-2 py-0.5 rounded-full bg-mint-500/15 border border-mint-400/20">
              {SLIDE_LABEL_MAP[currentSlide]}
            </span>
          )}
        </div>

        {/* Ondas sonoras */}
        <div className="my-1 -mx-1">
          <LyaVoiceWaves active={status === 'connected' && (agentSpeaking || !muted)} />
        </div>

        {/* Controles */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {status === 'connected' ? (
            <>
              <button
                onClick={toggleMute}
                aria-label={muted ? 'Activar mic' : 'Silenciar'}
                className={`w-10 h-10 rounded-full inline-flex items-center justify-center transition-all border ${
                  muted
                    ? 'bg-amber-500/20 border-amber-400/40 text-amber-200 hover:bg-amber-500/30'
                    : 'bg-white/95 border-white/20 text-slate-900 hover:bg-white shadow-lg'
                }`}
              >
                {muted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setChatOpen(true)}
                aria-label="Ver chat"
                title="Ver chat completo y documentos"
                className="relative w-10 h-10 rounded-full bg-mint-500/25 hover:bg-mint-500/40 border border-mint-400/40 text-mint-100 inline-flex items-center justify-center transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {history && history.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-mint-400 text-slate-900 text-[9px] font-bold inline-flex items-center justify-center">
                    {history.length}
                  </span>
                )}
              </button>
              <button
                onClick={endConversation}
                className="px-3.5 h-10 rounded-full bg-red-500/90 hover:bg-red-500 text-white text-[11px] font-bold transition-colors shadow-lg"
              >
                Finalizar
              </button>
            </>
          ) : status === 'connecting' ? (
            <button
              disabled
              className="w-10 h-10 rounded-full bg-white/10 text-white/40 inline-flex items-center justify-center cursor-wait"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </button>
          ) : (
            <button
              onClick={() => startConversation(clientToolsObj)}
              aria-label="Iniciar conversación"
              className="relative w-11 h-11 rounded-full bg-white inline-flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            >
              <span className="absolute inset-0 rounded-full bg-mint-400 animate-ping opacity-30" />
              <Mic className="relative w-4 h-4 text-slate-900" />
            </button>
          )}
        </div>

        {/* Footer minimal */}
        {status === 'connected' && agentSpeaking && (
          <div className="mt-2 flex items-center justify-center gap-1 text-[8px] text-mint-300/80 font-mono uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5" />
            En vivo · interrumpible
          </div>
        )}
      </div>

      {/* Modal expandido tipo chat con historial completo + documentos */}
      <LyaConversationModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        history={history}
        status={status}
        agentSpeaking={agentSpeaking}
        muted={muted}
        error={error}
        onToggleMute={toggleMute}
        onEnd={endConversation}
        onStart={() => startConversation(clientToolsObj)}
        userEmail={userEmail}
      />
    </motion.div>
  );
}