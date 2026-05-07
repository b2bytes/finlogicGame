import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, FileSignature } from 'lucide-react';

/**
 * RegulationStackPanel — columna derecha de la home Opus.
 * Top: Sello "Ley Fintech 21.521" con verificación CMF.
 * Bottom: Smart Contract ciudadano con campos de verificación.
 */

export default function RegulationStackPanel() {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Card 1 · Sello Ley Fintech 21.521 (compact) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[20px] bg-gradient-to-br from-[#0d1f17]/95 via-[#0a1410]/90 to-[#081210]/95 border border-mint-500/15 overflow-hidden p-4 flex-shrink-0"
      >
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-mint-500/15 rounded-full blur-3xl" />

        {/* Sello + texto en horizontal compact */}
        <div className="relative flex items-center gap-3">
          <div className="relative w-[88px] h-[88px] flex-shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-mint-400/30" />
            <div className="absolute inset-1.5 rounded-full border border-mint-400/40" />
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(110,231,183,0.4) 0%, rgba(34,197,94,0.2) 40%, transparent 70%)',
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[7px] font-grotesk text-mint-300/80 uppercase tracking-[0.2em] leading-tight font-medium">
                Ley
              </span>
              <span className="font-instrument italic text-white text-[15px] leading-[1.05]">
                Fintech
              </span>
              <span className="font-geist font-extrabold text-mint-300 text-[15px] leading-tight tabular-nums tracking-tight">
                21.521
              </span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-mint-500 ring-[2.5px] ring-[#0a1410] flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.6)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-mint-400 flex-shrink-0" />
              <h3 className="text-[13px] font-geist font-bold text-white leading-tight tracking-tight">
                Ley Fintech 21.521
              </h3>
            </div>
            <p className="text-[10px] font-geist text-white/60 leading-snug">
              <span className="text-mint-400 mr-1">●</span>Registrada CMF
            </p>
            <p className="text-[10px] font-geist text-white/60 leading-snug">
              Estatus: <span className="text-mint-300 font-semibold">Activo</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card 2 · Smart Contract (flex-1 absorbe el resto) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative flex-1 min-h-0 rounded-[20px] bg-gradient-to-br from-white/95 to-white/90 overflow-hidden p-4 backdrop-blur-xl flex flex-col"
      >
        <div className="flex items-start justify-between mb-2 flex-shrink-0">
          <div>
            <h3 className="font-instrument text-[#0a1410] text-[17px] leading-[1.05]">
              Mandato Ciudadano
            </h3>
            <p className="font-instrument italic text-mint-700 text-[17px] leading-[1.05]">
              Smart Contract
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[9px] font-grotesk uppercase tracking-wider text-mint-700 bg-mint-100 border border-mint-300 px-1.5 py-0.5 rounded-full font-medium">
            <FileSignature className="w-2.5 h-2.5" />
            Listo
          </div>
        </div>

        {/* Items verificación (más compactos) */}
        <ul className="space-y-1.5 mb-3 flex-1 min-h-0">
          {[
            'Consulta registrada con sello de tiempo y normativa chilena vigente.',
            'Auditable públicamente desde /Transparencia por cualquier ciudadano.',
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-mint-600 flex-shrink-0 mt-0.5" />
              <span className="text-[10px] font-geist text-slate-600 leading-snug">{line}</span>
            </li>
          ))}
        </ul>

        {/* Verificación ciudadana */}
        <div className="space-y-1.5 flex-shrink-0">
          <p className="text-[10px] font-geist font-semibold text-[#0a1410]">Verificación ciudadana</p>
          <div className="relative">
            <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-mint-600" />
            <input
              readOnly
              value="Verificado · ciudadano"
              className="w-full h-9 pl-8 pr-3 rounded-lg bg-mint-50 border border-mint-200 text-[11px] font-geist font-medium text-mint-800 cursor-default"
            />
          </div>
          <Link
            to="/Transparencia"
            className="block text-center text-[10px] font-geist font-semibold text-mint-700 hover:text-mint-800 mt-1.5"
          >
            Ver auditoría pública →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}