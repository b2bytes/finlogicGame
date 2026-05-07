import React from 'react';
import Eyebrow from '@/components/editorial/Eyebrow';

const KPIS = [
  { label: 'Demos en vivo', value: '25', sublabel: '90 segundos cada una' },
  { label: 'Leads B2B capturados', value: '40', sublabel: 'con email + LinkedIn' },
  { label: 'Pilotos firmados', value: '3', sublabel: 'fintechs reguladas' },
  { label: 'Convenio público', value: '1', sublabel: 'SII / CMF / SERCOTEC' },
  { label: 'Posts coordinados', value: '12', sublabel: 'LinkedIn + X + IG' },
  { label: 'Tráfico finlogic.one', value: '+800%', sublabel: 'pico 7-8 mayo' },
];

export default function KPIsLanzamiento() {
  return (
    <section className="px-6 lg:px-12 py-16 sm:py-20 bg-foreground text-background">
      <div className="max-w-6xl mx-auto">
        <Eyebrow size="md" className="mb-4 !text-mint-300">📊 KPI 48H · MEDIBLE</Eyebrow>
        <h2 className="font-display tracking-tight font-bold text-3xl sm:text-5xl mb-4 leading-tight">
          Sin métricas no hay guerra.<br />
          <span className="text-mint-400">Estos son los números.</span>
        </h2>
        <p className="text-background/70 max-w-3xl">
          Tracking diario en /Insights. Cierre semanal con el equipo el viernes 8 mayo 19:00.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-3xl border border-background/15 p-7">
              <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-background/60 mb-2">{k.label}</p>
              <p className="hero-number text-mint-400 text-5xl sm:text-6xl">{k.value}</p>
              <p className="mt-2 text-sm text-background/70">{k.sublabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}