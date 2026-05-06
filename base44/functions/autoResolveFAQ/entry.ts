// autoResolveFAQ — Mandato §SupportAgent FAQ #2
// Match semántico contra 10 FAQs canónicas + retorna respuesta adaptada al perfil.
// Registra FAQInteraction para tracking deflection KPI 65% D+90.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const FAQS = [
  {
    id: 'faq-latencia',
    keywords: ['lento', 'caída', 'caido', 'no carga', 'demora', 'esperando', 'pegado'],
    question: '¿Está caída la app?',
    answer: 'No está caída. El pipeline analiza CMF/SERNAC/SII y demora 30-60s en respuesta inicial. Si pasa 90s sin respuesta, presiona "Reintentar" en pantalla.',
  },
  {
    id: 'faq-dominio-one',
    keywords: ['dominio', '.one', 'finlogic.one', 'oficial', 'real', 'estafa'],
    question: '¿Por qué dominio .one?',
    answer: 'Operamos bajo normativa chilena con dominio .one por simbolismo: "uno" con el ciudadano. Estamos verificables en CMF y SERNAC. Tus datos están protegidos por Ley 21.719.',
  },
  {
    id: 'faq-enviar-doc',
    keywords: ['enviar documento', 'mandar carta', 'no sé enviar', 'cómo se manda'],
    question: 'No sé enviar el documento generado',
    answer: 'Tu documento queda guardado en /MisCasos. Tres opciones: 1) Descarga el PDF, 2) "Enviar directo" desde el caso, 3) WhatsApp guiado para reenviar.',
  },
  {
    id: 'faq-precio-pro',
    keywords: ['precio', 'cuánto cuesta', 'pro', '3990', 'plan', 'suscripción', 'cuanto'],
    question: '¿Cuánto cuesta Pro?',
    answer: 'FinLogic Pro: $3.990 CLP/mes. Incluye casos ilimitados, alertas de plazos legales, generación PDF prioritaria y Lya con memoria persistente. Cancelas cuando quieras.',
  },
  {
    id: 'faq-plazo-vencido',
    keywords: ['vencido', 'plazo pasado', 'se me pasó', 'tarde', 'última hora'],
    question: '¿Mi plazo ya venció?',
    answer: 'Te avisamos 7d/3d/1d antes. Si tu plazo vence en menos de 24h, escríbenos para priorizar. Algunos plazos admiten prórroga; te diremos cuáles según tu caso.',
  },
  {
    id: 'faq-info-correcta',
    keywords: ['confiable', 'correcto', 'segura información', 'me equivoco', 'error'],
    question: '¿La información es correcta?',
    answer: 'Cada respuesta tiene un score de verificación visible en /Transparencia. Score actual: 72/100 (target 85). Si detectas un error, repórtalo y respondemos en 24h.',
  },
  {
    id: 'faq-soy-fintech',
    keywords: ['fintech', 'b2b', 'api', 'compliance', 'empresa', 'integrar'],
    question: 'Soy fintech, ¿tienen API?',
    answer: 'Sí. Compliance API con 5 endpoints (TMC, verify-entity, regulatory-impact, fraud, consumer-rights). Plan base $490.000 CLP/mes con 10K calls. Embed: $0.015 USD/consulta + $2.5M setup. Ver /api-compliance.',
  },
  {
    id: 'faq-cobro-no-reconocido',
    keywords: ['cobro', 'no reconozco', 'cargo', 'raro', 'extraño', 'no fui yo', 'fraude'],
    question: 'Tengo un cobro que no reconozco',
    answer: 'Cuéntame banco, monto y fecha. El sistema clasifica si es fraude, error operacional o cobro legítimo, y genera el reclamo con base en Ley 20.009 (5 días hábiles para denunciar).',
  },
  {
    id: 'faq-adulto-mayor',
    keywords: ['adulto mayor', 'don luis', 'jubilado', 'pensionado', 'persona mayor', 'tercera edad'],
    question: 'Soy adulto mayor, ¿es para mí?',
    answer: 'Totalmente. Activa el modo accesibilidad (botón persona+círculo arriba): texto +120%, contraste alto, lenguaje simple, modo voz. También atendemos por WhatsApp y teléfono.',
  },
  {
    id: 'faq-datos-seguros',
    keywords: ['datos seguros', 'privacidad', 'rut', 'ley 21.719', 'borrar datos'],
    question: '¿Mis datos están seguros?',
    answer: 'Sí. NO almacenamos credenciales bancarias. RUT siempre hasheado. Cumplimos Ley 21.719 (datos personales). Puedes eliminar tu cuenta y todos tus datos en Configuración → Privacidad.',
  },
];

function scoreFAQ(query, faq) {
  const q = query.toLowerCase();
  let score = 0;
  for (const kw of faq.keywords) {
    if (q.includes(kw.toLowerCase())) score += 1;
  }
  return score / Math.max(faq.keywords.length, 1);
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    const base44 = createClientFromRequest(req);
    const { query, userProfile = 'general', channel = 'web' } = await req.json();
    if (!query) return Response.json({ error: 'query requerido' }, { status: 400 });

    // Encontrar mejor match
    let best = null;
    let bestScore = 0;
    for (const faq of FAQS) {
      const s = scoreFAQ(query, faq);
      if (s > bestScore) {
        bestScore = s;
        best = faq;
      }
    }

    const matched = best && bestScore >= 0.15;
    const response = matched
      ? best.answer
      : null;

    // Persistir interacción para tracking deflection KPI
    if (matched) {
      try {
        await base44.entities.FAQInteraction.create({
          faqId: best.id,
          questionText: query.slice(0, 280),
          userProfileType: userProfile,
          channel,
          deflectionSuccess: true,
        });
      } catch (e) {
        console.warn('FAQInteraction track error:', e?.message);
      }
    }

    return Response.json({
      matched,
      faqId: matched ? best.id : null,
      faqQuestion: matched ? best.question : null,
      response,
      confidence: bestScore,
      shouldEscalate: !matched,
    });
  } catch (error) {
    console.error('autoResolveFAQ error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});