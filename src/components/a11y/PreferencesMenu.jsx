import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings2, Check, Sparkles, Accessibility, Palette, RotateCcw, Keyboard } from 'lucide-react';
import { useSkin, SKIN_META } from '@/lib/SkinContext.jsx';
import { useAccessibility } from '@/lib/AccessibilityContext';

/**
 * PreferencesMenu — un único botón "Preferencias" en el header que reúne:
 *  · Modo accesible (Don Luis: texto grande, contraste alto, áreas táctiles 48px)
 *  · Skin Adaptativo (Auto + 4 perfiles canónicos)
 *
 * Diseño Apple/iOS: popover con secciones, focus visible, navegación por teclado,
 * ESC cierra, click-fuera cierra, ARIA roles correctos.
 *
 * Más pro que dos botones sueltos: ahorra espacio, sube jerarquía y hace
 * la accesibilidad descubrible (ya no oculta detrás de un ícono ambiguo).
 */
export default function PreferencesMenu() {
  const { skin, setSkin, isManual, resetSkin } = useSkin();
  const { accessible, toggle: toggleA11y } = useAccessibility();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const triggerRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  // Indicador visual: ¿hay alguna preferencia personalizada activa?
  const hasCustomization = accessible || skin !== 'auto';
  const currentSkinMeta = SKIN_META[skin] || SKIN_META.auto;

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Preferencias de visualización${hasCustomization ? ' (personalizadas)' : ''}`}
        title="Preferencias de visualización"
        className={`relative inline-flex items-center justify-center gap-2 rounded-full border-2 transition-all min-h-[44px] min-w-[44px] px-3 hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          hasCustomization
            ? 'bg-mint-50 border-mint-300 text-mint-700'
            : 'bg-card border-border text-foreground hover:border-mint-300 hover:bg-mint-50'
        }`}
      >
        <Settings2 className="w-4 h-4" strokeWidth={2.4} />
        <span className="hidden sm:inline text-xs font-semibold">Preferencias</span>
        {hasCustomization && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
            style={{ background: currentSkinMeta.color }}
          />
        )}
      </button>

      {open && (
        <>
          {/* Backdrop sutil sólo en mobile para mejor enfoque */}
          <div
            className="fixed inset-0 bg-foreground/10 backdrop-blur-[2px] z-40 sm:hidden"
            aria-hidden
          />
          <div
            role="dialog"
            aria-label="Menú de preferencias de visualización"
            className="fixed sm:absolute left-3 right-3 top-16 sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-[340px] sm:max-w-[calc(100vw-2rem)] rounded-3xl border border-border bg-popover shadow-soft-lg p-2 z-50 animate-fade-up"
            style={{ animationDuration: '0.2s' }}
          >
            {/* Header */}
            <div className="px-3 pt-2 pb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-foreground text-base">
                  Personaliza tu vista
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                  Adapta FinLogic a tus necesidades. Tus preferencias se guardan en este dispositivo.
                </p>
              </div>
              {hasCustomization && (
                <button
                  type="button"
                  onClick={() => {
                    if (accessible) toggleA11y();
                    if (skin !== 'auto') resetSkin();
                  }}
                  className="text-[11px] font-semibold text-mint-700 hover:text-mint-800 hover:underline inline-flex items-center gap-1 px-2 py-1 rounded-full hover:bg-mint-50 flex-shrink-0"
                  aria-label="Restablecer todas las preferencias"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            <div className="h-px bg-border mx-2" />

            {/* Sección: Accesibilidad */}
            <div role="group" aria-labelledby="prefs-a11y" className="px-1 py-2">
              <div id="prefs-a11y" className="px-3 pb-2 flex items-center gap-2">
                <Accessibility className="w-3.5 h-3.5 text-mint-600" />
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Accesibilidad
                </p>
              </div>
              <button
                role="switch"
                aria-checked={accessible}
                onClick={toggleA11y}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-secondary transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    accessible
                      ? 'bg-mint-600 text-white'
                      : 'bg-secondary text-foreground border border-border'
                  }`}
                >
                  <Accessibility className="w-4 h-4" strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Modo accesible
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Texto +25% · alto contraste · áreas táctiles 48px
                  </p>
                </div>
                {/* Toggle visual */}
                <span
                  aria-hidden
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                    accessible ? 'bg-mint-600' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                      accessible ? 'left-[18px]' : 'left-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>

            <div className="h-px bg-border mx-2" />

            {/* Sección: Skin Adaptativo */}
            <div role="radiogroup" aria-labelledby="prefs-skin" className="px-1 py-2">
              <div id="prefs-skin" className="px-3 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-mint-600" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Skin Adaptativo
                  </p>
                </div>
                {isManual && (
                  <span className="text-[10px] font-semibold text-mint-700 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-200">
                    Manual
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                {Object.entries(SKIN_META).map(([key, meta]) => {
                  const selected = skin === key;
                  return (
                    <button
                      key={key}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setSkin(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${
                        selected ? 'bg-mint-50' : 'hover:bg-secondary'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 shadow-sm"
                        style={{ background: meta.color, color: 'white' }}
                        aria-hidden
                      >
                        {meta.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {meta.label}
                          </p>
                          {key === 'auto' && (
                            <Sparkles className="w-3 h-3 text-mint-600 flex-shrink-0" aria-hidden />
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug truncate">
                          {meta.description}
                        </p>
                      </div>
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          selected ? 'bg-mint-600 border-mint-600' : 'border-border'
                        }`}
                        aria-hidden
                      >
                        {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer hint */}
            <div className="h-px bg-border mx-2" />
            <div className="px-3 py-2.5 flex items-center gap-2">
              <Keyboard className="w-3 h-3 text-muted-foreground flex-shrink-0" aria-hidden />
              <p className="text-[10px] text-muted-foreground leading-snug">
                Presiona <kbd className="px-1 py-0.5 rounded bg-secondary border border-border font-mono text-[10px] font-semibold">Esc</kbd> para cerrar.
                {' '}Lya detecta tu perfil al consultar.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}