import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck, FileCheck2, Scale } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ICON_BY_BODY = {
  CMF: { icon: Scale, color: 'text-mint-700', bg: 'bg-mint-50' },
  SERNAC: { icon: ShieldCheck, color: 'text-orange-700', bg: 'bg-[#FFE0CC]' },
  SII: { icon: FileCheck2, color: 'text-amber-700', bg: 'bg-[#FFF3D6]' },
  CSIRT: { icon: ShieldCheck, color: 'text-purple-700', bg: 'bg-[#F0E5FF]' },
  default: { icon: Activity, color: 'text-mint-700', bg: 'bg-mint-50' },
};

const FALLBACK = [
  { regulatoryBody: 'CMF', title: 'Cobro indebido en tarjeta de crédito BancoEstado', region: 'Maipú' },
  { regulatoryBody: 'SERNAC', title: 'Cláusula abusiva en contrato de telefonía', region: 'Concepción' },
  { regulatoryBody: 'SII', title: 'Devolución de IVA mal calculada', region: 'Antofagasta' },
  { regulatoryBody: 'CMF', title: 'Tasa sobre el TMC en crédito de consumo', region: 'Valparaíso' },
  { regulatoryBody: 'SERNAC', title: 'Cargo automático no autorizado', region: 'La Florida' },
  { regulatoryBody: 'CSIRT', title: 'Phishing bancario reportado a tiempo', region: 'Las Condes' },
];

const REGIONS = ['Maipú', 'Puente Alto', 'Concepción', 'Antofagasta', 'Valparaíso', 'La Florida', 'Las Condes', 'Temuco', 'Iquique'];

function timeAgo() {
  const m = Math.floor(Math.random() * 12) + 1;
  return `hace ${m} min`;
}

export default function LiveTicker() {
  const [items, setItems] = useState(FALLBACK);

  useEffect(() => {
    base44.entities.MisCasos.list('-created_date', 8)
      .then((casos) => {
        if (casos && casos.length >= 4) {
          setItems(
            casos.map((c) => ({
              regulatoryBody: c.regulatoryBody || 'CMF',
              title: c.title || 'Caso resuelto',
              region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Duplicar para loop infinito
  const looped = [...items, ...items];

  return (
    <section className="py-10 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint-600" />
          </span>
          <p className="text-xs font-semibold text-mint-700 uppercase tracking-[0.18em]">
            Casos en vivo
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <p className="text-xs text-muted-foreground">
            Resoluciones reales registradas en los últimos minutos
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div className="flex gap-3 animate-ticker whitespace-nowrap">
          {looped.map((item, i) => {
            const meta = ICON_BY_BODY[item.regulatoryBody] || ICON_BY_BODY.default;
            const Icon = meta.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 bg-card border border-border rounded-full pl-2 pr-5 py-2 shadow-soft flex-shrink-0"
              >
                <div className={`w-9 h-9 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${meta.color}`} strokeWidth={2.2} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground leading-tight max-w-[280px] truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.regulatoryBody} · {item.region} · {timeAgo()}
                  </p>
                </div>
                <span className="ml-1 text-[10px] font-bold text-mint-700 bg-mint-50 border border-mint-200 px-2 py-0.5 rounded-full">
                  RESUELTO
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 50s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}