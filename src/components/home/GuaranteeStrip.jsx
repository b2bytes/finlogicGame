import React from 'react';
import { Zap, Lock, HeartHandshake, Languages } from 'lucide-react';

const GUARANTEES = [
  {
    icon: Zap,
    title: 'Respuesta en 60 seg',
    desc: 'Pipeline IA optimizado',
    bg: 'bg-mint-100',
    color: 'text-mint-700',
  },
  {
    icon: HeartHandshake,
    title: 'Gratis para ciudadanos',
    desc: 'Sin tarjeta, sin trampas',
    bg: 'bg-[#FFE0CC]',
    color: 'text-orange-700',
  },
  {
    icon: Lock,
    title: '100% confidencial',
    desc: 'Tus datos nunca se venden',
    bg: 'bg-[#F0E5FF]',
    color: 'text-purple-700',
  },
  {
    icon: Languages,
    title: 'En tu idioma',
    desc: 'Cero tecnicismos legales',
    bg: 'bg-[#FFF3D6]',
    color: 'text-amber-700',
  },
];

export default function GuaranteeStrip() {
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {GUARANTEES.map((g) => (
            <div
              key={g.title}
              className="bg-card border border-border/60 rounded-[24px] p-5 md:p-6 hover:shadow-soft hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl ${g.bg} flex items-center justify-center mb-3`}>
                <g.icon className={`w-5 h-5 ${g.color}`} strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-sm md:text-base font-bold text-foreground leading-tight">
                {g.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {g.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}