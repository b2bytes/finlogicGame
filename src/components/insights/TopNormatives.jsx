import React from 'react';
import { BookOpen } from 'lucide-react';

const LABELS = {
  ley_19496_sernac: 'Ley 19.496 — Consumidor',
  ley_20009_fraude: 'Ley 20.009 — Fraude',
  ley_21521: 'Ley 21.521 — Fintech',
  ncg_502_cmf: 'NCG 502 — CMF',
  ley_20555: 'Ley 20.555 — SERNAC Financiero',
  ley_21719_datos: 'Ley 21.719 — Datos personales',
  ley_21663_ciberseguridad: 'Ley 21.663 — Ciberseg.',
  lir_propyme: 'LIR Pro-Pyme',
  ley_21713_tributaria: 'Ley 21.713 — Tributaria',
  open_finance: 'Open Finance',
  csirt: 'CSIRT',
  tributacion_cripto: 'Tributación Cripto',
};

export default function TopNormatives({ data }) {
  const sorted = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-1">
        <BookOpen className="w-4 h-4 text-mint-600" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Normativa más invocada
        </h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Las 6 leyes que más protegen al ciudadano hoy
      </p>

      <ol className="space-y-2.5">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Sin datos suficientes aún.</p>
        ) : (
          sorted.map(([key, count], idx) => (
            <li
              key={key}
              className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border/40"
            >
              <span className="font-display text-lg font-bold text-mint-600 tabular-nums w-6">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {LABELS[key] || key}
                </p>
              </div>
              <span className="text-xs font-bold text-foreground bg-mint-50 px-2 py-1 rounded-full border border-mint-200 tabular-nums">
                {count}×
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}