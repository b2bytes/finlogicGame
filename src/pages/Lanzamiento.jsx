import React from 'react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import LanzamientoHero from '@/components/lanzamiento/LanzamientoHero';
import TargetSpeakers from '@/components/lanzamiento/TargetSpeakers';
import PlanTactico from '@/components/lanzamiento/PlanTactico';
import MensajesListos from '@/components/lanzamiento/MensajesListos';
import KPIsLanzamiento from '@/components/lanzamiento/KPIsLanzamiento';

/**
 * /Lanzamiento — Plan de marketing para tomar Chile Fintech Forum 2026.
 * Documento operativo del equipo: targets, timeline, mensajes, KPIs.
 */
export default function Lanzamiento() {
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