import React from 'react';
import RubricaCriterion from './RubricaCriterion';

/**
 * RubricaGroup — agrupa criterios y muestra el peso del grupo + score acumulado.
 */
export default function RubricaGroup({ group, results, onValidated }) {
  const criterionResults = group.criteria.map((c) => results[c.id]);
  const validatedCount = criterionResults.filter((r) => r != null).length;

  // Score ponderado del grupo: cada criterio aporta (criterion.weight/100) * score
  const groupScore =
    validatedCount === 0
      ? null
      : Math.round(
          group.criteria.reduce((acc, c) => {
            const r = results[c.id];
            return acc + (r ? (r.score * c.weight) / 100 : 0);
          }, 0)
        );

  return (
    <section className="space-y-4">
      <header className="flex items-end justify-between gap-4 pb-2 border-b border-border">
        <div>
          <p className="text-xs font-mono-editorial text-mint-600 uppercase tracking-widest mb-1">
            {group.weight}% del puntaje total
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
            {group.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{group.description}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-muted-foreground">Score grupo</p>
          <p className="hero-number text-3xl text-foreground tabular-nums">
            {groupScore !== null ? groupScore : '—'}
            <span className="text-base text-muted-foreground font-normal">/100</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {validatedCount}/{group.criteria.length} validados
          </p>
        </div>
      </header>

      <div className="space-y-3">
        {group.criteria.map((c) => (
          <RubricaCriterion key={c.id} criterion={c} onValidated={onValidated} />
        ))}
      </div>
    </section>
  );
}