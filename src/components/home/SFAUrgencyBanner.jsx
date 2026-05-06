import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';

// Vigencia SFA (Sistema de Finanzas Abiertas) — 4-jul-2026
// El mandato lo marca como ventana única PSBI
const SFA_DATE = new Date('2026-07-04T00:00:00-04:00');

function daysUntil(date) {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function SFAUrgencyBanner() {
  const days = daysUntil(SFA_DATE);
  if (days === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 -mt-2 mb-2">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/api-compliance"
          className="group flex items-center gap-3 sm:gap-4 rounded-full bg-foreground text-background px-4 sm:px-5 py-2.5 hover:bg-foreground/90 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-mint-500/20 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-mint-300" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-mint-300 flex-shrink-0">
              SFA · {days} días
            </span>
            <span className="text-xs sm:text-sm text-background/85">
              <span className="hidden sm:inline">Sistema de Finanzas Abiertas entra en vigencia el </span>
              <span className="sm:hidden">SFA vigente </span>
              <span className="font-semibold text-background">4 jul 2026</span>
              <span className="hidden md:inline">. Tu fintech tiene una ventana única.</span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-mint-300 group-hover:gap-2 transition-all flex-shrink-0">
            Compliance API
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </section>
  );
}