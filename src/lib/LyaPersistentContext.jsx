import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Conversation } from '@elevenlabs/client';
import { base44 } from '@/api/base44Client';

/**
 * LyaPersistentContext — Mantiene la sesión de voz de Lya VIVA entre rutas.
 *
 * Problema que resuelve: el LyaVoiceCard vive dentro de App.jsx pero al navegar
 * (pushState SPA) algunos componentes del shell se re-renderizaban y la
 * Conversation de ElevenLabs se perdía. Al usar useRef dentro de un Provider
 * montado UNA SOLA VEZ en el root, la conexión sobrevive a navegaciones.
 *
 * Expone:
 *   - status: 'idle' | 'connecting' | 'connected' | 'error'
 *   - agentSpeaking, muted, error, lastMessage
 *   - startConversation(clientTools) → conecta con tools del consumidor
 *   - endConversation()
 *   - toggleMute()
 *   - registerTools(tools) → permite a una página agregar tools temporales
 */

const LyaPersistentCtx = createContext(null);

export function LyaPersistentProvider({ children }) {
  const [status, setStatus] = useState('idle');
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  // Historial completo de la conversación para visualizarla tipo chat.
  // Cada item: { id, role: 'lya'|'user', text, ts, doc?: { title, content, addressedTo, legalBasis, documentType } }
  const [history, setHistory] = useState([]);

  const conversationRef = useRef(null);
  const toolsRef = useRef({});

  // Permite a tools push-ear contenido al historial (ej: documento generado)
  const pushHistory = useCallback((msg) => {
    setHistory((prev) => [...prev, { id: Date.now() + Math.random(), ts: Date.now(), ...msg }]);
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  // Permite a cualquier página inyectar/sobreescribir tools en caliente
  const registerTools = useCallback((newTools) => {
    toolsRef.current = { ...toolsRef.current, ...(newTools || {}) };
  }, []);

  const startConversation = useCallback(async (initialTools = {}) => {
    if (conversationRef.current) return; // ya conectado
    setError(null);
    setStatus('connecting');
    setLastMessage(null);
    toolsRef.current = { ...toolsRef.current, ...initialTools };
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const res = await base44.functions.invoke('elevenLabsAgentSignedUrl', {});
      const signedUrl = res.data?.signedUrl;
      if (!signedUrl) throw new Error('No se pudo obtener signed URL');

      // Wrapper dinámico que mira siempre toolsRef.current al momento del call
      const dynamicTools = new Proxy({}, {
        get(_, name) {
          return (...args) => {
            const fn = toolsRef.current[name];
            if (typeof fn !== 'function') {
              return `Tool "${name}" no disponible en esta página.`;
            }
            return fn(...args);
          };
        },
        ownKeys: () => Object.keys(toolsRef.current),
        getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
      });

      const conversation = await Conversation.startSession({
        signedUrl,
        clientTools: dynamicTools,
        onConnect: () => setStatus('connected'),
        onDisconnect: () => {
          setStatus('idle');
          setAgentSpeaking(false);
          conversationRef.current = null;
        },
        onError: (err) => {
          setError(typeof err === 'string' ? err : err?.message || 'Error de conexión');
          setStatus('error');
        },
        onModeChange: (mode) => setAgentSpeaking(mode?.mode === 'speaking'),
        onMessage: (msg) => {
          if (!msg?.message) return;
          const role = msg.source === 'ai' ? 'lya' : 'user';
          setLastMessage({ role, text: msg.message });
          // Agrega al historial completo (deduplica si llega el mismo turno doble)
          setHistory((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === role && last.text === msg.message) return prev;
            return [...prev, { id: Date.now() + Math.random(), ts: Date.now(), role, text: msg.message }];
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
  }, []);

  const endConversation = useCallback(async () => {
    try { await conversationRef.current?.endSession(); } catch (_) {}
    conversationRef.current = null;
    setStatus('idle');
    setAgentSpeaking(false);
    setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (!conversationRef.current) return;
    const newMuted = !muted;
    try { conversationRef.current.setMicMuted?.(newMuted); } catch (_) {}
    setMuted(newMuted);
  }, [muted]);

  // Cleanup al desmontar la app entera
  useEffect(() => () => { endConversation(); }, [endConversation]);

  const value = {
    status,
    agentSpeaking,
    muted,
    error,
    lastMessage,
    history,
    pushHistory,
    clearHistory,
    startConversation,
    endConversation,
    toggleMute,
    registerTools,
  };

  return (
    <LyaPersistentCtx.Provider value={value}>
      {children}
    </LyaPersistentCtx.Provider>
  );
}

export function useLyaPersistent() {
  const ctx = useContext(LyaPersistentCtx);
  if (!ctx) throw new Error('useLyaPersistent debe usarse dentro de LyaPersistentProvider');
  return ctx;
}