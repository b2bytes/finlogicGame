import React from 'react';
import { Clock, ShieldCheck, Scale } from 'lucide-react';

const categoryLabels = {
  fraude_digital: 'Fraude digital',
  cobro_indebido: 'Cobro indebido',
  derechos_arco: 'Derechos ARCO',
  contrato_abusivo: 'Contrato abusivo',
  normativa_consulta: 'Consulta normativa',
  indicadores_economicos: 'Indicadores económicos',
  compliance_api: 'Compliance API',
  fuera_de_scope: 'Fuera de alcance',
};

export default function TraceCard({ trace, onClick }) {
  const score = trace.verifierScore || 0;
  const scoreColor = score >= 85 ? 'text-mint-700' : score >= 70 ? 'text-foreground' : 'text-destructive';

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card hover:bg-mint-50/40 rounded-3xl border border-border p-5 transition-all hover:border-mint-200 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
          {categoryLabels[trace.category] || trace.category}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(trace.created_date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground line-clamp-2 mb-3">
        {trace.citizenSummary || trace.responsePreview || trace.query}
      </p>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className={`font-semibold ${scoreColor}`}>{score}/100</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {trace.totalLatencyMs ? `${(trace.totalLatencyMs / 1000).toFixed(1)}s` : '—'}
        </div>
        {trace.lawsCited?.length > 0 && (
          <div className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" />
            {trace.lawsCited.length} {trace.lawsCited.length === 1 ? 'ley' : 'leyes'}
          </div>
        )}
      </div>
    </button>
  );
}