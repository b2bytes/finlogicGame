import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, TrendingUp } from 'lucide-react';

const HERO_ILLUSTRATION =
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/95b6d6fd9_generated_image.png';

// Variants para animación de entrada secuencial
const bubbleEnter = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Animación de flotación continua suave (Apple-style)
const float = {
  animate: (offset = 0) => ({
    y: [0, -6, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: offset,
    },
  }),
};

export default function HeroIllustration() {
  return (
    <div className="relative w-full">
      {/* Ambient glow detrás de la ilustración */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[90%] h-[80%] bg-mint-200/40 rounded-full blur-[110px]" />
        <div className="absolute bottom-0 right-1/4 w-2/3 h-2/3 bg-[#FFD9B8]/45 rounded-full blur-[90px]" />
      </div>

      {/* Image container — proporción cuadrada-ish, integrada al layout */}
      <div className="relative aspect-[5/5] sm:aspect-[6/5] lg:aspect-square max-w-[560px] mx-auto">
        <img
          src={HERO_ILLUSTRATION}
          alt="Ciudadanos chilenos diversos protegiendo sus finanzas con FinLogic"
          className="w-full h-full object-contain object-center select-none"
          loading="eager"
          draggable="false"
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 70% 65% at 50% 50%, #000 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)',
            maskImage:
              'radial-gradient(ellipse 70% 65% at 50% 50%, #000 55%, rgba(0,0,0,0.85) 75%, rgba(0,0,0,0.3) 90%, transparent 100%)',
          }}
        />

        {/* ─── Burbuja chat USUARIO — top-left esquina, lejos de las caras ─── */}
        <motion.div
          variants={bubbleEnter}
          initial="hidden"
          animate="show"
          custom={0.3}
          className="hidden md:block absolute top-[2%] left-[-12px] lg:left-[-24px] max-w-[210px] z-10"
        >
          <motion.div variants={float} animate="animate" custom={0}>
            <div className="bg-card border border-border shadow-soft-lg rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <p className="text-[10px] font-mono-editorial text-muted-foreground uppercase tracking-wider mb-0.5">
                Camila · 22
              </p>
              <p className="text-[12.5px] text-foreground leading-snug">
                "Me cobraron $42.000 que no reconozco…"
              </p>
            </div>
            <div className="flex items-center gap-1 mt-1 ml-3">
              <span className="text-[10px] text-muted-foreground/70 font-mono-editorial">14:32</span>
              <Check className="w-2.5 h-2.5 text-mint-600" strokeWidth={3.5} />
              <Check className="w-2.5 h-2.5 text-mint-600 -ml-1.5" strokeWidth={3.5} />
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Burbuja chat LYA — top-right esquina, evita caras ─── */}
        <motion.div
          variants={bubbleEnter}
          initial="hidden"
          animate="show"
          custom={0.9}
          className="hidden md:block absolute top-[6%] right-[-16px] lg:right-[-32px] max-w-[240px] z-10"
        >
          <motion.div variants={float} animate="animate" custom={1.5}>
            <div className="flex items-start gap-2">
              <div className="bg-mint-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-soft-lg flex-1">
                <p className="text-[10px] font-mono-editorial text-mint-100 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" strokeWidth={3} />
                  Lya · IA
                </p>
                <p className="text-[12.5px] leading-snug">
                  Aplica <span className="font-semibold">Ley 20.009 Art. 5°</span>. Banco restituye en 5 días.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-1.5 justify-end mr-2">
              <Check className="w-3 h-3 text-mint-600" strokeWidth={3} />
              <span className="text-[10px] text-muted-foreground font-mono-editorial">
                Verificado · 0.4s
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* ─── Card resultado — bottom-right esquina, bajo el grupo ─── */}
        <motion.div
          variants={bubbleEnter}
          initial="hidden"
          animate="show"
          custom={1.5}
          className="hidden md:flex absolute bottom-[2%] right-[2%] lg:right-[-8px] z-10"
        >
          <motion.div
            variants={float}
            animate="animate"
            custom={2.5}
            className="flex items-center gap-3 bg-foreground text-background rounded-2xl px-4 py-2.5 shadow-soft-lg whitespace-nowrap"
          >
            <div className="w-9 h-9 rounded-full bg-mint-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-mint-300" strokeWidth={2.6} />
            </div>
            <div className="leading-tight">
              <p className="text-[10px] text-mint-300 font-mono-editorial font-medium uppercase tracking-wider">
                Hoy · en vivo
              </p>
              <p className="font-display text-base font-bold tabular-nums">
                +$8.1M recuperados
              </p>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse-soft ml-1" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}