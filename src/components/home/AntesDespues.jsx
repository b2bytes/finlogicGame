import React from 'react';
import { X, Check, Clock, FileX, Languages, Wallet, ShieldOff } from 'lucide-react';

const antes = [
  { icon: Clock, text: 'Esperar 30 días una respuesta' },
  { icon: FileX, text: 'Cartas que nadie entiende' },
  { icon: Languages, text: 'Lenguaje técnico imposible' },
  { icon: Wallet, text: 'Pagar abogado $200.000+' },
  { icon: ShieldOff, text: 'No saber tus derechos reales' },
];

const despues = [
  { text: 'Respuesta en menos de 60 segundos' },
  { text: 'Carta lista para enviar al banco' },
  { text: 'En tu idioma. En tus palabras.' },
  { text: 'Gratis. Siempre gratis para ciudadanos.' },
  { text: '12 normativas chilenas trabajando para ti' },
];

export default function AntesDespues() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
            El cambio que mereces
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Antes era un calvario.<br />
            <span className="text-mint-600">Ahora es un derecho.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {/* ANTES */}
          <div className="relative bg-card rounded-[28px] border border-border/60 p-7 md:p-8 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE5E5] flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">Antes</p>
                <h3 className="font-display text-xl font-bold text-foreground">Sin FinLogic</h3>
              </div>
            </div>
            <ul className="space-y-3.5">
              {antes.map((item) => (
                <li key={item.text} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-[#FFE5E5]/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-3 h-3 text-red-500" strokeWidth={2.5} />
                  </div>
                  <span className="line-through decoration-red-300/60 decoration-2 leading-relaxed">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* DESPUÉS */}
          <div className="relative rounded-[28px] p-7 md:p-8 overflow-hidden bg-gradient-to-br from-mint-50 via-mint-100/50 to-mint-50 border border-mint-200">
            <div aria-hidden="true" className="absolute -top-12 -right-12 w-40 h-40 bg-mint-200/40 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-mint-600 flex items-center justify-center shadow-mint">
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-mint-700">Ahora</p>
                  <h3 className="font-display text-xl font-bold text-foreground">Con FinLogic</h3>
                </div>
              </div>
              <ul className="space-y-3.5">
                {despues.map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-sm text-foreground/85 font-medium">
                    <div className="w-6 h-6 rounded-full bg-mint-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-mint">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}