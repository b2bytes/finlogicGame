import React from 'react';
import { Sparkles, Check, TrendingUp } from 'lucide-react';

const HERO_ILLUSTRATION =
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/95b6d6fd9_generated_image.png';

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

        {/* ─── Burbuja chat USUARIO — top right (mensaje entrante) ─── */}
        <div
          className="hidden md:block absolute top-[8%] right-0 lg:right-[-8px] max-w-[230px] animate-float"
          style={{ animationDelay: '200ms' }}
        >
          <div className="bg-card border border-border shadow-soft-lg rounded-2xl rounded-tr-sm px-4 py-2.5">
            <p className="text-[11px] font-mono-editorial text-muted-foreground uppercase tracking-wider mb-0.5">
              Camila · 22
            </p>
            <p className="text-[13px] text-foreground leading-snug">
              "Me cobraron $42.000 que no reconozco…"
            </p>
          </div>
          <div className="flex justify-end mt-1 pr-3">
            <span className="text-[10px] text-muted-foreground/70 font-mono-editorial">14:32</span>
          </div>
        </div>

        {/* ─── Burbuja chat LYA — middle left (respuesta IA) ─── */}
        <div
          className="hidden md:block absolute top-[42%] left-0 lg:left-[-12px] max-w-[260px] animate-float"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-mint-600 flex items-center justify-center flex-shrink-0 shadow-mint">
              <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2.6} />
            </div>
            <div className="bg-mint-600 text-white rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-soft-lg">
              <p className="text-[11px] font-mono-editorial text-mint-100 uppercase tracking-wider mb-0.5">
                Lya · IA FinLogic
              </p>
              <p className="text-[13px] leading-snug">
                Aplica <span className="font-semibold">Ley 20.009 Art. 5°</span>. El banco debe restituir en 5 días.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 ml-9">
            <Check className="w-3 h-3 text-mint-600" strokeWidth={3} />
            <span className="text-[10px] text-muted-foreground font-mono-editorial">
              Verificado · 0.4s
            </span>
          </div>
        </div>

        {/* ─── Card resultado — bottom (recuperación, dark) ─── */}
        <div
          className="hidden md:flex absolute bottom-[4%] left-1/2 -translate-x-1/2 items-center gap-3 bg-foreground text-background rounded-2xl px-4 py-3 shadow-soft-lg animate-float whitespace-nowrap"
          style={{ animationDelay: '400ms' }}
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
          <div className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse-soft ml-1" />
        </div>
      </div>
    </div>
  );
}