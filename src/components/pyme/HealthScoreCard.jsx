import React from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Activity, ShieldAlert } from 'lucide-react';

const LABEL_CONFIG = {
  critico: { color: 'text-red-700', bg: 'from-red-100 to-red-200', icon: ShieldAlert, text: 'Crítico' },
  en_riesgo: { color: 'text-orange-700', bg: 'from-orange-100 to-amber-200', icon: AlertTriangle, text: 'En riesgo' },
  estable: { color: 'text-blue-700', bg: 'from-blue-100 to-blue-200', icon: Activity, text: 'Estable' },
  saludable: { color: 'text-mint-700', bg: 'from-mint-100 to-emerald-200', icon: CheckCircle2, text: 'Saludable' },
  excelente: { color: 'text-emerald-800', bg: 'from-emerald-200 to-teal-300', icon: TrendingUp, text: 'Excelente' },
};

export default function HealthScoreCard({ pyme, summary }) {
  const cfg = LABEL_CONFIG[pyme.financialHealthLabel] || LABEL_CONFIG.estable;
  const Icon = cfg.icon;
  const score = pyme.financialHealthScore ?? 0;

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br ${cfg.bg} p-6 md:p-8 shadow-soft`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${cfg.color}`}>
            <Icon className="w-4 h-4" />
            {cfg.text}
          </div>
          <h3 className="mt-2 font-display text-2xl md:text-3xl font-bold text-foreground truncate">
            {pyme.businessName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            RUT {pyme.rut} · {pyme.taxRegime?.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className={`font-display text-5xl md:text-6xl font-bold ${cfg.color} leading-none`}>
            {score}
          </div>
          <div className="text-xs text-muted-foreground mt-1">salud /100</div>
        </div>
      </div>

      {summary && (
        <p className="mt-5 text-sm md:text-base text-foreground/80 leading-relaxed">
          {summary}
        </p>
      )}
    </div>
  );
}