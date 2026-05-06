import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

const UF_VALUE_CLP = 38000; // ~aprox actual
const PRICE_PER_CALL_USD = 0.008;
const USD_CLP = 950;
const BASE_MONTHLY_CLP = 490000;
const INCLUDED_CALLS = 10000;
const MULTA_REFERENCIAL_UF = 5000;

export default function ROICalculator() {
  const [calls, setCalls] = useState(15000);
  const [risk, setRisk] = useState(0.2); // 20% probabilidad anual de multa CMF

  const data = useMemo(() => {
    const extraCalls = Math.max(0, calls - INCLUDED_CALLS);
    const extraCostClp = extraCalls * PRICE_PER_CALL_USD * USD_CLP;
    const monthlyCost = BASE_MONTHLY_CLP + extraCostClp;
    const annualCost = monthlyCost * 12;
    const multaClp = MULTA_REFERENCIAL_UF * UF_VALUE_CLP;
    const expectedLoss = multaClp * risk;
    const savings = expectedLoss - annualCost;
    const roi = annualCost > 0 ? (savings / annualCost) * 100 : 0;
    return { monthlyCost, annualCost, multaClp, expectedLoss, savings, roi };
  }, [calls, risk]);

  const fmt = (n) => '$' + Math.round(n).toLocaleString('es-CL');

  return (
    <section id="calculadora" className="py-20 md:py-28 bg-mint-50/40">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-mint-200 mb-4">
            <Calculator className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">Calculadora ROI</span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            ¿Cuánto te ahorra una API contra una multa CMF?
          </h2>
        </div>

        <div className="bg-card rounded-3xl border border-border shadow-soft-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Inputs */}
            <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-border">
              <div className="space-y-8">
                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="calls" className="text-sm font-semibold text-foreground">
                      Llamadas API/mes
                    </label>
                    <span className="text-2xl font-display font-bold text-mint-700">
                      {calls.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <input
                    id="calls"
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={calls}
                    onChange={(e) => setCalls(Number(e.target.value))}
                    className="w-full accent-mint-600 h-3 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5K</span>
                    <span>100K</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label htmlFor="risk" className="text-sm font-semibold text-foreground">
                      Probabilidad anual de multa
                    </label>
                    <span className="text-2xl font-display font-bold text-mint-700">
                      {Math.round(risk * 100)}%
                    </span>
                  </div>
                  <input
                    id="risk"
                    type="range"
                    min="0.05"
                    max="0.6"
                    step="0.05"
                    value={risk}
                    onChange={(e) => setRisk(Number(e.target.value))}
                    className="w-full accent-mint-600 h-3 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>5%</span>
                    <span>60%</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Plan base</span>
                    <span className="font-medium text-foreground">{fmt(BASE_MONTHLY_CLP)}/mes</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Llamadas extra</span>
                    <span className="font-medium text-foreground">
                      {fmt(data.monthlyCost - BASE_MONTHLY_CLP)}/mes
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold pt-2 border-t border-border mt-2">
                    <span className="text-foreground">Total anual</span>
                    <span className="text-foreground">{fmt(data.annualCost)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="p-8 md:p-10 bg-foreground text-background">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-2">
                Tu ahorro esperado
              </p>
              <div className="flex items-baseline gap-2 mb-6">
                <TrendingUp className="w-7 h-7 text-mint-300" strokeWidth={2.5} />
                <span className="font-display text-4xl md:text-5xl font-bold text-mint-300">
                  {fmt(data.savings)}
                </span>
              </div>
              <p className="text-sm opacity-80 leading-relaxed mb-8">
                ROI: <span className="font-bold text-mint-300">{Math.round(data.roi).toLocaleString('es-CL')}%</span> sobre el costo anual de la API.
              </p>

              <div className="space-y-3 text-sm border-t border-white/10 pt-6">
                <div className="flex justify-between">
                  <span className="opacity-70">Multa CMF referencial</span>
                  <span className="font-medium">{fmt(data.multaClp)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Pérdida esperada (sin API)</span>
                  <span className="font-medium">{fmt(data.expectedLoss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Costo API anual</span>
                  <span className="font-medium">{fmt(data.annualCost)}</span>
                </div>
              </div>

              <p className="mt-8 text-xs opacity-60 leading-relaxed">
                Multa referencial: 5.000 UF (~{fmt(data.multaClp)}). Cálculo conservador asumiendo
                un solo evento/año. La pérdida real puede incluir reputacional, suspensión y costos legales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}