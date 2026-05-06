import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, ShieldCheck, AlertTriangle } from 'lucide-react';
import Logo from '@/components/home/Logo';
import PipelineLoader from '@/components/consulta/PipelineLoader';
import ResponseCard from '@/components/consulta/ResponseCard';

export default function Consulta() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [traceId, setTraceId] = useState(null);
  const [error, setError] = useState(null);

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
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
            Sin login
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 md:py-16">
        {!response && !loading && (
          <>
            <div className="mb-10 animate-fade-up">
              <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                Cuéntame qué pasó.
              </h1>
              <p className="mt-3 text-lg text-muted-foreground">
                En lenguaje simple. Sin tecnicismos. Yo identifico tu derecho y la acción que debes tomar.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Por ejemplo: Me cobraron una comisión que no entiendo en mi cuenta corriente y el banco no me responde…"
                  className="min-h-[180px] text-base rounded-3xl border-2 p-5 resize-none bg-card focus-visible:ring-mint-500"
                  autoFocus
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

            <p className="mt-10 text-xs text-center text-muted-foreground">
              Tus datos no salen de aquí · Ley 21.719 · Auditable en /Transparencia
            </p>
          </>
        )}

        {loading && (
          <div className="space-y-6 animate-fade-up">
            <div className="bg-secondary rounded-3xl p-5 text-sm text-foreground">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tu consulta</p>
              {query}
            </div>
            <PipelineLoader />
          </div>
        )}

        {response && !loading && (
          <div className="space-y-6">
            <div className="bg-secondary rounded-3xl p-5 text-sm text-foreground">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tu consulta</p>
              {query}
            </div>
            <ResponseCard response={response} traceId={traceId} />
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