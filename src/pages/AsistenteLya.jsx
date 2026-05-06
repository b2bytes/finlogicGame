import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import LyaMessage from '@/components/lya/LyaMessage';
import LyaSources from '@/components/lya/LyaSources';
import LyaActionCTA from '@/components/lya/LyaActionCTA';
import LyaShareWhatsApp from '@/components/lya/LyaShareWhatsApp';
import LyaVoiceControls from '@/components/lya/LyaVoiceControls';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import { useLyaNavigator } from '@/lib/useLyaNavigator.jsx';
import { useLyaActions } from '@/lib/useLyaActions.jsx';

const SUGERENCIAS = [
  '¿Cuánto vale la UF hoy?',
  'Convierte 1 millón de pesos a UF',
  '¿Qué hago si no reconozco un cobro en mi tarjeta?',
  '¿Cómo solicito una carta ARCO a mi banco?',
  '¿Cuál es la TPM actual?',
  '¿Cuántos días tengo para reclamar un fraude?',
];

const NAV_SHORTCUTS = [
  'Llévame a mis casos',
  'Muéstrame transparencia',
  'Abre los precios',
  'Ir al pitch deck',
];

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
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [handsFree, setHandsFree] = useState(false);
  const scrollRef = useRef(null);
  const handsFreeRef = useRef(false);

  const voice = useLyaVoice();
  const { tryNavigate } = useLyaNavigator();
  const { tryAction } = useLyaActions();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // Mantén ref sincronizado para closures dentro de callbacks de voz
  useEffect(() => { handsFreeRef.current = handsFree; }, [handsFree]);

  // Anuncio inicial de bienvenida cuando se enciende la voz por primera vez
  useEffect(() => {
    if (autoSpeak && voice.ttsSupported && messages.length === 1) {
      voice.speak('Hola, soy Lya. Cuéntame qué pasó con tus finanzas.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSpeak]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);

    try {
      // 0. Pre-filtro NAVEGACIÓN — si el usuario pide ir a una sección, Lya navega
      const navResult = tryNavigate(q);
      if (navResult.navigated) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `${navResult.message}\n\nEstás ahora en **${navResult.label}**. Si quieres volver a hablar conmigo, vuelve a /AsistenteLya.`,
            isNav: true,
          },
        ]);
        if (autoSpeak) voice.speak(navResult.message);
        return;
      }

      // 0.5 Pre-filtro ACCIÓN REAL CMF (UF/dólar/UTM/TPM, conversiones)
      const action = await tryAction(q);
      if (action.handled) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: action.response,
            sources: [action.source],
            confidence: 1.0,
            regulatoryBody: 'CMF',
            query: q,
            isLive: true,
          },
        ]);
        if (autoSpeak) voice.speak(action.response.replace(/[*_]/g, ''));
        return;
      }

      // 1. Pre-filtro FAQ (deflection rápido <1s en preguntas frecuentes)
      const faqResult = await base44.functions
        .invoke('autoResolveFAQ', { query: q, channel: 'web' })
        .catch(() => ({ data: { matched: false } }));

      if (faqResult.data?.matched && faqResult.data.confidence >= 0.25) {
        const faqContent = faqResult.data.response;
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: faqContent,
            sources: ['FAQ canónica · ' + faqResult.data.faqQuestion],
            confidence: 0.95,
            regulatoryBody: 'ninguno',
            query: q,
            isFaq: true,
          },
        ]);
        if (autoSpeak) voice.speak(faqContent);
        return;
      }

      // 2. Pipeline normativo completo
      const { data } = await base44.functions.invoke('lyaKnowledgeQuery', {
        query: q,
        mode: 'text',
        userProfile: 'general',
      });

      const finalContent = data?.response || 'No pude procesar tu consulta.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: finalContent,
          sources: data?.sources,
          confidence: data?.confidence,
          regulatoryBody: data?.regulatoryBody,
          suggestedAction: data?.suggestedAction,
          query: q,
        },
      ]);
      if (autoSpeak) voice.speak(finalContent);
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
    <div className="min-h-[100dvh] bg-background flex flex-col pb-[env(safe-area-inset-bottom)]">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <Link
            to="/"
            aria-label="Volver"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <Logo size="sm" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-mint-50 border border-mint-200">
            <ShieldCheck className="w-3 h-3 text-mint-700" />
            <span className="text-[10px] font-semibold text-mint-700">Ley 21.521</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-5 md:py-8 flex flex-col">
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
          className="flex-1 bg-card/40 border border-border rounded-3xl p-4 md:p-7 space-y-4 overflow-y-auto min-h-[300px] max-h-[55vh] md:max-h-[60vh] mb-4"
        >
          {messages.map((m, i) => (
            <div key={i}>
              <LyaMessage role={m.role} content={m.content} />
              {m.role === 'assistant' && m.sources && (
                <div className="ml-11 max-w-[85%]">
                  <LyaSources
                    sources={m.sources}
                    confidence={m.confidence}
                    regulatoryBody={m.regulatoryBody}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <LyaActionCTA
                      query={m.query}
                      response={m.content}
                      regulatoryBody={m.regulatoryBody}
                      suggestedAction={m.suggestedAction}
                    />
                    <LyaShareWhatsApp
                      query={m.query}
                      response={m.content}
                      sources={m.sources}
                    />
                  </div>
                </div>
              )}
            </div>
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

        {/* Sugerencias — scroll horizontal en mobile, wrap en desktop */}
        {messages.length <= 1 && (
          <div className="space-y-2.5 mb-4 -mx-4 sm:mx-0">
            <div className="flex sm:flex-wrap gap-2 overflow-x-auto sm:overflow-visible px-4 sm:px-0 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs font-medium px-3 py-2 rounded-full bg-mint-50 hover:bg-mint-100 border border-mint-200 text-mint-700 transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible px-4 sm:px-0 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground self-center flex-shrink-0">
                O pídeme:
              </span>
              {NAV_SHORTCUTS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs font-medium px-3 py-2 rounded-full bg-secondary hover:bg-foreground hover:text-background border border-border text-foreground transition-colors flex-shrink-0 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="mb-3">
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
              voice.startListening((finalText) => {
                send(finalText);
              });
            }}
          />
        </div>

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
          {voice.sttSupported || voice.ttsSupported
            ? 'Lya es un asistente IA con voz · español de Chile · siempre verifica decisiones críticas con un profesional.'
            : 'Lya es un asistente IA · siempre verifica decisiones críticas con un profesional.'}
        </p>
      </main>
    </div>
  );
}