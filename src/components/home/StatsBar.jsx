import React from 'react';

const stats = [
  {
    value: '12.847',
    label: 'consultas',
    emoji: '🤓',
    bg: 'bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400',
  },
  {
    value: '3.291',
    label: 'documentos',
    emoji: '👍',
    bg: 'bg-gradient-to-br from-emerald-200 via-emerald-300 to-teal-400',
  },
  {
    value: '8.412',
    label: 'ciudadanos',
    emoji: '🤝',
    bg: 'bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400',
  },
  {
    value: '94,2%',
    label: 'verificado',
    emoji: '🤔',
    bg: 'bg-gradient-to-br from-orange-200 via-orange-300 to-amber-400',
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
              className={`relative ${stat.bg} rounded-3xl p-6 md:p-7 overflow-hidden hover:shadow-soft-lg transition-all duration-300 min-h-[160px] flex items-center gap-4`}
            >
              <div className="text-4xl md:text-5xl flex-shrink-0">
                {stat.emoji}
              </div>
              <div className="min-w-0">
                <div className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-sm leading-none">
                  {stat.value}
                </div>
                <p className="mt-1.5 text-sm font-medium text-white/90">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}