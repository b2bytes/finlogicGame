import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const accentMap = {
  default: 'text-mint-700 bg-mint-50',
  blue: 'text-blue-700 bg-blue-50',
  amber: 'text-amber-700 bg-amber-50',
};

export default function MRRCard({ label, value, delta = 0, sublabel, accent = 'default' }) {
  const isUp = delta >= 0;
  const formatted = (value || 0).toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <p className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full ${accentMap[accent]}`}>
          {label}
        </p>
        {delta !== 0 && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              isUp ? 'text-mint-700' : 'text-destructive'
            }`}
          >
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-foreground tracking-tight">{formatted}</p>
      {sublabel && <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>}
    </div>
  );
}