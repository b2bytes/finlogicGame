import React from 'react';

const stats = [
  {
    value: '12.847',
    label: 'consultas resueltas',
    emoji: '🤓',
    gradient: 'from-blue-100 to-blue-200',
    bg: 'bg-gradient-to-br from-blue-200/70 to-blue-300/60',
  },
  {
    value: '3.291',
    label: 'documentos generados',
    emoji: '👍',
    gradient: 'from-emerald-100 to-emerald-200',
    bg: 'bg-gradient-to-br from-emerald-200/70 to-emerald-300/60',
  },
  {
    value: '8.412',
    label: 'ciudadanos protegidos',
    emoji: '👥',
    gradient: 'from-purple-100 to-purple-200',
    bg: 'bg-gradient-to-br from-purple-200/70 to-purple-300/60',
  },
  {
    value: '94,2%',
    label: 'verificado',
    emoji: '🤔',
    gradient: 'from-orange-100 to-orange-200',
    bg: 'bg-gradient-to-br from-orange-200/70 to-orange-300/60',
  },
];

export default function StatsBar() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">
          Cómo funciona
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`relative ${stat.bg} rounded-3xl p-6 overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow`}
            >
              <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/60 backdrop-blur flex items-center justify-center text-xl">
                {stat.emoji}
              </div>
              <div className="mt-12 text-white">
                <div className="font-display text-4xl md:text-5xl font-bold tracking-tight drop-shadow-sm">
                  {stat.value}
                </div>
                <p className="mt-1 text-sm font-medium opacity-90">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}