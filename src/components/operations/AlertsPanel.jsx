import React from 'react';
import { Bell, CheckCircle2 } from 'lucide-react';

const severityConfig = {
  critical: { cls: 'bg-destructive text-destructive-foreground', label: 'Crítica' },
  high: { cls: 'bg-destructive/15 text-destructive border border-destructive/30', label: 'Alta' },
  medium: { cls: 'bg-amber-100 text-amber-800 border border-amber-200', label: 'Media' },
  low: { cls: 'bg-secondary text-secondary-foreground', label: 'Baja' },
};

export default function AlertsPanel({ alerts = [], onResolve }) {
  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-mint-600" />
          <h3 className="font-display text-lg font-bold text-foreground">Alertas operacionales</h3>
        </div>
        <span className="text-xs text-muted-foreground">{alerts.length} abiertas</span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-8 h-8 mx-auto text-mint-500 mb-2" />
          <p className="text-sm font-medium text-foreground">Todo está bajo control</p>
          <p className="text-xs text-muted-foreground mt-1">Sin alertas activas en este momento.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {alerts.map((a) => {
            const c = severityConfig[a.severity] || severityConfig.medium;
            return (
              <div
                key={a.id}
                className="rounded-2xl border border-border bg-background p-4 hover:shadow-soft transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.cls}`}>
                    {c.label}
                  </span>
                  {onResolve && (
                    <button
                      onClick={() => onResolve(a.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Resolver
                    </button>
                  )}
                </div>
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                {a.description && (
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{a.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}