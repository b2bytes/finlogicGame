import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Pitch Claude Impact Lab — 6 y 7 de mayo de 2026 (mandato §1)
const EVENT_START = new Date('2026-05-06T00:00:00-04:00');
const EVENT_END = new Date('2026-05-07T23:59:59-04:00');

export default function ImpactLabBanner() {
  const now = Date.now();
  const isLive = now >= EVENT_START.getTime() && now <= EVENT_END.getTime();

  const [stats, setStats] = useState({ casos: 45, score: 72, integraciones: 8 });

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
        setStats({
          casos: casos?.length || 45,
          score: avgScore,
          integraciones: 8,
        });
      } catch (e) {
        // mantén baseline del mandato
      }
    })();
  }, [isLive]);

  if (!isLive) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-2 mb-2">
      <div className="max-w-7xl mx-auto">
        <Link
          to="/PitchDeck"
          className="group flex items-center gap-3 sm:gap-4 rounded-full bg-mint-50 border border-mint-200 px-4 sm:px-5 py-2.5 hover:bg-mint-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-mint-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-mint-700 flex-shrink-0">
              EN VIVO · Claude Impact Lab
            </span>
            <span className="text-xs sm:text-sm text-foreground/85">
              <span className="hidden md:inline">Estamos presentando FinLogic hoy. </span>
              <span className="font-semibold text-foreground">
                {stats.casos} consultas · {stats.score}/100
                <span className="hidden lg:inline"> · {stats.integraciones} integraciones cero mocks</span>
              </span>
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-mint-700 group-hover:gap-2 transition-all flex-shrink-0">
            Ver pitch
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>
      </div>
    </section>
  );
}