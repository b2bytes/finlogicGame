import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, ShieldCheck, AlertTriangle } from 'lucide-react';
import Logo from '@/components/home/Logo';
import PipelineLoader from '@/components/consulta/PipelineLoader';
import ResponseCard from '@/components/consulta/ResponseCard';
import AccessibilityToggle from '@/components/a11y/AccessibilityToggle';
import VoiceInput from '@/components/consulta/VoiceInput';
import ConsultaSidePanel from '@/components/consulta/ConsultaSidePanel';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';

export default function Consulta() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [traceId, setTraceId] = useState(null);
  const [error, setError] = useState(null);
  const [voiceMode, setVoiceMode] = useState(false);
  const location = useLocation();
  const lyaVoice = useLyaVoice();

  // Lee ?q= del HeroSection y ?modo=voz para activar voz al entrar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    const modo = params.get('modo');
    if (q) setQuery(q);
    if (modo === 'voz') setVoiceMode(true);
  }, [location.search]);

  const handleVoiceTranscript = (text) => {
    setQuery((prev) => (prev ? `${prev} ${text}`.trim() : text));
  };

  const examples = [
    'Me cobraron $47.500 que no reconozco en mi tarjeta',
    'Recibí un mensaje del banco pidiendo mis claves y las puse',
    'Mi crédito de consumo tiene una tasa del 65% anual',
    '¿Qué son mis derechos ARCO sobre mis datos?',
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (query.trim().length < 5 || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const { data } = await base44.functions.invoke('processConsultation', {
        query: query.trim(),
        channel: 'web',
      });
      if (data?.success) {
        setResponse(data.response);
        setTraceId(data.traceId);
        // Si la consulta entró por voz, Lya responde hablando (manos libres real)
        if (voiceMode && lyaVoice.ttsSupported && data.response) {
          const spoken = [
            data.response.fact,
            data.response.translation,
            data.response.action,
          ].filter(Boolean).join('. ');
          lyaVoice.speak(spoken);
        }
      } else {
        setError(data?.error || 'No pudimos procesar tu consulta');
      }
    } catch (err) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuery('');
    setResponse(null);
    setTraceId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
              Sin login
            </div>
            <AccessibilityToggle />
          </div>
        </div>
      </header>

      <main className={`mx-auto px-4 sm:px-6 py-8 md:py-16 ${response || loading ? 'max-w-3xl' : 'max-w-6xl'}`}>
        {!response && !loading && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-12">
            <div>
            <div className="mb-10 animate-fade-up">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
                <span className="text-xs font-semibold text-mint-700">Sistema en línea · respuesta en 60s</span>
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Cuéntame qué pasó.
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                En lenguaje simple. Sin tecnicismos. Yo identifico tu derecho y la acción que debes tomar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {voiceMode && (
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={loading} />
              )}

              <div className="relative">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={voiceMode
                    ? 'Lo que digas aparecerá aquí…'
                    : 'Por ejemplo: Me cobraron una comisión que no entiendo en mi cuenta corriente y el banco no me responde…'}
                  className="min-h-[180px] text-base rounded-3xl border-2 p-5 resize-none bg-card focus-visible:ring-mint-500"
                  autoFocus={!voiceMode}
                />
                <div className="absolute bottom-4 right-4">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={query.trim().length < 5}
                    className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-12 px-6 font-semibold shadow-mint"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Resolver
                  </Button>
                </div>
              </div>

              {!voiceMode && (
                <button
                  type="button"
                  onClick={() => setVoiceMode(true)}
                  className="text-xs text-mint-700 hover:text-mint-600 font-semibold underline-offset-4 hover:underline"
                >
                  ¿Prefieres hablar? Activar modo voz
                </button>
              )}

              {error && (
                <div className="flex items-start gap-2.5 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </form>

            <div className="mt-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                O prueba con un caso real
              </p>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setQuery(ex)}
                    className="text-left text-sm px-4 py-2.5 rounded-2xl bg-secondary hover:bg-mint-50 hover:border-mint-200 border border-transparent text-secondary-foreground transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            </div>

            <div className="hidden lg:block">
              <ConsultaSidePanel />
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-6 animate-fade-up">
            <div className="bg-secondary rounded-3xl p-5 text-sm text-foreground">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tu consulta</p>
              {query}
            </div>
            <PipelineLoader onRetry={handleSubmit} />
          </div>
        )}

        {response && !loading && (
          <div className="space-y-6">
            <div className="bg-secondary rounded-3xl p-5 text-sm text-foreground">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tu consulta</p>
              {query}
            </div>
            <ResponseCard response={response} traceId={traceId} query={query} />
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="rounded-full h-12 flex-1"
              >
                Hacer otra consulta
              </Button>
              <Button
                asChild
                size="lg"
                className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-12 flex-1"
              >
                <Link to="/">Volver al inicio</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}