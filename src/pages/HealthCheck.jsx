import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import HealthCheckPanel from '@/components/admin/health/HealthCheckPanel';
import VisitTracesPanel from '@/components/admin/health/VisitTracesPanel';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';

/**
 * /Admin/HealthCheck — Página privada admin con dos secciones:
 *  1. Tester de salud (recorre backend + entidades + integraciones)
 *  2. Recorridos privados (sesiones reales + bounce + errores)
 *
 * Acceso restringido: role === 'admin'.
 */
export default function HealthCheck() {
  const { user, isLoadingAuth } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (isLoadingAuth) return;
    setAllowed(user?.role === 'admin');
    setAuthChecked(true);
  }, [user, isLoadingAuth]);

  if (!authChecked || isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 mb-5">
            <ShieldCheck className="w-7 h-7 text-amber-700" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Acceso restringido</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Este panel es interno del equipo FinLogic. Solo administradores autenticados pueden verlo.
          </p>
          <button
            onClick={() => base44.auth.redirectToLogin('/Admin/HealthCheck')}
            className="inline-flex h-11 px-6 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-8">
        <header className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-mint-700 mb-1">
              Admin · Operaciones internas
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Health Check & Recorridos
            </h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Tester en vivo del sistema y dashboard privado de sesiones reales.
              Solo visible para administradores. Los datos de recorridos NUNCA
              se exponen al público.
            </p>
          </div>
        </header>

        <HealthCheckPanel />
        <VisitTracesPanel />
      </div>

      <Footer />
    </div>
  );
}