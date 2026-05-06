import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-mint-600 via-mint-600 to-mint-700 p-10 md:p-14 text-center">
          {/* Soft decorative blobs */}
          <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-white/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div aria-hidden="true" className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white tracking-tight leading-[1.05]">
              Esto no es un chatbot.
            </h2>
            <p className="mt-2 font-display text-2xl md:text-4xl font-bold text-white/95 tracking-tight leading-[1.1]">
              Es el sistema operativo financiero<br className="hidden md:block" /> del pueblo de Chile.
            </p>
            <p className="mt-6 text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed">
              5 millones de chilenos no pueden entender sus derechos financieros. Nosotros los traducimos a acción. Sin abogado. Gratis.
            </p>

            <Button
              asChild
              size="lg"
              className="mt-8 rounded-full bg-white hover:bg-white/95 text-mint-700 h-12 px-7 text-sm font-bold group"
            >
              <Link to="/Consulta">
                Consultar ahora — gratis
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}