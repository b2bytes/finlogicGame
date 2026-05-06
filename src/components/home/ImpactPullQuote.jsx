import React from 'react';
import { Quote } from 'lucide-react';

// Pull quote del pitch Claude Impact Lab — apertura del mandato (página 361).
// Usa typography editorial Apple-style para dar peso narrativo.
export default function ImpactPullQuote() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <Quote className="w-10 h-10 text-mint-300 mx-auto mb-6" strokeWidth={1.5} />
        <p className="font-display text-2xl md:text-4xl lg:text-[44px] font-bold tracking-tight text-foreground leading-[1.15]">
          Hoy en Chile hay <span className="text-mint-600">500.000 personas</span> que presentaron un reclamo en SERNAC sin saber si tenían razón.
        </p>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Eso no es ignorancia. Es un sistema diseñado para ser incomprensible.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-mint-700 uppercase tracking-wider">
          <span className="w-8 h-px bg-mint-300" />
          FinLogic existe para cambiarlo
          <span className="w-8 h-px bg-mint-300" />
        </div>
      </div>
    </section>
  );
}