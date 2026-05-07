import React from 'react';
import AgentNetworkPanel from './AgentNetworkPanel';
import HeroCenterPanel from './HeroCenterPanel';
import RegulationStackPanel from './RegulationStackPanel';

/**
 * OpusHero — composición principal de la home Opus 4.7.
 * Grid 3 columnas en desktop: agents (3) | center (6) | regulation (3).
 * Mobile: stack vertical, center-panel primero.
 */

export default function OpusHero() {
  return (
    <section
      id="main"
      className="relative min-h-[calc(100vh-64px)] py-6 sm:py-8 px-3 sm:px-5 lg:px-6"
    >
      {/* Aurora de fondo */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.25) 0%, transparent 60%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 60%)' }}
        />
      </div>

      <div className="relative max-w-[1280px] mx-auto grid lg:grid-cols-12 gap-4 lg:gap-5">
        {/* Center primero en mobile, en col-2 en desktop */}
        <div className="lg:col-span-6 lg:order-2">
          <HeroCenterPanel />
        </div>

        {/* Left — agents */}
        <div className="lg:col-span-3 lg:order-1">
          <AgentNetworkPanel />
        </div>

        {/* Right — regulation */}
        <div className="lg:col-span-3 lg:order-3">
          <RegulationStackPanel />
        </div>
      </div>
    </section>
  );
}