import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ShieldCheck, FileSignature, Send, Loader2, Check } from 'lucide-react';
import LyaCyberAvatar from '@/components/lya/LyaCyberAvatar';

/**
 * LyaSidebar — panel lateral con Lya guiando el proceso colaborativo.
 * Estados: filling | review | signing | signed | sending | sent
 * Cada estado muestra un mensaje Lya + acción disponible.
 */
const STATE_MESSAGES = {
  filling: {
    title: 'Estoy redactando tu documento…',
    body: 'Estoy citando las leyes aplicables a tu caso y dejando los datos faltantes marcados para que tú los completes.',
    icon: Sparkles,
    color: 'mint',
  },
  review: {
    title: 'Listo. Revisa el documento',
    body: 'Lo dejé con base legal correcta. Si hay algo entre [corchetes], es porque necesito que lo completes tú. Cuando esté ok, fírmalo.',
    icon: ShieldCheck,
    color: 'mint',
  },
  signing: {
    title: 'Firma el documento',
    body: 'Dibuja tu firma en el panel. Quedará incrustada en el PDF final junto con tu nombre y RUT.',
    icon: FileSignature,
    color: 'amber',
  },
  signed: {
    title: 'Firmado ✓',
    body: 'Tu documento está firmado. Ahora puedes descargarlo o enviarlo directamente al organismo destinatario.',
    icon: Check,
    color: 'mint',
  },
  sending: {
    title: 'Enviando…',
    body: 'Estoy enviando tu documento al destinatario. Te confirmo cuando llegue.',
    icon: Loader2,
    color: 'mint',
  },
  sent: {
    title: 'Enviado ✓',
    body: 'Tu documento llegó al destinatario. Tienes copia en tu correo. Yo te aviso si hay respuesta.',
    icon: Send,
    color: 'mint',
  },
};

export default function LyaSidebar({ state = 'filling', extractedFields, missingFields }) {
  const cfg = STATE_MESSAGES[state] || STATE_MESSAGES.filling;
  const Icon = cfg.icon;
  const isAnimated = state === 'filling' || state === 'sending';

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-6 text-white relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-mint-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header con avatar */}
      <div className="relative flex items-center gap-3 mb-4">
        <LyaCyberAvatar size={44} speaking={isAnimated} listening={!isAnimated} />
        <div>
          <p className="text-xs font-mono-editorial uppercase tracking-wider text-mint-300/80">
            Lya · IA legal
          </p>
          <p className="text-sm font-bold text-white">Editor colaborativo</p>
        </div>
      </div>

      {/* Mensaje según estado */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
        >
          <div className="flex items-start gap-2.5 mb-2">
            <Icon className={`w-4 h-4 text-mint-300 flex-shrink-0 mt-0.5 ${isAnimated ? 'animate-spin' : ''}`} />
            <h3 className="text-sm font-bold text-white leading-tight">{cfg.title}</h3>
          </div>
          <p className="text-[13px] text-white/75 leading-relaxed">{cfg.body}</p>
        </motion.div>
      </AnimatePresence>

      {/* Datos extraídos por Lya */}
      {extractedFields && (state === 'review' || state === 'signing' || state === 'signed') && (
        <div className="relative space-y-2 mb-4">
          <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-white/50">
            Datos extraídos automáticamente
          </p>
          <div className="space-y-1.5">
            {extractedFields.factsSummary && (
              <FieldRow label="Hechos" value={extractedFields.factsSummary} truncate />
            )}
            {extractedFields.amountInvolved && (
              <FieldRow label="Monto" value={extractedFields.amountInvolved} />
            )}
            {extractedFields.institutionInvolved && (
              <FieldRow label="Institución" value={extractedFields.institutionInvolved} />
            )}
            {extractedFields.demandedAction && (
              <FieldRow label="Solicita" value={extractedFields.demandedAction} truncate />
            )}
          </div>
        </div>
      )}

      {/* Campos faltantes */}
      {missingFields && missingFields.length > 0 && state === 'review' && (
        <div className="relative bg-amber-500/10 border border-amber-400/30 rounded-2xl p-3">
          <p className="text-[11px] font-bold text-amber-200 mb-1.5">
            ⚠ Te faltan {missingFields.length} datos
          </p>
          <ul className="space-y-1">
            {missingFields.slice(0, 5).map((field, i) => (
              <li key={i} className="text-[11px] text-amber-100/80 leading-snug">
                · {field.replace(/[\[\]_]/g, ' ').trim()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, value, truncate }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5">
      <span className="text-[9px] font-mono-editorial uppercase tracking-wider text-mint-300/70">
        {label}
      </span>
      <span className={`text-[12px] text-white/85 leading-snug ${truncate ? 'line-clamp-2' : ''}`}>
        {value}
      </span>
    </div>
  );
}