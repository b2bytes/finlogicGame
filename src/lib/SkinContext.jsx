import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * SkinContext — Skins Adaptativos FinLogic
 *
 * 4 skins canónicos mapeados a los perfiles del mandato + auto.
 * Cada skin altera variables CSS (--background, --primary, --radius, font-size base, …)
 * vía clases en <html>: skin-camila / skin-don_luis / skin-maria_jose / skin-roberto.
 * El skin "auto" no aplica clase y deja el tema base mint.
 *
 * Persiste en localStorage. Se puede sobreescribir por código (auto-detect post triage)
 * vía setSkin('don_luis', { auto: true }) — el flag "auto" indica que la elección
 * vino del backend y debe ceder ante una elección manual posterior.
 */

const SKINS = ['auto', 'camila', 'don_luis', 'maria_jose', 'roberto'];

const SkinContext = createContext({
  skin: 'auto',
  setSkin: () => {},
  isManual: false,
  resetSkin: () => {},
});

export function SkinProvider({ children }) {
  const [skin, setSkinState] = useState(() => {
    if (typeof window === 'undefined') return 'auto';
    const saved = localStorage.getItem('finlogic_skin');
    return SKINS.includes(saved) ? saved : 'auto';
  });
  const [isManual, setIsManual] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('finlogic_skin_manual') === 'true';
  });

  // Sync clase en <html>
  useEffect(() => {
    const html = document.documentElement;
    SKINS.forEach((s) => html.classList.remove(`skin-${s}`));
    if (skin && skin !== 'auto') {
      html.classList.add(`skin-${skin}`);
    }
    localStorage.setItem('finlogic_skin', skin);
    localStorage.setItem('finlogic_skin_manual', isManual ? 'true' : 'false');
  }, [skin, isManual]);

  const setSkin = useCallback((next, opts = {}) => {
    if (!SKINS.includes(next)) return;
    // Si es auto-detección y el usuario ya eligió manualmente, no sobreescribir.
    if (opts.auto && isManual) return;
    setSkinState(next);
    setIsManual(!opts.auto);
  }, [isManual]);

  const resetSkin = useCallback(() => {
    setSkinState('auto');
    setIsManual(false);
  }, []);

  return (
    <SkinContext.Provider value={{ skin, setSkin, isManual, resetSkin }}>
      {children}
    </SkinContext.Provider>
  );
}

export const useSkin = () => useContext(SkinContext);

export const SKIN_META = {
  auto: {
    label: 'Auto',
    description: 'Detección automática según tu consulta',
    emoji: '✨',
    color: 'hsl(158 52% 42%)',
  },
  camila: {
    label: 'Camila',
    description: '22 años · Santiago · móvil-first',
    emoji: '🎓',
    color: 'hsl(280 60% 55%)',
    profile: 'Joven, lenguaje coloquial',
  },
  don_luis: {
    label: 'Don Luis',
    description: '68 años · Valparaíso · accesible',
    emoji: '👴',
    color: 'hsl(158 70% 30%)',
    profile: 'Texto +25%, contraste alto, áreas táctiles 48px',
  },
  maria_jose: {
    label: 'María José',
    description: '34 años · Temuco · emprendedora',
    emoji: '💼',
    color: 'hsl(28 80% 50%)',
    profile: 'Profesional, accionable, datos densos',
  },
  roberto: {
    label: 'Roberto',
    description: '45 años · Antofagasta · técnico',
    emoji: '👨‍💻',
    color: 'hsl(220 60% 35%)',
    profile: 'Técnico, conciso, navy + mint',
  },
};