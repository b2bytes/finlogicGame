import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// 10 FAQs canónicas — SupportAgent Carolina Muñoz (mandato pág. 421-478)
const FAQS = [
  {
    q: '¿Está caída la app? Tarda mucho en responder',
    a: 'No, está procesando. El pipeline de Lya analiza CMF, SERNAC y SII en cada consulta y demora entre 30 y 60 segundos. Si pasa de 90s, aparece el botón "Reintentar". Es lento porque verifica la normativa real, no inventa.',
    profile: 'todos',
  },
  {
    q: '¿Por qué FinLogic usa el dominio .one?',
    a: 'Operamos bajo normativa chilena y "uno" simboliza estar de tu lado. Puedes verificarnos en CMF y SERNAC. Tus datos están protegidos por la Ley 21.719.',
    profile: 'todos',
  },
  {
    q: 'No sé cómo enviar el documento que me generaron',
    a: 'Tu documento queda guardado en /MisCasos. Tres opciones: 1) Descargar PDF, 2) Botón "Enviar directo" al organismo, 3) Te guiamos por WhatsApp paso a paso.',
    profile: 'don_luis',
  },
  {
    q: '¿Cuánto cuesta el plan Pro?',
    a: '$3.990 CLP/mes. Incluye casos ilimitados, alertas de plazos legales 7d/3d/1d, generación de PDFs, y prioridad en consultas.',
    profile: 'camila',
  },
  {
    q: 'Mi plazo legal está por vencer',
    a: 'Tranquilo. Recibes alertas automáticas 7, 3 y 1 día antes. Si te quedan menos de 24h, escríbenos por WhatsApp y priorizamos tu caso de inmediato.',
    profile: 'roberto',
  },
  {
    q: '¿Cómo sé que la información es correcta?',
    a: 'Cada respuesta tiene un score de verificación visible. Hoy estamos en 72/100 promedio (target 85/100 a 90 días). Todo es auditable en /Transparencia. Si encuentras un error, lo corregimos en <24h.',
    profile: 'todos',
  },
  {
    q: 'Soy fintech, ¿cómo integro la Compliance API?',
    a: 'Plan base $490.000 CLP/mes con 10.000 llamadas (5 endpoints: TMC, verify-entity, regulatory-impact, fraud-pattern, consumer-rights). Llamadas extra: $0.008 USD c/u. También ofrecemos Embed: $0.015 USD por consulta + $2.5M de setup.',
    profile: 'b2b_fintech',
  },
  {
    q: 'Tengo un cobro que no reconozco en mi cuenta',
    a: 'Cuéntanos: banco, monto y fecha. El sistema identifica si es fraude (Ley 20.009: el banco devuelve en 5 días), error de cobro o cargo legítimo. Si es fraude, generamos el reclamo automáticamente.',
    profile: 'roberto',
  },
  {
    q: 'Soy adulto mayor, ¿hay un modo accesible?',
    a: 'Sí. Activa el "Modo accesibilidad": texto +120%, lenguaje simple, narración por voz. Botón con icono de persona en círculo. También puedes llamarnos directo o pedir ayuda por WhatsApp.',
    profile: 'don_luis',
  },
  {
    q: '¿Mis datos están seguros?',
    a: 'No almacenamos credenciales bancarias en ningún momento. Todo bajo Ley 21.719 de protección de datos personales. Puedes eliminar tu cuenta y datos desde Configuración → Privacidad.',
    profile: 'todos',
  },
];

export default function FAQAccordion({ filter = 'todos' }) {
  const [openIdx, setOpenIdx] = useState(null);
  const filtered = filter === 'todos' ? FAQS : FAQS.filter((f) => f.profile === filter || f.profile === 'todos');

  return (
    <div className="space-y-2">
      {filtered.map((faq, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            className="bg-card rounded-2xl border border-border overflow-hidden transition-shadow hover:shadow-soft"
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <span className="font-medium text-foreground text-sm md:text-base">{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/60 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}