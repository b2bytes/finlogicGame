import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import HeroNav from '@/components/home/HeroNav';
import MRRCard from '@/components/finance/MRRCard';

export default function FinancialDashboard() {
  const [snapshots, setSnapshots] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const me = await base44.auth.me().catch(() => null);
    setUser(me);
    if (me?.role !== 'admin') {
      setLoading(false);
      return;
    }
    const [snaps, alrts] = await Promise.all([
      base44.entities.RevenueSnapshot.list('-snapshotDate', 30),
      base44.entities.FinancialAlert.filter({ resolved: false }, '-created_date', 10),
    ]);
    setSnapshots(snaps);
    setAlerts(alrts);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await base44.functions.invoke('calculateMRR', {});
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroNav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <div className="h-32 bg-muted rounded-3xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <HeroNav />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Acceso restringido</h1>
          <p className="mt-3 text-muted-foreground">El dashboard financiero es solo para administradores.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </main>
      </div>
    );
  }

  const latest = snapshots[0];
  const prev = snapshots[1];
  const deltaTotal = prev?.totalMRR ? ((latest.totalMRR - prev.totalMRR) / prev.totalMRR) * 100 : 0;
  const deltaPro = prev?.mrrPro ? ((latest.mrrPro - prev.mrrPro) / prev.mrrPro) * 100 : 0;
  const deltaB2B = prev?.mrrComplianceAPI ? ((latest.mrrComplianceAPI - prev.mrrComplianceAPI) / prev.mrrComplianceAPI) * 100 : 0;

  const chartData = [...snapshots].reverse().map((s) => ({
    date: s.snapshotDate?.slice(5),
    MRR: s.totalMRR,
    Pro: s.mrrPro,
    B2B: s.mrrComplianceAPI,
  }));

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              FinOps Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {latest ? `Snapshot ${latest.snapshotDate}` : 'Sin snapshots aún'}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full bg-foreground hover:bg-foreground/90 text-background"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Recalcular MRR
          </Button>
        </div>

        {!latest ? (
          <div className="bg-card border border-border rounded-3xl p-10 text-center">
            <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="font-semibold text-foreground">Sin snapshots aún</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pulsa "Recalcular MRR" para generar el primer registro.
            </p>
          </div>
        ) : (
          <>
            {latest.executiveSummary && (
              <div className="mb-6 bg-card border border-border rounded-2xl p-5">
                <p className="text-xs font-semibold text-mint-600 uppercase tracking-wide mb-1.5">
                  Resumen ejecutivo
                </p>
                <p className="text-sm text-foreground leading-relaxed">{latest.executiveSummary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <MRRCard
                label="MRR Total"
                value={latest.totalMRR}
                delta={deltaTotal}
                sublabel={`ARR: ${(latest.totalARR || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })}`}
              />
              <MRRCard
                label="MRR Pro"
                value={latest.mrrPro}
                delta={deltaPro}
                sublabel={`${latest.activeProSubscribers} suscriptores`}
                accent="blue"
              />
              <MRRCard
                label="MRR Compliance API"
                value={latest.mrrComplianceAPI}
                delta={deltaB2B}
                sublabel={`${latest.activeB2BClients} clientes B2B`}
                accent="amber"
              />
            </div>

            {chartData.length > 1 && (
              <div className="bg-card border border-border rounded-3xl p-6 mb-8">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Evolución MRR ({chartData.length} días)
                </h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.75rem',
                        }}
                      />
                      <Line type="monotone" dataKey="MRR" stroke="hsl(var(--mint-500))" strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="Pro" stroke="hsl(var(--chart-3))" strokeWidth={1.5} dot={false} />
                      <Line type="monotone" dataKey="B2B" stroke="hsl(var(--chart-4))" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {alerts.length > 0 && (
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alertas activas ({alerts.length})
                </h2>
                <div className="space-y-3">
                  {alerts.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-100"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.message}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-200 text-orange-800">
                        {a.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}