// lyaNavigationTools.js — Catálogo central de páginas y secciones que Lya
// puede usar para navegar la plataforma. Mantiene su conocimiento sincronizado
// entre frontend (client tools) y backend (system prompt del agente).
// v1.1 · cache-bust HMR — incluye fillField, clickByLyaAction, triggerLyaToast, openLyaChat.

// Páginas principales con descripción para el agente.
export const LYA_PAGES = [
  { path: '/', name: 'Home', description: 'Landing principal de FinLogic, hero con propuesta de valor' },
  { path: '/Consulta', name: 'Consulta', description: 'Hacer consulta legal-financiera al pipeline IA' },
  { path: '/Transparencia', name: 'Transparencia', description: 'Auditoría pública de decisiones IA, traces' },
  { path: '/Casos', name: 'Casos', description: 'Casos resueltos públicos con métricas reales' },
  { path: '/MisCasos', name: 'Mis Casos', description: 'Casos del usuario logueado' },
  { path: '/Pyme', name: 'Pyme', description: 'Capa pyme: análisis tributario, salud financiera' },
  { path: '/APICompliance', name: 'API Compliance', description: 'B2B Compliance API, 5 endpoints, $490K CLP/mes' },
  { path: '/Pricing', name: 'Pricing', description: 'Planes Free, Pro y Compliance API' },
  { path: '/Pro', name: 'Pro', description: 'Plan Pro ciudadano' },
  { path: '/Marca', name: 'Marca', description: 'Identidad de marca, brand kit, sistema visual' },
  { path: '/Diseno', name: 'Diseño', description: 'Sistema de diseño, skins, accesibilidad' },
  { path: '/Insights', name: 'Insights', description: 'Métricas agregadas de uso e impacto' },
  { path: '/Soporte', name: 'Soporte', description: 'Centro de soporte, FAQ' },
  { path: '/Embajadores', name: 'Embajadores', description: 'Programa de referidos' },
  { path: '/PitchDeck', name: 'Pitch Deck', description: 'Pitch deck del Claude Impact Lab' },
  { path: '/Demo', name: 'Demo', description: 'Demo en video del producto' },
  { path: '/Rubrica', name: 'Rúbrica', description: 'Rúbrica de evaluación del Claude Impact Lab' },
  { path: '/Entregables', name: 'Entregables', description: 'Entregables formales del concurso' },
];

// Slides del pitch deck.
export const LYA_SLIDES = [
  { id: 'slide-hero', label: 'Apertura' },
  { id: 'slide-problema', label: 'El problema' },
  { id: 'slide-perfiles', label: '4 perfiles' },
  { id: 'slide-demo', label: 'Demo en vivo' },
  { id: 'slide-casos', label: 'Casos resueltos' },
  { id: 'slide-traccion', label: 'Tracción' },
  { id: 'slide-api', label: 'Compliance API' },
  { id: 'slide-sfa', label: 'Ventana SFA' },
  { id: 'slide-equipo', label: 'Equipo' },
  { id: 'slide-cierre', label: 'Cierre' },
];

// Helper: scroll suave a un elemento por id o selector CSS.
export function scrollToElement(target) {
  if (!target) return false;
  let el = null;
  try {
    if (target.startsWith('#') || target.includes('.') || target.includes('[')) {
      el = document.querySelector(target);
    } else {
      el = document.getElementById(target);
    }
  } catch (_) {
    el = document.getElementById(target);
  }
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Highlight breve para confirmar visualmente
    el.style.transition = 'box-shadow 0.6s ease';
    el.style.boxShadow = '0 0 0 4px hsl(var(--mint-400) / 0.5)';
    setTimeout(() => { el.style.boxShadow = ''; }, 1800);
    return true;
  }
  return false;
}

// Helper: scroll a posición vertical (top, bottom, número px).
export function scrollToPosition(position) {
  if (position === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return true;
  }
  if (position === 'bottom') {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    return true;
  }
  const num = Number(position);
  if (!isNaN(num)) {
    window.scrollTo({ top: num, behavior: 'smooth' });
    return true;
  }
  return false;
}

// Helper: navegar a una página (misma pestaña por defecto).
export function navigateToPath(path, openInNewTab = false) {
  if (openInNewTab) {
    window.open(`${window.location.origin}${path}`, '_blank', 'noopener,noreferrer');
    return true;
  }
  // Navegación SPA si estamos dentro de la misma origin
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  return true;
}

// ─── Fase 1 · Helpers de interacción avanzada ────────────────────────

// Helper: rellenar un input/textarea por id, name, placeholder o data-lya-field.
// Dispara los eventos correctos para que React detecte el cambio.
export function fillField(fieldName, value) {
  if (!fieldName) return false;
  const selectors = [
    `[data-lya-field="${fieldName}"]`,
    `#${fieldName}`,
    `[name="${fieldName}"]`,
    `[placeholder*="${fieldName}" i]`,
    `[aria-label*="${fieldName}" i]`,
  ];
  let el = null;
  for (const sel of selectors) {
    try { el = document.querySelector(sel); } catch (_) { /* selector inválido */ }
    if (el) break;
  }
  if (!el) return false;

  // React necesita que usemos el setter nativo para detectar el cambio
  const tag = el.tagName?.toLowerCase();
  const proto = tag === 'textarea'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (nativeSetter) {
    nativeSetter.call(el, String(value ?? ''));
  } else {
    el.value = String(value ?? '');
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.focus();
  return true;
}

// Helper: dispara click programático sobre un elemento marcado con
// data-lya-action="<target>" o por id/selector.
export function clickByLyaAction(target) {
  if (!target) return false;
  const selectors = [
    `[data-lya-action="${target}"]`,
    `#${target}`,
    target.startsWith('.') || target.includes('[') ? target : null,
  ].filter(Boolean);
  let el = null;
  for (const sel of selectors) {
    try { el = document.querySelector(sel); } catch (_) { /* noop */ }
    if (el) break;
  }
  if (!el) return false;
  el.click();
  return true;
}

// Helper: emitir un toast visual desde Lya (capturado por LyaActionBus).
export function triggerLyaToast(message, variant = 'info') {
  if (!message) return false;
  window.dispatchEvent(
    new CustomEvent('lya:toast', { detail: { message, variant } })
  );
  return true;
}

// Helper: pedir abrir el chat widget global (con consulta opcional pre-llenada).
export function openLyaChat(prefilledQuery) {
  window.dispatchEvent(
    new CustomEvent('lya:open-chat', { detail: { prefilledQuery } })
  );
  return true;
}