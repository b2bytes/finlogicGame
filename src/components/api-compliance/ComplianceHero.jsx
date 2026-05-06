import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function ComplianceHero() {
  return (
    <section className="relative overflow-hidden bg-background pt-20 pb-16 md:pt-28 md:pb-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 -right-32 w-[500px] h-[500px] rounded-full bg-mint-100/40 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-accent/30 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6 animate-fade-up">
          <ShieldCheck className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-semibold text-mint-700">FinLogic Compliance API · B2B</span>
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05] max-w-4xl animate-fade-up">
          Una multa CMF cuesta <span className="text-destructive">$190M</span>.
          <br />
          Nuestra API cuesta <span className="text-mint-700">$490.000/mes</span>.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed animate-fade-up">
          5 endpoints que validan tasa, fraude, datos y derechos del consumidor en tiempo real.
          Cumple Ley 21.521, NCG 502, Ley 19.496 y Ley 21.719 sin construirlo tú.
        </p>

        <div className="mt-10 flex flex-wrap gap-3 animate-fade-up">
          <Button asChild size="lg" className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-12 px-6 font-semibold min-h-[48px]">
            <a href="#calculadora">
              Calcular mi ROI
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full h-12 px-6 font-semibold min-h-[48px]">
            <a href="#demo">Ver demo `/check-tmc`</a>
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-up">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            10.000 llamadas incluidas
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            $0,008 USD/llamada extra
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            SLA 99,9% uptime
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-mint-500" />
            Setup en 24h
          </div>
        </div>
      </div>
    </section>
  );
}