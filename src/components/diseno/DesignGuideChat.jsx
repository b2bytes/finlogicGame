import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';

/**
 * DesignGuideChat — Agente conversacional flotante que explica
 * el diseño de FinLogic en tiempo real al jurado. Premium Apple-like.
 */

const INTRO_MESSAGE = {
  role: 'assistant',
  content: `¡Hola! 👋 Soy tu **Guía de Diseño FinLogic**.

Estoy aquí para explicarte cualquier aspecto del sistema:

• **Flujos de usuario** — cómo navegan los 5 arquetipos
• **Sistema de diseño** — tokens, paleta, tipografía, componentes
• **Wireframes** — las pantallas que estamos construyendo
• **Decisiones de UX** — por qué elegimos cada patrón

¿Qué te gustaría saber?`,
};

const QUICK_QUESTIONS = [
  '¿Por qué elegiste estos colores?',
  'Explica el flujo de Camila',
  '¿Qué hace especial a Lya?',
  '¿Cómo funciona la accesibilidad?',
];

export default function DesignGuideChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = `Eres la Guía de Diseño de FinLogic, un asistente experto en UX/UI que explica el sistema de diseño del producto al jurado del Claude Impact Lab.

CONTEXTO DEL PRODUCTO:
- FinLogic es un OS financiero-legal para ciudadanos y pymes de Chile
- 5 capas: Ciudadanía, Pyme, Agéntica (Lya), B2B API, Transparencia
- 5 arquetipos: Camila (ciudadana 28), Don Luis (adulto mayor 68), María José (pyme 35), Roberto (fintech B2B 42), Lya (agente IA)
- Inspiración visual: Apple HIG + Wise + Mercado Pago
- Paleta: mint (confianza), crema cálido (calidez), coral (urgencia), radios 24px+, sombras blandas
- Tipografía: Plus Jakarta Sans (display), Inter (body)
- Componentes: pills, botones pill, cards glass, badges de urgencia
- Accesibilidad: Modo Don Luis (texto +25%, contraste alto, áreas táctiles 48px, voz STT/TTS)
- Pipeline IA: Triage (GPT-5-mini) → Tools en vivo (CMF) → RAG (12 módulos) → Especialista (Claude Sonnet) → Verificador
- Transparencia: AgentTrace público, el usuario ve cómo Lya llegó a su respuesta

INSTRUCCIONES:
- Responde en español chileno amigable pero profesional
- Sé conciso (máx 150 palabras) pero sustancioso
- Usa **negritas** para conceptos clave
- Si preguntan por un flujo específico, describe los pasos
- Si preguntan por colores/tipografía, explica el porqué emocional
- Siempre conecta las decisiones de diseño con el impacto en el usuario`;

      const { data } = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nPregunta del jurado: ${q}`,
        response_json_schema: null,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: data }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Disculpa, tuve un problema. ¿Puedes repetir tu pregunta?' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB flotante */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-foreground text-background shadow-soft-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Abrir guía de diseño"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-mint-500 border-2 border-background flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-card border border-border rounded-3xl shadow-soft-lg overflow-hidden flex flex-col"
            style={{ maxHeight: 'min(600px, calc(100vh - 6rem))' }}
          >
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-gradient-to-r from-mint-50/80 to-background">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-foreground text-background flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-foreground">Guía de Diseño</p>
                  <p className="text-[10px] text-muted-foreground">FinLogic · Claude Impact Lab</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-foreground text-background rounded-br-md'
                        : 'bg-secondary/60 text-foreground rounded-bl-md'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <ReactMarkdown
                        className="prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-mint-700"
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      <p>{m.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary/60 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-mint-600 animate-spin" />
                    <span className="text-xs text-muted-foreground">Pensando…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions */}
            {messages.length <= 2 && !loading && (
              <div className="px-4 pb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Preguntas rápidas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="text-[11px] font-medium px-2.5 py-1.5 rounded-full bg-mint-50 hover:bg-mint-100 border border-mint-200 text-mint-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-border bg-secondary/30"
            >
              <div className="flex items-center gap-2 bg-card rounded-full border border-border px-4 py-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregunta sobre el diseño…"
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/60 outline-none py-2 min-w-0"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center disabled:opacity-40 hover:bg-foreground/90 transition-colors flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}