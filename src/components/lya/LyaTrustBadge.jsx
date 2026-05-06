import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

/**
 * LyaTrustBadge — pill compacta que muestra el verifierScore (0-100) y el
 * hallucinationRisk (none|low|medium|high) que retorna lyaKnowledgeQuery.
 *
 * Es el ancla visible de "transparencia radical" del mandato §AIAgents — cada
 * respuesta de Lya muestra qué tan verificada está su cita normativa, sin que
 * el ciudadano tenga que abrir /Transparencia.
 *
 * - score ≥ 85 → ShieldCheck mint (verificado)
 * - score 60-84 + risk medium → ShieldAlert ámbar (verificación parcial)
 * - score < 60 o risk high → AlertTriangle rojo (revisar fuente oficial)
 */
export default function LyaTrustBadge({ verifierScore, hallucinationRisk }) {
  if (typeof verifierScore !== 'number') return null;

  const high = hallucinationRisk === 'high' || verifierScore < 60;
  const medium = !high && (hallucinationRisk === 'medium' || verifierScore < 85);

  const cfg = high
    ? {
        Icon: AlertTriangle,
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/30',
        label: 'Verifica en fuente oficial',
      }
    : medium
    ? {
        Icon: ShieldAlert,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        label: 'Verificación parcial',
      }
    : {
        Icon: ShieldCheck,
        bg: 'bg-mint-50',
        text: 'text-mint-700',
        border: 'border-mint-200',
        label: 'Verificado por RAG',
      };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.bg} ${cfg.text} ${cfg.border}`}
      title={`Score verificador ${verifierScore}/100 · Riesgo alucinación: ${hallucinationRisk || 'none'}`}
    >
      <cfg.Icon className="w-3 h-3" />
      {cfg.label} · {verifierScore}/100
    </span>
  );
}