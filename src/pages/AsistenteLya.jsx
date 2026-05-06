import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Loader2, ShieldCheck, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import LyaMessage from '@/components/lya/LyaMessage';

const SUGERENCIAS = [
  '¿Qué hago si no reconozco un cobro en mi tarjeta?',
  '¿Cómo solicito una carta ARCO a mi banco?',
  '¿Cuál es la TMC vigente para créditos de consumo?',
  '¿Cuántos días tengo para reclamar un fraude?',
];

const sessionId = `lya-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function AsistenteLya() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy **Lya**, tu asistente FinLogic. Cuéntame qué pasó con tus finanzas y te ayudo paso a paso. Puede ser un cobro raro, un derecho que quieres ejercer, una duda de tu banco… lo que sea, en tus palabras.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      const result = await base44.functions.invoke('lyaKnowledgeQuery', {
        query: q,
        userProfile: 'general',
        mode: 'text',
      });

      const data = result.data || {};
      const answer = data.response || 'No pude generar una respuesta en este momento.';
      const sources = Array.isArray(data.sources) ? data.sources : [];

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer,
          sources,
          confidence: data.confidence,
          regulatoryBody: data.regulatoryBody,
        },
      ]);

      // Persistir auditoría — alimenta /Transparencia y /Admin/SystemMetrics
      try {
        await base44.entities.AgentTrace.create({
          sessionId,
          query: q,
          category: data.regulatoryBody === 'CSIRT' ? 'fraude_digital' : 'normativa_consulta',
          pipelineStage: 'complete',
          totalLatencyMs: data.latencyMs,
          verifierScore: Math.round((data.confidence || 0.85) * 100),
          lawsCited: sources,
          responsePreview: answer.slice(0, 200),
          modelUsed: 'sonnet',
          isPublic: true,
        });

        await base44.entities.ConsultationHistory.create({
          sessionId,
          userMessage: q,
          agentResponse: answer.slice(0, 1000),
          agentName: 'Lya',
          regulatoryBodyIdentified: data.regulatoryBody || 'ninguno',
          inputChannel: 'web',
        });
      } catch (auditErr) {
        // Auditoría no bloquea UX
        console.warn('Audit trace error:', auditErr);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, tuve un problema procesando tu consulta. ¿Puedes intentarlo de nuevo o ir a /Consulta para el flujo guiado?',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-mint-50 border border-mint-200">
            <ShieldCheck className="w-3 h-3 text-mint-700" />
            <span className="text-[10px] font-semibold text-mint-700">Ley 21.521</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
        <div className="mb-6 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">Asistente IA · Lya</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
            Tu derecho, en tu idioma. Ahora.
          </h1>
        </div>

        {/* Mensajes */}
        <div
          ref={scrollRef}
          className="flex-1 bg-card/40 border border-border rounded-3xl p-5 md:p-7 space-y-4 overflow-y-auto min-h-[400px] max-h-[60vh] mb-4"
        >
          {messages.map((m, i) => (
            <LyaMessage
              key={i}
              role={m.role}
              content={m.content}
              sources={m.sources}
              confidence={m.confidence}
            />
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white animate-pulse-soft" />
              </div>
              <div className="bg-card border border-border rounded-3xl rounded-tl-md px-5 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-mint-600 animate-spin" />
                <span className="text-sm text-muted-foreground">Lya está pensando…</span>
              </div>
            </div>
          )}
        </div>

        {/* Sugerencias */}
        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs font-medium px-3 py-2 rounded-full bg-mint-50 hover:bg-mint-100 border border-mint-200 text-mint-700 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 bg-card rounded-full border border-border shadow-soft p-1.5 pl-5"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Cuéntame qué pasó con tus finanzas…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none py-2 min-w-0 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-10 px-5 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-sm font-semibold transition-colors inline-flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </button>
        </form>

        <p className="mt-3 text-xs text-muted-foreground text-center">
          Lya es un asistente IA · siempre verifica decisiones críticas con un profesional.
        </p>
      </main>
    </div>
  );
}