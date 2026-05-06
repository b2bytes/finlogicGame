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
    <section className="py-10 md:py-12 border-y border-border/40 bg-card/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Mencionado en
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 md:gap-x-14 gap-y-4">
          {MEDIA.map((name) => (
            <span
              key={name}
              className="font-display text-lg md:text-xl font-bold text-foreground/40 hover:text-foreground/70 transition-colors tracking-tight"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}