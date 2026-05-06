import React from 'react';
import { Zap, Target, Clock, FileText } from 'lucide-react';

export default function PipelineKPIs({ traces = [], docs = [] }) {
  const last24h = Date.now() - 24 * 60 * 60 * 1000;
  const recent = traces.filter((t) => new Date(t.created_date).getTime() > last24h);

  const avgScore = recent.length
    ? Math.round(recent.reduce((s, t) => s + (t.verifierScore || 72), 0) / recent.length)
    : 72;

  const latencies = recent.map((t) => t.totalLatencyMs).filter((l) => l > 0);
  const avgLatency = latencies.length
    ? (latencies.reduce((s, l) => s + l, 0) / latencies.length / 1000).toFixed(1)
    : '—';

  const docsToday = docs.filter((d) => new Date(d.created_date).getTime() > last24h).length;

  const kpis = [
    {
      label: 'Score IA',
      value: `${avgScore}/100`,
      icon: Target,
      color: avgScore >= 85 ? 'text-mint-600' : avgScore >= 70 ? 'text-amber-600' : 'text-destructive',
      bg: avgScore >= 85 ? 'bg-mint-50' : avgScore >= 70 ? 'bg-amber-50' : 'bg-destructive/10',
    },
    {
      label: 'Latencia avg',
      value: `${avgLatency}s`,
      icon: Clock,
      color: 'text-foreground',
      bg: 'bg-secondary',
    },
    {
      label: 'Consultas 24h',
      value: recent.length,
      icon: Zap,
      color: 'text-mint-700',
      bg: 'bg-mint-50',
    },
    {
      label: 'Documentos',
      value: docsToday,
      icon: FileText,
      color: 'text-foreground',
      bg: 'bg-accent',
    },
  ];

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-5">Pipeline · 24h</h3>
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className={`rounded-2xl p-4 ${k.bg}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {k.label}
              </p>
            </div>
            <p className={`font-display text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}