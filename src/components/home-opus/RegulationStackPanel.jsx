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
    <div className="flex flex-col gap-4 h-full">
      {/* Card 1 · Sello Ley Fintech 21.521 */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[24px] bg-gradient-to-br from-[#0d1f17]/95 via-[#0a1410]/90 to-[#081210]/95 border border-mint-500/15 overflow-hidden p-5 sm:p-6"
      >
        {/* Glow corner */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-mint-500/15 rounded-full blur-3xl" />

        {/* Sello circular */}
        <div className="relative flex items-center justify-center mb-4">
          <div className="relative w-[140px] h-[140px]">
            {/* Anillos del sello */}
            <div className="absolute inset-0 rounded-full border-2 border-mint-400/30" />
            <div className="absolute inset-2 rounded-full border border-mint-400/40" />
            {/* Glow interior */}
            <div
              className="absolute inset-3 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(110,231,183,0.4) 0%, rgba(34,197,94,0.2) 40%, transparent 70%)',
              }}
            />
            {/* Texto del sello */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-grotesk text-mint-300/80 uppercase tracking-[0.2em] leading-tight font-medium">
                Ley
              </span>
              <span className="font-instrument italic text-white text-[24px] leading-[1.05]">
                Fintech
              </span>
              <span className="font-geist font-extrabold text-mint-300 text-[24px] leading-tight tabular-nums tracking-tight">
                21.521
              </span>
            </div>
            {/* Check verificación */}
            <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-mint-500 ring-[3px] ring-[#0a1410] flex items-center justify-center shadow-[0_0_16px_rgba(34,197,94,0.6)]">
              <CheckCircle2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="relative space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-mint-400 flex-shrink-0 mt-0.5" />
            <h3 className="text-[17px] font-geist font-bold text-white leading-tight tracking-tight">
              Ley Fintech 21.521
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] pl-6 font-geist">
            <span className="text-white/60">
              <span className="text-mint-400 mr-1">●</span>Registrada CMF
            </span>
            <span className="text-white/60">
              Estatus: <span className="text-mint-300 font-semibold">Activo</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Card 2 · Smart Contract */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative flex-1 rounded-[24px] bg-gradient-to-br from-white/95 to-white/90 overflow-hidden p-5 sm:p-6 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-instrument text-[#0a1410] text-[20px] leading-[1.05]">
              Mandato Ciudadano
            </h3>
            <p className="font-instrument italic text-mint-700 text-[20px] leading-[1.05]">
              Smart Contract
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-[10px] font-grotesk uppercase tracking-wider text-mint-700 bg-mint-100 border border-mint-300 px-2 py-0.5 rounded-full font-medium">
            <FileSignature className="w-2.5 h-2.5" />
            Ready firmar
          </div>
        </div>

        {/* Items verificación */}
        <ul className="space-y-2 mb-4">
          {[
            'Tu consulta queda registrada con sello de tiempo y vinculada a la normativa chilena vigente.',
            'Cualquier ciudadano puede auditar la trazabilidad completa del caso desde Transparencia.',
          ].map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-mint-600 flex-shrink-0 mt-0.5" />
              <span className="text-[11px] font-geist text-slate-600 leading-snug">{line}</span>
            </li>
          ))}
        </ul>

        {/* Verificación ciudadana */}
        <div className="space-y-2">
          <p className="text-[11px] font-geist font-semibold text-[#0a1410]">Verificación ciudadana</p>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mint-600" />
            <input
              readOnly
              value="Verificado · ciudadano"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-mint-50 border border-mint-200 text-[12px] font-geist font-medium text-mint-800 cursor-default"
            />
          </div>
        </div>

        {/* CTA sutil */}
        <Link
          to="/Transparencia"
          className="mt-4 block text-center text-[11px] font-geist font-semibold text-mint-700 hover:text-mint-800 underline-offset-2 hover:underline"
        >
          Ver auditoría pública →
        </Link>
      </motion.div>
    </div>
  );
}