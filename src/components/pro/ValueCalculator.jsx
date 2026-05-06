import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

export default function ValueCalculator() {
  const [casos, setCasos] = useState(2);
  const [montoPromedio, setMontoPromedio] = useState(85000);

  const recuperadoAnual = casos * 12 * montoPromedio * 0.6; // 60% éxito promedio
  const costoAnualPro = 3990 * 12;
  const roi = recuperadoAnual / costoAnualPro;

  const fmt = (n) => new Intl.NumberFormat('es-CL').format(Math.round(n));

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background to-mint-50/40">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-mint-600 mb-3">
            Calculadora de valor
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            ¿Cuánto te puede devolver Pro?
          </h2>
        </div>

        <div className="bg-card border border-border rounded-[28px] p-7 md:p-9 shadow-soft">
          <div className="grid md:grid-cols-2 gap-7">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Casos por mes que sueles tener
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={casos}
                onChange={(e) => setCasos(Number(e.target.value))}
                className="w-full accent-mint-600"
              />
              <p className="mt-1 text-2xl font-display font-bold text-foreground tabular-nums">
                {casos} <span className="text-sm font-medium text-muted-foreground">casos/mes</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Monto promedio en juego
              </label>
              <input
                type="range"
                min={20000}
                max={500000}
                step={5000}
                value={montoPromedio}
                onChange={(e) => setMontoPromedio(Number(e.target.value))}
                className="w-full accent-mint-600"
              />
              <p className="mt-1 text-2xl font-display font-bold text-foreground tabular-nums">
                ${fmt(montoPromedio)} <span className="text-sm font-medium text-muted-foreground">CLP</span>
              </p>
            </div>
          </div>

          <div className="mt-9 grid md:grid-cols-3 gap-4">
            <div className="bg-mint-50 border border-mint-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-mint-700 uppercase tracking-wider mb-1">
                Costo Pro anual
              </p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                ${fmt(costoAnualPro)}
              </p>
            </div>
            <div className="bg-[#FFE5D0]/60 border border-[#FFD9B8] rounded-2xl p-5">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider mb-1">
                Recuperación estimada
              </p>
              <p className="font-display text-2xl font-bold text-foreground tabular-nums">
                ${fmt(recuperadoAnual)}
              </p>
            </div>
            <div className="bg-foreground text-background rounded-2xl p-5">
              <p className="text-xs font-semibold text-mint-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" />
                ROI estimado
              </p>
              <p className="font-display text-2xl font-bold tabular-nums">
                {fmt(roi)}x
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs text-muted-foreground">
            * Cálculo orientativo basado en 60% de tasa de éxito promedio en casos resueltos vía FinLogic.
            No es garantía. ROI real depende de cada caso.
          </p>
        </div>
      </div>
    </section>
  );
}