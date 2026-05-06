import React from 'react';
import { ShieldCheck, Eye, Lock, Scale } from 'lucide-react';

const pillars = [
  {
    number: '01',
    icon: ShieldCheck,
    title: 'Registrada CMF',
    description: 'Operamos como PSBI bajo Ley Fintech 21.521. Sin atajos, sin letra chica.',
    bg: 'bg-[#E8F5E9]',
    iconColor: 'text-mint-700',
  },
  {
    number: '02',
    icon: Eye,
    title: 'Transparencia radical',
    description: 'Cada respuesta es auditable. Ve cómo el sistema llegó a tu solución en /Transparencia.',
    bg: 'bg-[#F0E5FF]',
    iconColor: 'text-purple-700',
  },
  {
    number: '03',
    icon: Lock,
    title: 'Tus datos son tuyos',
    description: 'Cumplimos Ley 21.719. Nunca compartimos credenciales bancarias. Nunca vendemos datos.',
    bg: 'bg-[#FFE0CC]',
    iconColor: 'text-orange-700',
  },
  {
    number: '04',
    icon: Scale,
    title: '12 normativas vivas',
    description: 'Ley Fintech, NCG 502, SERNAC, SII, datos, fraude, cripto, pyme. Todo el corpus regulatorio.',
    bg: 'bg-[#FFF3D6]',
    iconColor: 'text-amber-700',
  },
];

export default function TrustSection() {
  return (
    <section id="confianza" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Por qué confiar
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Mismo rigor que un banco.<br />
            <span className="text-muted-foreground">Para defenderte de uno.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="bg-card rounded-[28px] p-7 border border-border/60 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-xs font-bold tabular-nums text-muted-foreground">
                  {p.number}
                </span>
                <div className={`w-12 h-12 rounded-2xl ${p.bg} flex items-center justify-center`}>
                  <p.icon className={`w-5 h-5 ${p.iconColor}`} strokeWidth={2.2} />
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}