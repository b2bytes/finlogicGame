import React from 'react';
import { MessageSquare, Sparkles, FileCheck2, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Cuéntanos en tus palabras.',
    description: 'Sin formularios, sin tecnicismos. Banco, SII, fraude, datos o pyme — habla o escribe lo que pasa.',
    iconBg: 'bg-mint-100',
    iconColor: 'text-mint-700',
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Lya identifica tu derecho.',
    description: 'Pipeline auditable de 4 capas: triage → especialista → verificador → acción. 12 leyes chilenas vivas.',
    iconBg: 'bg-[#F0E5FF]',
    iconColor: 'text-purple-700',
  },
  {
    number: '03',
    icon: FileCheck2,
    title: 'Recibe tu documento listo.',
    description: 'Carta ARCO, reclamo SERNAC, denuncia CMF, formulario SII o reporte CSIRT. Tu firma y listo.',
    iconBg: 'bg-[#FFE0CC]',
    iconColor: 'text-orange-700',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Cómo funciona
          </p>
          <h2 className="font-display text-3xl md:text-[40px] font-bold tracking-tight text-foreground leading-[1.05]">
            De tu problema a la acción<br />
            <span className="text-mint-600">en 3 pasos.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group relative bg-card rounded-[28px] p-7 border border-border/60 hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className={`w-14 h-14 rounded-2xl ${step.iconBg} flex items-center justify-center`}>
                  <step.icon className={`w-6 h-6 ${step.iconColor}`} strokeWidth={2.2} />
                </div>
                <span className="font-display text-3xl font-bold tabular-nums text-foreground/15 leading-none">
                  {step.number}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-foreground mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-[3.5rem] -right-3 w-6 h-6 rounded-full bg-card border border-border shadow-soft items-center justify-center z-10">
                  <ArrowRight className="w-3 h-3 text-mint-600" />
                </div>
              )}
            </div>
          ))}</div>
      </div>
    </section>
  );
}