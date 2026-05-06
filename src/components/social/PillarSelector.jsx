import React from 'react';

const PILLARS = [
  { key: 'derecho_hoy', label: 'Tu Derecho de Hoy', weight: '40%' },
  { key: 'casos_reales', label: 'Casos Reales', weight: '30%' },
  { key: 'alerta_financiera', label: 'Alerta Financiera', weight: '20%' },
  { key: 'detras_sistema', label: 'Detrás del Sistema', weight: '10%' },
];

const PLATFORMS = [
  { key: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { key: 'instagram', label: 'Instagram', emoji: '📸' },
  { key: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { key: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { key: 'x', label: 'X / Twitter', emoji: '𝕏' },
];

export default function PillarSelector({ pillar, platform, onChange }) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-soft space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Pilar editorial
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PILLARS.map((p) => (
            <button
              key={p.key}
              onClick={() => onChange({ pillar: p.key, platform })}
              className={`text-left px-4 py-3 rounded-2xl border transition-all ${
                pillar === p.key
                  ? 'bg-mint-50 border-mint-300 text-mint-700'
                  : 'bg-card border-border text-foreground hover:border-mint-200'
              }`}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="text-[11px] text-muted-foreground">{p.weight} del calendario</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Plataforma
        </p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map((pl) => (
            <button
              key={pl.key}
              onClick={() => onChange({ pillar, platform: pl.key })}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                platform === pl.key
                  ? 'bg-foreground text-background'
                  : 'bg-secondary text-foreground hover:bg-mint-50 hover:text-mint-700'
              }`}
            >
              <span className="mr-1.5">{pl.emoji}</span>
              {pl.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}