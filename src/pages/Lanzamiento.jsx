import React from 'react';
import { Lock, Loader2 } from 'lucide-react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import LanzamientoHero from '@/components/lanzamiento/LanzamientoHero';
import TargetSpeakers from '@/components/lanzamiento/TargetSpeakers';
import PlanTactico from '@/components/lanzamiento/PlanTactico';
import MensajesListos from '@/components/lanzamiento/MensajesListos';
import KPIsLanzamiento from '@/components/lanzamiento/KPIsLanzamiento';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

/**
 * /Admin/Lanzamiento — Plan de marketing para tomar Chile Fintech Forum 2026.
 * PRIVADO · solo admin (Gabriel). Documento operativo interno: targets,
 * timeline, mensajes, KPIs. NO listado en navegación pública.
 */
export default function Lanzamiento() {
  const { user, isLoadingAuth } = useAuth();

  // Loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-mint-600" />
      </div>
    );
  }

  // Gate: solo admin puede ver esta página
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-card border border-border rounded-3xl p-10 shadow-soft">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-mint-50 inline-flex items-center justify-center">
            <Lock className="w-6 h-6 text-mint-600" />
          </div>
          <h1 className="font-editorial text-2xl text-foreground mb-2">Página privada</h1>
          <p className="text-sm text-muted-foreground mb-6">
            El plan de lanzamiento es interno del equipo FinLogic. Si eres admin, inicia sesión para verlo.
          </p>
          {!user ? (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="px-5 h-11 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-sm font-semibold transition-colors"
            >
              Iniciar sesión
            </button>
          ) : (
            <a
              href="/"
              className="inline-block px-5 h-11 leading-[44px] rounded-full bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition-colors"
            >
              Volver al inicio
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main id="main">
        <LanzamientoHero />
        <TargetSpeakers />
        <PlanTactico />
        <MensajesListos />
        <KPIsLanzamiento />
      </main>
      <Footer />
    </div>
  );
}