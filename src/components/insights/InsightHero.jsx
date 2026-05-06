import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export default function InsightHero() {
  return (
    <section className="pt-12 pb-8 md:pt-20 md:pb-10 bg-gradient-to-b from-mint-50/40 to-transparent">
      <div className="max-w-5xl mx-auto px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-6">
          <Database className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-semibold text-foreground">
            FinLogic Insights · datos agregados, cero PII
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
          El pulso financiero de Chile,<br />
          <span className="text-mint-600">en tiempo real.</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Para reguladores, fintechs reguladas, medios y academia. Lo que duele, lo que se reclama, dónde están los abusos del sistema.
          Auditable. Anonimizado. Ley 21.719.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-2 rounded-full border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
          Datos derivados de consultas voluntarias · k-anonimato ≥ 5
        </div>
      </div>
    </section>
  );
}