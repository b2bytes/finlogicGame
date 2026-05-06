import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const config = {
  critical: { label: 'Urgente', icon: AlertTriangle, cls: 'bg-destructive/10 text-destructive border-destructive/20' },
  high: { label: 'Alta prioridad', icon: AlertCircle, cls: 'bg-accent text-accent-foreground border-accent' },
  medium: { label: 'Atención', icon: Info, cls: 'bg-mint-50 text-mint-700 border-mint-200' },
  low: { label: 'Informativo', icon: Info, cls: 'bg-secondary text-secondary-foreground border-border' },
  resolved: { label: 'Resuelto', icon: CheckCircle2, cls: 'bg-mint-50 text-mint-700 border-mint-200' },
};

export default function UrgencyBadge({ level = 'medium' }) {
  const c = config[level] || config.medium;
  const Icon = c.icon;
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${c.cls}`}>
      <Icon className="w-3.5 h-3.5" strokeWidth={2.4} />
      {c.label}
    </div>
  );
}