import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, ShieldCheck, Heart, ArrowRight, Sparkles } from 'lucide-react';

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
    <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28">
      {/* Soft background blobs — Apple/Wise style */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-mint-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -top-10 right-1/3 w-[300px] h-[300px] bg-accent rounded-full blur-3xl opacity-50" />
      </div>

      {/* Floating decorative emojis/icons */}
      <div aria-hidden="true" className="absolute top-32 right-[20%] hidden lg:block animate-float">
        <div className="w-12 h-12 rounded-full bg-mint-100 border border-mint-200 flex items-center justify-center shadow-soft">
          <span className="text-xl">💰</span>
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-20 right-[8%] hidden lg:block animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center shadow-soft">
          <span className="text-2xl">📄</span>
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-56 right-[6%] hidden lg:block animate-float" style={{ animationDelay: '0.8s' }}>
        <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-mint-200 flex items-center justify-center shadow-soft">
          <ShieldCheck className="w-6 h-6 text-mint-600" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Left — Title + trust badge + sub-copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-mint-700" />
              <span className="text-xs font-semibold text-mint-700">
                Sistema operativo financiero del pueblo de Chile
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              ¿Sabes cuánto te van a cobrar el día <span className="text-mint-600">28</span>?
            </h1>

            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Resolvemos cobros indebidos, fraudes y dudas financieras en lenguaje simple.
              <span className="block mt-1 font-semibold text-foreground">Sin abogado. Sin letra chica. Gratis.</span>
            </p>

            <div className="mt-8 inline-flex items-start gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-mint-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Registrada CMF · Ley Fintech 21.521</p>
                <p className="text-muted-foreground text-xs mt-0.5">Tu seguridad protegida</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
                <span><span className="font-semibold text-foreground">12.847</span> consultas resueltas</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-mint-500" />
                <span><span className="font-semibold text-foreground">49s</span> respuesta promedio</span>
              </div>
            </div>
          </div>

          {/* Right — Floating consulta card */}
          <div className="relative animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="relative bg-card rounded-3xl shadow-soft-lg border border-border/60 p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && goToConsulta(query)}
                  placeholder="Cuéntanos qué está pasando con tus finanzas…"
                  className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/70 outline-none py-2"
                />
                <Heart className="w-5 h-5 text-mint-500 flex-shrink-0" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToConsulta('?modo=voz')}
                  aria-label="Consultar por voz"
                  className="w-14 h-14 rounded-2xl bg-secondary hover:bg-mint-50 border border-border flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Mic className="w-6 h-6 text-mint-600" />
                </button>
                <Button
                  onClick={() => goToConsulta(query)}
                  className="flex-1 h-14 rounded-2xl bg-mint-600 hover:bg-mint-700 text-white text-base font-semibold shadow-mint group"
                >
                  Consultar gratis
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {QUICK_PILLS.map((pill) => (
                  <button
                    key={pill.label}
                    onClick={() => goToConsulta(pill.query)}
                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary hover:bg-mint-50 border border-border text-foreground transition-colors"
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}