import React from 'react';
import { ShieldCheck, Eye, Lock, Scale } from 'lucide-react';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Registrada CMF',
    description: 'Operamos como PSBI bajo Ley Fintech 21.521. Sin atajos, sin letra chica.',
  },
  {
    icon: Eye,
    title: 'Transparencia radical',
    description: 'Cada respuesta es auditable. Ve cómo el sistema llegó a tu solución en /Transparencia.',
  },
  {
    icon: Lock,
    title: 'Tus datos son tuyos',
    description: 'Cumplimos Ley 21.719. Nunca compartimos credenciales bancarias. Nunca vendemos datos.',
  },
  {
    icon: Scale,
    title: 'Independiente',
    description: 'No emitimos productos financieros. No tenemos conflicto de interés con bancos.',
  },
];

export default function TrustSection() {
  return (
    <section id="confianza" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            Por qué confiar
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Mismo rigor que un banco.
            <span className="block text-muted-foreground"> Para defenderte de uno.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div key={p.title} className="bg-card rounded-3xl p-7 border border-border/60">
              <div className="w-11 h-11 rounded-2xl bg-mint-50 flex items-center justify-center mb-5">
                <p.icon className="w-5 h-5 text-mint-600" strokeWidth={2.2} />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
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