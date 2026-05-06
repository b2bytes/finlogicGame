import React from 'react';

const stats = [
  {
    value: '12.847',
    label: 'consultas resueltas',
    emoji: '🤓',
    bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    accent: 'text-blue-700',
    border: 'border-blue-200/60',
  },
  {
    value: '3.291',
    label: 'documentos generados',
    emoji: '👍',
    bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    accent: 'text-emerald-700',
    border: 'border-emerald-200/60',
  },
  {
    value: '8.412',
    label: 'ciudadanos protegidos',
    emoji: '🤝',
    bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
    accent: 'text-purple-700',
    border: 'border-purple-200/60',
  },
  {
    value: '94,2%',
    label: 'verificado',
    emoji: '✅',
    bg: 'bg-gradient-to-br from-orange-50 to-amber-100',
    accent: 'text-orange-700',
    border: 'border-orange-200/60',
  },
];

export default function StatsBar() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            En números
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Tracción real, sin filtros.
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative ${stat.bg} ${stat.border} border rounded-3xl p-6 overflow-hidden hover:shadow-soft transition-shadow`}
            >
              <div className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur flex items-center justify-center text-xl mb-6 shadow-soft">
                {stat.emoji}
              </div>
              <div className={`font-display text-4xl md:text-5xl font-bold tracking-tight ${stat.accent}`}>
                {stat.value}
              </div>
              <p className="mt-1 text-sm font-medium text-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}