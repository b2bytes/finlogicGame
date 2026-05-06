import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Lya Navigator — parser de intenciones de navegación 100% local (sin LLM).
 *
 * Convierte frases naturales del usuario en acciones de navegación dentro de la app.
 * No altera ninguna estructura existente: solo dispara `navigate(path)` y devuelve
 * un mensaje que Lya puede leer en voz alta para guiar al usuario.
 *
 * Detecta dos tipos de patrones:
 *  1. Verbo de navegación explícito: "llévame a", "muéstrame", "ábreme", "ir a"…
 *  2. Mención directa de la sección: "mis casos", "transparencia", "precios"…
 */

// ─── Mapa de rutas conocidas ────────────────────────────────────────────────
// Cada destino: keywords (lemmatización ligera) + path + frase guía hablada.
const DESTINATIONS = [
  {
    path: '/Consulta',
    label: 'la página de consulta',
    keywords: ['consulta', 'consultar', 'nueva consulta', 'preguntar', 'preguntarte'],
    say: 'Te llevo a Consulta. Cuéntame qué pasó.',
  },
  {
    path: '/MisCasos',
    label: 'tus casos',
    keywords: ['mis casos', 'mi caso', 'mis casos abiertos', 'mis denuncias', 'mis trámites', 'mis tramites'],
    say: 'Abriendo Mis Casos.',
  },
  {
    path: '/Casos',
    label: 'los casos públicos',
    keywords: ['casos públicos', 'casos publicos', 'casos resueltos', 'galería de casos', 'galeria de casos'],
    say: 'Aquí están los casos resueltos públicamente.',
  },
  {
    path: '/Transparencia',
    label: 'la página de transparencia',
    keywords: ['transparencia', 'auditoría', 'auditoria', 'cómo razonas', 'como razonas', 'razonamiento', 'trace', 'trazabilidad'],
    say: 'Te muestro la auditoría completa de mi razonamiento.',
  },
  {
    path: '/Pricing',
    label: 'los precios',
    keywords: ['precio', 'precios', 'planes', 'cuánto cuesta', 'cuanto cuesta', 'tarifa', 'tarifas'],
    say: 'Te llevo a los planes y precios.',
  },
  {
    path: '/Pro',
    label: 'el plan Pro',
    keywords: ['pro', 'plan pro', 'finlogic pro', 'suscribirme', 'suscripción', 'suscripcion'],
    say: 'Aquí está el plan Pro.',
  },
  {
    path: '/Pyme',
    label: 'la sección de pymes',
    keywords: ['pyme', 'pymes', 'mi empresa', 'mi negocio', 'emprendedor', 'emprendedora', 'sii', 'tributario', 'tributaria'],
    say: 'Abriendo la sección para pymes.',
  },
  {
    path: '/api-compliance',
    label: 'la API B2B',
    keywords: ['api', 'compliance api', 'b2b', 'fintech', 'integración', 'integracion', 'desarrollador', 'developers'],
    say: 'Te llevo a la API de compliance para fintechs.',
  },
  {
    path: '/Soporte',
    label: 'soporte',
    keywords: ['soporte', 'ayuda', 'contacto', 'reclamo', 'ticket', 'problema técnico', 'problema tecnico'],
    say: 'Abriendo el centro de soporte.',
  },
  {
    path: '/Embajadores',
    label: 'el programa de embajadores',
    keywords: ['embajador', 'embajadores', 'referidos', 'referir', 'invitar', 'compartir'],
    say: 'Aquí está el programa de embajadores.',
  },
  {
    path: '/Insights',
    label: 'los insights',
    keywords: ['insights', 'tendencias', 'estadísticas', 'estadisticas', 'datos del sector'],
    say: 'Te muestro los insights del sector.',
  },
  {
    path: '/PitchDeck',
    label: 'el pitch deck',
    keywords: ['pitch', 'pitch deck', 'presentación', 'presentacion', 'jurado', 'inversionistas'],
    say: 'Abriendo el pitch deck.',
  },
  {
    path: '/',
    label: 'el inicio',
    keywords: ['inicio', 'home', 'principal', 'portada', 'landing'],
    say: 'Volviendo al inicio.',
  },
];

// Verbos de navegación: si aparecen, sube la confianza
const NAV_VERBS = [
  'llevame', 'llévame', 'lleva me',
  'muestrame', 'muéstrame', 'muestra me',
  'abre', 'abreme', 'ábreme', 'abrir',
  'ir a', 'voy a', 'quiero ir', 'quiero ver',
  'navega', 'navégame', 'navegame',
  'redirígeme', 'redirigeme', 'redirígeme a',
  'lleva', 'mostrar', 'enseña', 'enséñame', 'ensename',
];

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[¿?¡!.,;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Devuelve { destination, confidence } o null si no hay intención de navegación.
 *
 * Confidence:
 *  - 0.9 si verbo de navegación + keyword
 *  - 0.6 si solo keyword (frase corta < 8 palabras)
 *  - null si nada coincide
 */
export function detectNavigationIntent(text) {
  const norm = normalize(text);
  if (!norm) return null;

  const wordCount = norm.split(' ').length;
  const hasVerb = NAV_VERBS.some((v) => norm.includes(normalize(v)));

  // Buscar destino por keywords (más largo = más específico, prioridad)
  let best = null;
  for (const dest of DESTINATIONS) {
    for (const kw of dest.keywords) {
      const nkw = normalize(kw);
      // Match de palabra/frase: con bordes para evitar falsos positivos cortos
      const pattern = new RegExp(`(^|\\s)${nkw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(\\s|$)`);
      if (pattern.test(norm)) {
        if (!best || nkw.length > best.matchedLength) {
          best = { dest, matchedLength: nkw.length };
        }
      }
    }
  }

  if (!best) return null;

  // Reglas de confianza:
  // - verbo + keyword → siempre alta
  // - solo keyword en frase corta (≤7 palabras) → media (probablemente intención de ir)
  // - keyword en frase larga (consulta sustantiva) → baja, mejor NO navegar
  let confidence = 0;
  if (hasVerb) confidence = 0.9;
  else if (wordCount <= 7) confidence = 0.6;
  else confidence = 0.2;

  return { destination: best.dest, confidence };
}

export function useLyaNavigator() {
  const navigate = useNavigate();

  /**
   * Intenta navegar a partir de un texto del usuario.
   * Retorna { navigated: bool, message: string | null }
   *  - navigated: true si se ejecutó navigate()
   *  - message: frase que Lya debe decir/mostrar (si aplica)
   */
  const tryNavigate = useCallback((text) => {
    const intent = detectNavigationIntent(text);
    if (!intent || intent.confidence < 0.6) {
      return { navigated: false, message: null };
    }
    const { destination } = intent;
    navigate(destination.path);
    return {
      navigated: true,
      message: destination.say,
      path: destination.path,
      label: destination.label,
    };
  }, [navigate]);

  return { tryNavigate, detectNavigationIntent };
}