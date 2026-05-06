import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import HeroNav from '@/components/home/HeroNav';
import IntegrationStatusGrid from '@/components/operations/IntegrationStatusGrid';
import PipelineKPIs from '@/components/operations/PipelineKPIs';
import UpcomingDeadlines from '@/components/operations/UpcomingDeadlines';
import AlertsPanel from '@/components/operations/AlertsPanel';

export default function OperacionesDashboard() {
  const [user, setUser] = useState(null);
  const [traces, setTraces] = useState([]);
  const [docs, setDocs] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const me = await base44.auth.me().catch(() => null);
    setUser(me);
    if (me?.role !== 'admin') {
      setLoading(false);
      return;
    }
    const [t, d, dl, a] = await Promise.all([
      base44.entities.AgentTrace.filter({ pipelineStage: 'complete' }, '-created_date', 100).catch(() => []),
      base44.entities.GeneratedDocument.list('-created_date', 100).catch(() => []),
      base44.entities.LegalDeadline.filter({ status: 'pendiente' }, '-deadlineDate', 30).catch(() => []),
      base44.entities.OperationalAlert.filter({ status: 'open' }, '-created_date', 20).catch(() => []),
    ]);
    setTraces(t || []);
    setDocs(d || []);
    setDeadlines(dl || []);
    setAlerts(a || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      base44.functions.invoke('monitorIntegrations', {}).catch(() => null),
      base44.functions.invoke('detectScoreAnomaly', {}).catch(() => null),
    ]);
    await load();
    setRefreshing(false);
  };

  const handleResolveAlert = async (id) => {
    await base44.entities.OperationalAlert.update(id, { status: 'resolved', resolvedAt: new Date().toISOString() });
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <HeroNav />
        <main className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-card rounded-3xl border border-border animate-pulse-soft" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <HeroNav />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Acceso restringido</h1>
          <p className="mt-3 text-muted-foreground">El panel COO Digital es solo para administradores.</p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </main>
      </div>
    );
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 md:py-14">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                COO Digital
              </h1>
              {criticalCount > 0 && (
                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-destructive text-destructive-foreground animate-pulse-soft">
                  {criticalCount} {criticalCount === 1 ? 'alerta' : 'alertas'}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Operaciones autónomas 24/7 · monitoreo cada hora
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-full bg-foreground hover:bg-foreground/90 text-background"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refrescar checks
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <PipelineKPIs traces={traces} docs={docs} />
          <IntegrationStatusGrid alerts={alerts} />
          <UpcomingDeadlines deadlines={deadlines} />
          <AlertsPanel alerts={alerts} onResolve={handleResolveAlert} />
        </div>

        <div className="mt-8 bg-foreground text-background rounded-3xl p-6 md:p-8">
          <p className="text-xs font-bold text-mint-300 uppercase tracking-wider mb-2">
            Automatizaciones activas
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-semibold">monitorIntegrations</p>
              <p className="text-xs text-background/60 mt-1">Cada 15 min · Check de 8 servicios</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-semibold">detectScoreAnomaly</p>
              <p className="text-xs text-background/60 mt-1">Cada hora · Score &lt; 65 ⇒ alerta</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-sm font-semibold">calculateMRR</p>
              <p className="text-xs text-background/60 mt-1">Diario 03:05 UTC · FinOps snapshot</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}