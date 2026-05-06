import React from 'react';

const stats = [
  { value: '5M', label: 'chilenos sin acceso a sus derechos financieros' },
  { value: '12', label: 'módulos normativos integrados' },
  { value: '49s', label: 'pipeline auditable end-to-end' },
  { value: '$0', label: 'siempre, para el ciudadano' },
];

export default function StatsBar() {
  return (
    <section className="py-12 border-y border-border/40 bg-card/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <div className="font-display text-4xl md:text-5xl font-bold text-mint-600 tracking-tight">
                {stat.value}
              </div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-snug">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}