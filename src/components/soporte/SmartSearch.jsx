import React, { useState } from 'react';
import { Search, Loader2, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const { data } = await base44.functions.invoke('autoResolveFAQ', {
        query: query.trim(),
        channel: 'web',
      });
      setResult(data);
    } catch (err) {
      setResult({ matched: false, shouldEscalate: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-3xl shadow-soft p-6 md:p-8 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-foreground">Búsqueda inteligente</p>
          <p className="text-xs text-muted-foreground">Respuesta instantánea sobre las 10 preguntas más frecuentes</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-secondary/40 rounded-3xl sm:rounded-full border border-border p-2 sm:p-1.5 sm:pl-5">
        <div className="flex items-center gap-2 flex-1 min-w-0 px-3 sm:px-0">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: cobro raro en tarjeta…"
            className="flex-1 bg-transparent outline-none text-sm py-2 min-w-0"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="h-10 sm:h-9 px-4 rounded-full bg-foreground hover:bg-foreground/90 text-background text-xs font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-1.5 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Buscar'}
        </button>
      </form>

      {result && (
        <div className="mt-5 animate-fade-up">
          {result.matched ? (
            <div className="bg-mint-50 border border-mint-200 rounded-2xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-mint-700 mt-0.5 flex-shrink-0" />
                <p className="text-xs font-bold uppercase tracking-wider text-mint-700">
                  {result.faqQuestion}
                </p>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.response}</p>
              <p className="mt-3 text-[11px] text-mint-700">
                ¿Te ayudó esta respuesta? Si no, completa el formulario abajo.
              </p>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <p className="text-sm text-foreground mb-3">
                No encontré una respuesta directa. Te sugiero:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/AsistenteLya"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Pregúntale a Lya <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  to="/Consulta"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-card border border-border hover:bg-secondary"
                >
                  Hacer consulta guiada
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}