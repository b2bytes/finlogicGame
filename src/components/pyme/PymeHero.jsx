import React from 'react';
import { Building2, ShieldCheck } from 'lucide-react';

export default function PymeHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-10 md:pt-16 md:pb-14">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[5%] w-[600px] h-[600px] bg-mint-200 rounded-full blur-3xl opacity-40" />
        <div className="absolute top-10 right-[35%] w-[420px] h-[420px] bg-accent rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint-50 border border-mint-200 px-3 py-1 text-xs font-medium text-mint-700 mb-5">
          <Building2 className="w-3.5 h-3.5" />
          FinLogic Pyme — Capa 2
        </div>

        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
          Salud financiera de tu pyme.<br />
          <span className="text-mint-600">Sin contador saturado.</span>
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
          Conecta los datos clave de tu negocio y FinLogic detecta vencimientos IVA, beneficios
          LIR Pro-Pyme y riesgos de multa antes que el SII te encuentre primero.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
          Ley 21.713 · LIR Pro-Pyme · F29 · F22
        </div>
      </div>
    </section>
  );
}