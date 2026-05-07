import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, AlertTriangle, XCircle, Loader2, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STATUS_STYLE = {
  pass: { icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'OK' },
  warn: { icon: AlertTriangle, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'WARN' },
  fail: { icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'FAIL' },
};

const OVERALL_STYLE = {
  healthy: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  degraded: 'bg-amber-100 text-amber-800 border-amber-300',
  critical: 'bg-red-100 text-red-800 border-red-300',
};

export default function HealthCheckPanel() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('runHealthCheck', {});
      if (res.data?.success) setReport(res.data);
      else setError(res.data?.error || 'Error desconocido');
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-mint-50 border border-mint-200 flex items-center justify-center">
            <Activity className="w-5 h-5 text-mint-700" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Health Check</h2>
            <p className="text-xs text-muted-foreground">
              Tester de funciones, integraciones y entidades críticas
            </p>
          </div>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-foreground hover:bg-foreground/90 text-background text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-wait"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {running ? 'Ejecutando…' : 'Ejecutar tester'}
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!report && !running && !error && (
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Ejecuta el tester para validar el sistema en vivo.
            </p>
          </div>
        )}

        {running && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 text-mint-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Recorriendo backend functions, entidades e integraciones…
            </p>
          </div>
        )}

        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Resumen */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-mono text-xs font-bold uppercase tracking-wider ${
                    OVERALL_STYLE[report.summary.overallStatus]
                  }`}
                >
                  Estado · {report.summary.overallStatus}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><strong className="text-emerald-700">{report.summary.passed}</strong> OK</span>
                  <span><strong className="text-amber-700">{report.summary.warnings}</strong> warn</span>
                  <span><strong className="text-red-700">{report.summary.failed}</strong> fail</span>
                  <span>· {report.durationMs}ms</span>
                </div>
              </div>

              {/* Lista de checks */}
              <div className="space-y-1.5">
                {report.checks.map((c, i) => {
                  const s = STATUS_STYLE[c.status] || STATUS_STYLE.warn;
                  const Icon = s.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 px-3.5 py-2.5 rounded-xl border ${s.bg}`}
                    >
                      <Icon className={`w-4 h-4 ${s.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground/90">{c.name}</span>
                          <span className="text-[9px] font-mono uppercase text-muted-foreground/80">
                            {c.category}
                          </span>
                          {c.latencyMs > 0 && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {c.latencyMs}ms
                            </span>
                          )}
                        </div>
                        <p className={`text-[12px] ${s.color} leading-snug mt-0.5`}>
                          {c.message}
                        </p>
                        {c.errorDetails && (
                          <p className="text-[11px] text-red-700/90 mt-1 font-mono break-words">
                            {c.errorDetails}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}