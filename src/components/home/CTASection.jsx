import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-mint-500 to-mint-700 p-12 md:p-20 text-center">
          <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-3xl mx-auto">
            <h2 className="font-display text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
              Esto no es un chatbot.
            </h2>
            <p className="mt-3 font-display text-3xl md:text-5xl font-bold text-mint-100 tracking-tight leading-[1.1]">
              Es el sistema operativo financiero del pueblo de Chile.
            </p>
            <p className="mt-8 text-lg text-white/85 max-w-xl mx-auto leading-relaxed">
              5 millones de chilenos no pueden entender sus derechos financieros. Nosotros los traducimos a acción. Sin abogado. Gratis.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-10 rounded-full bg-white hover:bg-white/95 text-mint-700 h-14 px-8 text-base font-bold group"
            >
              <Link to="/Consulta">
                Consultar ahora — gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}