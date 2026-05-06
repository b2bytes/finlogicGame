import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Activity } from 'lucide-react';

const INTEGRATIONS = [
  { id: 'claude', name: 'Claude Sonnet 4.6', type: 'LLM' },
  { id: 'invokellm', name: 'InvokeLLM', type: 'AI' },
  { id: 'mindicador', name: 'mindicador.cl', type: 'API' },
  { id: 'cmf', name: 'CMF Alertas', type: 'Scraper' },
  { id: 'sendemail', name: 'SendEmail', type: 'Email' },
  { id: 'uploadfile', name: 'UploadFile', type: 'Storage' },
  { id: 'jspdf', name: 'jsPDF', type: 'Docs' },
  { id: 'github', name: 'GitHub', type: 'Repo' },
];

export default function IntegrationStatusGrid({ alerts = [] }) {
  const getStatus = (id) => {
    const failure = alerts.find(
      (a) =>
        a.alertType === 'integration_failure' &&
        a.affectedEntity?.toLowerCase().includes(id) &&
        a.status === 'open'
    );
    if (failure) return failure.severity === 'critical' ? 'down' : 'degraded';
    return 'healthy';
  };

  const config = {
    healthy: { Icon: CheckCircle2, cls: 'text-mint-600', bg: 'bg-mint-50 border-mint-200', label: 'Activa' },
    degraded: { Icon: AlertTriangle, cls: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Degradada' },
    down: { Icon: XCircle, cls: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', label: 'Caída' },
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="w-5 h-5 text-mint-600" />
        <h3 className="font-display text-lg font-bold text-foreground">Integraciones (8)</h3>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {INTEGRATIONS.map((int) => {
          const s = getStatus(int.id);
          const c = config[s];
          return (
            <div key={int.id} className={`rounded-2xl border p-3 ${c.bg}`}>
              <div className="flex items-start gap-2">
                <c.Icon className={`w-4 h-4 ${c.cls} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{int.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {int.type} · {c.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}