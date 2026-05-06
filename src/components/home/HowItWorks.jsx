import React from 'react';
import { FileSearch, ShieldCheck, Bell } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FileSearch,
    title: 'Conecta tus cuentas',
    description: 'Tu cobro de APP correcto.',
    accentBg: 'bg-mint-50',
    accentText: 'text-mint-600',
    badge: '📊',
  },
  {
    number: '2',
    icon: ShieldCheck,
    title: 'Analizamos tus datos',
    description: 'Tu cobro de APP es correcto.',
    accentBg: 'bg-mint-50',
    accentText: 'text-mint-600',
    badge: '✅',
  },
  {
    number: '3',
    icon: Bell,
    title: 'Recibe informes y toma acción',
    description: 'Alerta: Movimientos irregulares detectados.',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    badge: '🙂',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-8">
          Cómo funciona
        </h2>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative bg-card rounded-3xl p-6 border border-border/60 hover:shadow-soft-lg transition-all duration-300 flex items-start gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl ${step.accentBg} flex items-center justify-center flex-shrink-0`}>
                <step.icon className={`w-7 h-7 ${step.accentText}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-mint-100 text-mint-700 text-xs font-bold flex items-center justify-center">
                    {step.number}
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground leading-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="text-2xl flex-shrink-0">{step.badge}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}