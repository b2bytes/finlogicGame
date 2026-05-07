import React from 'react';
import { Users, Sparkles, Briefcase, TrendingUp } from 'lucide-react';

/**
 * CrmStats — 4 KPIs ejecutivos del pipeline CRM (B2C+B2B+B2G).
 * Lee Leads en memoria y computa contadores, sin hits adicionales al backend.
 */
const KPIS = [
  { key: 'total', label: 'Personas en CRM', Icon: Users, color: 'mint' },
  { key: 'engaged', label: 'Activas (engaged+)', Icon: Sparkles, color: 'amber' },
  { key: 'b2b', label: 'B2B Fintech', Icon: Briefcase, color: 'violet' },
  { key: 'converted', label: 'Convertidas Pro', Icon: TrendingUp, color: 'emerald' },
];

const COLORS = {
  mint: 'bg-mint-50 border-mint-200 text-mint-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
};

export default function CrmStats({ leads = [] }) {
  const total = leads.length;
  const engaged = leads.filter((l) => ['engaged', 'retained', 'converted'].includes(l.lifecycleStage)).length;
  const b2b = leads.filter((l) => l.accountType === 'b2b_fintech').length;
  const converted = leads.filter((l) => l.convertedToPro || l.lifecycleStage === 'converted').length;

  const values = { total, engaged, b2b, converted };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {KPIS.map(({ key, label, Icon, color }) => (
        <div
          key={key}
          className="bg-card border border-border rounded-2xl p-4 hover:shadow-soft transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${COLORS[color]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono-editorial uppercase tracking-wider text-muted-foreground">
              {label}
            </span>
          </div>
          <p className="hero-number text-3xl text-foreground tabular-nums">{values[key]}</p>
        </div>
      ))}
    </div>
  );
}