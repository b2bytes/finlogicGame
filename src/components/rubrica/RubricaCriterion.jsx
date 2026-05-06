import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ChevronDown, Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * RubricaCriterion — fila de un criterio del jurado.
 * Permite validar agentic-amente el criterio contra el sistema en vivo.
 */
export default function RubricaCriterion({ criterion, onValidated }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('validateRubrica', {
        criterionId: criterion.id,
      });
      setResult(res.data);
      setExpanded(true);
      onValidated?.(criterion.id, res.data);
    } catch (e) {
      setResult({ score: 0, passed: false, message: e.message, evidence: {} });
    } finally {
      setLoading(false);
    }
  };

  const score = result?.score ?? null;
  const passed = result?.passed;

  const statusColor =
    score === null
      ? 'bg-muted text-muted-foreground border-border'
      : passed
        ? 'bg-mint-50 text-mint-700 border-mint-200'
        : score >= 50
          ? 'bg-amber-50 text-amber-700 border-amber-200'
          : 'bg-destructive/5 text-destructive border-destructive/20';

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          {loading ? (
            <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
          ) : score === null ? (
            <div className="w-5 h-5 rounded-full border-2 border-border" />
          ) : passed ? (
            <CheckCircle2 className="w-5 h-5 text-mint-600" />
          ) : (
            <XCircle className="w-5 h-5 text-destructive" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-semibold text-sm text-foreground leading-snug">
              {criterion.title}
            </h3>
            <span className="flex-shrink-0 text-[10px] font-mono-editorial px-2 py-0.5 rounded-full bg-mint-50 text-mint-700 border border-mint-200">
              {criterion.weight}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
            {criterion.description}
          </p>

          {/* Status row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleValidate}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-foreground/85 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
              {result ? 'Re-validar' : 'Validar'}
            </button>

            {result && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}>
                {score}/100 · {result.message}
              </span>
            )}

            {result && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                {expanded ? 'Ocultar evidencia' : 'Ver evidencia'}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && result?.evidence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border"
          >
            <pre className="text-[11px] font-mono-editorial text-muted-foreground bg-muted/40 p-4 overflow-x-auto whitespace-pre-wrap break-words">
              {JSON.stringify(result.evidence, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}