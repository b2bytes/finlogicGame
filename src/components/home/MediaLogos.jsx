import React from 'react';

const MEDIA = [
  'La Tercera',
  'El Mercurio',
  'BioBío',
  'Pulso',
  'Diario Financiero',
  'CIPER',
];

export default function MediaLogos() {
  return (
    <section className="py-8 md:py-10 border-y border-border/40 bg-gradient-to-r from-card/30 via-card/60 to-card/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-[10px] font-bold text-muted-foreground/80 uppercase tracking-[0.2em] mb-5">
          Cobertura editorial
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-3">
          {MEDIA.map((name) => (
            <span
              key={name}
              className="font-display text-base md:text-lg font-bold text-foreground/35 hover:text-foreground/60 transition-colors tracking-tight grayscale"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}