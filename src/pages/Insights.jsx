import React, { useEffect, useState } from 'react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import InsightHero from '@/components/insights/InsightHero';
import InsightMetrics from '@/components/insights/InsightMetrics';
import RegulatoryBreakdown from '@/components/insights/RegulatoryBreakdown';
import TopNormatives from '@/components/insights/TopNormatives';
import { base44 } from '@/api/base44Client';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEFAULT_BODIES = ['CMF', 'SERNAC', 'SII', 'CSIRT', 'BCN', 'FOGAPE', 'SERCOTEC', 'multiple'];

export default function Insights() {
  const [stats, setStats] = useState(null);
  const [breakdown, setBreakdown] = useState({});
  const [normatives, setNormatives] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.AgentTrace.list('-created_date', 500).catch(() => []),
      base44.entities.MisCasos.list('-created_date', 500).catch(() => []),
    ]).then(([traces, casos]) => {
      try {
      const tracesArr = Array.isArray(traces) ? traces : [];
      const casosArr = Array.isArray(casos) ? casos : [];

      // Agregaciones anónimas
      const breakdownMap = DEFAULT_BODIES.reduce((acc, b) => ({ ...acc, [b]: 0 }), {});
      const normativeMap = {};
      let critical = 0;
      let scoreSum = 0;
      let scoreCount = 0;
      const sessions = new Set();

      casosArr.forEach((c) => {
        if (c.regulatoryBody && breakdownMap[c.regulatoryBody] !== undefined) {
          breakdownMap[c.regulatoryBody] += 1;
        }
        if (c.normativeModule) {
          normativeMap[c.normativeModule] = (normativeMap[c.normativeModule] || 0) + 1;
        }
        if (c.priority === 'alta' || c.urgencyLevel === 'critical' || c.urgencyLevel === 'high') critical += 1;
      });

      tracesArr.forEach((t) => {
        if (typeof t.verifierScore === 'number') {
          scoreSum += t.verifierScore;
          scoreCount += 1;
        }
        if (t.sessionId) sessions.add(t.sessionId);
      });

      // Score promedio: usa traces si hay, sino casos resueltos
      let finalScore = 80;
      if (scoreCount > 0) finalScore = Math.round(scoreSum / scoreCount);
      else if (casosArr.length > 0) {
        const casoScores = casosArr.filter(c => c.verifierScore).map(c => c.verifierScore);
        if (casoScores.length > 0) {
          finalScore = Math.round(casoScores.reduce((a, b) => a + b, 0) / casoScores.length);
        }
      }

      setStats({
        totalConsultas: Math.max(tracesArr.length, casosArr.length),
        criticalCases: critical,
        avgScore: finalScore,
        uniqueCitizens: sessions.size || casosArr.length,
      });
      setBreakdown(breakdownMap);
      setNormatives(normativeMap);
      } catch (_) {
        setStats({ totalConsultas: 0, criticalCases: 0, avgScore: 80, uniqueCitizens: 0 });
      }
    }).catch(() => {
      setStats({ totalConsultas: 0, criticalCases: 0, avgScore: 80, uniqueCitizens: 0 });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main>
        <InsightHero />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
          {stats ? (
            <>
              <InsightMetrics stats={stats} />
              <div className="grid lg:grid-cols-2 gap-6">
                <RegulatoryBreakdown breakdown={breakdown} />
                <TopNormatives data={normatives} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-3xl border border-border p-5 h-32 animate-pulse" />
              ))}
            </div>
          )}

          <div className="bg-foreground text-background rounded-3xl p-6 sm:p-8 md:p-12 mt-10 text-center">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              ¿Necesitas insights agregados para tu organización?
            </h2>
            <p className="mt-3 text-background/70 max-w-2xl mx-auto">
              Reportes mensuales sectoriales, alertas de riesgo regulatorio, dashboards a medida para reguladores, fintechs, gremios y prensa.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 rounded-full bg-mint-500 hover:bg-mint-600 text-white h-12 px-7 font-semibold gap-2"
            >
              <a href="mailto:insights@finlogic.one">
                <Mail className="w-4 h-4" />
                Hablar con Insights
              </a>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}