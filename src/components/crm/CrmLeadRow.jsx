import React from 'react';
import { Mail, Phone, MessageCircle, AlertCircle } from 'lucide-react';
import CrmStageBadge from './CrmStageBadge';

/**
 * CrmLeadRow — fila de la tabla principal de leads. Hover-row con detalle.
 * Diseñada mobile-first: en sm+ se ve como tabla, en mobile como tarjeta.
 */
function relativeTime(iso) {
  if (!iso) return '—';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'hace seg';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function initials(lead) {
  const name = lead.fullName || lead.email || lead.sessionId || '?';
  return name.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]/g, '').slice(0, 2).toUpperCase();
}

export default function CrmLeadRow({ lead, onClick, active = false }) {
  const isUrgent = (lead.priorityScore || 0) >= 70;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 sm:p-4 rounded-2xl border transition-all flex items-start gap-3 ${
        active
          ? 'bg-mint-50 border-mint-300 shadow-soft'
          : 'bg-card border-border hover:border-mint-200 hover:bg-mint-50/30'
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
          isUrgent
            ? 'bg-rose-100 text-rose-700'
            : 'bg-secondary text-foreground/70'
        }`}
        aria-hidden
      >
        {initials(lead)}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-foreground truncate">
            {lead.fullName || lead.email || (lead.sessionId ? `Anónimo · ${lead.sessionId.slice(-6)}` : 'Sin identificar')}
          </p>
          <CrmStageBadge stage={lead.lifecycleStage} />
          {isUrgent && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
              <AlertCircle className="w-3 h-3" /> Urgente
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-1 truncate">
          {lead.lastQuery || lead.firstQuery || 'Sin mensajes aún'}
        </p>

        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono-editorial">
          {lead.email && (
            <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
              <Mail className="w-3 h-3" /> {lead.email}
            </span>
          )}
          {lead.phone && (
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3 h-3" /> {lead.phone}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> {lead.messagesCount || 0}
          </span>
          <span className="ml-auto">{relativeTime(lead.lastContactAt || lead.created_date)}</span>
        </div>
      </div>
    </button>
  );
}