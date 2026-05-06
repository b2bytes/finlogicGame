import React from 'react';
import { Folder, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

export default function MisCasosStats({ casos = [] }) {
  const total = casos.length;
  const resueltos = casos.filter((c) => c.status === 'resuelto').length;
  const enProceso = casos.filter((c) => ['abierto', 'en_proceso', 'documento_generado', 'enviado'].includes(c.status)).length;
  const totalRecuperado = casos
    .filter((c) => c.status === 'resuelto')
    .reduce((sum, c) => sum + (c.amountInvolved || 0), 0);

  const items = [
    {
      label: 'Casos totales',
      value: total,
      icon: Folder,
      bg: 'bg-[#C5E8D5]',
      iconColor: 'text-mint-700',
    },
    {
      label: 'Resueltos',
      value: resueltos,
      icon: CheckCircle2,
      bg: 'bg-[#DCC9F0]',
      iconColor: 'text-purple-700',
    },
    {
      label: 'En proceso',
      value: enProceso,
      icon: Clock,
      bg: 'bg-[#FFD4B0]',
      iconColor: 'text-orange-700',
    },
    {
      label: 'Recuperado',
      value: totalRecuperado > 0
        ? (totalRecuperado >= 1000000
            ? `$${(totalRecuperado / 1000000).toFixed(1)}M`
            : `$${Math.round(totalRecuperado / 1000).toLocaleString('es-CL')}K`)
        : '—',
      icon: TrendingUp,
      bg: 'bg-[#FFE08A]',
      iconColor: 'text-amber-700',
    },
  ];

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className={`${item.bg} rounded-[24px] p-5 hover:shadow-soft transition-all`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center">
              <item.icon className={`w-4 h-4 ${item.iconColor}`} strokeWidth={2.2} />
            </div>
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