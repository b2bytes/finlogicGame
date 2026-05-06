import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LifeBuoy } from 'lucide-react';
import Logo from '@/components/home/Logo';
import FAQAccordion from '@/components/soporte/FAQAccordion';
import TicketForm from '@/components/soporte/TicketForm';
import SoporteChannels from '@/components/soporte/SoporteChannels';

const PROFILE_TABS = [
  { key: 'all', label: 'Todas' },
  { key: 'camila', label: 'Camila · 22' },
  { key: 'don_luis', label: 'Don Luis · 68' },
  { key: 'maria_jose', label: 'María José · 34' },
  { key: 'roberto', label: 'Roberto · 45' },
  { key: 'b2b_fintech', label: 'Fintech B2B' },
];

export default function Soporte() {
  const [profile, setProfile] = useState('all');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 text-mint-700 text-xs font-semibold mb-4">
            <LifeBuoy className="w-3.5 h-3.5" />
            Soporte FinLogic
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            ¿En qué te ayudamos?
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Respuestas rápidas a las dudas más frecuentes. Si no encuentras lo tuyo, escríbenos
            abajo y te respondemos según urgencia.
          </p>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            {PROFILE_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setProfile(t.key)}
                className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                  profile === t.key
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-muted-foreground border-border hover:bg-mint-50 hover:text-mint-700 hover:border-mint-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <FAQAccordion profileFilter={profile} />
        </section>

        {/* Form */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold text-foreground mb-5">
            Escríbenos directo
          </h2>
          <TicketForm />
        </section>

        {/* Channels */}
        <section>
          <h2 className="font-display text-2xl font-bold text-foreground mb-5">
            O contáctanos por tu canal
          </h2>
          <SoporteChannels />
        </section>
      </main>
    </div>
  );
}