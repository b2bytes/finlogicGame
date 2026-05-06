import React from 'react';
import { TrendingUp, ShieldCheck, Award } from 'lucide-react';

export default function CasoOutcomeStats({ caso }) {
  const items = [];

  if (caso.amountInvolved && caso.amountInvolved > 0) {
    const formatted =
      caso.amountInvolved >= 1000000
        ? `$${(caso.amountInvolved / 1000000).toFixed(1)}M`
        : `$${Math.round(caso.amountInvolved / 1000).toLocaleString('es-CL')}K`;
    items.push({
      label: caso.status === 'resuelto' ? 'Recuperado' : 'En disputa',
      value: formatted,
      icon: TrendingUp,
      bg: 'bg-[#C5E8D5]',
      iconColor: 'text-mint-700',
    });
  }

  if (typeof caso.verifierScore === 'number' && caso.verifierScore > 0) {
    items.push({
      label: 'Score IA',
      value: `${Math.round(caso.verifierScore)}/100`,
      icon: ShieldCheck,
      bg: 'bg-[#DCC9F0]',
      iconColor: 'text-purple-700',
    });
  }

  if (caso.status === 'resuelto') {
    items.push({
      label: 'Estado',
      value: 'Resuelto',
      icon: Award,
      bg: 'bg-[#FFE08A]',
      iconColor: 'text-amber-700',
    });
  }

  if (items.length === 0) return null;

  const colsClass =
    items.length === 1 ? 'grid-cols-1' : items.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`grid ${colsClass} gap-3 mb-6`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} rounded-3xl p-5 transition-all`}
        >
          <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center mb-3">
            <item.icon className={`w-4 h-4 ${item.iconColor}`} strokeWidth={2.2} />
          </div>
          <div className="font-display text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-none tabular-nums">
            {item.value}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-foreground/70">{item.label}</p>
        </div>
      ))}
    </div>
  );
}