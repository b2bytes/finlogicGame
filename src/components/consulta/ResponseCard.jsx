import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Scale, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import UrgencyBadge from './UrgencyBadge';
import ShareWhatsApp from './ShareWhatsApp';
import PipelineBreakdown from './PipelineBreakdown';

export default function ResponseCard({ response, traceId, query }) {
  if (!response) return null;
  const { fact, translation, action, lawsCited = [], legalDeadlineDays, verifierScore, urgencyLevel, pipeline } = response;

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <UrgencyBadge level={urgencyLevel} />
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
          Score verificador: <span className="font-semibold text-mint-700">{verifierScore}/100</span>
        </div>
      </div>

      {/* HECHO */}
      <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Lo que pasó</p>
        <p className="text-lg font-semibold text-foreground leading-relaxed">{fact}</p>
      </div>

      {/* TU DERECHO */}
      <div className="bg-mint-50 rounded-3xl border border-mint-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-5 h-5 text-mint-700" strokeWidth={2.2} />
          <p className="text-xs font-semibold text-mint-700 uppercase tracking-wide">Tu derecho</p>
        </div>
        <p className="text-foreground leading-relaxed">{translation}</p>
        {lawsCited.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {lawsCited.map((law, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full bg-white border border-mint-200 text-xs font-medium text-mint-700">
                {law}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ACCIÓN */}
      <div className="bg-card rounded-3xl border-2 border-mint-300 p-6 shadow-mint">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5 text-mint-600" strokeWidth={2.2} />
          <p className="text-xs font-semibold text-mint-700 uppercase tracking-wide">Acción inmediata</p>
        </div>
        <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ol:my-2 prose-li:my-1">
          <ReactMarkdown>{action}</ReactMarkdown>
        </div>
      </div>

      {/* PLAZO LEGAL */}
      {legalDeadlineDays > 0 && (
        <div className="bg-accent rounded-3xl border border-border p-5 flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent-foreground flex-shrink-0" strokeWidth={2.2} />
          <p className="text-sm text-accent-foreground">
            <span className="font-semibold">Plazo legal:</span> tienes <span className="font-bold">{legalDeadlineDays} días hábiles</span> para actuar. Te avisaremos antes de que venza.
          </p>
        </div>
      )}

      {/* Pipeline transparente — diferenciador FinLogic */}
      <PipelineBreakdown pipeline={pipeline} />

      {/* Compartir WhatsApp — loop viral */}
      <ShareWhatsApp response={response} query={query} />

      {traceId && (
        <p className="text-xs text-center text-muted-foreground">
          Auditable públicamente en <a href={`/Transparencia?trace=${traceId}`} className="underline hover:text-foreground">/Transparencia</a>
        </p>
      )}
    </div>
  );
}