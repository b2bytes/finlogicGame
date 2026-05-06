import React, { useState } from 'react';
import { ChevronDown, Cpu, Route, Gauge, AlertCircle } from 'lucide-react';

const ORGANISM_LABEL = {
  CMF: 'Especialista CMF',
  SERNAC: 'Especialista SERNAC',
  SII: 'Especialista SII',
  CSIRT: 'Especialista Antifraude',
  BCN: 'Especialista Educativo',
  FOGAPE: 'Especialista FOGAPE',
  SERCOTEC: 'Especialista SERCOTEC',
  multiple: 'Coordinador multi-organismo',
};

const RECOMENDACION_LABEL = {
  aprobar: { text: 'Aprobada', color: 'text-mint-700 bg-mint-50 border-mint-200' },
  aprobar_con_advertencia: { text: 'Aprobada con advertencia', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  rechazar: { text: 'Rechazada por verificador', color: 'text-destructive bg-destructive/10 border-destructive/20' },
};

export default function PipelineBreakdown({ pipeline }) {
  const [open, setOpen] = useState(false);
  if (!pipeline) return null;

  const {
    triageLatencyMs,
    specialistLatencyMs,
    totalLatencyMs,
    routedTo,
    routingReason,
    verifierBreakdown = {},
  } = pipeline;

  const reco = RECOMENDACION_LABEL[verifierBreakdown.recomendacion] || RECOMENDACION_LABEL.aprobar;
  const dims = [
    { label: 'Precisión normativa', value: verifierBreakdown.precision },
    { label: 'Accionabilidad', value: verifierBreakdown.accionabilidad },
    { label: 'Claridad', value: verifierBreakdown.claridad },
    { label: 'Sin alucinación', value: verifierBreakdown.sinAlucinacion },
  ].filter((d) => typeof d.value === 'number');

  return (
    <div className="bg-card rounded-3xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-mint-50 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-mint-700" strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Cómo llegué a esta respuesta</p>
            <p className="text-xs text-muted-foreground">
              Triage → {ORGANISM_LABEL[routedTo] || 'Especialista'} → Verificador · {(totalLatencyMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-5 animate-fade-up">
          {/* Routing */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Route className="w-4 h-4 text-mint-700" />
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Enrutamiento</p>
            </div>
            <div className="bg-secondary/60 rounded-2xl p-4">
              <p className="text-sm text-foreground">
                <span className="font-semibold">{ORGANISM_LABEL[routedTo] || routedTo}</span>
              </p>
              {routingReason && (
                <p className="text-xs text-muted-foreground mt-1 italic">"{routingReason}"</p>
              )}
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span>Triage: <span className="font-semibold text-foreground">{triageLatencyMs}ms</span></span>
                <span>·</span>
                <span>Especialista: <span className="font-semibold text-foreground">{(specialistLatencyMs / 1000).toFixed(1)}s</span></span>
              </div>
            </div>
          </div>

          {/* Verificador */}
          {dims.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-mint-700" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Auditoría del verificador</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reco.color}`}>
                  {reco.text}
                </span>
              </div>
              <div className="space-y-2">
                {dims.map((d) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-36 flex-shrink-0">{d.label}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.value >= 80 ? 'bg-mint-500' : d.value >= 60 ? 'bg-amber-400' : 'bg-destructive'}`}
                        style={{ width: `${Math.max(0, Math.min(100, d.value))}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-10 text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riesgos */}
          {verifierBreakdown.riesgos && verifierBreakdown.riesgos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Riesgos detectados</p>
              </div>
              <ul className="space-y-1.5">
                {verifierBreakdown.riesgos.map((r, i) => (
                  <li key={i} className="text-xs text-muted-foreground bg-amber-50/60 border border-amber-200/60 rounded-xl px-3 py-2">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}