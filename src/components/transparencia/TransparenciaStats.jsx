import React from 'react';

export default function TransparenciaStats({ traces }) {
  const total = traces.length;
  const avgScore = total > 0
    ? Math.round(traces.reduce((s, t) => s + (t.verifierScore || 0), 0) / total)
    : 0;
  const avgLatency = total > 0
    ? (traces.reduce((s, t) => s + (t.totalLatencyMs || 0), 0) / total / 1000).toFixed(1)
    : '0';
  const lawsSet = new Set();
  traces.forEach((t) => (t.lawsCited || []).forEach((l) => lawsSet.add(l)));

  const stats = [
    { value: total, label: 'Respuestas auditables' },
    { value: `${avgScore}/100`, label: 'Score promedio' },
    { value: `${avgLatency}s`, label: 'Latencia media' },
    { value: lawsSet.size, label: 'Normas citadas' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
      {stats.map((s) => (
        <div key={s.label} className="bg-card rounded-3xl border border-border p-5">
          <p className="font-display text-3xl font-bold text-foreground tracking-tight">{s.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}