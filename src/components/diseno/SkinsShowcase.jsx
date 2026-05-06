import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSkin, SKIN_META } from '@/lib/SkinContext.jsx';
import { Sparkles, Palette, Eye, Mic, Zap, Cpu, Users } from 'lucide-react';

/**
 * SkinsShowcase — sección demo cinematográfica en /Diseno.
 * Muestra los 4 skins lado a lado + un "preview vivo" sincronizado con el switch global.
 */

const DEMO_RESPONSE = {
  fact: 'Un cobro de $47.500 que no reconoces en tu tarjeta de crédito.',
  translation:
    'La Ley 20.009 protege a los tarjetahabientes ante fraude: el banco es responsable salvo que demuestre dolo o culpa grave del titular.',
  action:
    '1. Desconoce el cargo formalmente al banco hoy mismo. 2. Pide bloqueo de la tarjeta. 3. Si en 5 días hábiles no responden, denuncia al CMF.',
  regulatoryBody: 'CSIRT',
  lawsCited: ['Ley 20.009', 'Art. 5° Ley 20.009'],
};

const SKIN_PREVIEW_STYLES = {
  // Camila — dark móvil moderno con acento púrpura (Imagen 2)
  camila: {
    bg: '#0f0d1a',
    surface: '#1a1729',
    text: '#f5f5f7',
    accent: 'hsl(280 70% 62%)',
    accentSoft: 'hsl(280 50% 22%)',
    accentBorder: 'hsl(280 60% 40%)',
    radius: '18px',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    voice: 'Rápida · joven',
    density: 'compact',
    headerBg: 'linear-gradient(135deg, hsl(280 50% 18%), hsl(280 60% 12%))',
    isDark: true,
  },
  // Don Luis — claro, alto contraste, tipografía grande (mantenido como light)
  don_luis: {
    bg: '#ffffff',
    surface: '#fafafa',
    text: '#0a0f1e',
    accent: 'hsl(158 70% 28%)',
    accentSoft: 'hsl(158 50% 94%)',
    accentBorder: 'hsl(158 50% 70%)',
    radius: '20px',
    fontSize: '17px',
    fontFamily: 'Inter, sans-serif',
    voice: 'Pausada · cálida',
    density: 'spacious',
    headerBg: 'linear-gradient(135deg, hsl(158 50% 94%), hsl(158 55% 88%))',
    isDark: false,
  },
  // María José — dark consultora pyme con badge naranja sobre superficie púrpura (Imagen 1)
  maria_jose: {
    bg: '#0e0d1a',
    surface: '#181530',
    text: '#f5f5f7',
    accent: 'hsl(28 85% 55%)',
    accentSoft: 'hsl(280 40% 18%)',
    accentBorder: 'hsl(280 30% 32%)',
    radius: '16px',
    fontSize: '14px',
    fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
    voice: 'Profesional · accionable',
    density: 'medium',
    headerBg: 'linear-gradient(135deg, hsl(280 40% 18%), hsl(280 50% 12%))',
    isDark: true,
  },
  // Roberto — terminal DevOps con mint fluorescente (Imagen 3)
  roberto: {
    bg: '#0a0e0c',
    surface: '#0f1411',
    text: '#e6f9ef',
    accent: 'hsl(158 75% 50%)',
    accentSoft: 'hsl(158 50% 12%)',
    accentBorder: 'hsl(158 60% 30%)',
    radius: '8px',
    fontSize: '13px',
    fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
    voice: 'Directa · técnica',
    density: 'dense',
    headerBg: 'linear-gradient(135deg, hsl(158 50% 8%), hsl(158 60% 5%))',
    isDark: true,
  },
};

