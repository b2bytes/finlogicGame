import React from 'react';
import { Sparkles } from 'lucide-react';

const TIERS = [
  {
    name: 'Vecino',
    range: '1–5 referidos',
    perks: ['Insignia digital "Vecino FinLogic"', 'Reconocimiento público en /Embajadores'],
    color: 'from-mint-100 to-mint-200',
    icon: '🌱',
  },
  {
    name: 'Líder de cuadra',
    range: '6–25 referidos',
    perks: ['Todo lo anterior', 'Pro gratis 6 meses', 'Acceso a sesión Q&A mensual con equipo legal'],
    color: 'from-purple-100 to-purple-200',
    icon: '🏘️',
  },
  {
    name: 'Voz del barrio',
    range: '26+ referidos',
    perks: ['Pro gratis vitalicio', 'Co-creación de contenido educativo', 'Mención en pitch deck'],
    color: 'from-amber-100 to-amber-200',
    icon: '📣',
  },
];

export default function ImpactList() {
  return (
    <section className="py-12">
      <div className="text-center mb-10">
        <p className="text-sm font-semibold text-mint-600 uppercase tracking-wide mb-2">
          Niveles de impacto
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Tu red de protección crece contigo
        </h2>
        <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
          Sin pagos en efectivo. Reconocimiento real, beneficios reales, comunidad real.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`bg-gradient-to-br ${tier.color} rounded-3xl p-6 border border-white/40 shadow-soft`}
          >
            <div className="text-4xl mb-3">{tier.icon}</div>
            <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
            <p className="text-xs font-semibold text-foreground/70 mt-1 mb-4">{tier.range}</p>
            <ul className="space-y-2">
              {tier.perks.map((p) => (
                <li key={p} className="flex items-start gap-2 text-sm text-foreground/90">
                  <Sparkles className="w-3.5 h-3.5 text-mint-600 flex-shrink-0 mt-0.5" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}