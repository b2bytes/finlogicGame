import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gauge, Zap, ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import MetricKPICard from '@/components/admin/MetricKPICard';

export default function SystemMetrics() {
  const [traces, setTraces] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      base44.entities.AgentTrace.list('-created_date', 200),
      base44.entities.OperationalAlert.filter({ status: 'open' }, '-created_date', 50),
    ])
      .then(([t, a]) => {
        if (!alive) return;
        setTraces(t || []);
        setAlerts(a || []);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const avgScore =
    traces.length > 0
      ? Math.round(traces.reduce((s, t) => s + (t.verifierScore || 0), 0) / traces.length)
      : 0;

  const avgLatency =
    traces.length > 0
      ? Math.round(traces.reduce((s, t) => s + (t.totalLatencyMs || 0), 0) / traces.length / 100) / 10
      : 0;

  const tracesPub = traces.filter((t) => t.isPublic).length;
  const openAlerts = alerts.length;

  // Distribución por organismo
  const byCat = traces.reduce((acc, t) => {
    const k = t.category || 'sin_categoria';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const totalCat = Object.values(byCat).reduce((a, b) => a + b, 0) || 1;
  const catRows = Object.entries(byCat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-semibold text-mint-600 mb-2 tracking-wider uppercase">
            Admin · Auto-evolución del sistema
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            System Metrics
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Pipeline IA en vivo. Score verificador, latencia, distribución de consultas y alertas operacionales abiertas.
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-secondary/50 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-4 mb-10">
              <MetricKPICard
                label="Score verificador"
                value={avgScore}
                suffix="/100"
                target="≥85 D+90"
                color="mint"
                icon={ShieldCheck}
                trend={avgScore >= 80 ? '✓ saludable' : avgScore >= 72 ? '→ baseline' : '↓ bajo target'}
              />
              <MetricKPICard
                label="Latencia promedio"
                value={avgLatency}
                suffix="s"
                target="<35s D+90"
                color="purple"
                icon={Zap}
                trend={avgLatency < 35 ? '✓ óptimo' : avgLatency < 49 ? '→ mejorando' : '↓ sobre baseline'}
              />
              <MetricKPICard
                label="Trazas públicas"
                value={tracesPub}
                target="auditables"
                color="orange"
                icon={Activity}
              />
              <MetricKPICard
                label="Alertas abiertas"
                value={openAlerts}
                target={openAlerts === 0 ? '0 = saludable' : 'Revisar'}
                color={openAlerts > 0 ? 'amber' : 'mint'}
                icon={AlertTriangle}
              />
            </div>

            {/* Distribución por categoría */}
            <section className="mb-10">
              <h2 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Gauge className="w-5 h-5 text-mint-600" />
                Distribución de consultas
              </h2>
              <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-3">
                {catRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin datos aún.</p>
                ) : (
                  catRows.map(([cat, count]) => {
                    const pct = Math.round((count / totalCat) * 100);
                    return (
                      <div key={cat} className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-foreground w-44 capitalize">
                          {cat.replace(/_/g, ' ')}
                        </span>
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mint-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground tabular-nums w-16 text-right">
                          {count} · {pct}%
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Alertas */}
            {openAlerts > 0 && (
              <section>
                <h2 className="font-display text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Alertas abiertas
                </h2>
                <div className="space-y-3">
                  {alerts.slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                      </div>
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          a.severity === 'critical'
                            ? 'bg-destructive/10 text-destructive'
                            : a.severity === 'high'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}