import React, { useState } from 'react';
import { useSkin, SKIN_META } from '@/lib/SkinContext.jsx';
import { Sparkles, Palette, Eye, MessageSquare, Mic } from 'lucide-react';

/**
 * SkinsShowcase — sección demo en /Diseno.
 * Permite al jurado ver la MISMA respuesta renderizada en los 4 skins.
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
  camila: {
    bg: '#fefefe',
    surface: '#fff',
    text: '#0f172a',
    accent: 'hsl(280 60% 55%)',
    accentSoft: 'hsl(280 60% 96%)',
    accentBorder: 'hsl(280 50% 85%)',
    radius: '20px',
    fontSize: '14px',
    headingWeight: 700,
    density: 'compact',
    fontFamily: 'Inter, sans-serif',
    voice: 'Rápida · joven',
  },
  don_luis: {
    bg: '#ffffff',
    surface: '#fafafa',
    text: '#0a0f1e',
    accent: 'hsl(158 70% 28%)',
    accentSoft: 'hsl(158 50% 94%)',
    accentBorder: 'hsl(158 50% 70%)',
    radius: '20px',
    fontSize: '17px',
    headingWeight: 700,
    density: 'spacious',
    fontFamily: 'Inter, sans-serif',
    voice: 'Pausada · cálida',
  },
  maria_jose: {
    bg: '#fffbf5',
    surface: '#fff',
    text: '#1f2937',
    accent: 'hsl(28 80% 50%)',
    accentSoft: 'hsl(28 80% 96%)',
    accentBorder: 'hsl(28 70% 80%)',
    radius: '16px',
    fontSize: '14px',
    headingWeight: 700,
    density: 'medium',
    fontFamily: '"Plus Jakarta Sans", Inter, sans-serif',
    voice: 'Profesional · accionable',
  },
  roberto: {
    bg: '#f8fafc',
    surface: '#fff',
    text: '#0f172a',
    accent: 'hsl(220 60% 35%)',
    accentSoft: 'hsl(220 60% 96%)',
    accentBorder: 'hsl(220 50% 80%)',
    radius: '10px',
    fontSize: '13px',
    headingWeight: 600,
    density: 'dense',
    fontFamily: '"JetBrains Mono", ui-monospace, monospace',
    voice: 'Directa · técnica',
  },
};

function SkinPreviewCard({ skinKey, response }) {
  const meta = SKIN_META[skinKey];
  const s = SKIN_PREVIEW_STYLES[skinKey];
  const padding = s.density === 'spacious' ? '20px' : s.density === 'compact' ? '14px' : '16px';

  return (
    <div
      className="rounded-3xl border border-border overflow-hidden shadow-soft"
      style={{ background: s.bg, fontFamily: s.fontFamily }}
    >
      {/* Header del skin */}
      <div
        className="px-5 py-4 flex items-center gap-3 border-b"
        style={{ borderColor: s.accentBorder, background: s.accentSoft }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
          style={{ background: s.accent, color: 'white' }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-bold truncate"
            style={{ color: s.text, fontWeight: s.headingWeight, fontSize: '15px' }}
          >
            Skin {meta.label}
          </p>
          <p className="text-xs text-muted-foreground truncate">{meta.description}</p>
        </div>
      </div>

      {/* Mock respuesta */}
      <div style={{ padding, color: s.text, fontSize: s.fontSize, lineHeight: 1.55 }}>
        <div className="flex items-center gap-1.5 mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: s.accent, color: 'white' }}
          >
            {response.regulatoryBody}
          </span>
          <span className="text-[10px] text-muted-foreground">·</span>
          <span className="text-[10px] text-muted-foreground">Score 87/100</span>
        </div>

        <p
          style={{
            fontWeight: s.headingWeight,
            fontSize: skinKey === 'don_luis' ? '18px' : '15px',
            marginBottom: 8,
            color: s.text,
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
            fontSize: skinKey === 'don_luis' ? '16px' : s.fontSize,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: s.accent }}>
            Tu derecho
          </p>
          {response.translation}
        </div>

        <div className="text-xs">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-muted-foreground">
            Acción concreta
          </p>
          <p style={{ fontSize: skinKey === 'don_luis' ? '15px' : '12.5px', lineHeight: 1.5 }}>
            {response.action}
          </p>
        </div>

        {/* CTA pill */}
        <button
          type="button"
          tabIndex={-1}
          className="mt-3 inline-flex items-center gap-1.5 font-semibold text-white"
          style={{
            background: s.accent,
            borderRadius: skinKey === 'roberto' ? '6px' : '999px',
            padding: skinKey === 'don_luis' ? '12px 20px' : '8px 14px',
            fontSize: skinKey === 'don_luis' ? '15px' : '12px',
            minHeight: skinKey === 'don_luis' ? '48px' : 'auto',
          }}
        >
          {skinKey === 'don_luis' && '👉 '}
          Resolver ahora
        </button>

        <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Mic className="w-3 h-3" /> {s.voice}
          </span>
          <span>·</span>
          <span>Densidad {s.density}</span>
        </div>
      </div>
    </div>
  );
}

