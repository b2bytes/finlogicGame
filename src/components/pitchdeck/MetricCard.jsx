import React from 'react';

/**
 * MetricCard — slide 7 deck v11. Card pastel con icono + cifra-héroe + trend chip.
 */
export default function MetricCard({
  icon,
  value,
  trend,
  label,
  sublabel,
  bg = 'mint',
  valueTone = 'foreground',
}) {
  const bgs = {
    mint: 'bg-mint-50',
    peach: 'bg-[hsl(28_75%_94%)]',
    lilac: 'bg-[hsl(280_55%_95%)]',
    cream: 'bg-[hsl(50_85%_94%)]',
  };
  const valueTones = {
    foreground: 'text-foreground',
    accent: 'text-destructive',
    mint: 'text-mint-600',
  };

  return (
    <div className={`relative ${bgs[bg]} rounded-3xl p-6 sm:p-8 border border-border/40`}>
      <div className="flex items-start justify-between mb-6">
        <div className="text-2xl">{icon}</div>
        {trend && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-card/70 backdrop-blur-sm border border-border/40 text-[11px] font-mono-editorial text-muted-foreground">
            {trend}
          </span>
        )}
      </div>

      <p className={`hero-number ${valueTones[valueTone]} text-5xl sm:text-6xl`}>{value}</p>
      <p className="mt-3 text-sm font-medium text-foreground">{label}</p>
      {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>
  );
}