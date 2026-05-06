import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, BarChart3, ArrowRight, Check, Zap, Lock } from 'lucide-react';

export default function B2BSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-mint-50/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Para empresas
          </p>
          <h2 className="font-display text-3xl md:text-[44px] font-bold tracking-tight text-foreground leading-[1.05]">
            La misma IA que defiende ciudadanos,<br />
            <span className="text-mint-600">ahora protege tu fintech.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
            12 normativas chilenas vivas, verificador legal auditable y endpoints listos para integrar en horas, no meses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Compliance API card */}
          <div className="group bg-foreground text-background rounded-[32px] p-8 md:p-10 relative overflow-hidden hover:shadow-soft-lg transition-all">
            <div aria-hidden="true" className="absolute -top-32 -right-32 w-80 h-80 bg-mint-500/20 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-mint-500/20 flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-mint-300" strokeWidth={2.2} />
                </div>
                <span className="text-xs font-semibold text-mint-300 uppercase tracking-wider">
                  Compliance API
                </span>
              </div>

              <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-3">
                Compliance regulatorio<br />como API.
              </h3>
              <p className="text-background/70 leading-relaxed mb-6 max-w-md">
                Verifica TMC, valida entidades CMF, detecta patrones de fraude y obtén dictámenes legales en milisegundos.
              </p>

              {/* Mock terminal */}
              <div className="bg-black/40 backdrop-blur rounded-2xl p-4 border border-white/10 font-mono text-xs leading-relaxed mb-6">
                <div className="text-mint-300">POST /v1/check-tmc</div>
                <div className="text-background/50 mt-1">{`{ "tasa": 38.5, "monto": 500000 }`}</div>
                <div className="mt-3 text-background/40">→ 200 OK · 142ms</div>
                <div className="text-amber-300 mt-1">{`{ "valid": true, "tmc_max": 41.2 }`}</div>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
                {['5 endpoints listos', '99.9% uptime', 'SOC 2 ready'].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-xs text-background/80">
                    <Check className="w-3.5 h-3.5 text-mint-300" />
                    {t}
                  </div>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-500/10 border border-mint-500/20 mb-6">
                <span className="text-[10px] font-bold tracking-wider uppercase text-mint-300">
                  + Embed
                </span>
                <span className="text-xs text-background/75">
                  $0.015 USD / consulta · setup $2.5M
                </span>
              </div>

              <Link
                to="/api-compliance"
                className="inline-flex items-center gap-1.5 rounded-full bg-mint-500 hover:bg-mint-600 text-white h-11 px-5 text-sm font-semibold transition-colors"
              >
                Ver documentación
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Insights card */}
          <div className="group bg-card border border-border rounded-[32px] p-8 md:p-10 relative overflow-hidden hover:shadow-soft-lg transition-all">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#F0E5FF] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-700" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
                FinLogic Insights
              </span>
            </div>

            <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight leading-tight mb-3 text-foreground">
              El pulso financiero<br />de Chile, anonimizado.
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
              Dashboards mensuales de patrones de reclamos, organismos saturados y normativas más invocadas. Para reguladores, prensa y academia.
            </p>

            {/* Mock dashboard */}
            <div className="bg-secondary/60 rounded-2xl p-5 mb-6 space-y-3">
              {[
                { label: 'CMF', value: 37, color: 'bg-mint-500' },
                { label: 'SERNAC', value: 25, color: 'bg-purple-500' },
                { label: 'SII', value: 25, color: 'bg-amber-500' },
                { label: 'CSIRT', value: 13, color: 'bg-orange-500' },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-foreground w-16">{row.label}</span>
                  <div className="flex-1 h-2 bg-card rounded-full overflow-hidden">
                    <div
                      className={`h-full ${row.color} rounded-full`}
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums w-10 text-right">
                    {row.value}%
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-7">
              {[
                { icon: Lock, label: 'k-anonimato ≥ 5' },
                { icon: Zap, label: 'Datos en vivo' },
                { icon: Check, label: 'Ley 21.719' },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <t.icon className="w-3.5 h-3.5 text-mint-600" />
                  {t.label}
                </div>
              ))}
            </div>

            <Link
              to="/Insights"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground hover:bg-foreground/90 text-background h-11 px-5 text-sm font-semibold transition-colors"
            >
              Ver Insights
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}