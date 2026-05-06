import React from 'react';
import { Landmark, Scale, Receipt, ShieldAlert, BookOpen, PiggyBank, Briefcase } from 'lucide-react';

// Los 7 organismos reguladores que el mandato exige cubrir end-to-end
const ORGANISMOS = [
  { sigla: 'CMF',       icon: Landmark,    nombre: 'Comisión Mercado Financiero',     color: 'text-mint-700' },
  { sigla: 'SERNAC',    icon: Scale,       nombre: 'Servicio Nacional Consumidor',    color: 'text-purple-700' },
  { sigla: 'SII',       icon: Receipt,     nombre: 'Servicio Impuestos Internos',     color: 'text-orange-700' },
  { sigla: 'CSIRT',     icon: ShieldAlert, nombre: 'Ciberseguridad de Gobierno',      color: 'text-red-700' },
  { sigla: 'BCN',       icon: BookOpen,    nombre: 'Biblioteca Congreso Nacional',    color: 'text-blue-700' },
  { sigla: 'FOGAPE',    icon: PiggyBank,   nombre: 'Fondo Garantía Pequeño Empresario', color: 'text-amber-700' },
  { sigla: 'SERCOTEC',  icon: Briefcase,   nombre: 'Servicio Cooperación Técnica',    color: 'text-teal-700' },
];

export default function OrganismosCobertura() {
  return (
    <section className="py-10 md:py-14 border-y border-border/40 bg-card/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-center mb-7">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider uppercase text-muted-foreground text-center">
            Cobertura end-to-end · 7 organismos reguladores · 12 normativas vivas
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {ORGANISMOS.map((o) => {
            const Icon = o.icon;
            return (
              <div
                key={o.sigla}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl bg-card border border-border/60 hover:border-mint-200 hover:shadow-soft transition-all duration-300"
                title={o.nombre}
              >
                <Icon className={`w-5 h-5 ${o.color} opacity-80 group-hover:opacity-100`} strokeWidth={2} />
                <span className="text-[11px] sm:text-xs font-bold text-foreground tracking-tight">
                  {o.sigla}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}