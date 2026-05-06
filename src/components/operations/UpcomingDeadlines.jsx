import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, AlertTriangle } from 'lucide-react';

export default function UpcomingDeadlines({ deadlines = [] }) {
  const today = new Date();
  const enriched = deadlines
    .map((d) => {
      const due = new Date(d.deadlineDate);
      const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
      return { ...d, days };
    })
    .filter((d) => d.days >= -3 && d.days <= 14)
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-mint-600" />
          <h3 className="font-display text-lg font-bold text-foreground">Plazos legales críticos</h3>
        </div>
        <span className="text-xs text-muted-foreground">{enriched.length} activos</span>
      </div>

      {enriched.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Sin plazos próximos.</p>
      ) : (
        <div className="space-y-2.5">
          {enriched.map((d) => {
            const isOverdue = d.days < 0;
            const isUrgent = d.days >= 0 && d.days <= 3;
            const cls = isOverdue
              ? 'border-destructive/40 bg-destructive/5'
              : isUrgent
              ? 'border-mint-300 bg-mint-50'
              : 'border-border bg-secondary/40';
            return (
              <Link
                key={d.id}
                to={d.casoRef ? `/MisCasos/${d.casoRef}` : '/MisCasos'}
                className={`flex items-center gap-3 rounded-2xl border p-3 hover:shadow-soft transition-all ${cls}`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isOverdue || isUrgent ? 'bg-destructive/10' : 'bg-card'
                  }`}
                >
                  {isOverdue || isUrgent ? (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  ) : (
                    <Calendar className="w-4 h-4 text-mint-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {d.organism} · {d.legalBasis}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOverdue
                      ? `Vencido hace ${Math.abs(d.days)}d`
                      : d.days === 0
                      ? 'Vence hoy'
                      : `${d.days} días`}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}