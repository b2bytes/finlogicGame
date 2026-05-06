import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import PymeHero from '@/components/pyme/PymeHero';
import PymeOnboardingForm from '@/components/pyme/PymeOnboardingForm';
import HealthScoreCard from '@/components/pyme/HealthScoreCard';
import TaxAlertCard from '@/components/pyme/TaxAlertCard';

export default function Pyme() {
  const [pymes, setPymes] = useState([]);
  const [activePyme, setActivePyme] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadPymes = async () => {
    setLoading(true);
    const list = await base44.entities.PymeProfile.list('-created_date', 20);
    setPymes(list);
    if (list.length > 0 && !activePyme) {
      await selectPyme(list[0]);
    }
    setLoading(false);
  };

  const selectPyme = async (pyme) => {
    setActivePyme(pyme);
    setSummary('');
    const a = await base44.entities.TaxAlert.filter(
      { pymeProfileId: pyme.id },
      '-created_date',
      50
    );
    setAlerts(a);
  };

  useEffect(() => {
    loadPymes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (form) => {
    setAnalyzing(true);
    const created = await base44.entities.PymeProfile.create(form);
    const res = await base44.functions.invoke('analyzeTaxSituation', {
      pymeProfileId: created.id,
    });
    if (res?.data?.summary) setSummary(res.data.summary);
    const refreshed = await base44.entities.PymeProfile.get(created.id);
    setActivePyme(refreshed);
    const a = await base44.entities.TaxAlert.filter(
      { pymeProfileId: created.id },
      '-created_date',
      50
    );
    setAlerts(a);
    const list = await base44.entities.PymeProfile.list('-created_date', 20);
    setPymes(list);
    setShowForm(false);
    setAnalyzing(false);
  };

  const handleReanalyze = async () => {
    if (!activePyme) return;
    setAnalyzing(true);
    const res = await base44.functions.invoke('analyzeTaxSituation', {
      pymeProfileId: activePyme.id,
    });
    if (res?.data?.summary) setSummary(res.data.summary);
    const refreshed = await base44.entities.PymeProfile.get(activePyme.id);
    setActivePyme(refreshed);
    const a = await base44.entities.TaxAlert.filter(
      { pymeProfileId: activePyme.id },
      '-created_date',
      50
    );
    setAlerts(a);
    setAnalyzing(false);
  };

  const showOnboarding = !loading && (pymes.length === 0 || showForm);

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <main>
        <PymeHero />

        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            {pymes.length > 0 && !showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
                className="rounded-full"
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar pyme
              </Button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-40 bg-muted rounded-3xl animate-pulse" />
              <div className="h-24 bg-muted rounded-2xl animate-pulse" />
              <div className="h-24 bg-muted rounded-2xl animate-pulse" />
            </div>
          ) : showOnboarding ? (
            <div className="max-w-3xl">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Cuéntanos de tu pyme
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                Necesitamos lo mínimo para ejecutar el primer análisis tributario y de salud financiera.
              </p>
              <PymeOnboardingForm onSubmit={handleCreate} submitting={analyzing} />
            </div>
          ) : activePyme ? (
            <div className="space-y-8">
              {pymes.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {pymes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPyme(p)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        activePyme.id === p.id
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {p.businessName}
                    </button>
                  ))}
                </div>
              )}

              <HealthScoreCard pyme={activePyme} summary={summary} />

              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  Alertas tributarias ({alerts.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReanalyze}
                  disabled={analyzing}
                  className="rounded-full"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {analyzing ? 'Analizando…' : 'Re-analizar'}
                </Button>
              </div>

              {alerts.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Aún no hay alertas. Ejecuta un análisis para generarlas.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {alerts.map((a) => (
                    <TaxAlertCard key={a.id} alert={a} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  );
}