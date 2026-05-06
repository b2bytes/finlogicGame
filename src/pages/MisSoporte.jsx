import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy, Plus, AlertTriangle, MessageCircleQuestion } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import Logo from '@/components/home/Logo';
import MyTicketCard from '@/components/soporte/MyTicketCard';

export default function MisSoporte() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    base44.entities.SupportTicket.list('-created_date', 100)
      .then((data) => setTickets(data || []))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    todos: tickets.length,
    abiertos: tickets.filter((t) => ['abierto', 'en_proceso', 'esperando_usuario'].includes(t.status)).length,
    resueltos: tickets.filter((t) => ['resuelto', 'cerrado'].includes(t.status)).length,
    criticos: tickets.filter((t) => t.priority === 'critico' || (t.deadlineDaysRemaining !== undefined && t.deadlineDaysRemaining <= 3)).length,
  };

  const filtered = tickets.filter((t) => {
    if (filter === 'todos') return true;
    if (filter === 'abiertos') return ['abierto', 'en_proceso', 'esperando_usuario'].includes(t.status);
    if (filter === 'resueltos') return ['resuelto', 'cerrado'].includes(t.status);
    if (filter === 'criticos') return t.priority === 'critico' || (t.deadlineDaysRemaining !== undefined && t.deadlineDaysRemaining <= 3);
    return true;
  });

  const tabs = [
    { key: 'todos', label: 'Todos', count: counts.todos },
    { key: 'abiertos', label: 'Abiertos', count: counts.abiertos },
    { key: 'criticos', label: 'Críticos', count: counts.criticos },
    { key: 'resueltos', label: 'Resueltos', count: counts.resueltos },
  ];

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
            <Link to="/Soporte">
              <Plus className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Nuevo</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-14">
        <div className="mb-6 sm:mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-semibold mb-4 border border-mint-200">
            <LifeBuoy className="w-3.5 h-3.5" />
            Mi Soporte
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Tus tickets, en un lugar.
          </h1>
          <p className="mt-2 sm:mt-3 text-muted-foreground text-base sm:text-lg max-w-2xl">
            Seguimiento del estado, prioridad y plazos legales asociados.
          </p>
        </div>

        {/* Banner crítico si hay tickets con plazo <72h */}
        {counts.criticos > 0 && (
          <div className="mb-6 bg-destructive/10 border border-destructive/30 rounded-3xl p-4 sm:p-5 flex items-start gap-3 animate-fade-up">
            <div className="w-10 h-10 rounded-2xl bg-destructive/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-foreground">
                Tienes {counts.criticos} ticket{counts.criticos > 1 ? 's' : ''} con plazo crítico
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plazo legal &lt; 72h. Te respondemos primero.
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors inline-flex items-center gap-1.5 ${
                filter === t.key
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-muted-foreground border-border hover:bg-mint-50 hover:text-mint-700 hover:border-mint-200'
              }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold ${filter === t.key ? 'text-background/70' : 'text-muted-foreground/70'}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border p-5 h-40 animate-pulse-soft" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border">
            <MessageCircleQuestion className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-display text-xl font-semibold text-foreground">
              {filter === 'todos' ? 'Sin tickets aún' : `Nada en "${filter}"`}
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              {filter === 'todos'
                ? 'Si tienes una duda, abre un ticket desde Soporte.'
                : 'Cambia el filtro para ver otros tickets.'}
            </p>
            {filter === 'todos' && (
              <Button asChild className="mt-5 rounded-full bg-mint-500 hover:bg-mint-600 text-white">
                <Link to="/Soporte">Abrir ticket</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
            {filtered.map((t) => (
              <MyTicketCard key={t.id} ticket={t} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}