import React from 'react';
import { Check, X, Minus } from 'lucide-react';

// Comparativa según mandato §Diferenciación competitiva
// Eje principal: ¿captura conocimiento del Estado y lo traduce a acción accionable?
const FILAS = [
  {
    feature: 'Cubre 7 organismos (CMF, SERNAC, SII, CSIRT…)',
    finlogic: 'full',
    abogado: 'partial',
    defensoria: 'partial',
    chatbot: 'none',
  },
  {
    feature: 'Genera el documento listo para enviar',
    finlogic: 'full',
    abogado: 'full',
    defensoria: 'none',
    chatbot: 'none',
  },
  {
    feature: 'Pipeline IA auditable y citado',
    finlogic: 'full',
    abogado: 'none',
    defensoria: 'none',
    chatbot: 'none',
  },
  {
    feature: 'Respuesta en menos de 60 segundos',
    finlogic: 'full',
    abogado: 'none',
    defensoria: 'none',
    chatbot: 'full',
  },
  {
    feature: 'Gratis para ciudadanos',
    finlogic: 'full',
    abogado: 'none',
    defensoria: 'full',
    chatbot: 'partial',
  },
  {
    feature: 'API B2B + Embed para fintechs',
    finlogic: 'full',
    abogado: 'none',
    defensoria: 'none',
    chatbot: 'none',
  },
  {
    feature: 'Plazos legales con alertas',
    finlogic: 'full',
    abogado: 'partial',
    defensoria: 'none',
    chatbot: 'none',
  },
];

const COLUMNAS = [
  { key: 'finlogic',  title: 'FinLogic',        sub: 'Sistema operativo',  highlight: true },
  { key: 'abogado',   title: 'Abogado',         sub: '$200K+ por caso' },
  { key: 'defensoria', title: 'Defensoría',     sub: 'Solo deuda' },
  { key: 'chatbot',   title: 'Chatbots banco',  sub: 'Solo dudas' },
];

function Cell({ value, highlight }) {
  if (value === 'full') {
    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto ${highlight ? 'bg-mint-600 shadow-mint' : 'bg-mint-100'}`}>
        <Check className={`w-4 h-4 ${highlight ? 'text-white' : 'text-mint-700'}`} strokeWidth={3} />
      </div>
    );
  }
  if (value === 'partial') {
    return (
      <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
        <Minus className="w-4 h-4 text-amber-700" strokeWidth={3} />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center mx-auto">
      <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
    </div>
  );
}

export default function DiferencialFinLogic() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            Por qué somos distintos
          </p>
          <h2 className="font-display text-3xl md:text-[44px] font-bold tracking-tight text-foreground leading-[1.02]">
            No competimos con abogados.<br />
            <span className="text-mint-600">Capturamos el conocimiento del Estado.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl">
            Las leyes ya existen. Los organismos ya existen. Lo que faltaba era un puente entre la norma y el ciudadano. Eso es FinLogic.
          </p>
        </div>

        <div className="bg-card rounded-[28px] border border-border/60 overflow-hidden shadow-soft">
          {/* Header */}
          <div className="grid grid-cols-[1.6fr_repeat(4,1fr)] sm:grid-cols-[2fr_repeat(4,1fr)] border-b border-border/60 bg-secondary/30">
            <div className="p-4 sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Capacidad
              </p>
            </div>
            {COLUMNAS.map((c) => (
              <div
                key={c.key}
                className={`p-3 sm:p-5 text-center border-l border-border/60 ${c.highlight ? 'bg-mint-50' : ''}`}
              >
                <p className={`font-display text-xs sm:text-sm font-bold leading-tight ${c.highlight ? 'text-mint-700' : 'text-foreground'}`}>
                  {c.title}
                </p>
                <p className={`text-[10px] mt-0.5 leading-tight ${c.highlight ? 'text-mint-600' : 'text-muted-foreground'} hidden sm:block`}>
                  {c.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Filas */}
          {FILAS.map((fila, i) => (
            <div
              key={fila.feature}
              className={`grid grid-cols-[1.6fr_repeat(4,1fr)] sm:grid-cols-[2fr_repeat(4,1fr)] ${i < FILAS.length - 1 ? 'border-b border-border/40' : ''}`}
            >
              <div className="p-3 sm:p-5 flex items-center">
                <p className="text-xs sm:text-sm text-foreground font-medium leading-snug">
                  {fila.feature}
                </p>
              </div>
              {COLUMNAS.map((c) => (
                <div
                  key={c.key}
                  className={`p-3 sm:p-5 flex items-center justify-center border-l border-border/40 ${c.highlight ? 'bg-mint-50/40' : ''}`}
                >
                  <Cell value={fila[c.key]} highlight={c.highlight} />
                </div>
              ))}
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          Comparativa hecha con datos públicos a mayo 2026. <span className="text-mint-700 font-semibold">Verificable</span> en /Transparencia.
        </p>
      </div>
    </section>
  );
}