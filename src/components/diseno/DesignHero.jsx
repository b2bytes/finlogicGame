import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, Workflow, Palette, Frame, Sparkles, FileDown } from 'lucide-react';
import Logo from '@/components/home/Logo';

const SECTIONS = [
  { id: 'flows', label: 'Mapa de flujos', icon: Workflow, desc: '5 arquetipos · 23 pantallas · navegación end-to-end' },
  { id: 'system', label: 'Sistema de diseño', icon: Palette, desc: 'Color, tipografía, radios, sombras, componentes' },
  { id: 'wireframes', label: 'Wireframes faltantes', icon: Frame, desc: 'Mockups de pantallas pendientes en alta fidelidad' },
];

export default function DesignHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mint-50/60 via-background to-background border-b border-border/40">
      {/* Mesh decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-mint-200/30 blur-3xl" />
        <div className="absolute top-40 -left-20 w-80 h-80 rounded-full bg-accent/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground text-background mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold tracking-wide">Entregable jurado · Claude Impact Lab</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Diseño FinLogic
              <span className="block text-mint-600">en una sola mirada.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Mapa de flujos de usuario, sistema de diseño completo y mockups de las pantallas
              que faltan por construir. Producto de 5 capas, una experiencia.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#flows"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
              >
                <Workflow className="w-4 h-4" />
                Ver flujos de usuario
              </a>
              <a
                href="#system"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-card border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors"
              >
                <Palette className="w-4 h-4" />
                Sistema de diseño
              </a>
            </div>
          </div>

          {/* Card "índice" tipo Apple */}
          <div className="bg-card/80 backdrop-blur border border-border rounded-3xl shadow-soft-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <Logo size="sm" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                v1.0
              </span>
            </div>
            <div className="space-y-2">
              {SECTIONS.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-secondary/60 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-mint-50 border border-mint-200 flex items-center justify-center flex-shrink-0 group-hover:bg-mint-100 transition-colors">
                    <s.icon className="w-4 h-4 text-mint-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{i + 1}. {s.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
              <Layers className="w-3.5 h-3.5 text-mint-600" />
              <span>5 capas · Ciudadanía · Pyme · Agéntica · B2B API · Transparencia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}