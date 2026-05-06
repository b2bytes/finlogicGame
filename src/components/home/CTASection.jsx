import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mic, Sparkles } from 'lucide-react';

const ILLUSTRATION = 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/b12ba5fe3_generated_image.png';

export default function CTASection() {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-mint-600 via-mint-600 to-mint-700 p-8 md:p-12 lg:p-14">
          <div aria-hidden="true" className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative grid lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/20 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-semibold text-white">Esto no es un chatbot</span>
              </div>

              <h2 className="font-display text-3xl md:text-5xl lg:text-[56px] font-bold text-white tracking-tight leading-[1.02]">
                El sistema operativo financiero<br className="hidden md:block" /> del pueblo de Chile.
              </h2>

              <p className="mt-5 text-base md:text-lg text-white/85 max-w-xl leading-relaxed">
                5 millones de chilenos no pueden entender sus derechos financieros. Nosotros los traducimos a acción. Sin abogado. Gratis.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/Consulta"
                  className="group inline-flex items-center gap-2 rounded-full bg-white hover:bg-white/95 text-mint-700 h-12 px-6 text-sm font-bold transition-all shadow-lg hover:shadow-xl"
                >
                  Consultar ahora — gratis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/Consulta?modo=voz"
                  className="inline-flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur border border-white/25 text-white h-12 px-6 text-sm font-bold transition-all"
                >
                  <Mic className="w-4 h-4" />
                  Hablar por voz
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/75">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Sin tarjeta requerida
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  Respuesta en 60 segundos
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  100% confidencial
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img
                src={ILLUSTRATION}
                alt="Ciudadana confiada usando FinLogic"
                className="w-full h-auto max-w-md mx-auto"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}