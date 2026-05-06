import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import HeroIllustration from './HeroIllustration';

const QUICK_PILLS = [
  { label: 'Cobros indebidos', query: 'Tengo un cobro que no reconozco en mi tarjeta' },
  { label: 'Documentos', query: 'Necesito una carta ARCO para mi banco' },
  { label: 'Deudas', query: 'Quiero entender mi deuda y tasas que me cobran' },
  { label: 'Inversiones', query: 'Tengo dudas sobre una inversión que me ofrecieron' },
];

export default function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const goToConsulta = (q) => {
    const param = q ? `?q=${encodeURIComponent(q)}` : '';
    navigate(`/Consulta${param}`);
  };

  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden">
      {/* Soft gradient mesh background */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-mint-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FFE5D0]/40 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-[#F0E5FF]/40 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
          {/* Left — Title + input + trust */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-7">
              <Sparkles className="w-3.5 h-3.5 text-mint-700 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-mint-700">
                Sistema operativo financiero del pueblo de Chile
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-bold tracking-tight text-foreground leading-[1.05]">
              ¿Sabes cuánto te van a cobrar el día <span className="text-mint-600">28</span>?
            </h1>

            {/* Inline input row — pill estilo mockup */}
            <div className="mt-7 sm:mt-8 flex items-center gap-1.5 sm:gap-2 bg-card rounded-full border border-border shadow-soft p-1.5 pl-4 sm:pl-5 max-w-xl">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToConsulta(query)}
                placeholder="Cuéntanos qué pasa con tus finanzas…"
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none py-2 min-w-0"
              />
              <button
                onClick={() => goToConsulta('?modo=voz')}
                aria-label="Consultar por voz"
                className="w-9 h-9 rounded-full bg-secondary hover:bg-mint-50 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Mic className="w-4 h-4 text-mint-700" />
              </button>
              <button
                onClick={() => goToConsulta(query)}
                className="h-10 px-3 sm:px-5 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-xs sm:text-sm font-semibold transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
              >
                <span className="hidden xs:inline sm:inline">Consultar</span>
                <span className="xs:hidden sm:hidden">Ir</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick pills */}
            <div className="flex flex-wrap gap-2 mt-4 max-w-xl">
              {QUICK_PILLS.map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => goToConsulta(pill.query)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full bg-mint-50 hover:bg-mint-100 border border-mint-200 text-mint-700 transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-card border border-border shadow-soft">
              <div className="w-8 h-8 rounded-full bg-mint-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-mint-600" />
              </div>
              <div className="text-sm">
                <span className="font-semibold text-foreground">Registrada CMF · Ley Fintech 21.521</span>
                <span className="text-muted-foreground text-xs block leading-tight">Tu seguridad protegida</span>
              </div>
            </div>
          </div>

          {/* Right — Illustration with floating cards */}
          <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}