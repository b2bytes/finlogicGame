import React from 'react';
import { CheckCircle2, Circle, Clock, FileText, Send, AlertTriangle } from 'lucide-react';

const STAGES = [
  { id: 'abierto', label: 'Caso abierto', icon: Circle },
  { id: 'en_proceso', label: 'En análisis', icon: Clock },
  { id: 'documento_generado', label: 'Documento listo', icon: FileText },
  { id: 'enviado', label: 'Enviado al organismo', icon: Send },
  { id: 'resuelto', label: 'Resuelto', icon: CheckCircle2 },
];

const ORDER = ['abierto', 'en_proceso', 'documento_generado', 'enviado', 'resuelto'];

export default function CasoTimeline({ status, vencido }) {
  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <h3 className="font-display text-base font-bold text-foreground mb-5">Línea de tiempo</h3>
      <div className="space-y-4">
        {STAGES.map((stage, idx) => {
          const isComplete = idx < currentIdx || status === stage.id;
          const isActive = status === stage.id;
          const isOverdue = vencido && idx === currentIdx;
          const Icon = isOverdue ? AlertTriangle : stage.icon;

          return (
            <div key={stage.id} className="flex items-start gap-3 relative">
              {idx < STAGES.length - 1 && (
                <div className={`absolute left-[15px] top-8 w-0.5 h-6 ${isComplete && !isActive ? 'bg-mint-500' : 'bg-border'}`} />
              )}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                isOverdue ? 'bg-destructive/10' :
                isActive ? 'bg-mint-100' :
                isComplete ? 'bg-mint-500' : 'bg-secondary'
              }`}>
                <Icon className={`w-4 h-4 ${
                  isOverdue ? 'text-destructive' :
                  isActive ? 'text-mint-700' :
                  isComplete ? 'text-white' : 'text-muted-foreground'
                }`} />
              </div>
              <div className="flex-1 pt-1">
                <p className={`text-sm font-medium ${isActive ? 'text-foreground' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {stage.label}
                </p>
                {isActive && !isOverdue && <p className="text-xs text-mint-700 mt-0.5">En curso</p>}
                {isOverdue && <p className="text-xs text-destructive mt-0.5">Plazo vencido</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}