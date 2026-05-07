import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Eyebrow from '@/components/editorial/Eyebrow';

export default function LanzamientoHero() {
  return (
    <section className="relative overflow-hidden px-6 lg:px-12 py-16 sm:py-24">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-mint-100/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-[hsl(28_80%_92%)]/60 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Eyebrow size="md" className="mb-6">⚡ MODO GUERRA · LANZAMIENTO 7 MAYO 2026</Eyebrow>
          <h1 className="font-display tracking-tight font-bold text-foreground leading-[0.95] text-5xl sm:text-7xl lg:text-[88px]">
            FinLogic aterriza<br />
            en <span className="text-mint-600">Espacio Riesco</span><br />
            mañana.
          </h1>
          <p className="mt-8 text-lg sm:text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Plan de marketing táctico para tomar el <strong className="text-foreground">Chile Fintech Forum 2026</strong> desde adentro.
            6.000+ asistentes. 90+ speakers. 2 días para activar la red completa.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft">
              <Calendar className="w-4 h-4 text-mint-600" />
              <span className="text-sm font-semibold">7 mayo 2026</span>
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft">
              <MapPin className="w-4 h-4 text-mint-600" />
              <span className="text-sm font-semibold">Espacio Riesco · Huechuraba</span>
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft">
              <Users className="w-4 h-4 text-mint-600" />
              <span className="text-sm font-semibold">+6.000 asistentes</span>
            </span>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/Consulta"
              className="inline-flex items-center gap-2 rounded-full bg-mint-600 hover:bg-mint-700 text-white h-12 px-6 text-sm font-bold transition-colors shadow-soft"
            >
              Probar FinLogic ahora <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://www.chilefintechforum.com/speakers-2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-card border border-border hover:border-mint-300 text-foreground h-12 px-6 text-sm font-bold transition-colors"
            >
              Ver speakers oficiales
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}