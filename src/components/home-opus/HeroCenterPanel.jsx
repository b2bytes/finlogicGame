import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, ArrowRight } from 'lucide-react';
import HeroVortex from './HeroVortex';

/**
 * HeroCenterPanel — el panel central de la home Opus.
 * - Eyebrow: REGISTRADA CMF · LEY FINTECH 21.521 · PIPELINE IA EN VIVO
 * - Headline editorial Fraunces: "Tu derecho financiero, en tu idioma. Ahora."
 * - Vortex IA central
 * - Bloque inferior: descripción + waveform + CTA "Iniciar caso"
 */

export default function HeroCenterPanel() {
  return (
    <div className="relative h-full min-h-[600px] flex flex-col gap-4">
      {/* Card superior — headline + vortex */}
      <div className="relative flex-1 rounded-[28px] bg-gradient-to-br from-[#0d1f17]/90 via-[#0a1410]/85 to-[#081210]/90 border border-mint-500/10 overflow-hidden p-7 sm:p-9">
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
          className="relative flex items-center justify-center gap-2 mb-6 flex-wrap"
        >
          {['REGISTRADA CMF', 'LEY FINTECH 21.521', 'PIPELINE IA EN VIVO'].map((tag, i) => (
            <React.Fragment key={tag}>
              {i > 0 && <span className="text-mint-400/40 text-[10px]">·</span>}
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mint-300/90">
                <span className="text-mint-400 mr-1.5">●</span>
                {tag}
              </span>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Headline editorial */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-editorial text-white text-center text-[40px] sm:text-[52px] lg:text-[60px] leading-[1.05] tracking-tight mb-4"
        >
          Tu derecho financiero,
          <br />
          en tu idioma. <span className="font-editorial-italic text-mint-200">Ahora.</span>
        </motion.h1>

        {/* Vortex IA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative flex items-center justify-center mt-2 sm:mt-4"
        >
          <HeroVortex size={300} />
        </motion.div>
      </div>

      {/* Card inferior — descripción + voice + CTA */}
      <div className="relative rounded-[24px] bg-gradient-to-br from-[#0d1f17]/95 via-[#0a1410]/90 to-[#081210]/95 border border-mint-500/10 overflow-hidden p-5 sm:p-6">
        <div className="grid sm:grid-cols-[1fr_auto] gap-4 sm:gap-6 items-center">
          {/* Texto + waveform */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex-1 min-w-0">
              <p className="text-[14px] sm:text-[15px] text-white/80 leading-snug">
                Banco, SII, fraude, cripto, datos personales o pyme. Cuéntanos qué te pasa: lo traduce tu derecho y identifica tu deuda.{' '}
                <span className="text-white font-semibold">La Gratis. Ahora.</span>
              </p>
            </div>
            {/* Waveform visual */}
            <Waveform />
          </div>

          {/* Acciones — mic + CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <button
              type="button"
              aria-label="Hablar"
              className="relative w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-all hover:scale-105 group"
            >
              <span className="absolute inset-0 rounded-full bg-mint-400/30 animate-ping opacity-50" />
              <Mic className="relative w-5 h-5 text-white" />
            </button>

            <Link
              to="/Consulta"
              className="inline-flex items-center gap-2 rounded-full bg-white hover:bg-white/95 text-[#0a1410] h-12 px-5 sm:px-6 text-[14px] font-bold transition-all hover:scale-[1.02] shadow-[0_0_24px_rgba(255,255,255,0.15)]"
            >
              Iniciar caso
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Waveform() {
  // 22 barras animadas tipo equalizer
  return (
    <div className="hidden sm:flex items-center gap-[3px] h-10 flex-shrink-0" aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
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