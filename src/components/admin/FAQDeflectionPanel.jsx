import React from 'react';
import { Sparkles } from 'lucide-react';

export default function FAQDeflectionPanel({ interactions = [] }) {
  if (!interactions.length) {
    return (
      <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
        <p className="text-sm text-muted-foreground">Sin interacciones FAQ aún.</p>
      </div>
    );
  }

  // Agrupa por faqId, cuenta hits y deflection rate
  const grouped = interactions.reduce((acc, i) => {
    const k = i.faqId || 'sin_id';
    if (!acc[k]) acc[k] = { faqId: k, hits: 0, deflected: 0, helpful: 0, notHelpful: 0 };
    acc[k].hits += 1;
    if (i.deflectionSuccess) acc[k].deflected += 1;
    if (i.wasHelpful === true) acc[k].helpful += 1;
    if (i.wasHelpful === false) acc[k].notHelpful += 1;
    return acc;
  }, {});

  const rows = Object.values(grouped)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 8);

  const totalHits = interactions.length;
  const totalDeflected = interactions.filter((i) => i.deflectionSuccess).length;
  const deflectionRate = totalHits ? Math.round((totalDeflected / totalHits) * 100) : 0;

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-mint-600" />
          <h3 className="font-display font-bold text-foreground">Top FAQs · deflection</h3>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Tasa global</p>
          <p className="font-display font-bold text-mint-700 text-lg leading-none">
            {deflectionRate}%
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((r) => {
          const rate = r.hits ? Math.round((r.deflected / r.hits) * 100) : 0;
          return (
            <div key={r.faqId} className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-44 truncate">
                {r.faqId}
              </span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-mint-500 rounded-full"
                  style={{ width: `${rate}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground tabular-nums w-24 text-right">
                {r.deflected}/{r.hits} · {rate}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground mt-5">
        Target mandato: <span className="font-semibold text-foreground">65% deflection en D+90</span>
      </p>
    </div>
  );
}