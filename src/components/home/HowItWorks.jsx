import React from 'react';
import { FileSearch, ShieldCheck, Bell } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: FileSearch,
    title: 'Tu cobro de APP correcto.',
    actionLabel: 'Conecta tus cuentas',
    accentBg: 'bg-mint-50',
    accentText: 'text-mint-600',
    decorBg: 'bg-blue-50',
    decor: '📊',
  },
  {
    number: '2',
    icon: ShieldCheck,
    title: 'Tu cobro de APP es correcto.',
    actionLabel: 'Analizamos tus datos',
    accentBg: 'bg-mint-50',
    accentText: 'text-mint-600',
    decorBg: 'bg-mint-50',
    decor: '✅',
  },
  {
    number: '3',
    icon: Bell,
    title: 'Alerta: Movimientos irregulares detectados.',
    actionLabel: 'Recibe informes y toma acción',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-600',
    decorBg: 'bg-amber-50',
    decor: '🙂',
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
              className="group relative bg-card rounded-3xl p-6 border border-border/60 hover:shadow-soft-lg transition-all duration-300"
            >
              {/* Top row: icon big + title */}
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-2xl ${step.accentBg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`w-6 h-6 ${step.accentText} flex items-center justify-center`}>
                    <step.icon className="w-6 h-6" />
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground leading-snug pt-1">
                  {step.title}
                </p>
              </div>

              {/* Bottom row: numbered action + decor */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground flex-shrink-0">
                    {step.number}.
                  </span>
                  <span className="text-sm font-medium text-foreground truncate">
                    {step.actionLabel}
                  </span>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${step.decorBg} flex items-center justify-center flex-shrink-0 text-2xl`}>
                  {step.decor}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}