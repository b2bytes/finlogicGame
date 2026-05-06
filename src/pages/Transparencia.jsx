import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Eye } from 'lucide-react';
import Logo from '@/components/home/Logo';
import TraceCard from '@/components/transparencia/TraceCard';
import TraceDetail from '@/components/transparencia/TraceDetail';
import TransparenciaStats from '@/components/transparencia/TransparenciaStats';
import ViewToggle from '@/components/transparencia/ViewToggle.jsx';

export default function Transparencia() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [viewMode, setViewMode] = useState('citizen');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.AgentTrace.filter(
        { isPublic: true, pipelineStage: 'complete' },
        '-created_date',
        50
      );
      setTraces(data || []);
      setLoading(false);

      // Auto-open trace if ?trace=id in URL
      const traceId = searchParams.get('trace');
      if (traceId) {
        const found = (data || []).find((t) => t.id === traceId);
        if (found) setSelectedTrace(found);
      }
    };
    load();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-mint-700 font-medium">
            <Eye className="w-3.5 h-3.5" />
            Auditoría pública
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-16">
        <div className="mb-10 max-w-2xl animate-fade-up">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            Transparencia radical
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Cada respuesta es auditable.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Ningún modelo opaco. Aquí ves cómo el pipeline llegó a cada solución: qué leyes citó, cuánto tardó, qué modelo lo respondió y con qué nivel de confianza.
          </p>
          <div className="mt-6">
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border p-5 h-40 animate-pulse-soft" />
            ))}
          </div>
        ) : traces.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border">
            <Eye className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-foreground font-semibold">Aún no hay consultas públicas</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sé el primero en hacer una <Link to="/Consulta" className="text-mint-700 underline">consulta</Link>.
            </p>
          </div>
        ) : (
          <>
            <TransparenciaStats traces={traces} />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {traces.map((trace) => (
                <TraceCard
                  key={trace.id}
                  trace={trace}
                  onClick={() => setSelectedTrace(trace)}
                />
              ))}
            </div>
          </>
        )}

        <p className="mt-12 text-xs text-center text-muted-foreground">
          Datos anonimizados · Cumple Ley 21.719 · Actualizado en tiempo real
        </p>
      </main>

      <TraceDetail
        trace={selectedTrace}
        viewMode={viewMode}
        open={!!selectedTrace}
        onOpenChange={(open) => !open && setSelectedTrace(null)}
      />
    </div>
  );
}