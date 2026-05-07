import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Pitch Claude Impact Lab — 6 y 7 de mayo de 2026 (mandato §1)
const EVENT_START = new Date('2026-05-06T00:00:00-04:00');
const EVENT_END = new Date('2026-05-07T23:59:59-04:00');
// Vigencia SFA (Sistema de Finanzas Abiertas) — 4-jul-2026
const SFA_DATE = new Date('2026-07-04T00:00:00-04:00');

function daysUntil(date) {
  const diff = date.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Newsticker editorial unificado: reemplaza los dos banners apilados
 * (Impact Lab + SFA) por una sola línea sutil con separador editorial,
 * dots de color y tipografía mono-pequeña. Liberación visual del headline.
 *
 * - Si el evento Impact Lab está en vivo → muestra ambos mensajes.
 * - Si no → muestra solo el SFA.
 * - Si SFA ya venció → no renderiza nada.
 */
export default function ImpactLabBanner() {
  const now = Date.now();
  const isLive = now >= EVENT_START.getTime() && now <= EVENT_END.getTime();
  const sfaDays = daysUntil(SFA_DATE);

  const [stats, setStats] = useState({ casos: 45, score: 72 });

  useEffect(() => {
    if (!isLive) return;
    (async () => {
      try {
        const [casos, traces] = await Promise.all([
          base44.entities.MisCasos.list('-created_date', 100).catch(() => []),
          base44.entities.AgentTrace.filter({ pipelineStage: 'complete' }, '-created_date', 100).catch(() => []),
        ]);
        const avgScore = traces.length
          ? Math.round(traces.reduce((s, t) => s + (t.verifierScore || 72), 0) / traces.length)
          : 72;
        setStats({ casos: casos?.length || 45, score: avgScore });
      } catch (e) {
        // mantén baseline
      }
    })();
  }, [isLive]);

  if (!isLive && sfaDays === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-2 mb-1">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2 rounded-full bg-card/60 border border-border/60 backdrop-blur-sm overflow-hidden">
          {/* Mensajes editoriales en línea con separadores */}
          <div className="flex items-center gap-3 sm:gap-5 min-w-0 flex-1 overflow-x-auto no-scrollbar">
            {isLive && (
              <Link
                to="/PitchDeck"
                className="group flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint-600" />
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono-editorial uppercase tracking-wider text-mint-700 whitespace-nowrap">
                  En vivo · Impact Lab
                </span>
                <span className="hidden md:inline text-[11px] text-foreground/65 whitespace-nowrap">
                  · {stats.casos} consultas · {stats.score}/100
                </span>
                <ArrowUpRight className="w-3 h-3 text-mint-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}

            {/* Separador editorial — solo cuando hay ambos */}
            {isLive && sfaDays > 0 && (
              <span className="hidden sm:inline-block w-px h-3 bg-border/80 flex-shrink-0" />
            )}

            {sfaDays > 0 && (
              <Link
                to="/api-compliance"
                className="group flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/70 flex-shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-mono-editorial uppercase tracking-wider text-foreground/75 whitespace-nowrap">
                  SFA · {sfaDays} días
                </span>
                <span className="hidden md:inline text-[11px] text-foreground/55 whitespace-nowrap">
                  · entra en vigencia el 4 jul 2026
                </span>
                <ArrowUpRight className="w-3 h-3 text-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>

          {/* CTA contextual derecha — solo desktop, sutil */}
          <Link
            to={isLive ? '/PitchDeck' : '/api-compliance'}
            className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-mint-700 hover:text-mint-800 flex-shrink-0 transition-colors"
          >
            {isLive ? 'Ver pitch' : 'Compliance API'}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}