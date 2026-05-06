import React from 'react';
import { AlertCircle, CalendarClock, FileText, Sparkles } from 'lucide-react';

const PRIORITY_STYLES = {
  critico: 'bg-red-50 border-red-200 text-red-700',
  alto: 'bg-orange-50 border-orange-200 text-orange-700',
  medio: 'bg-amber-50 border-amber-200 text-amber-700',
  bajo: 'bg-mint-50 border-mint-200 text-mint-700',
};

const TYPE_ICONS = {
  vencimiento_iva: CalendarClock,
  vencimiento_ppm: CalendarClock,
  declaracion_renta: FileText,
  multa_detectada: AlertCircle,
  beneficio_disponible: Sparkles,
  cambio_normativo: FileText,
  salud_financiera: AlertCircle,
};

const formatCLP = (n) =>
  typeof n === 'number'
    ? n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    : null;

export default function TaxAlertCard({ alert }) {
  const Icon = TYPE_ICONS[alert.alertType] || AlertCircle;
  const priorityCls = PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.medio;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-5 hover:shadow-soft transition-all">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${priorityCls}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${priorityCls}`}>
              {alert.priority}
            </span>
            {alert.siiFormReference && (
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {alert.siiFormReference}
              </span>
            )}
          </div>
          <h4 className="font-semibold text-foreground text-sm leading-snug">
            {alert.title}
          </h4>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {alert.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
            {alert.deadline && (
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <CalendarClock className="w-3 h-3" />
                Vence {alert.deadline}
              </span>
            )}
            {alert.amountAtRisk ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground">
                💸 {formatCLP(alert.amountAtRisk)}
              </span>
            ) : null}
          </div>

          {alert.actionRequired && (
            <div className="mt-3 text-xs bg-mint-50 border border-mint-100 rounded-lg p-2.5 text-mint-700">
              <strong className="font-semibold">Acción:</strong> {alert.actionRequired}
            </div>
          )}

          {alert.legalBasis && (
            <p className="mt-2 text-[11px] text-muted-foreground italic">
              Base legal: {alert.legalBasis}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}