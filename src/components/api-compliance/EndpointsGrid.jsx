import React from 'react';
import { Percent, Building2, FileSearch, AlertTriangle, Scale } from 'lucide-react';

const endpoints = [
  {
    icon: Percent,
    method: 'POST',
    path: '/check-tmc',
    title: 'Validación TMC',
    description: 'Verifica si la tasa de un crédito supera la Tasa Máxima Convencional vigente.',
    law: 'Ley 18.010',
  },
  {
    icon: Building2,
    method: 'POST',
    path: '/verify-entity',
    title: 'Verificación entidad',
    description: 'Confirma si una institución financiera está registrada y vigente en CMF.',
    law: 'Ley 21.521',
  },
  {
    icon: FileSearch,
    method: 'POST',
    path: '/regulatory-impact',
    title: 'Impacto regulatorio',
    description: 'Analiza un producto y devuelve normativa aplicable, riesgos y acciones recomendadas.',
    law: 'NCG 502 + 12 módulos',
  },
  {
    icon: AlertTriangle,
    method: 'POST',
    path: '/fraud-pattern-match',
    title: 'Detección de patrones de fraude',
    description: 'Cruza una transacción contra patrones CSIRT y alertas CMF activas.',
    law: 'Ley 20.009 · 21.663',
  },
  {
    icon: Scale,
    method: 'POST',
    path: '/consumer-rights-check',
    title: 'Derechos del consumidor',
    description: 'Audita un contrato o cláusula contra Ley del Consumidor y SERNAC Financiero.',
    law: 'Ley 19.496 · 20.555',
  },
];

export default function EndpointsGrid() {
  return (
    <section id="endpoints" className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-mint-700 uppercase tracking-wide mb-3">5 endpoints</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Compliance regulatorio como API.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cada llamada devuelve JSON estructurado con score, normativa citada y acciones sugeridas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {endpoints.map((ep) => {
            const Icon = ep.icon;
            return (
              <article
                key={ep.path}
                className="bg-card rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-mint-50 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-mint-700" strokeWidth={2.2} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-600 text-white tracking-wider">
                    {ep.method}
                  </span>
                  <code className="text-xs font-mono text-muted-foreground">{ep.path}</code>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{ep.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{ep.description}</p>
                <div className="pt-3 border-t border-border text-xs text-mint-700 font-semibold">
                  {ep.law}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}