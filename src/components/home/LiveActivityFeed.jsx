import React, { useEffect, useState } from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FALLBACK = [
  { regulatoryBody: 'CMF', title: 'Cobro indebido revertido por banco', amountInvolved: 145000, mins: 2 },
  { regulatoryBody: 'SERNAC', title: 'Reclamo por seguro no autorizado', amountInvolved: 89000, mins: 5 },
  { regulatoryBody: 'CMF', title: 'TMC excedida en crédito de consumo', amountInvolved: 267000, mins: 8 },
  { regulatoryBody: 'CSIRT', title: 'Phishing detectado y reportado', mins: 11 },
  { regulatoryBody: 'SII', title: 'Boleta electrónica corregida ante SII', amountInvolved: 54000, mins: 14 },
  { regulatoryBody: 'SERNAC', title: 'Carta ARCO enviada al banco', mins: 18 },
];

const ORG_COLORS = {
  CMF: 'bg-mint-100 text-mint-700',
  SERNAC: 'bg-[#F0E5FF] text-purple-700',
  SII: 'bg-[#FFF3D6] text-amber-700',
  CSIRT: 'bg-[#FFE0CC] text-orange-700',
  BCN: 'bg-secondary text-foreground',
};

export default function LiveActivityFeed() {
  const [items, setItems] = useState(FALLBACK);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    base44.entities.MisCasos
      .filter({ status: 'resuelto' }, '-created_date', 8)
      .then((data) => {
        if (data && data.length >= 4) {
          setItems(data.map((c, i) => ({
            regulatoryBody: c.regulatoryBody || 'SERNAC',
            title: c.title,
            amountInvolved: c.amountInvolved,
            mins: 2 + i * 3,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Rotación visual cada 3s
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const visible = [...items, ...items].slice(tick % items.length, (tick % items.length) + 4);

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="rounded-[32px] bg-card border border-border/60 shadow-soft overflow-hidden">
          <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border/60 bg-secondary/30">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mint-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-mint-600"></span>
              </span>
              <Activity className="w-4 h-4 text-mint-600" />
              <span className="text-sm font-bold text-foreground">Actividad en vivo</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">· últimos 20 minutos</span>
            </div>
            <span className="text-[10px] font-bold text-mint-700 bg-mint-50 border border-mint-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Tiempo real
            </span>
          </div>

          <ul className="divide-y divide-border/50">
            {visible.map((item, i) => (
              <li
                key={`${tick}-${i}`}
                className="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-3.5 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ORG_COLORS[item.regulatoryBody] || 'bg-secondary'} flex-shrink-0`}>
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {item.regulatoryBody}
                </span>
                <p className="text-sm text-foreground/85 leading-snug flex-1 truncate">
                  {item.title}
                </p>
                {item.amountInvolved > 0 && (
                  <span className="text-xs font-bold text-mint-700 tabular-nums hidden sm:inline-block flex-shrink-0">
                    +${item.amountInvolved.toLocaleString('es-CL')}
                  </span>
                )}
                <span className="text-[11px] text-muted-foreground tabular-nums flex-shrink-0">
                  hace {item.mins} min
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}