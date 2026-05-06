import React from 'react';
import { Languages } from 'lucide-react';

const perfiles = [
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/100231319_generated_image.png',
    emoji: '👴',
    name: 'Don Luis',
    age: '68',
    location: 'Valparaíso',
    quote: '"Me cobraron un seguro que nunca pedí en mi tarjeta de pensión."',
    color: 'bg-[#FFF3E0]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/2b5e2a921_generated_image.png',
    emoji: '👩‍🎓',
    name: 'Camila',
    age: '22',
    location: 'Santiago',
    quote: '"No entiendo el CAE de mi crédito de consumo. ¿Es legal?"',
    color: 'bg-[#E8F5E9]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/fddcf327a_generated_image.png',
    emoji: '👩‍💼',
    name: 'María José',
    age: '34',
    location: 'Temuco',
    quote: '"Vendo por Instagram. ¿Cómo formalizo en el SII sin morir en el intento?"',
    color: 'bg-[#FFE0CC]',
  },
  {
    avatar: 'https://media.base44.com/images/public/69fae03fe83575f06c206e95/55d62fe58_generated_image.png',
    emoji: '👨‍🔧',
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
              className={`relative overflow-hidden rounded-[28px] ${p.color} p-6 hover:shadow-soft hover:-translate-y-1 transition-all duration-300`}
            >
              {/* Floating language icon */}
              <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-soft">
                <Languages className="w-4 h-4 text-mint-700" />
              </div>

              {/* Top: emoji bubble */}
              <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-2xl mb-3 shadow-soft">
                {p.emoji}
              </div>

              {/* Avatar — más grande, dominante */}
              <div className="relative -mx-6 mb-4 mt-2 h-44 overflow-hidden">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

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
          ))}
        </div>
      </div>
    </section>
  );
}