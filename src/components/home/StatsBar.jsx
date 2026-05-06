import React from 'react';

const stats = [
  {
    value: '12.847',
    label: 'consultas',
    emoji: '🤓',
    bg: 'bg-gradient-to-br from-blue-300 to-blue-500',
  },
  {
    value: '3.291',
    label: 'documentos',
    emoji: '👍',
    bg: 'bg-gradient-to-br from-emerald-300 to-emerald-500',
  },
  {
    value: '8.412',
    label: 'ciudadanos',
    emoji: '🤝',
    bg: 'bg-gradient-to-br from-purple-300 to-purple-500',
  },
  {
    value: '94,2%',
    label: 'verificado',
    emoji: '✅',
    bg: 'bg-gradient-to-br from-orange-300 to-amber-500',
  },
];

export default function StatsBar() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative ${stat.bg} rounded-3xl p-6 md:p-7 overflow-hidden hover:shadow-soft-lg transition-all duration-300`}
            >
              <div className="text-3xl md:text-4xl mb-2">
                {stat.emoji}
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-sm">
                {stat.value}
              </div>
              <p className="mt-1 text-sm font-medium text-white/90">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}