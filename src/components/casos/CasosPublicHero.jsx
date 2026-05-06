import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CasosPublicHero({ count, casos = [] }) {
  const totalRecovered = casos.reduce((s, c) => s + (c.amountInvolved || 0), 0);
  const avgScore = casos.length
    ? Math.round(casos.reduce((s, c) => s + (c.verifierScore || 80), 0) / casos.length)
    : 0;

  return (
    <section className="relative overflow-hidden pt-12 pb-12">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-mint-100 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-semibold text-mint-700">
            Casos reales resueltos por FinLogic
          </span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05]">
          {count > 0 ? <span className="text-mint-600">{count.toLocaleString('es-CL')}</span> : 'Cientos'} de chilenos
          <br />ya resolvieron su caso.
        </h1>
        <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Cada caso aquí fue resuelto con normativa real, plazo legal vigente y documento generado.
          <span className="block mt-1 font-semibold text-foreground">Tu caso puede ser el siguiente.</span>
        </p>

        {totalRecovered > 0 && (
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            <div className="bg-card rounded-3xl border border-border p-4 shadow-soft">
              <p className="text-[10px] font-bold text-mint-600 uppercase tracking-wider">Recuperados</p>
              <p className="font-display text-xl md:text-2xl font-bold text-foreground mt-1 tabular-nums">
                ${(totalRecovered / 1000000).toFixed(1)}M
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">CLP defendidos</p>
            </div>
            <div className="bg-card rounded-3xl border border-border p-4 shadow-soft">
              <p className="text-[10px] font-bold text-mint-600 uppercase tracking-wider">Score IA</p>
              <p className="font-display text-xl md:text-2xl font-bold text-foreground mt-1 tabular-nums">
                {avgScore}/100
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">verificador legal</p>
            </div>
            <div className="bg-card rounded-3xl border border-border p-4 shadow-soft">
              <p className="text-[10px] font-bold text-mint-600 uppercase tracking-wider">Casos</p>
              <p className="font-display text-xl md:text-2xl font-bold text-foreground mt-1 tabular-nums">
                {count}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">resueltos</p>
            </div>
          </div>
        )}

        <Button
          asChild
          size="lg"
          className="mt-8 rounded-full bg-mint-600 hover:bg-mint-700 text-white h-14 px-8 text-base font-semibold shadow-mint group"
        >
          <Link to="/Consulta">
            Resolver mi caso ahora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </section>
  );
}