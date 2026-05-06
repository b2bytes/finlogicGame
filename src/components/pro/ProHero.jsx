import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

export default function ProHero({ trigger }) {
  const triggerCopy = {
    second_case: {
      eyebrow: 'Tu segundo caso · momento Pro',
      title: 'Vas en serio. Te toca un upgrade.',
    },
    deadline_critical: {
      eyebrow: 'Plazo legal a menos de 5 días',
      title: 'No dejes que un plazo te cueste tu derecho.',
    },
    document_generated: {
      eyebrow: 'Acabas de generar un documento',
      title: 'Conviértelo en hábito. Conviértelo en derecho.',
    },
    default: {
      eyebrow: 'FinLogic Pro',
      title: 'Sigue gratis. O potencia tu defensa.',
    },
  };

  const t = triggerCopy[trigger] || triggerCopy.default;

  return (
    <section className="relative pt-12 pb-10 md:pt-20 md:pb-14 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-mint-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#FFD9B8]/40 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-semibold text-mint-700">{t.eyebrow}</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
          {t.title}
        </h1>

        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          La capa ciudadana es <span className="font-semibold text-foreground">gratuita para siempre</span>.
          Pro suma memoria, alertas WhatsApp y prioridad por <span className="font-semibold text-mint-700">$3.990 CLP/mes</span>.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold">
          <Crown className="w-3.5 h-3.5 text-amber-300" />
          7 días gratis · cancela cuando quieras
        </div>
      </div>
    </section>
  );
}