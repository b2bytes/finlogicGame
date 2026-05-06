import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

/**
 * Pre-flight checklist · todo lo que debe estar listo ANTES de grabar.
 * Marca local (localStorage) para que el equipo lo use en producción.
 */

const SECTIONS = [
  {
    title: 'Sistema en producción',
    items: [
      { id: 'prod-1', text: 'Datos seed: ≥ 1.847 consultas reales en /Transparencia' },
      { id: 'prod-2', text: '/Consulta responde en < 11s con score ≥ 89/100' },
      { id: 'prod-3', text: 'Caso "Don Luis · cobro $89.990" pre-cargado y verificado' },
      { id: 'prod-4', text: 'PitchDeck slides 7, 8, 9, 12 verificados sin bugs visuales' },
      { id: 'prod-5', text: 'AgentTrace de Ley 20.009 Art. 5° con score ≥ 91/100 visible' },
    ],
  },
  {
    title: 'Activos visuales',
    items: [
      { id: 'asset-1', text: 'Foto Don Luis (Pexels/Unsplash) descargada y tratada en color crema' },
      { id: 'asset-2', text: 'B-roll cartolas bancarias + contratos con letra chica (3-5 clips)' },
      { id: 'asset-3', text: 'Mockup WhatsApp con alerta "te quedan 2 días" generado' },
      { id: 'asset-4', text: 'QR finlogic.one generado en PNG 1024×1024 transparente' },
      { id: 'asset-5', text: 'Logo FL en SVG + PNG transparente para outro' },
    ],
  },
  {
    title: 'Audio y voz',
    items: [
      { id: 'audio-1', text: 'Cuenta ElevenLabs activa · voz Sabina/Catalina es-CL probada' },
      { id: 'audio-2', text: 'Track musical Epidemic Sound licenciado y descargado' },
      { id: 'audio-3', text: 'SFX UI grabados desde el producto real (clicks, swooshes)' },
      { id: 'audio-4', text: 'Voz en off generada por escena · 9 archivos WAV separados' },
      { id: 'audio-5', text: 'Mezcla en DAW (Logic/Reaper/Audacity) · -16 LUFS validado' },
    ],
  },
  {
    title: 'Captura técnica',
    items: [
      { id: 'tech-1', text: 'Mac con Screen Studio o Cleanshot X instalado y licenciado' },
      { id: 'tech-2', text: 'Chrome incognito · viewport 1440×900 · zoom 100%' },
      { id: 'tech-3', text: 'MacOS focus mode ON · cero notificaciones · WiFi estable 5GHz' },
      { id: 'tech-4', text: 'Cursor magnificado +30% · color mint #0E7A47' },
      { id: 'tech-5', text: 'Grabación 4K 60fps · ProRes 422 HQ · ≥ 50GB libres' },
    ],
  },
  {
    title: 'Post-producción',
    items: [
      { id: 'post-1', text: 'Edición en CapCut Pro / DaVinci Resolve / Final Cut Pro' },
      { id: 'post-2', text: 'Color grading aplicado: LUT Apple-style + paleta FinLogic' },
      { id: 'post-3', text: 'Subtítulos SRT generados (es) + traducidos (en)' },
      { id: 'post-4', text: 'Render final MP4 H.264 1080p CRF 18 · ≤ 250 MB' },
      { id: 'post-5', text: 'Subido a YouTube unlisted + Vimeo Pro backup' },
      { id: 'post-6', text: 'URL pegada en components/demo/DemoVideoPlayer · /Demo verifica' },
    ],
  },
];

const STORAGE_KEY = 'finlogic_demo_checklist_v1';

export default function DemoChecklist() {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setChecked(JSON.parse(saved));
    } catch {}
  }, []);

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const totalItems = SECTIONS.reduce((acc, s) => acc + s.items.length, 0);
  const completedItems = SECTIONS.reduce(
    (acc, s) => acc + s.items.filter((i) => checked[i.id]).length,
    0
  );
  const pct = Math.round((completedItems / totalItems) * 100);

  return (
    <div className="space-y-5">
      {/* Progreso global */}
      <div className="bg-foreground text-background rounded-3xl p-6 shadow-soft-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-mono-editorial uppercase tracking-widest text-mint-300 mb-1">
              Progreso de producción
            </p>
            <p className="font-display font-bold text-3xl">
              {completedItems} <span className="text-background/50 text-xl">/ {totalItems}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="hero-number text-5xl text-mint-300">{pct}%</p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-background/15 overflow-hidden">
          <div
            className="h-full bg-mint-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <div className="mt-4 inline-flex items-center gap-2 text-mint-300 text-xs font-mono-editorial uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Todo listo para grabar
          </div>
        )}
        {pct < 100 && pct > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 text-background/60 text-xs font-mono-editorial uppercase tracking-widest">
            <AlertCircle className="w-3.5 h-3.5" />
            Faltan {totalItems - completedItems} items
          </div>
        )}
      </div>

      {/* Secciones */}
      {SECTIONS.map((section) => {
        const completed = section.items.filter((i) => checked[i.id]).length;
        return (
          <div key={section.title} className="bg-background rounded-3xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold text-foreground">{section.title}</h4>
              <span className="text-xs font-mono-editorial text-muted-foreground">
                {completed}/{section.items.length}
              </span>
            </div>
            <ul className="space-y-2">
              {section.items.map((item) => {
                const isChecked = !!checked[item.id];
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggle(item.id)}
                      className="w-full text-left flex items-start gap-3 py-1.5 hover:bg-secondary/40 rounded-xl px-2 transition-colors"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-mint-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm leading-relaxed ${
                          isChecked
                            ? 'text-muted-foreground line-through'
                            : 'text-foreground/85'
                        }`}
                      >
                        {item.text}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}