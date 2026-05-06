import React from 'react';
import { Sparkles } from 'lucide-react';

// Pitch Claude Impact Lab: 6-7 mayo 2026 (mandato §1, p.361)
// El banner solo aparece durante esos días + 1 día buffer.
const EVENT_START = new Date('2026-05-06T00:00:00-04:00');
const EVENT_END = new Date('2026-05-08T23:59:59-04:00');

export default function ImpactLabBanner() {
  const now = Date.now();
  if (now < EVENT_START.getTime() || now > EVENT_END.getTime()) return null;

  return (
    <div className="bg-mint-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
        <Sparkles className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">
          <span className="font-bold">FinLogic en vivo</span> en Claude Impact Lab · 6–7 mayo 2026 · Demo auditable en{' '}
          <a href="/Transparencia" className="underline underline-offset-2 hover:text-mint-100">
            /Transparencia
          </a>
        </span>
      </div>
    </div>
  );
}