import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Layers, Workflow, Palette, Frame, Sparkles, MessageCircle, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '@/components/home/Logo';

const SECTIONS = [
  { id: 'flows', label: 'Mapa de flujos', icon: Workflow, desc: '5 arquetipos · 23 pantallas · navegación end-to-end' },
  { id: 'system', label: 'Sistema de diseño', icon: Palette, desc: 'Color, tipografía, radios, sombras, componentes' },
  { id: 'wireframes', label: 'Wireframes faltantes', icon: Frame, desc: 'Mockups de pantallas pendientes en alta fidelidad' },
];

export default function DesignHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-mint-50/60 via-background to-background border-b border-border/40">
      {/* Mesh decorativo animado */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-mint-200/40 to-mint-300/20 blur-3xl"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
          className="absolute top-40 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-accent/50 to-amber-100/30 blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground text-background mb-6 shadow-soft">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold tracking-wide">Entregable jurado · Claude Impact Lab</span>
              <span className="w-1.5 h-1.5 rounded-full bg-mint-400 animate-pulse" />
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              Diseño FinLogic
              <span className="block text-mint-600">en una sola mirada.</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Mapa de flujos de usuario, sistema de diseño completo y mockups de las pantallas
              que faltan por construir. <strong className="text-foreground">5 capas, una experiencia.</strong>
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#flows"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-soft"
              >
                <Play className="w-4 h-4" />
                Ver flujos de usuario
              </a>
              <a
                href="#system"
                className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-card border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Palette className="w-4 h-4" />
                Sistema de diseño
              </a>
            </div>

            {/* Hint del chat */}
            <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-3.5 h-3.5 text-mint-600" />
              <span>Usa el <strong className="text-foreground">chat flotante</strong> para que te explique cualquier detalle</span>
            </div>
          </motion.div>

          {/* Card "índice" tipo Apple */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-soft-lg p-6 hover:shadow-mint transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-5">
              <Logo size="sm" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-mint-700 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-200">
                  LIVE
                </span>
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Contenido del entregable
            </p>
            <div className="space-y-2">
              {SECTIONS.map((s, i) => (
                <motion.a
                  key={s.id}
                  href={`#${s.id}`}
                  whileHover={{ x: 4 }}
                  className="flex items-start gap-3 p-3 rounded-2xl hover:bg-mint-50/60 border border-transparent hover:border-mint-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-mint-50 border border-mint-200 flex items-center justify-center flex-shrink-0 group-hover:bg-mint-100 group-hover:scale-105 transition-all">
                    <s.icon className="w-4.5 h-4.5 text-mint-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-mint-700 transition-colors">{i + 1}. {s.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.desc}</p>
                  </div>
                </motion.a>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border flex items-center gap-2 text-[11px] text-muted-foreground">
              <Layers className="w-3.5 h-3.5 text-mint-600" />
              <span>5 capas · Ciudadanía · Pyme · Agéntica · B2B API · Transparencia</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}