import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, MessageCircle, Bot } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_CONFIG = {
  abierto: { label: 'Abierto', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  en_proceso: { label: 'En proceso', icon: Clock, bg: 'bg-mint-50', text: 'text-mint-700', border: 'border-mint-200' },
  esperando_usuario: { label: 'Esperándote', icon: MessageCircle, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  resuelto: { label: 'Resuelto', icon: CheckCircle2, bg: 'bg-mint-50', text: 'text-mint-700', border: 'border-mint-200' },
  cerrado: { label: 'Cerrado', icon: CheckCircle2, bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' },
};

const PRIORITY_DOT = {
  critico: 'bg-destructive',
  alto: 'bg-orange-500',
  medio: 'bg-amber-500',
  bajo: 'bg-mint-500',
};

export default function MyTicketCard({ ticket }) {
  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.abierto;
  const StatusIcon = cfg.icon;
  const isCritical = ticket.priority === 'critico' || (ticket.deadlineDaysRemaining !== undefined && ticket.deadlineDaysRemaining <= 3);

  return (
    <div className={`bg-card rounded-3xl border ${isCritical ? 'border-destructive/40' : 'border-border'} p-5 shadow-soft hover:-translate-y-0.5 transition-all`}>
      {isCritical && (
        <div className="flex items-center gap-1.5 mb-3 -mt-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold w-fit">
          <AlertTriangle className="w-3 h-3" />
          Plazo crítico · {ticket.deadlineDaysRemaining}d restantes
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[ticket.priority] || 'bg-muted'}`} />
          <h3 className="font-display font-bold text-foreground truncate text-sm">
            {ticket.subject || ticket.message?.slice(0, 60) || 'Ticket sin asunto'}
          </h3>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border} inline-flex items-center gap-1`}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {ticket.message}
      </p>

      {ticket.aiResponse && (
        <div className="bg-mint-50/60 border border-mint-200/60 rounded-2xl p-3 mb-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Bot className="w-3 h-3 text-mint-700" />
            <span className="text-[10px] font-bold text-mint-700 uppercase tracking-wider">
              {ticket.autoResolved ? 'Auto-resuelto IA' : 'Respuesta'}
            </span>
          </div>
          <p className="text-xs text-foreground/80 line-clamp-3">{ticket.aiResponse}</p>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="capitalize">{ticket.category?.replace(/_/g, ' ')}</span>
        <span>
          {ticket.created_date && formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true, locale: es })}
        </span>
      </div>
    </div>
  );
}