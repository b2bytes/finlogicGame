import React from 'react';
import { Languages } from 'lucide-react';

const perfiles = [
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/100231319_generated_image.png',
    name: 'Don Luis',
    age: '68',
    location: 'Valparaíso',
    quote: '"Me cobraron un seguro que nunca pedí en mi tarjeta de pensión."',
    color: 'bg-[#FFF3E0]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/2b5e2a921_generated_image.png',
    name: 'Camila',
    age: '22',
    location: 'Santiago',
    quote: '"No entiendo el CAE de mi crédito de consumo. ¿Es legal?"',
    color: 'bg-[#E8F5E9]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/fddcf327a_generated_image.png',
    name: 'María José',
    age: '34',
    location: 'Temuco',
    quote: '"Vendo por Instagram. ¿Cómo formalizo en el SII sin morir en el intento?"',
    color: 'bg-[#FFE0CC]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/55d62fe58_generated_image.png',
    name: 'Roberto',
    age: '45',
    location: 'Antofagasta',
    quote: '"Recibí un SMS sospechoso del banco. ¿Es phishing?"',
    color: 'bg-[#F0E5FF]',
  },
];

export default function PerfilesSection() {
  return (
    <section id="perfiles" className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Para todos
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Tu derecho.{' '}
            <span className="text-muted-foreground">En tu idioma. Ahora.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {perfiles.map((p) => (
            <div
              key={p.name}
              className={`relative overflow-hidden rounded-[28px] ${p.color} hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 flex flex-col`}
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur shadow-soft">
                  <Languages className="w-3 h-3 text-mint-700" />
                  <span className="text-[10px] font-bold text-mint-700">Lenguaje simple</span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <p className="text-[11px] font-semibold text-foreground/60 mb-1">
                  {p.age} años · {p.location}
                </p>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {p.name}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed italic">
                  {p.quote}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}