export default function SkinsShowcase() {
  const { skin, setSkin } = useSkin();
  const [highlighted, setHighlighted] = useState('don_luis');

  return (
    <section id="skins" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12 max-w-3xl mx-auto">
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
          contraste alto y áreas táctiles de 48px. Camila (22) ve una UI compacta y vibrante.
          Roberto (45) ve datos densos y tipografía técnica. <strong>El backend detecta el perfil
          desde la consulta y aplica el skin automáticamente.</strong>
        </p>
      </div>

      {/* Toggle aplicar globalmente */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
          Aplicar a toda la app:
        </span>
        {Object.entries(SKIN_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => {
              setSkin(key);
              setHighlighted(key);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all ${
              skin === key
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-foreground border-border hover:border-mint-300'
            }`}
          >
            <span>{meta.emoji}</span>
            {meta.label}
            {skin === key && <Sparkles className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Grid 4 skins lado a lado */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {['camila', 'don_luis', 'maria_jose', 'roberto'].map((key) => (
          <div
            key={key}
            onClick={() => {
              setSkin(key);
              setHighlighted(key);
            }}
            className={`cursor-pointer transition-transform ${
              highlighted === key ? 'scale-[1.02]' : 'hover:scale-[1.01]'
            }`}
          >
            <SkinPreviewCard skinKey={key} response={DEMO_RESPONSE} />
          </div>
        ))}
      </div>

      {/* Pie técnico */}
      <div className="mt-10 max-w-4xl mx-auto rounded-3xl bg-secondary p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-3">
          <Eye className="w-5 h-5 text-mint-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display font-bold text-foreground text-lg mb-1">
              ¿Cómo funciona técnicamente?
            </h3>
            <p className="text-sm text-muted-foreground">
              El triage de Lya (GPT-5 mini, &lt;600ms) detecta el perfil del ciudadano desde su
              consulta. El frontend escucha ese campo (<code className="text-xs bg-card px-1.5 py-0.5 rounded">detectedProfile</code>)
              y aplica un skin vía <code className="text-xs bg-card px-1.5 py-0.5 rounded">SkinContext</code> que
              cambia variables CSS globales: tipografía, escala, colores, densidad, radios y
              áreas táctiles. El usuario puede sobreescribir manualmente desde el switcher.
            </p>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Detección', value: 'Triage GPT-5 mini', sub: '< 600ms · 5 perfiles' },
            { label: 'Aplicación', value: 'CSS variables', sub: '0 re-render · clase en <html>' },
            { label: 'Override', value: 'Manual + persistente', sub: 'localStorage · WCAG 2.1' },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl bg-card p-4 border border-border">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {m.label}
              </p>
              <p className="font-display font-bold text-foreground text-base">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}