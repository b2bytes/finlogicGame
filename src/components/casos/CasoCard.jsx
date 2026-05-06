import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle2, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GenerateDocDialog from './GenerateDocDialog';

const statusConfig = {
  abierto: { label: 'Abierto', cls: 'bg-mint-50 text-mint-700 border-mint-200' },
  en_proceso: { label: 'En proceso', cls: 'bg-accent text-accent-foreground border-border' },
  documento_generado: { label: 'Documento listo', cls: 'bg-mint-50 text-mint-700 border-mint-200' },
  enviado: { label: 'Enviado', cls: 'bg-mint-100 text-mint-700 border-mint-200' },
  resuelto: { label: 'Resuelto', cls: 'bg-secondary text-secondary-foreground border-border' },
  vencido: { label: 'Vencido', cls: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const organismLabels = {
  CMF: 'CMF', SERNAC: 'SERNAC', SII: 'SII', CSIRT: 'CSIRT', BCN: 'BCN',
  FOGAPE: 'FOGAPE', SERCOTEC: 'SERCOTEC', multiple: 'Múltiples',
};

export default function CasoCard({ caso, onUpdate }) {
  const [docOpen, setDocOpen] = useState(false);
  const status = statusConfig[caso.status] || statusConfig.abierto;
  const days = caso.daysRemaining;
  const isUrgent = typeof days === 'number' && days >= 0 && days <= 3;
  const isOverdue = typeof days === 'number' && days < 0;

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.cls}`}>
          {status.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {organismLabels[caso.regulatoryBody] || caso.regulatoryBody}
        </span>
      </div>

      <Link to={`/MisCasos/${caso.id}`} className="block">
        <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-mint-700 transition-colors">
          {caso.title}
        </h3>
      </Link>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {caso.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        {typeof days === 'number' ? (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${
            isOverdue ? 'text-destructive' : isUrgent ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            {isOverdue ? <AlertTriangle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
            {isOverdue
              ? `Vencido hace ${Math.abs(days)}d`
              : days === 0
                ? 'Vence hoy'
                : `${days} días para actuar`}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sin plazo crítico
          </div>
        )}

        {caso.generatedDocRef ? (
          <div className="flex items-center gap-1 text-xs text-mint-700 font-medium">
            <FileText className="w-3.5 h-3.5" />
            Documento
          </div>
        ) : (
          <Button
            onClick={() => setDocOpen(true)}
            size="sm"
            variant="ghost"
            className="h-8 px-3 text-xs font-semibold text-mint-700 hover:text-mint-700 hover:bg-mint-50 rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Generar documento
          </Button>
        )}
      </div>

      <GenerateDocDialog
        caso={caso}
        open={docOpen}
        onOpenChange={setDocOpen}
        onGenerated={onUpdate}
      />
    </div>
  );
}