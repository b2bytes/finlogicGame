import React from 'react';
import { Quote } from 'lucide-react';

const TESTIMONIOS = [
  {
    quote:
      'FinLogic me devolvió $145.000 que el banco me cobró por un seguro que nunca pedí. En tres días. Sin abogado.',
    author: 'María Pérez',
    role: 'Profesional, Santiago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
    metric: '$145K',
    metricLabel: 'recuperados',
    bg: 'bg-[#C5E8D5]',
  },
  {
    quote:
      'Mi mamá tiene 72 años y por primera vez entendió un cargo de su tarjeta. Le habló al chat como si fuera una persona.',
    author: 'Carolina Soto',
    role: 'Hija de Don Luis',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces',
    metric: '72 años',
    metricLabel: 'sin saber sus derechos',
    bg: 'bg-[#DCC9F0]',
  },
  {
    quote:
      'Como fintech regulada, integramos su API en 4 horas. Lo que antes nos tomaba un compliance officer full-time, ahora es una llamada HTTP.',
    author: 'Felipe Aguirre',
    role: 'CTO, fintech CMF',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
    metric: '4 horas',
    metricLabel: 'integración total',
    bg: 'bg-[#FFE08A]',
  },
];

export default function TestimoniosSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Lo que dicen
          </p>
          <h2 className="font-display text-3xl md:text-[44px] font-bold tracking-tight text-foreground leading-[1.05]">
            Una herramienta. Tres realidades.<br />
            <span className="text-mint-600">El mismo derecho.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIOS.map((t) => (
            <article
              key={t.author}
              className={`${t.bg} rounded-[28px] p-7 flex flex-col hover:shadow-soft-lg transition-all`}
            >
              <Quote className="w-7 h-7 text-foreground/30 mb-4" strokeWidth={2} />

              <p className="text-[15px] leading-relaxed text-foreground/90 font-medium flex-1 mb-6">
                "{t.quote}"
              </p>

              <div className="bg-white/60 backdrop-blur rounded-2xl p-3 mb-5">
                <div className="font-display text-2xl font-bold text-foreground tabular-nums leading-none">
                  {t.metric}
                </div>
                <p className="text-xs text-foreground/70 mt-1 font-medium">{t.metricLabel}</p>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white/80"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {t.author}
                  </p>
                  <p className="text-xs text-foreground/60">{t.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}