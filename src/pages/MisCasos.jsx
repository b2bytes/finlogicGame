import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Folder } from 'lucide-react';
import Logo from '@/components/home/Logo';
import CasoCard from '@/components/casos/CasoCard';
import CasosFilters from '@/components/casos/CasosFilters';
import MisCasosStats from '@/components/casos/MisCasosStats';
import ProTriggerBanner from '@/components/pro/ProTriggerBanner';

export default function MisCasos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const data = await base44.entities.MisCasos.list('-created_date', 50);
    setCasos(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = filter === 'all' ? casos : casos.filter((c) => c.status === filter);
  const counts = casos.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link to="/" aria-label="Volver" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <Logo size="sm" />
          <Button asChild size="sm" className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-9 px-3 sm:px-4">
            <Link to="/Consulta">
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Nueva</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14">
        <div className="mb-6 sm:mb-8 animate-fade-up">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Mis Casos
          </h1>
          <p className="mt-2 sm:mt-3 text-muted-foreground text-base sm:text-lg">
            Cada consulta resuelta queda registrada con su plazo legal y organismo competente.
          </p>
        </div>

        <MisCasosStats casos={casos} />

        {casos.length >= 2 && <ProTriggerBanner trigger="second_case" />}

        <div className="mb-6">
          <CasosFilters active={filter} onChange={setFilter} counts={counts} />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border p-6 h-48 animate-pulse-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border">
            <Folder className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-display text-xl font-semibold text-foreground">
              {filter === 'all' ? 'Aún no tienes casos' : 'Nada en esta categoría'}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              {filter === 'all'
                ? 'Cuando hagas tu primera consulta, quedará registrada acá con su plazo legal.'
                : 'Cambia el filtro o crea una consulta nueva.'}
            </p>
            {filter === 'all' && (
              <Button asChild className="mt-5 rounded-full bg-mint-500 hover:bg-mint-600 text-white">
                <Link to="/Consulta">Hacer mi primera consulta</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((caso) => (
              <CasoCard key={caso.id} caso={caso} onUpdate={load} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}