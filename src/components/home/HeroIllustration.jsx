import React from 'react';
import { ShieldCheck, FileCheck2, TrendingUp } from 'lucide-react';

const HERO_ILLUSTRATION =
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/95b6d6fd9_generated_image.png';

export default function HeroIllustration() {
  return (
    <div className="relative w-full">
      {/* Ambient glow detrás de la ilustración */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[110%] h-[80%] bg-mint-200/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-2/3 h-2/3 bg-[#FFD9B8]/50 rounded-full blur-[90px]" />
      </div>

      {/* Image with fade mask */}
      <div className="relative">
        <img
          src={HERO_ILLUSTRATION}
          alt="Ciudadanos chilenos diversos protegiendo sus finanzas con FinLogic"
          className="w-full h-auto select-none"
          loading="eager"
          draggable="false"
          style={{
            WebkitMaskImage:
              'radial-gradient(ellipse 62% 58% at 50% 50%, #000 50%, rgba(0,0,0,0.6) 70%, transparent 92%)',
            maskImage:
              'radial-gradient(ellipse 62% 58% at 50% 50%, #000 50%, rgba(0,0,0,0.6) 70%, transparent 92%)',
          }}
        />

        {/* Floating card 1 — Top left: arquetipo Don Luis */}
        <div
          className="hidden md:flex absolute top-[18%] -left-2 lg:-left-6 items-center gap-3 bg-card/95 backdrop-blur-md border border-border shadow-soft-lg rounded-2xl px-3.5 py-2.5 animate-float"
          style={{ animationDelay: '200ms' }}
        >
          <div className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-mint-700" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-foreground">Don Luis · 72</p>
            <p className="text-[11px] text-muted-foreground">Pensión protegida</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
        </div>

        {/* Floating card 2 — Right: documento generado */}
        <div
          className="hidden md:flex absolute top-[40%] -right-2 lg:-right-6 items-center gap-3 bg-card/95 backdrop-blur-md border border-border shadow-soft-lg rounded-2xl px-3.5 py-2.5 animate-float"
          style={{ animationDelay: '600ms' }}
        >
          <div className="w-9 h-9 rounded-full bg-[#F0E5FF] flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-4 h-4 text-purple-700" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-foreground">Carta ARCO lista</p>
            <p className="text-[11px] text-muted-foreground">Generada en 42s</p>
          </div>
        </div>

        {/* Floating card 3 — Bottom: monto recuperado */}
        <div
          className="hidden md:flex absolute bottom-[8%] left-[10%] items-center gap-3 bg-foreground text-background rounded-2xl px-4 py-2.5 shadow-soft-lg animate-float"
          style={{ animationDelay: '400ms' }}
        >
          <div className="w-9 h-9 rounded-full bg-mint-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-mint-300" strokeWidth={2.6} />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] text-mint-300 font-medium uppercase tracking-wider">Hoy</p>
            <p className="font-display text-base font-bold tabular-nums">+$8.1M recuperados</p>
          </div>
        </div>
      </div>
    </div>
  );
}