import React from 'react';

const MEDIA = [
  { name: 'La Tercera', style: 'font-serif italic' },
  { name: 'El Mercurio', style: 'font-serif' },
  { name: 'BioBío', style: 'font-display' },
  { name: 'Pulso', style: 'font-display italic' },
  { name: 'Diario Financiero', style: 'font-serif' },
  { name: 'CIPER', style: 'font-display tracking-widest' },
];

export default function MediaLogos() {
  return (
    <section className="py-8 md:py-10 border-y border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-5">
          Mencionado en la prensa nacional
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-3">
          {MEDIA.map((m) => (
            <span
              key={m.name}
              className={`${m.style} text-base md:text-lg font-semibold text-foreground/35 hover:text-foreground/70 transition-colors tracking-tight grayscale`}
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}