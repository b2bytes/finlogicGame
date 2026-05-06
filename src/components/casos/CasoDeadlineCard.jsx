import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function CasoDeadlineCard({ days, deadline }) {
  if (typeof days !== 'number' && !deadline) {
    return (
      <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="w-4 h-4" />
          <p className="text-sm font-medium">Sin plazo legal crítico</p>
        </div>
      </div>
    );
  }

  const isOverdue = days < 0;
  const isUrgent = days >= 0 && days <= 3;
  const isWarning = days > 3 && days <= 7;

  const config = isOverdue
    ? { bg: 'bg-destructive', text: 'text-destructive-foreground', icon: AlertTriangle, label: `Vencido hace ${Math.abs(days)} día${Math.abs(days) !== 1 ? 's' : ''}` }
    : isUrgent
    ? { bg: 'bg-destructive', text: 'text-destructive-foreground', icon: AlertTriangle, label: days === 0 ? 'Vence HOY' : `${days} día${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}` }
    : isWarning
    ? { bg: 'bg-mint-600', text: 'text-white', icon: Clock, label: `${days} días restantes` }
    : { bg: 'bg-mint-100', text: 'text-mint-700', icon: Clock, label: `${days} días restantes` };

  const Icon = config.icon;

  return (
    <div className={`rounded-3xl p-6 shadow-soft ${config.bg} ${config.text}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold opacity-80 uppercase tracking-wide">Plazo legal</p>
          <p className="font-display text-2xl font-bold mt-0.5 leading-tight">
            {config.label}
          </p>
          {deadline?.legalBasis && (
            <p className="text-xs opacity-90 mt-2">{deadline.legalBasis}</p>
          )}
        </div>
      </div>
    </div>
  );
}