import React from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

// Estilos literales
const ACCENT_STYLES = {
  mint: { bg: 'bg-mint-50', border: 'border-mint-200', text: 'text-mint-700', dot: 'bg-mint-500', glow: 'shadow-mint/20' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500', glow: 'shadow-blue-500/20' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', glow: 'shadow-amber-500/20' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500', glow: 'shadow-rose-500/20' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', dot: 'bg-violet-500', glow: 'shadow-violet-500/20' },
};

/**
 * FlowDiagram — Diagrama horizontal de pasos animado.
 */
export default function FlowDiagram({ steps, accentColor = 'mint' }) {
  const accent = ACCENT_STYLES[accentColor] || ACCENT_STYLES.mint;

  return (
    <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden pb-2">
      <div className="flex items-stretch gap-2 min-w-max lg:min-w-0 lg:flex-wrap">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className={`relative flex flex-col w-40 sm:w-44 ${accent.bg} ${accent.border} border rounded-2xl p-3 shadow-soft hover:shadow-lg transition-shadow cursor-default`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-5 h-5 rounded-full ${accent.dot} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                  {idx + 1}
                </div>
                {step.route && (
                  <code className={`text-[9px] font-mono ${accent.text} truncate opacity-80`}>{step.route}</code>
                )}
              </div>
              <p className="text-[13px] font-semibold text-foreground leading-tight">{step.title}</p>
              {step.desc && (
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{step.desc}</p>
              )}
            </motion.div>
            {idx < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 + 0.1, duration: 0.3 }}
                className="flex items-center flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}