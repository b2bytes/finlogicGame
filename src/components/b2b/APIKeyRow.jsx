import React from 'react';
import { Building2, Activity } from 'lucide-react';

const planColors = {
  base: 'bg-mint-50 text-mint-700 border-mint-200',
  professional: 'bg-accent text-accent-foreground border-border',
  enterprise: 'bg-foreground text-background border-foreground',
};

const statusColors = {
  active: 'bg-mint-50 text-mint-700',
  trialing: 'bg-accent text-accent-foreground',
  suspended: 'bg-destructive/10 text-destructive',
  revoked: 'bg-muted text-muted-foreground',
};

export default function APIKeyRow({ record }) {
  const usagePct = Math.min(100, Math.round((record.callsUsedThisMonth / record.monthlyCallLimit) * 100));

  return (
    <div className="bg-card rounded-3xl border border-border p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-mint-50 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-mint-700" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold text-foreground truncate">{record.organizationName}</h3>
            <p className="text-xs text-muted-foreground font-mono">{record.apiKeyPrefix}…</p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${planColors[record.plan]}`}>
            {record.plan}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[record.status]}`}>
            {record.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Activity className="w-3.5 h-3.5" />
            Uso mensual
          </span>
          <span className="font-medium text-foreground">
            {record.callsUsedThisMonth?.toLocaleString() || 0} / {record.monthlyCallLimit?.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${usagePct > 90 ? 'bg-destructive' : 'bg-mint-500'}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
      </div>

      {record.contactEmail && (
        <p className="text-xs text-muted-foreground mt-3 truncate">{record.contactEmail}</p>
      )}
    </div>
  );
}