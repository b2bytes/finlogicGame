import React from 'react';

/**
 * CrmStageBadge — pill semántica del lifecycle stage del lead.
 * Mapea a colores deck v11 FinLogic.
 */
const STAGE_CONFIG = {
  visitor:   { label: 'Visitante',  cls: 'bg-muted text-muted-foreground border-border' },
  lead:      { label: 'Lead',       cls: 'bg-mint-50 text-mint-700 border-mint-200' },
  activated: { label: 'Activada',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  engaged:   { label: 'Engaged',    cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  retained:  { label: 'Retenida',   cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  converted: { label: 'Pro',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  churned:   { label: 'Churn',      cls: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function CrmStageBadge({ stage }) {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG.visitor;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono-editorial uppercase px-2 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}