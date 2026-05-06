import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function LyaSources({ sources = [], confidence, regulatoryBody }) {
  if (!sources?.length) return null;

  const confidencePct = Math.round((confidence ?? 0) * 100);
  const confColor =
    confidencePct >= 85 ? 'text-mint-700 bg-mint-50 border-mint-200'
    : confidencePct >= 65 ? 'text-amber-700 bg-amber-50 border-amber-200'
    : 'text-muted-foreground bg-secondary border-border';

  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Fundamento normativo
        </span>
        <div className={`ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${confColor}`}>
          <ShieldCheck className="w-2.5 h-2.5" />
          <span className="text-[10px] font-bold">{confidencePct}% confianza</span>
        </div>
      </div>
      <ul className="space-y-1">
        {sources.map((s, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="text-mint-600 font-bold flex-shrink-0">·</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      {regulatoryBody && regulatoryBody !== 'ninguno' && (
        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/5 text-[10px] font-semibold text-foreground">
          Organismo: {regulatoryBody}
        </div>
      )}
    </div>
  );
}