import React from 'react';
import { Check, X, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROWS = [
  { feature: 'Consultas ciudadanas en lenguaje simple', free: true, pro: true },
  { feature: 'Cartas ARCO, reclamos SERNAC/CMF', free: true, pro: true },
  { feature: 'AgentTrace público auditable', free: true, pro: true },
  { feature: 'Modo accesibilidad y voz', free: true, pro: true },
  { feature: 'Plazos legales con alertas email', free: true, pro: true },
  { feature: 'Memoria persistente entre consultas', free: false, pro: true },
  { feature: 'Alertas WhatsApp 7d/3d/1d antes de plazo', free: false, pro: true },
  { feature: 'Generación PDF prioritaria (skip queue)', free: false, pro: true },
  { feature: 'Score verificador detallado por respuesta', free: false, pro: true },
  { feature: 'Asesoría 1:1 trimestral con aliado legal', free: false, pro: true },
  { feature: 'Soporte preferente <2 minutos', free: false, pro: true },
];

export default function PlanComparison() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="bg-card border border-border rounded-[28px] p-7 md:p-8 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Free
            </p>
            <h3 className="font-display text-3xl font-bold text-foreground">$0</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-6">
              Para todo ciudadano de Chile · siempre
            </p>

            <ul className="space-y-3 flex-1">
              {ROWS.map((row) => (
                <li key={row.feature} className="flex items-start gap-2.5 text-sm">
                  {row.free ? (
                    <Check className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" strokeWidth={2.6} />
                  ) : (
                    <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" strokeWidth={2.4} />
                  )}
                  <span className={row.free ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>
                    {row.feature}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/Consulta"
              className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-full bg-secondary hover:bg-mint-50 border border-border h-11 px-5 text-sm font-semibold text-foreground transition-colors"
            >
              Seguir gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-foreground text-background rounded-[28px] p-7 md:p-8 flex flex-col shadow-soft-lg overflow-hidden">
            <div aria-hidden="true" className="absolute -top-32 -right-32 w-80 h-80 bg-mint-500/25 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-mint-300">
                  Pro
                </p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-300/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3" />
                  Recomendado
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <h3 className="font-display text-3xl font-bold">$3.990</h3>
                <span className="text-sm text-background/60">CLP / mes</span>
              </div>
              <p className="text-sm text-background/70 mt-1 mb-6">
                7 días gratis · cancelable cuando quieras
              </p>

              <ul className="space-y-3 flex-1">
                {ROWS.map((row) => (
                  <li key={row.feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-mint-300 flex-shrink-0 mt-0.5" strokeWidth={2.6} />
                    <span className="text-background/90">{row.feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="mt-7 w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-mint-500 hover:bg-mint-600 h-11 px-5 text-sm font-semibold text-white transition-colors"
              >
                Empezar prueba de 7 días
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}