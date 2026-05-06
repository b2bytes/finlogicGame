import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mic, ShieldCheck, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Soft background gradients — Apple style */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-mint-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-accent rounded-full blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Hero copy */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-mint-700" />
              <span className="text-xs font-semibold text-mint-700">
                Sistema operativo financiero del pueblo de Chile
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
              ¿Sabes cuánto te van a cobrar el día <span className="text-mint-600">28</span>?
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              FinLogic te avisa el día 25. Con la opción de mover tu plata antes de que te cobren.
              Resolvemos cobros indebidos, fraudes y dudas financieras en lenguaje simple.
              <span className="block mt-2 font-semibold text-foreground">Sin abogado. Sin letra chica. Gratis.</span>
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-14 px-8 text-base font-semibold shadow-mint group"
              >
                <Link to="/Consulta">
                  Cuéntame qué pasó
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full h-14 px-6 text-base font-semibold border-border bg-card hover:bg-secondary"
              >
                <Link to="/Consulta?modo=voz">
                  <Mic className="mr-2 w-5 h-5" />
                  Prefiero hablar
                </Link>
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-mint-600" />
              <span>Registrada CMF · Ley Fintech 21.521 · Tus datos no salen de aquí</span>
            </div>
          </div>

          {/* Right — Phone mockup with chat preview */}
          <div className="relative lg:pl-8 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="relative mx-auto max-w-md">
              {/* Floating decorative elements */}
              <div aria-hidden="true" className="absolute -top-6 -left-6 w-20 h-20 bg-mint-100 rounded-3xl rotate-12 animate-float" />
              <div aria-hidden="true" className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent rounded-3xl -rotate-6 animate-float" style={{ animationDelay: '1s' }} />

              {/* Phone frame */}
              <div className="relative bg-card rounded-[2.5rem] shadow-soft-lg p-3 border border-border">
                <div className="bg-background rounded-[2rem] overflow-hidden">
                  {/* App header */}
                  <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                    <div className="w-8 h-8 rounded-full bg-mint-500 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Lex</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
                        En línea
                      </p>
                    </div>
                  </div>

                  {/* Chat bubbles */}
                  <div className="px-5 pb-6 space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-mint-500 text-white rounded-3xl rounded-tr-md px-4 py-2.5 max-w-[80%] text-sm">
                        Me cobraron $47.500 que no reconozco en mi tarjeta
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-secondary rounded-3xl rounded-tl-md px-4 py-2.5 max-w-[85%] text-sm">
                        <p className="font-semibold text-mint-700 mb-1">Tienes derecho a reclamar.</p>
                        <p className="text-foreground/80">
                          Por <span className="font-semibold">Ley 20.009</span>, el banco debe devolverte el cargo en máximo 5 días hábiles si denuncias dentro de 24h.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-card border-2 border-mint-200 rounded-3xl rounded-tl-md px-4 py-3 max-w-[90%]">
                        <p className="text-xs font-semibold text-mint-700 mb-1.5">📋 Carta de reclamo lista</p>
                        <p className="text-xs text-muted-foreground mb-2">Generada según normativa CMF vigente</p>
                        <button className="text-xs font-semibold text-mint-600 hover:text-mint-700">
                          Descargar PDF →
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Score verificador: <span className="font-semibold text-mint-700">89/100</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}