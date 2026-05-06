import React from 'react';
import { TrendingUp, AlertTriangle, Scale, Users } from 'lucide-react';

export default function InsightMetrics({ stats }) {
  const items = [
    {
      label: 'Consultas procesadas',
      value: stats.totalConsultas.toLocaleString('es-CL'),
      delta: '+18% vs mes anterior',
      icon: TrendingUp,
      color: 'text-mint-600 bg-mint-50',
    },
    {
      label: 'Casos críticos detectados',
      value: stats.criticalCases.toLocaleString('es-CL'),
      delta: 'fraude + cobros indebidos',
      icon: AlertTriangle,
      color: 'text-orange-600 bg-orange-50',
    },
    {
      label: 'Score promedio IA',
      value: `${stats.avgScore}/100`,
      delta: 'verificación legal',
      icon: Scale,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Ciudadanos únicos',
      value: stats.uniqueCitizens.toLocaleString('es-CL'),
      delta: 'última actividad: hoy',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.label} className="bg-card rounded-3xl border border-border p-5 shadow-soft">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {m.label}
            </p>
            <p className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1 tabular-nums">
              {m.value}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{m.delta}</p>
          </div>
        );
      })}
    </div>
  );
}