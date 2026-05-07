import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, ArrowRight } from 'lucide-react';
import LyaOrb from './LyaOrb';

/**
 * HeroCenterPanel — el panel central de la home Opus.
 * - Eyebrow: REGISTRADA CMF · LEY FINTECH 21.521 · PIPELINE IA EN VIVO
 * - Headline editorial Fraunces: "Tu derecho financiero, en tu idioma. Ahora."
 * - Vortex IA central
 * - Bloque inferior: descripción + waveform + CTA "Iniciar caso"
 */

export default function HeroCenterPanel() {
  return (
    <div className="relative h-full flex flex-col gap-3">
      {/* Card superior — headline + orb (compact viewport-fit) */}
      <div className="relative flex-1 min-h-0 rounded-[24px] bg-gradient-to-br from-[#0d1f17]/90 via-[#0a1410]/85 to-[#081210]/90 border border-mint-500/10 overflow-hidden p-5 sm:p-6 flex flex-col">
        {/* Glow centro */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 60%)' }}
          />
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative flex items-center justify-center gap-2 mb-3 flex-wrap flex-shrink-0"
        >
          {['REGISTRADA CMF', 'LEY FINTECH 21.521', 'PIPELINE IA EN VIVO'].map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-mint-400/40 text-[10px]">·</span>}
              <span className="text-[9px] font-grotesk uppercase tracking-[0.22em] text-mint-300/90 font-medium">
                <span className="text-mint-400 mr-1">●</span>
                {tag}
              </span>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Headline Instrument Serif — viewport-aware (clamp) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-instrument text-white text-center leading-[1.02] tracking-[-0.025em] mb-2 flex-shrink-0"
          style={{ fontSize: 'clamp(28px, 4.2vw, 56px)' }}
        >
          Tu derecho financiero,
          <br />
          en tu idioma. <span className="font-instrument-italic text-mint-200">Ahora.</span>
        </motion.h1>

        {/* LYA ORB — flex-1 absorbe el espacio sobrante con orb centrado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex-1 min-h-0 flex items-center justify-center"
        >
          <div
            className="relative aspect-square"
            style={{
              width: 'min(260px, 28vh)',
              maxHeight: '100%',
            }}
          >
            <LyaOrb size={undefined} />
          </div>
        </motion.div>
      </div>

      {/* Card inferior — descripción + voice + CTA (compact) */}
      <div className="relative rounded-[20px] bg-gradient-to-br from-[#0d1f17]/95 via-[#0a1410]/90 to-[#081210]/95 border border-mint-500/10 overflow-hidden p-4 flex-shrink-0">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="font-geist text-[12px] sm:text-[13px] text-white/80 leading-snug line-clamp-2">
                Banco, SII, fraude, cripto, datos o pyme. Cuéntanos qué pasó: traducimos a tu derecho.{' '}
                <span className="text-white font-semibold">Gratis. Ahora.</span>
              </p>
            </div>
            <Waveform />
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              aria-label="Hablar"
              className="relative w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all hover:scale-105"
            >
              <span className="absolute inset-0 rounded-full bg-mint-400/30 animate-ping opacity-40" />
              <Mic className="relative w-4 h-4 text-white" />
            </button>

            <Link
              to="/Consulta"
              className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-white/95 text-[#0a1410] h-10 px-4 sm:px-5 text-[13px] font-geist font-bold transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              Iniciar caso
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Waveform() {
  // 16 barras animadas tipo equalizer (compact)
  return (
    <div className="hidden md:flex items-center gap-[3px] h-8 flex-shrink-0" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[2px] rounded-full bg-mint-300/80"
          animate={{
            height: ['18%', '90%', '40%', '70%', '25%'],
          }}
          transition={{
            duration: 1.4 + (i % 5) * 0.2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
          style={{ height: '40%' }}
        />
      ))}
    </div>
  );
}