function SkinCard({ skinKey, response, isActive, onClick }) {
  const meta = SKIN_META[skinKey];
  const s = SKIN_PREVIEW_STYLES[skinKey];
  const padding = s.density === 'spacious' ? '20px' : s.density === 'compact' ? '14px' : '16px';
  // Opacidades adaptadas para dark vs light (en dark, "muted" debe quedar más visible)
  const mutedOpacity = s.isDark ? 0.7 : 0.55;
  const subtleOpacity = s.isDark ? 0.55 : 0.5;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`w-full text-left rounded-3xl overflow-hidden border-2 shadow-soft outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${
        isActive ? 'border-foreground shadow-soft-lg' : 'border-border hover:border-mint-300'
      }`}
      style={{ background: s.bg, fontFamily: s.fontFamily }}
      aria-pressed={isActive}
      aria-label={`Aplicar skin ${meta.label}`}
    >
      {/* Header del skin */}
      <div
        className="px-4 py-3.5 flex items-center gap-2.5 border-b"
        style={{ borderColor: s.accentBorder, background: s.headerBg }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 shadow-sm"
          style={{ background: s.accent, color: 'white' }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold truncate" style={{ color: s.text, fontSize: '14px' }}>
            {meta.label}
          </p>
          <p className="text-[10.5px] truncate" style={{ color: s.text, opacity: mutedOpacity }}>
            {meta.description}
          </p>
        </div>
        {isActive && (
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: s.accent, color: 'white' }}
          >
            Activo
          </span>
        )}
      </div>

      {/* Mock respuesta */}
      <div style={{ padding, color: s.text, fontSize: s.fontSize, lineHeight: 1.55, wordBreak: 'break-word' }}>
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: skinKey === 'roberto' ? 'transparent' : s.accent,
              color: skinKey === 'roberto' ? s.accent : 'white',
              border: skinKey === 'roberto' ? `1px solid ${s.accent}` : 'none',
              fontFamily: skinKey === 'roberto' ? 'ui-monospace, monospace' : 'inherit',
            }}
          >
            {skinKey === 'roberto' ? `[${response.regulatoryBody}]` : response.regulatoryBody}
          </span>
          <span className="text-[10px]" style={{ color: s.text, opacity: subtleOpacity }}>·</span>
          <span className="text-[10px]" style={{ color: s.text, opacity: subtleOpacity }}>Score 87/100</span>
        </div>

        <p
          style={{
            fontWeight: 700,
            fontSize: skinKey === 'don_luis' ? '17px' : '14px',
            marginBottom: 8,
            color: s.text,
            lineHeight: 1.35,
          }}
        >
          {response.fact}
        </p>

        <div
          style={{
            background: s.accentSoft,
            borderLeft: `3px solid ${s.accent}`,
            borderRadius: s.radius,
            padding: skinKey === 'don_luis' ? '14px' : '10px 12px',
            marginBottom: 10,
            fontSize: skinKey === 'don_luis' ? '15px' : s.fontSize,
            lineHeight: 1.5,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: s.accent }}>
            Tu derecho
          </p>
          {response.translation}
        </div>

        <p
          style={{
            fontSize: skinKey === 'don_luis' ? '14px' : '12.5px',
            lineHeight: 1.55,
            color: s.text,
            opacity: s.isDark ? 0.78 : 0.85,
          }}
        >
          {response.action}
        </p>

        <div
          tabIndex={-1}
          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-white pointer-events-none"
          style={{
            background: s.accent,
            borderRadius: skinKey === 'roberto' ? '6px' : '999px',
            padding: skinKey === 'don_luis' ? '12px 20px' : '8px 14px',
            fontSize: skinKey === 'don_luis' ? '14px' : '12px',
            minHeight: skinKey === 'don_luis' ? '48px' : 'auto',
          }}
        >
          {skinKey === 'don_luis' && '👉 '}
          Resolver ahora
        </div>

        <div className="flex items-center gap-3 mt-3 text-[10px]" style={{ color: s.text, opacity: mutedOpacity }}>
          <span className="inline-flex items-center gap-1">
            <Mic className="w-3 h-3" /> {s.voice}
          </span>
          <span>·</span>
          <span>Densidad {s.density}</span>
        </div>
      </div>
    </motion.button>
  );
}

