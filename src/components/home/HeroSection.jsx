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
      {/* Soft background blobs — mockup style: halos verdes y durazno detrás del hero */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[5%] w-[600px] h-[600px] bg-mint-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-10 right-[35%] w-[420px] h-[420px] bg-accent rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 right-[50%] w-[300px] h-[300px] bg-mint-100 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Floating decorative emojis/icons — más grandes y visibles */}
      <div aria-hidden="true" className="absolute top-24 right-[28%] hidden lg:block animate-float">
        <div className="w-16 h-16 rounded-full bg-mint-100 border border-mint-200 flex items-center justify-center shadow-soft text-3xl">
          💰
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-8 right-[12%] hidden lg:block animate-float" style={{ animationDelay: '1.5s' }}>
        <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center shadow-soft-lg text-4xl">
          📄
        </div>
      </div>
      <div aria-hidden="true" className="absolute top-20 right-[3%] hidden lg:block animate-float" style={{ animationDelay: '0.8s' }}>
        <div className="w-16 h-16 rounded-2xl bg-mint-100 border border-mint-200 flex items-center justify-center shadow-soft">
          <ShieldCheck className="w-8 h-8 text-mint-600" />
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

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.02]">
              ¿Sabes cuánto te van a cobrar el día <span className="text-mint-600">28</span>?
            </h1>

            <div className="mt-8 inline-flex items-start gap-3 px-4 py-3 rounded-2xl bg-card border border-border shadow-soft">
              <div className="w-10 h-10 rounded-xl bg-mint-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-mint-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Registrada CMF · Ley Fintech 21.521</p>
                <p className="text-muted-foreground text-xs mt-0.5">Tu seguridad protegida</p>
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
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border border-purple-200/60 flex items-center justify-center transition-all flex-shrink-0 shadow-soft"
                >
                  <Mic className="w-6 h-6 text-purple-700" />
                </button>
                <div className="relative flex-1">
                  <div aria-hidden="true" className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-200 via-mint-300 to-amber-200 blur-md opacity-60" />
                  <Button
                    onClick={() => goToConsulta(query)}
                    className="relative w-full h-14 rounded-2xl bg-mint-600 hover:bg-mint-700 text-white text-base font-semibold shadow-mint group"
                  >
                    Consultar gratis
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
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