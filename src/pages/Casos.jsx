import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Folder } from 'lucide-react';
import Logo from '@/components/home/Logo';
import CasoPublicCard from '@/components/casos/CasoPublicCard';
import CasosPublicHero from '@/components/casos/CasosPublicHero';

const ORGANISMS = ['all', 'CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN'];

export default function Casos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    base44.entities.MisCasos
      .filter({ status: 'resuelto' }, '-created_date', 60)
      .then((data) => {
        setCasos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? casos : casos.filter((c) => c.regulatoryBody === filter);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="w-16" />
        </div>
      </header>

      <CasosPublicHero count={casos.length} />

      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {ORGANISMS.map((o) => (
            <button
              key={o}
              onClick={() => setFilter(o)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === o
                  ? 'bg-foreground text-background'
                  : 'bg-card border border-border text-foreground hover:bg-secondary'
              }`}
            >
              {o === 'all' ? `Todos (${casos.length})` : o}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border p-6 h-64 animate-pulse-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border max-w-xl mx-auto">
            <Folder className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-display text-xl font-semibold text-foreground">
              Aún no hay casos públicos en esta categoría
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Cambia el filtro o sé el primero en resolver un caso.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((caso) => (
              <CasoPublicCard key={caso.id} caso={caso} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}