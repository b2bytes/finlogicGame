import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, KeyRound } from 'lucide-react';
import Logo from '@/components/home/Logo';
import APIKeyRow from '@/components/b2b/APIKeyRow';
import IssueKeyDialog from '@/components/b2b/IssueKeyDialog';

export default function B2BAPIKeys() {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    const data = await base44.entities.ComplianceAPIKey.list('-created_date', 100);
    setKeys(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalCalls = keys.reduce((sum, k) => sum + (k.callsUsedThisMonth || 0), 0);
  const activeKeys = keys.filter((k) => k.status === 'active' || k.status === 'trialing').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <Button onClick={() => setDialogOpen(true)} size="sm" className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-9">
            <Plus className="w-4 h-4 mr-1" />
            Emitir key
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="mb-8 animate-fade-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-700 text-xs font-semibold mb-4">
            <KeyRound className="w-3.5 h-3.5" />
            Compliance API B2B
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            API Keys
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
            Gestiona claves de acceso para fintechs y bancos que consumen los endpoints regulatorios de FinLogic.
            Plan base $490.000 CLP/mes con 10.000 llamadas.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Keys totales</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{keys.length}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Activas</p>
            <p className="font-display text-2xl font-bold text-mint-700 mt-1">{activeKeys}</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4">
            <p className="text-xs text-muted-foreground">Llamadas este mes</p>
            <p className="font-display text-2xl font-bold text-foreground mt-1">{totalCalls.toLocaleString()}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-3xl border border-border p-5 h-40 animate-pulse-soft" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border">
            <KeyRound className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-display text-xl font-semibold text-foreground">Sin keys emitidas</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Emite la primera para que fintechs aliadas consuman los endpoints regulatorios.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="mt-5 rounded-full bg-mint-500 hover:bg-mint-600 text-white">
              Emitir API Key
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {keys.map((k) => <APIKeyRow key={k.id} record={k} />)}
          </div>
        )}
      </main>

      <IssueKeyDialog open={dialogOpen} onOpenChange={setDialogOpen} onIssued={load} />
    </div>
  );
}