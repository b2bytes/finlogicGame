import React from 'react';
import { Sparkles } from 'lucide-react';

// Pitch Claude Impact Lab — 6-7 mayo 2026 (mandato §1 p.361-420)
// Auto-desactiva el 8-may-2026 00:00 Chile (UTC-4)
const IMPACT_LAB_END = new Date('2026-05-08T00:00:00-04:00');

export default function ImpactLabBadge() {
  if (Date.now() > IMPACT_LAB_END.getTime()) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 rounded-full bg-mint-50 border border-mint-200 px-4 py-2">
          <div className="relative w-7 h-7 rounded-full bg-mint-500 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-mint-400 animate-pulse-soft" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap text-xs sm:text-sm">
            <span className="font-bold text-mint-700 uppercase tracking-wider text-[11px]">
              En vivo · Claude Impact Lab
            </span>
            <span className="text-foreground/80 truncate">
              Demostrando tracción real: 45 consultas, score 72/100, 2 documentos generados, cero mocks.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}