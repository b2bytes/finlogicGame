import React from 'react';
import { Palette, Type, Square, Sparkles, MousePointerClick, ShieldCheck } from 'lucide-react';

const COLORS = [
  { token: 'mint-500', label: 'Primary · Mint Wise', hex: '#34A57F', desc: 'Acción principal, confianza financiera' },
  { token: 'foreground', label: 'Foreground', hex: '#15192B', desc: 'Texto principal, headlines' },
  { token: 'background', label: 'Background', hex: '#F7F2E8', desc: 'Crema cálido, calidez Wise' },
  { token: 'accent', label: 'Accent · Durazno', hex: '#FCE3CC', desc: 'Highlights cálidos Apple' },
  { token: 'destructive', label: 'Destructive · Coral', hex: '#E97157', desc: 'Errores, urgencia (no rojo agresivo)' },
  { token: 'border', label: 'Border', hex: '#E8E2D7', desc: 'Bordes casi invisibles' },
];

const TYPE_SCALE = [
  { name: 'Display 7xl', cls: 'text-5xl md:text-7xl font-display font-bold tracking-tight', sample: 'Aa' },
  { name: 'H1 · 4xl/5xl', cls: 'text-3xl md:text-4xl font-display font-bold tracking-tight', sample: 'Aa' },
  { name: 'H2 · 2xl', cls: 'text-xl md:text-2xl font-display font-bold', sample: 'Aa' },
  { name: 'Body · base', cls: 'text-base font-sans', sample: 'Aa' },
  { name: 'Caption · xs', cls: 'text-xs font-medium uppercase tracking-wider', sample: 'Aa' },
];

const RADII = [
  { name: 'sm · 8px', cls: 'rounded-sm' },
  { name: 'md · 16px', cls: 'rounded-md' },
  { name: 'lg · 24px', cls: 'rounded-lg' },
  { name: '2xl · 28px', cls: 'rounded-2xl' },
  { name: '3xl · 40px', cls: 'rounded-3xl' },
  { name: 'full', cls: 'rounded-full' },
];

const SHADOWS = [
  { name: 'soft', cls: 'shadow-soft', desc: 'Cards estándar' },
  { name: 'soft-lg', cls: 'shadow-soft-lg', desc: 'Cards elevadas, modales' },
  { name: 'mint', cls: 'shadow-mint', desc: 'CTAs primary, glow mint' },
];

const COMPONENTS = [
  { label: 'Pill', preview: <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 text-mint-700"><ShieldCheck className="w-3 h-3" /> Ley 21.521</span> },
  { label: 'Button primary', preview: <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-foreground text-background text-xs font-semibold">Consultar gratis</button> },
  { label: 'Button mint', preview: <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-mint-600 text-white text-xs font-semibold shadow-mint">Hablar con Lya</button> },
  { label: 'Card glass', preview: <div className="glass border border-border/40 rounded-2xl px-3 py-2 text-xs">Glassmorphism</div> },
  { label: 'Badge urgente', preview: <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20">5 días</span> },
  { label: 'Avatar', preview: <div className="w-9 h-9 rounded-full bg-mint-500 text-white flex items-center justify-center text-xs font-bold">CL</div> },
];

export default function DesignSystem() {
  return (
    <section id="system" className="py-20 md:py-28 bg-secondary/40 border-y border-border/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-4">
            <Palette className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">2 · Sistema de diseño</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Tokens, tipografía y componentes.
            <span className="block text-mint-600">Premium pero cálido.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Inspiración: Apple HIG · Wise · Mercado Pago. Radios grandes, sombras blandas, paleta cálida
            que transmite confianza sin agredir.
          </p>
        </div>

        {/* Color tokens */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 mb-6 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <Palette className="w-4 h-4 text-mint-600" />
            <h3 className="font-display text-xl font-bold">Paleta · Tokens</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {COLORS.map((c) => (
              <div key={c.token} className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/40 border border-border">
                <div
                  className="w-12 h-12 rounded-xl flex-shrink-0 border border-border/60 shadow-soft"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.label}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{c.hex} · --{c.token}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipografía + Radios + Sombras */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-4 h-4 text-mint-600" />
              <h3 className="font-display text-lg font-bold">Tipografía</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              <span className="font-mono font-semibold">Plus Jakarta Sans</span> (display) ·{' '}
              <span className="font-mono font-semibold">Inter</span> (body)
            </p>
            <div className="space-y-3">
              {TYPE_SCALE.map((t) => (
                <div key={t.name} className="flex items-baseline justify-between gap-3 pb-2 border-b border-border/60 last:border-0">
                  <span className={`${t.cls} text-foreground`}>{t.sample}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{t.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Square className="w-4 h-4 text-mint-600" />
              <h3 className="font-display text-lg font-bold">Radios</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Radios grandes (Apple-style). Base <code className="font-mono">--radius: 1.5rem</code>.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {RADII.map((r) => (
                <div key={r.name} className="text-center">
                  <div className={`w-full aspect-square ${r.cls} bg-mint-100 border border-mint-200`} />
                  <p className="text-[10px] font-mono text-muted-foreground mt-1.5">{r.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-mint-600" />
              <h3 className="font-display text-lg font-bold">Sombras</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Capas blandas, nunca duras. Estilo iOS/Apple.
            </p>
            <div className="space-y-4">
              {SHADOWS.map((s) => (
                <div key={s.name}>
                  <div className={`w-full h-14 rounded-2xl bg-card border border-border ${s.cls} flex items-center justify-center text-xs font-semibold text-muted-foreground`}>
                    {s.name}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 px-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Componentes */}
        <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft">
          <div className="flex items-center gap-2 mb-5">
            <MousePointerClick className="w-4 h-4 text-mint-600" />
            <h3 className="font-display text-xl font-bold">Componentes base</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMPONENTS.map((c) => (
              <div key={c.label} className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{c.label}</span>
                {c.preview}
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Componentes shadcn/ui extendidos · Lucide icons · Framer Motion para microinteracciones.
          </p>
        </div>
      </div>
    </section>
  );
}