const TECH_PILLARS = [
  {
    icon: Cpu,
    label: 'Detección',
    value: 'Triage GPT-5 mini',
    sub: '< 600 ms · 5 perfiles',
    accent: 'hsl(220 60% 35%)',
  },
  {
    icon: Zap,
    label: 'Aplicación',
    value: 'CSS variables',
    sub: '0 re-render · clase en <html>',
    accent: 'hsl(28 80% 50%)',
  },
  {
    icon: Users,
    label: 'Override',
    value: 'Manual + persistente',
    sub: 'localStorage · WCAG 2.1',
    accent: 'hsl(280 60% 55%)',
  },
];

export default function SkinsShowcase() {
  const { skin, setSkin } = useSkin();
  const [highlighted, setHighlighted] = useState(skin !== 'auto' ? skin : 'don_luis');

  const apply = (key) => {
    setSkin(key);
    setHighlighted(key);
  };

  return (
    <section
      id="skins"
      className="relative py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Mesh decorativo */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.5 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[300px] rounded-full bg-gradient-to-br from-mint-200/30 to-purple-200/20 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="relative text-center mb-12 max-w-3xl mx-auto"
      >
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-4">
          <Palette className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-bold text-mint-700 uppercase tracking-wider">
            Skins Adaptativos
          </span>
        </span>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Una sola respuesta. <span className="text-mint-600">Cuatro personalidades.</span>
        </h2>
        <p className="text-lg text-muted-foreground">
          La interfaz de FinLogic se adapta a quién consulta. Don Luis (68) ve texto grande,
          contraste alto y áreas táctiles de 48 px. Camila (22) ve una UI compacta y vibrante.
          Roberto (45) ve datos densos y tipografía técnica.
        </p>
        <p className="mt-3 text-sm text-foreground font-semibold">
          El backend detecta el perfil desde la consulta y aplica el skin automáticamente.
        </p>
      </motion.div>

      {/* Pills aplicar globalmente */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative flex flex-wrap items-center justify-center gap-2 mb-10"
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2 hidden sm:inline">
          Aplicar a toda la app:
        </span>
        {Object.entries(SKIN_META).map(([key, meta]) => (
          <motion.button
            key={key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => apply(key)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full border-2 text-xs font-semibold transition-colors ${
              skin === key
                ? 'bg-foreground text-background border-foreground shadow-soft'
                : 'bg-card text-foreground border-border hover:border-mint-300'
            }`}
          >
            <span>{meta.emoji}</span>
            {meta.label}
            <AnimatePresence>
              {skin === key && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 'auto', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="overflow-hidden inline-flex"
                >
                  <Sparkles className="w-3 h-3 ml-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </motion.div>

      {/* Grid 4 skins — 1 col mobile, 2 cols tablet, 4 cols solo en xl+ para evitar apretujamiento */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
        className="relative grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        {['camila', 'don_luis', 'maria_jose', 'roberto'].map((key) => (
          <motion.div
            key={key}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <SkinCard
              skinKey={key}
              response={DEMO_RESPONSE}
              isActive={highlighted === key || skin === key}
              onClick={() => apply(key)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Bloque técnico */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6 }}
        className="relative mt-12 max-w-5xl mx-auto rounded-3xl bg-card border border-border shadow-soft p-6 sm:p-8"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-mint-50 border border-mint-200 flex items-center justify-center flex-shrink-0">
            <Eye className="w-5 h-5 text-mint-700" />
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-lg mb-1">
              ¿Cómo funciona técnicamente?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              El triage de Lya (GPT-5 mini, &lt;600 ms) detecta el perfil del ciudadano desde su
              consulta. El frontend escucha el campo{' '}
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">detectedProfile</code> y
              aplica un skin vía{' '}
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">SkinContext</code> que
              cambia variables CSS globales: tipografía, escala, colores, densidad, radios y áreas
              táctiles. Cero re-render. El usuario puede sobreescribir manualmente desde el
              switcher 🎨 en cualquier header.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {TECH_PILLARS.map((m) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.label}
                whileHover={{ y: -3 }}
                className="rounded-2xl bg-background p-4 border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: m.accent }}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {m.label}
                  </p>
                </div>
                <p className="font-display font-bold text-foreground text-base">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.sub}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}