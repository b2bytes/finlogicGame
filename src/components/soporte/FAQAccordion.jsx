import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: '¿Está caída la app? Llevo más de un minuto esperando.',
    a: 'No. El pipeline de Lya analiza CMF, SERNAC y SII en vivo y demora entre 30 y 60 segundos. Si pasan más de 90s sin respuesta, aparece un botón "Reintentar" sobre el chat.',
    tags: ['camila', 'general'],
  },
  {
    q: '¿Por qué el dominio termina en .one y no en .cl?',
    a: 'Operamos bajo normativa chilena (Ley 21.521, NCG 502 CMF, Ley 19.496 SERNAC). El dominio .one significa "uno con el ciudadano". Puedes verificarnos en CMF y SERNAC. Tus datos están protegidos por la Ley 21.719.',
    tags: ['general', 'roberto'],
  },
  {
    q: 'No sé cómo enviar el documento que me generaron.',
    a: 'Está guardado en /MisCasos. Tienes 3 opciones: descargarlo en PDF, usar el botón "Enviar directo" al organismo, o pedir que te guíen por WhatsApp paso a paso.',
    tags: ['don_luis', 'general'],
  },
  {
    q: '¿Cuánto cuesta el plan Pro?',
    a: '$3.990 CLP al mes. Incluye casos ilimitados, alertas de plazos legales (7d/3d/1d), generación de PDFs y prioridad en respuesta. Sin permanencia.',
    tags: ['camila', 'maria_jose'],
  },
  {
    q: 'Tengo un plazo legal que se vence en menos de 24 horas.',
    a: 'Te enviamos alertas automáticas a 7, 3 y 1 día. Si tu plazo vence en menos de 24h, escríbenos por este formulario marcando "Plazo legal" — lo priorizamos en la cola crítica.',
    tags: ['roberto', 'general'],
  },
  {
    q: '¿Cómo sé que la información que me dan es correcta?',
    a: 'Cada respuesta tiene un score de verificación (hoy promedio 72/100, meta 85). Puedes auditar el razonamiento completo en /Transparencia con el ID de tu consulta. Si detectas un error, lo corregimos en menos de 24h.',
    tags: ['general', 'camila'],
  },
  {
    q: 'Soy de una fintech. ¿Cómo accedo a la Compliance API?',
    a: '5 endpoints (check-tmc, verify-entity, regulatory-impact, fraud-pattern-match, consumer-rights-check). Plan base $490.000 CLP/mes con 10.000 llamadas + $0.008 USD por llamada extra. Setup $2.5M CLP. Escríbenos en categoría "Compliance API".',
    tags: ['b2b_fintech'],
  },
  {
    q: 'Tengo un cobro en mi tarjeta que no reconozco.',
    a: 'Cuéntanos banco, monto y fecha exacta. El sistema identifica si es fraude (Ley 20.009 — el banco debe responder en 5 días hábiles), error de cobro o cargo legítimo, y te genera el reclamo formal listo para enviar.',
    tags: ['roberto', 'don_luis'],
  },
  {
    q: 'Mi mamá/papá no entiende la app. ¿Hay modo simple?',
    a: 'Sí. Modo accesibilidad: texto +120%, lenguaje sin tecnicismos, lectura por voz. Se activa con el botón persona+círculo en la esquina. También atendemos por teléfono y WhatsApp.',
    tags: ['don_luis'],
  },
  {
    q: '¿Mis datos están seguros? ¿Qué hacen con ellos?',
    a: 'No almacenamos credenciales bancarias. Tus datos están protegidos por la Ley 21.719 de Protección de Datos. Puedes pedir su eliminación cuando quieras en Configuración → Privacidad.',
    tags: ['general', 'maria_jose'],
  },
];

export default function FAQAccordion({ profileFilter = 'all' }) {
  const [openIndex, setOpenIndex] = useState(null);
  const filtered =
    profileFilter === 'all' ? FAQS : FAQS.filter((f) => f.tags.includes(profileFilter));

  return (
    <div className="space-y-3">
      {filtered.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-mint-50/50 transition-colors"
            >
              <span className="font-display font-semibold text-foreground">{faq.q}</span>
              <ChevronDown
                className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}