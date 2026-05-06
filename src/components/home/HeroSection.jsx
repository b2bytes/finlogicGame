import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight } from 'lucide-react';
import HeroIllustration from './HeroIllustration';
import HeroTrustStrip from './HeroTrustStrip';

const QUICK_PILLS = [
  { label: 'Cobro indebido', query: 'Tengo un cobro que no reconozco en mi tarjeta' },
  { label: 'Fraude', query: 'Recibí un SMS sospechoso del banco, creo que es phishing' },
  { label: 'SII / Pyme', query: 'Vendo por Instagram, ¿cómo formalizo en el SII?' },
  { label: 'Cripto', query: '¿Tengo que declarar mis ganancias en cripto al SII?' },
  { label: 'Datos / ARCO', query: 'Quiero que el banco elimine mis datos personales' },
  { label: 'TMC / Tasas', query: 'Quiero saber si la tasa de mi crédito supera el TMC' },
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
              <span className="relative flex w-2 h-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-mint-600" />
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-mint-700">
                Registrada CMF · Ley Fintech 21.521 · Pipeline IA en vivo
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[72px] font-bold tracking-tight text-foreground leading-[1.02]">
              Tu derecho financiero,<br />
              <span className="text-mint-600">en tu idioma. Ahora.</span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Banco, SII, fraude, cripto, datos personales o pyme. Cuéntanos qué te pasa: nuestra IA lo traduce a la ley chilena, identifica tu derecho y genera la carta. <span className="font-semibold text-foreground">Gratis. En menos de 60 segundos.</span>
            </p>

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

            {/* Trust strip — avatares + casos resueltos en vivo */}
            <HeroTrustStrip />
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