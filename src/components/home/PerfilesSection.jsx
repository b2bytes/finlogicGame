import React from 'react';

const perfiles = [
  {
    emoji: '👵',
    name: 'Don Luis',
    age: '68',
    location: 'Valparaíso',
    quote: '"Me cobraron un seguro que nunca pedí en mi tarjeta de pensión."',
    color: 'from-orange-50 to-amber-100',
  },
  {
    emoji: '👩‍🎓',
    name: 'Camila',
    age: '22',
    location: 'Santiago',
    quote: '"No entiendo el CAE de mi crédito de consumo. ¿Es legal?"',
    color: 'from-mint-50 to-mint-100',
  },
  {
    emoji: '👩‍💼',
    name: 'María José',
    age: '34',
    location: 'Temuco',
    quote: '"Vendo por Instagram. ¿Cómo formalizo en el SII sin morir en el intento?"',
    color: 'from-blue-50 to-sky-100',
  },
  {
    emoji: '👨‍🔧',
    name: 'Roberto',
    age: '45',
    location: 'Antofagasta',
    quote: '"Recibí un SMS sospechoso del banco. ¿Es phishing?"',
    color: 'from-rose-50 to-pink-100',
  },
];

export default function PerfilesSection() {
  return (
    <section id="perfiles" className="py-24 bg-card/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-sm font-semibold text-mint-600 mb-3 tracking-wide uppercase">
            Para todos
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Tu derecho.
            <span className="text-muted-foreground"> En tu idioma. Ahora.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {perfiles.map((p) => (
            <div
              key={p.name}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${p.color} p-7 hover:shadow-soft hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-4xl mb-5 shadow-soft group-hover:scale-110 transition-transform">
                {p.emoji}
              </div>
              <p className="text-xs font-semibold text-foreground/60 mb-1">
                {p.age} años · {p.location}
              </p>
              <h3 className="font-display text-xl font-bold text-foreground mb-3">
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