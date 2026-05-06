import React from 'react';
import DesignHero from '@/components/diseno/DesignHero';
import UserFlowsMap from '@/components/diseno/UserFlowsMap';
import DesignSystem from '@/components/diseno/DesignSystem';
import WireframesGallery from '@/components/diseno/WireframesGallery';
import Footer from '@/components/home/Footer';

/**
 * /Diseno — Entregable jurado Claude Impact Lab
 * Responde a las 3 solicitudes de Diego:
 *   1. Mapa/diagrama de flujos de usuario
 *   2. Guía visual del diseño (sistema)
 *   3. Wireframes de pantallas faltantes
 */
export default function Diseno() {
  return (
    <div className="min-h-[100dvh] bg-background">
      <main>
        <DesignHero />
        <UserFlowsMap />
        <DesignSystem />
        <WireframesGallery />
      </main>
      <Footer />
    </div>
  );
}