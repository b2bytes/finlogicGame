import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Briefcase } from 'lucide-react';

/**
 * StageScene — escena pública del pitch.
 *
 * Composición: Paula (izq · humana) ←→ LYA (centro · mediadora IA) ←→ Audiencia (der · jurado).
 * Lya es el puente: traduce lenguaje técnico de Paula al lenguaje del público.
 * Cuando Lya habla, las líneas que la conectan a ambos lados se animan.
 */
export default function StageScene({ speaking = false }) {
  return (
    <div className="relative">
      {/* Etiqueta de escena */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-mono-editorial uppercase tracking-[0.15em] text-white/70">
          Escena pública
        </span>
        <span className="text-[9px] font-mono-editorial uppercase tracking-[0.15em] text-white/70">
          {speaking ? 'Lya traduciendo' : 'En espera'}
        </span>
      </div>

      {/* Fila de actores */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Paula — izquierda */}
        <Actor
          align="right"
          icon={<Briefcase className="w-4 h-4 text-white" />}
          gradient="from-[hsl(28_80%_70%)] to-[hsl(28_80%_55%)]"
          ring="ring-[hsl(28_80%_85%)]/30"
          label="Paula Garcés"
          role="Producto · Auditoría"
          tag="Humana"
        />

        {/* Lya — centro · mediadora */}
        <LyaCenter speaking={speaking} />

        {/* Audiencia — derecha */}
        <Actor
          align="left"
          icon={<Users className="w-4 h-4 text-white" />}
          gradient="from-[hsl(220_50%_70%)] to-[hsl(220_55%_50%)]"
          ring="ring-[hsl(220_50%_85%)]/30"
          label="Jurado · Público"
          role="Audiencia"
          tag="Asiste"
        />

        {/* Líneas de mediación (absolutas, detrás de los avatares) */}
        <FlowLine side="left" speaking={speaking} />
        <FlowLine side="right" speaking={speaking} />
      </div>
    </div>
  );
}

// ─── Lya central (más grande, con halo y badge "MEDIADORA") ─────
function LyaCenter({ speaking }) {
  return (
    <div className="relative z-10 flex flex-col items-center mx-1">
      {/* Badge de rol arriba */}
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-white text-mint-700 text-[8.5px] font-mono-editorial font-bold uppercase tracking-wider shadow-soft whitespace-nowrap z-10">
        Mediadora · IA
      </span>

      <div className="relative w-[68px] h-[68px] rounded-full bg-gradient-to-br from-mint-300 via-mint-400 to-mint-600 ring-[3px] ring-white/50 flex items-center justify-center">
        {/* Halos animados al hablar */}
        {speaking && (
          <>
            <span className="absolute -inset-1 rounded-full ring-2 ring-white animate-ping opacity-60" />
            <motion.span
              className="absolute -inset-3 rounded-full ring-2 ring-mint-200/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </>
        )}

        {/* Inicial L editorial */}
        <span className="relative font-editorial text-white text-3xl font-bold leading-none drop-shadow-sm">
          L
        </span>

        {/* Indicador de micrófono activo */}
        {speaking && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 ring-2 ring-mint-700 flex items-center justify-center"
          >
            <Mic className="w-3 h-3 text-white" />
          </motion.span>
        )}
      </div>

      <p className="mt-1.5 text-[12px] font-bold text-white leading-none">Lya</p>
      <p className="text-[9px] font-mono-editorial uppercase tracking-wider text-mint-200 mt-0.5 leading-tight whitespace-nowrap">
        Voz pública
      </p>
    </div>
  );
}

// ─── Actor lateral (Paula o Audiencia) ─────────────────────────
function Actor({ align, icon, gradient, ring, label, role, tag }) {
  const isRight = align === 'right'; // Paula
  return (
    <div className={`flex flex-col ${isRight ? 'items-end' : 'items-start'} min-w-0`}>
      <div className="flex items-center gap-2 max-w-full">
        {!isRight && (
          <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${gradient} ring-2 ${ring} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
        <div className={`min-w-0 ${isRight ? 'text-right' : 'text-left'}`}>
          <p className="text-[11px] font-bold text-white leading-tight truncate">{label}</p>
          <p className="text-[8.5px] font-mono-editorial uppercase tracking-wider text-white/60 leading-tight truncate">
            {role}
          </p>
          <span className="inline-block mt-0.5 px-1.5 py-px rounded text-[8px] font-mono-editorial bg-white/10 text-white/80 uppercase tracking-wider">
            {tag}
          </span>
        </div>
        {isRight && (
          <div className={`relative w-11 h-11 rounded-full bg-gradient-to-br ${gradient} ring-2 ${ring} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Línea de mediación animada ────────────────────────────────
function FlowLine({ side, speaking }) {
  // Línea horizontal que pasa "detrás" de Lya y conecta con cada actor lateral
  const isLeft = side === 'left';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-[34px] ${isLeft ? 'left-0 right-1/2 mr-[34px]' : 'right-0 left-1/2 ml-[34px]'} h-[2px] overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/15 rounded-full" />
      {speaking && (
        <motion.div
          className={`absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r ${
            isLeft
              ? 'from-transparent via-mint-200 to-mint-100'
              : 'from-mint-100 via-mint-200 to-transparent'
          }`}
          initial={{ x: isLeft ? '-100%' : '100%' }}
          animate={{ x: isLeft ? '300%' : '-300%' }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </div>
  );
}