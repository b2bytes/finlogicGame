import React from 'react';
import LiveImpactPanel from './LiveImpactPanel';
import HeroCenterPanel from './HeroCenterPanel';
import RegulationStackPanel from './RegulationStackPanel';

/**
 * OpusHero — composición principal de la home Opus 4.7 SIN SCROLL.
 * Llena exactamente el viewport (h-[calc(100vh-64px)]) en lg+.
 * Grid 3 cols: live impact (3) | center hero+orb+voz (6) | regulation (3).
 * Mobile: stack vertical scrollable (necesario para usabilidad).
 */

export default function OpusHero() {
  return (
    <section
      id="main"
      className="relative lg:h-[calc(100vh-64px)] lg:overflow-hidden py-4 lg:py-4 px-3 sm:px-5 lg:px-5"
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

      <div className="relative max-w-[1320px] mx-auto h-full grid lg:grid-cols-12 gap-3 lg:gap-4">
        {/* Center primero en mobile */}
        <div className="lg:col-span-6 lg:order-2 lg:h-full lg:min-h-0">
          <HeroCenterPanel />
        </div>

        {/* Left — live impact (real data) */}
        <div className="lg:col-span-3 lg:order-1 lg:h-full lg:min-h-0">
          <LiveImpactPanel />
        </div>

        {/* Right — regulation + smart contract */}
        <div className="lg:col-span-3 lg:order-3 lg:h-full lg:min-h-0">
          <RegulationStackPanel />
        </div>
      </div>
    </section>
  );
}