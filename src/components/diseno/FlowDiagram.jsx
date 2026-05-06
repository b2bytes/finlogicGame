import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * FlowDiagram — Diagrama horizontal de pasos para un flujo de usuario.
 * Renderiza nodos conectados con flechas, responsive (scroll horizontal en mobile).
 */
export default function FlowDiagram({ steps, accentColor = 'mint' }) {
  const accent = {
    mint: { bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', dot: 'bg-mint-500' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500' },
  }[accentColor] || { bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', dot: 'bg-mint-500' };

  return (
    <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
      <div className="flex items-stretch gap-3 min-w-max lg:min-w-0 lg:flex-wrap">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div className={`relative flex flex-col w-44 sm:w-48 ${accent.bg} ${accent.border} border rounded-2xl p-3.5 shadow-soft`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full ${accent.dot} text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0`}>
                  {idx + 1}
                </div>
                {step.route && (
                  <code className={`text-[10px] font-mono ${accent.text} truncate`}>{step.route}</code>
                )}
              </div>
              <p className="text-sm font-semibold text-foreground leading-tight">{step.title}</p>
              {step.desc && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{step.desc}</p>
              )}
            </div>
            {idx < steps.length - 1 && (
              <div className="flex items-center text-muted-foreground/50 flex-shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}