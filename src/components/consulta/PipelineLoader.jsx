import React, { useEffect, useState } from 'react';
import { Sparkles, RotateCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = [
  { label: 'Identificando tu situación…', t: 0 },
  { label: 'Buscando la normativa que te protege…', t: 4000 },
  { label: 'Consultando CMF, SERNAC y SII…', t: 12000 },
  { label: 'Preparando tu respuesta accionable…', t: 24000 },
  { label: 'Verificando antes de entregártela…', t: 38000 },
];

const TIMEOUT_MS = 90000;

export default function PipelineLoader({ onRetry }) {
  const [stage, setStage] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timers = STAGES.map((s, i) => setTimeout(() => setStage(i), s.t));
    const timeoutTimer = setTimeout(() => setTimedOut(true), TIMEOUT_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(timeoutTimer);
    };
  }, []);

  if (timedOut) {
    return (
      <div className="bg-card rounded-3xl border-2 border-destructive/30 p-6 shadow-soft">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Esto está tardando más de lo normal</p>
            <p className="text-xs text-muted-foreground">El pipeline no respondió en 90s. No es tu culpa.</p>
          </div>
        </div>
        {onRetry && (
          <Button
            onClick={onRetry}
            className="w-full mt-2 rounded-full bg-foreground hover:bg-foreground/90 text-background min-h-[48px] font-semibold"
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reintentar consulta
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-mint-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white animate-pulse-soft" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Lya está pensando…</p>
          <p className="text-xs text-muted-foreground">Esto suele tomar 30-60 segundos</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {STAGES.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                i < stage ? 'bg-mint-500' : i === stage ? 'bg-mint-500 animate-pulse' : 'bg-border'
              }`}
            />
            <span
              className={`text-sm transition-colors ${
                i <= stage ? 'text-foreground' : 'text-muted-foreground/60'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}