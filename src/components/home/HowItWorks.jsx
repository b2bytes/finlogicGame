import React from 'react';
import { MessageCircle, Search, FileText, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: MessageCircle,
    number: '01',
    title: 'Cuéntanos qué pasó',
    description: 'En tus palabras. Sin formularios técnicos. Por texto o por voz.',
  },
  {
    icon: Search,
    number: '02',
    title: 'Identificamos tu derecho',
    description: 'Consultamos en vivo CMF, SERNAC, SII y la normativa chilena vigente.',
  },
  {
    icon: FileText,
    number: '03',
    title: 'Generamos el documento',
    description: 'Carta ARCO, reclamo SERNAC o denuncia CSIRT. Listo para enviar.',
  },
  {
    icon: ShieldCheck,
    number: '04',
    title: 'Hacemos seguimiento',
    description: 'Te avisamos antes de que venza el plazo. Tu caso, siempre vivo.',
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            Cómo funciona
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            De PDFs densos a acción concreta.
            <span className="text-muted-foreground"> En 4 pasos.</span>
          </h2>
        </div>

        <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Connector line — desktop only */}
          <div aria-hidden="true" className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-mint-200 to-transparent" />

          {steps.map((step, idx) => (
            <div
              key={step.number}
              className="group relative bg-card rounded-3xl p-7 border border-border/60 hover:border-mint-300 hover:shadow-soft transition-all duration-300"
            >
              <div className="relative w-12 h-12 rounded-2xl bg-mint-50 flex items-center justify-center mb-5 group-hover:bg-mint-500 transition-colors">
                <step.icon className="w-6 h-6 text-mint-600 group-hover:text-white transition-colors" />
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}