import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight, Bell, FileText, TrendingUp } from 'lucide-react';

/**
 * Banner contextual del "Momento Pro". Mandato §GrowthMarketing.
 * Se renderiza solo cuando el trigger es relevante.
 *
 * Triggers soportados:
 *   - second_case      → 2+ casos creados
 *   - deadline_critical → caso abierto con plazo <5 días
 *   - document_generated → carta legal generada
 *
 * Si no hay trigger (null), no renderiza nada.
 */
export default function ProTriggerBanner({ trigger }) {
  if (!trigger) return null;

  const config = {
    second_case: {
      icon: TrendingUp,
      eyebrow: 'Vas en serio',
      title: 'Tu segundo caso ya está aquí',
      copy: 'Con Pro tienes memoria entre consultas, alertas WhatsApp y prioridad en la cola.',
      cta: 'Probar Pro 7 días gratis',
    },
    deadline_critical: {
      icon: Bell,
      eyebrow: 'Plazo crítico',
      title: 'Que un plazo no te cueste tu derecho',
      copy: 'Pro te avisa por WhatsApp 7d/3d/1d antes y prioriza tu caso.',
      cta: 'Activar alertas Pro',
    },
    document_generated: {
      icon: FileText,
      eyebrow: 'Acabas de generar tu documento',
      title: 'Conviértelo en hábito',
      copy: 'Pro genera documentos ilimitados y guarda historial completo.',
      cta: 'Ver beneficios Pro',
    },
  };

  const c = config[trigger];
  if (!c) return null;
  const Icon = c.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-foreground to-foreground/90 text-background p-5 sm:p-6 my-6 shadow-soft-lg animate-fade-up">
      <div aria-hidden="true" className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-mint-500/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 rounded-2xl bg-mint-500/20 border border-mint-400/30 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-mint-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-mint-300 mb-1 inline-flex items-center gap-1.5">
            <Crown className="w-3 h-3" /> {c.eyebrow}
          </p>
          <p className="font-display text-lg sm:text-xl font-bold leading-snug">{c.title}</p>
          <p className="text-sm text-background/70 mt-1 leading-relaxed">{c.copy}</p>
        </div>
        <Link
          to={`/Pro?trigger=${trigger}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-mint-500 hover:bg-mint-400 text-foreground px-5 py-3 text-sm font-bold whitespace-nowrap transition-colors flex-shrink-0"
        >
          {c.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}