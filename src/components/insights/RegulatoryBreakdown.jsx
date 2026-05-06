import React from 'react';

const COLORS = {
  CMF: 'bg-mint-500',
  SERNAC: 'bg-purple-500',
  SII: 'bg-amber-500',
  CSIRT: 'bg-orange-500',
  BCN: 'bg-blue-500',
  FOGAPE: 'bg-emerald-500',
  SERCOTEC: 'bg-cyan-500',
  multiple: 'bg-slate-400',
};

export default function RegulatoryBreakdown({ breakdown }) {
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        ¿Quién recibe los reclamos?
      </h3>
      <p className="text-xs text-muted-foreground mb-5">
        Distribución por organismo regulador chileno
      </p>

      <div className="space-y-3">
        {sorted.map(([body, count]) => {
          const pct = (count / total) * 100;
          return (
            <div key={body}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="font-semibold text-foreground">{body}</span>
                <span className="text-muted-foreground tabular-nums">
                  {count} · {pct.toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full ${COLORS[body] || 'bg-slate-400'} rounded-full transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-5 text-[11px] text-muted-foreground border-t border-border pt-3">
        Útil para CMF, SERNAC y medios de comunicación · Datos en vivo
      </p>
    </div>
  );
}