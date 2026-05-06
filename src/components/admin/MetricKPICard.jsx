import React from 'react';

export default function MetricKPICard({ label, value, target, trend, color = 'mint', icon: Icon, suffix = '' }) {
  const palette = {
    mint: { bg: 'bg-mint-50', text: 'text-mint-700', border: 'border-mint-200' },
    purple: { bg: 'bg-[#F0E5FF]', text: 'text-purple-700', border: 'border-purple-200' },
    orange: { bg: 'bg-[#FFE5D0]', text: 'text-orange-700', border: 'border-orange-200' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  }[color] || { bg: 'bg-mint-50', text: 'text-mint-700', border: 'border-mint-200' };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-2xl ${palette.bg} flex items-center justify-center`}>
          {Icon && <Icon className={`w-5 h-5 ${palette.text}`} strokeWidth={2.2} />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold ${palette.text}`}>{trend}</span>
        )}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-display text-3xl font-bold text-foreground tabular-nums leading-none">
        {value}
        {suffix && <span className="text-base font-medium text-muted-foreground ml-1">{suffix}</span>}
      </p>
      {target && (
        <p className="text-xs text-muted-foreground mt-2">
          Target: <span className="font-semibold text-foreground">{target}</span>
        </p>
      )}
    </div>
  );
}