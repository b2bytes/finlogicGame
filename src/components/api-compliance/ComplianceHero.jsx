import React from 'react';
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
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Columna izquierda: copy + CTAs */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6 animate-fade-up">
              <ShieldCheck className="w-3.5 h-3.5 text-mint-700" />
              <span className="text-xs font-semibold text-mint-700">FinLogic Compliance API · B2B</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.05] animate-fade-up">
              Una multa CMF cuesta <span className="text-destructive">$190M CLP</span>.
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
                <a href="#demo">Ver demo /check-tmc</a>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-up">
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

          {/* Columna derecha: mockup respuesta JSON real (llena el espacio vacío) */}
          <div className="lg:col-span-5 animate-fade-up">
            <div className="rounded-3xl bg-foreground text-background shadow-soft-lg overflow-hidden border border-foreground/20">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-mint-400/80" />
                </div>
                <code className="text-[10px] font-mono text-white/60">api.finlogic.one/v1</code>
              </div>
              <pre className="p-5 text-[11px] md:text-xs text-mint-300 font-mono leading-relaxed overflow-x-auto">
{`POST /v1/compliance
{
  "endpoint": "check-tmc",
  "payload": { "rate": 65 }
}

→ 200 OK · 340ms
{
  "compliant": false,
  "currentTMC": 49.92,
  "excess": 15.08,
  "legalBasis": "Art. 6 bis Ley 18.010"
}`}
              </pre>
              <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">Multa evitada</span>
                <span className="text-mint-300 font-display font-bold text-base">5.000 UF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}