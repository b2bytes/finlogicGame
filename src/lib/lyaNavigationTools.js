// lyaNavigationTools.js — Catálogo central de páginas y secciones que Lya
// puede usar para navegar la plataforma. Mantiene su conocimiento sincronizado
// entre frontend (client tools) y backend (system prompt del agente).
// v1.2 · cache-bust HMR — exporta: scrollToElement, scrollToPosition, scrollToText,
// navigateToPath, goBackHistory, goForwardHistory, reloadPage, findByText,
// clickByText, describeCurrentPage, listInteractiveElements, fillField,
// clickByLyaAction, triggerLyaToast, openLyaChat, LYA_PAGES, LYA_SLIDES.

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
  { path: '/Lanzamiento', name: 'Lanzamiento', description: 'Plan de marketing táctico para Chile Fintech Forum 2026' },
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
// Acepta CUALQUIER path interno: si no comienza con "/" lo agrega.
// También acepta query strings (?x=1) y hash (#section).
export function navigateToPath(path, openInNewTab = false) {
  if (!path) return false;
  let target = String(path).trim();
  if (!target.startsWith('/') && !target.startsWith('http')) {
    target = '/' + target;
  }
  if (openInNewTab) {
    const url = target.startsWith('http') ? target : `${window.location.origin}${target}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
  // Navegación SPA dentro de la misma origin
  window.history.pushState({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
  // Si trae hash, hacer scroll al ancla después del re-render
  if (target.includes('#')) {
    const anchor = target.split('#')[1];
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  }
  return true;
}

// Helper: history navigation
export function goBackHistory() { try { window.history.back(); return true; } catch (_) { return false; } }
export function goForwardHistory() { try { window.history.forward(); return true; } catch (_) { return false; } }
export function reloadPage() { try { window.location.reload(); return true; } catch (_) { return false; } }

// Helper: normaliza texto para búsqueda — quita tildes, lowercases, trim.
// Permite que "equipo" matchee "Equipo", "EQUIPO", "Equípo" sin distinción.
function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: encontrar elementos por TEXTO VISIBLE (sin requerir id/data-attr).
// Estrategia en cascada: (1) match exacto > (2) match por palabras > (3) match
// substring. Prioriza elementos más cortos y visibles. Insensible a tildes.
export function findByText(text, tagsHint = ['a', 'button', 'h1', 'h2', 'h3', 'h4', 'h5', '[role="button"]', 'section', 'nav', 'p', 'span', 'li']) {
  if (!text) return null;
  const needle = normalizeText(text);
  if (!needle) return null;
  const candidates = document.querySelectorAll(tagsHint.join(','));
  let exact = null;
  let bestSubstr = null;
  let bestSubstrLen = Infinity;
  candidates.forEach((el) => {
    if (el.offsetParent === null) return;
    const raw = el.getAttribute('aria-label') || el.textContent || '';
    const txt = normalizeText(raw);
    if (!txt) return;
    if (txt === needle && !exact) exact = el;
    if (txt.includes(needle) && txt.length < bestSubstrLen) {
      bestSubstr = el; bestSubstrLen = txt.length;
    }
  });
  return exact || bestSubstr;
}

// Helper: scroll a elemento por TEXTO VISIBLE
export function scrollToText(text) {
  const el = findByText(text);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.style.transition = 'box-shadow 0.6s ease';
  el.style.boxShadow = '0 0 0 4px hsl(var(--mint-400) / 0.55)';
  setTimeout(() => { el.style.boxShadow = ''; }, 2000);
  return true;
}

// Helper: click por TEXTO VISIBLE (botones, links)
export function clickByText(text) {
  const el = findByText(text, ['button', 'a', '[role="button"]']);
  if (!el) return false;
  el.click();
  return true;
}

// Helper: describir página actual (qué ve el usuario)
export function describeCurrentPage() {
  const path = window.location.pathname;
  const title = document.title;
  const h1 = document.querySelector('h1')?.textContent?.trim() || '';
  const headings = Array.from(document.querySelectorAll('h2, h3'))
    .slice(0, 8)
    .map((h) => h.textContent?.trim())
    .filter(Boolean);
  const anchors = Array.from(document.querySelectorAll('[id]'))
    .filter((el) => el.id && !el.id.startsWith('radix-') && el.offsetParent !== null)
    .slice(0, 12)
    .map((el) => el.id);
  return { path, title, h1, headings, anchors };
}

// Helper: listar elementos interactivos visibles (links + botones) en la página
export function listInteractiveElements(limit = 20) {
  const items = [];
  const selectors = 'a[href], button, [role="button"], [data-lya-action]';
  document.querySelectorAll(selectors).forEach((el) => {
    if (el.offsetParent === null) return;
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 80);
    if (!label) return;
    const kind = el.tagName.toLowerCase() === 'a' ? 'link' : 'button';
    const href = el.getAttribute('href');
    const action = el.getAttribute('data-lya-action');
    items.push({ kind, label, ...(href ? { href } : {}), ...(action ? { action } : {}) });
    if (items.length >= limit) return;
  });
  return items.slice(0, limit);
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