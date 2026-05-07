// Guion oficial de Lya para presentar FinLogic al jurado del Claude Impact Lab Chile 2026.
// Cada slide tiene:
//   - id        → ancla del scroll (selector CSS o índice)
//   - title     → etiqueta visible en el panel
//   - narration → texto que Lya dice en voz alta (Camila es-CL, ElevenLabs)
//   - duration  → segundos estimados (para timeline visual; el avance real lo dispara onend del audio)
//
// Tono: pitch ejecutivo + cálido. Lya se presenta como "yo" — es la asistente IA.
// Co-presenta junto a Paula Garcés (humana, producto/auditoría).
// Sin acrónimos sin expandir, sin tecnicismos secos. Cifras tabulares dichas en simple.

export const PITCH_SCRIPT = [
  {
    id: 'slide-hero',
    title: 'Apertura',
    narration:
      'Hola jurado del Claude Impact Lab Chile. Soy Lya, la asistente legal financiera de FinLogic. Hoy presento junto a Paula Garcés, nuestra líder de producto y auditoría. Lo que verán a continuación es una plataforma viva, en producción, que traduce las leyes financieras de Chile al idioma de cualquier ciudadano. Nuestra promesa es simple: tu derecho financiero, en tu idioma, ahora.',
    duration: 22,
  },
  {
    id: 'slide-problema',
    title: 'El problema',
    narration:
      'Chile tiene un problema invisible. Quinientas mil personas presentaron un reclamo en el Sernac sin saber qué decía la ley. Un abogado especializado cuesta más de doscientos mil pesos. Un reclamo demora veintiocho días. Y hay cuatro organismos —la Comisión para el Mercado Financiero, el Sernac, el Servicio de Impuestos Internos y el equipo nacional de ciberseguridad— que no hablan el mismo idioma. Los ciudadanos quedan en el medio, perdidos.',
    duration: 28,
  },
  {
    id: 'slide-perfiles',
    title: 'A quién resolvemos',
    narration:
      'Trabajamos para cuatro chilenos reales. Don Luis, pensionado de Valparaíso, víctima de un mensaje falso de su banco. Camila, estudiante de Santiago, a quien le metieron dos seguros que nunca aceptó. María José, dueña de un almacén en Temuco, pagando el doble de impuestos por estar en el régimen tributario equivocado. Y Roberto, trabajador de Antofagasta, con una transferencia fraudulenta en su cuenta. Cuatro perfiles, cuatro capas funcionales en la plataforma.',
    duration: 30,
  },
  {
    id: 'slide-demo',
    title: 'Demo en vivo',
    narration:
      'Aquí estoy yo, Lya. Soy una orquestadora. Cuando alguien me escribe, hago triage en menos de seiscientos milisegundos, derivo al agente especialista —fraude, consumidor, tributario o ciberseguridad—, verifico la respuesta contra la ley vigente con un sistema anti-alucinación, y genero el documento legal listo para enviar. Todo verificable y auditable en la página de transparencia.',
    duration: 26,
  },
  {
    id: 'slide-casos',
    title: 'Casos resueltos',
    narration:
      'Los resultados son medibles. Setecientos treinta y dos mil pesos recuperados para ciudadanos. Nueve días y medio de promedio para resolver un caso, contra los veintiocho del sistema tradicional. Roberto recuperó trescientos ochenta mil pesos en siete días. Don Luis, doscientos cuarenta mil en cinco. María José ahorró tres millones ochocientos mil al año cambiándose de régimen tributario. Camila desvinculó sus seguros y recuperó ciento doce mil pesos.',
    duration: 30,
  },
  {
    id: 'slide-traccion',
    title: 'Tracción real',
    narration:
      'Esto no es una maqueta. Estamos en producción. Mil ochocientas cuarenta y siete consultas resueltas esta semana, con veinticuatro por ciento de crecimiento. Trescientas doce cartas legales generadas, noventa y siete por ciento verificadas. Ocho millones doscientos mil pesos recuperados a cuarenta y siete ciudadanos. Y un score de verificación de ochenta y nueve sobre cien, con solo cero coma cuatro por ciento de alucinación. Estamos en el uno por ciento superior de la industria.',
    duration: 32,
  },
  {
    id: 'slide-api',
    title: 'Compliance API · B2B',
    narration:
      'Nuestro modelo de negocio sostenible es la Compliance API. Cinco endpoints que cualquier fintech puede integrar en un día: validación de tasa máxima convencional, verificación de entidades en la Comisión para el Mercado Financiero, impacto regulatorio, detección de patrones de fraude, y verificación de derechos del consumidor. Una multa evitada de cinco mil unidades de fomento se previene en trescientos cuarenta milisegundos. Cuatrocientos noventa mil pesos al mes, diez mil llamadas incluidas.',
    duration: 30,
  },
  {
    id: 'slide-sfa',
    title: 'Ventana de mercado',
    narration:
      'Y aquí viene la ventana. El cuatro de julio entra en vigencia el Sistema de Finanzas Abiertas en Chile. Trescientas doce fintechs reguladas estarán obligadas a tener un módulo de compliance auditable. Pueden construirlo en doce a dieciocho meses, o integrar el nuestro en un día. El mercado de compliance fintech vale mil ochocientos millones de pesos al año. Hoy hay cero competidores con cobertura completa. Ese es el momento.',
    duration: 30,
  },
  {
    id: 'slide-equipo',
    title: 'El equipo humano',
    narration:
      'Detrás de mí hay cuatro personas. Gabriel, líder y arquitecto de inteligencia artificial, quien me orquesta a mí y al pipeline completo. Diego, encargado de la API de compliance y las integraciones con la Comisión, el Servicio de Impuestos y ciberseguridad. Paula Garcés, mi compañera de presentación hoy, líder de producto y responsable de la auditoría normativa de cada respuesta. Y Martín, diseñador del sistema, la marca y la accesibilidad. Cuatro disciplinas, los puentes que faltaban.',
    duration: 32,
  },
  {
    id: 'slide-cierre',
    title: 'Cierre · Lo que pedimos',
    narration:
      'Cerramos con una idea. Las leyes ya existen. Los organismos ya existen. FinLogic es el puente. Lo que pedimos hoy es concreto: tres fintechs piloto para validar la API antes del cuatro de julio, y un convenio con la Comisión para el Mercado Financiero para acceder a datos verificados en tiempo real. Pueden probar el sistema ahora mismo en finlogic.one, o ver la auditoría completa en la página de transparencia. Tu derecho. En tu idioma. Ahora. Gracias.',
    duration: 32,
  },
];