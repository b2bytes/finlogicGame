import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShieldCheck, Clock, Cpu, Zap } from 'lucide-react';

export default function TraceDetail({ trace, open, onOpenChange, viewMode = 'citizen' }) {
  if (!trace) return null;

  const isTechnical = viewMode === 'technical';
  const stages = [
    { label: 'Triage', ms: trace.triageLatencyMs, icon: Zap },
    { label: 'RAG', ms: trace.ragLatencyMs, icon: Cpu },
    { label: 'Especialista', ms: trace.specialistLatencyMs, icon: Cpu },
  ].filter((s) => s.ms);

  const score = trace.verifierScore || 0;
  const scoreCitizenLabel = score >= 85 ? 'Alta confianza' : score >= 70 ? 'Confianza media' : 'Revisar con experto';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Auditoría de respuesta</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Consulta</p>
            <p className="text-sm text-foreground bg-secondary rounded-2xl p-4">{trace.query}</p>
          </section>

          <section>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Respuesta del sistema</p>
            <p className="text-sm text-foreground bg-mint-50 rounded-2xl p-4 border border-mint-200">
              {trace.citizenSummary || trace.responsePreview}
            </p>
          </section>

          <section className="grid grid-cols-3 gap-3">
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <ShieldCheck className="w-4 h-4 mx-auto text-mint-600 mb-1" />
              <p className={`font-bold text-foreground ${isTechnical ? 'text-lg font-mono' : 'text-sm'}`}>
                {isTechnical ? `${score}/100` : scoreCitizenLabel}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {isTechnical ? 'verifierScore' : 'Confianza'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <Clock className="w-4 h-4 mx-auto text-foreground mb-1" />
              <p className={`font-bold text-foreground ${isTechnical ? 'text-lg font-mono' : 'text-sm'}`}>
                {trace.totalLatencyMs
                  ? isTechnical
                    ? `${trace.totalLatencyMs}ms`
                    : `${(trace.totalLatencyMs / 1000).toFixed(1)}s`
                  : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {isTechnical ? 'totalLatencyMs' : 'Tiempo'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-3 text-center">
              <Cpu className="w-4 h-4 mx-auto text-foreground mb-1" />
              <p className={`font-bold text-foreground ${isTechnical ? 'text-lg font-mono' : 'text-sm capitalize'}`}>
                {isTechnical ? trace.modelUsed || 'sonnet' : 'IA verificada'}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {isTechnical ? 'modelUsed' : 'Análisis'}
              </p>
            </div>
          </section>

          {isTechnical && stages.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Pipeline</p>
              <div className="space-y-1.5">
                {stages.map((s) => (
                  <div key={s.label} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-xl bg-secondary">
                    <span className="text-foreground font-mono text-xs">{s.label}</span>
                    <span className="font-mono text-muted-foreground text-xs">{s.ms}ms</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {trace.lawsCited?.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Normativa citada</p>
              <div className="flex flex-wrap gap-1.5">
                {trace.lawsCited.map((law, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-mint-50 border border-mint-200 text-xs font-medium text-mint-700">
                    {law}
                  </span>
                ))}
              </div>
            </section>
          )}

          {isTechnical && (
            <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border">
              ID: <span className="font-mono">{trace.id}</span>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}