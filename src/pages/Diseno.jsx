import React from 'react';
import DesignHero from '@/components/diseno/DesignHero';
import UserFlowsMap from '@/components/diseno/UserFlowsMap';
import DesignSystem from '@/components/diseno/DesignSystem';
import SkinsShowcase from '@/components/diseno/SkinsShowcase';
import WireframesGallery from '@/components/diseno/WireframesGallery';
import DesignGuideChat from '@/components/diseno/DesignGuideChat';
import Footer from '@/components/home/Footer';

/**
 * /Diseno — Entregable jurado Claude Impact Lab
 * Responde a las 3 solicitudes de Diego:
 *   1. Mapa/diagrama de flujos de usuario
 *   2. Guía visual del diseño (sistema)
 *   3. Wireframes de pantallas faltantes
 * + Agente conversacional "Guía de Diseño" flotante
 */
export default function Diseno() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <main>
        <DesignHero />
        <SkinsShowcase />
        <UserFlowsMap />
        <DesignSystem />
        <WireframesGallery />
      </main>
      <Footer />
      <DesignGuideChat />
    </div>
  );
}