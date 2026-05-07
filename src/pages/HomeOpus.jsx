import React from 'react';
import OpusNav from '@/components/home-opus/OpusNav';
import OpusHero from '@/components/home-opus/OpusHero';
import { useReferralCapture } from '@/lib/useReferralCapture.jsx';

/**
 * HomeOpus — nueva home estilo Opus 4.7.
 * Dark glassmorphism, 3 paneles: agents | hero+vortex | regulation+contract.
 * Mantiene tracking de referrals y respeta el sistema FinLogic.
 */
export default function HomeOpus() {
  useReferralCapture();
  return (
    <div className="min-h-screen bg-[#050b08] text-white overflow-x-clip relative">
      {/* Background base con gradiente sutil */}
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(13,31,23,0.8) 0%, rgba(5,11,8,1) 60%)',
        }}
      />
      <div className="relative z-10">
        <OpusNav />
        <main>
          <OpusHero />
        </main>
      </div>
    </div>
  );
}