import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useSkin, SKIN_META } from '@/lib/SkinContext.jsx';

/**
 * SkinSwitcher — botón compacto al lado del AccessibilityToggle.
 * Abre un popover con los 4 skins + Auto.
 */
export default function SkinSwitcher({ compact = false }) {
  const { skin, setSkin, isManual, resetSkin } = useSkin();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = SKIN_META[skin] || SKIN_META.auto;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Cambiar skin · actual: ${current.label}`}
        title={`Skin: ${current.label}`}
        className={`relative flex items-center justify-center rounded-full border-2 transition-all min-w-[48px] min-h-[48px] hover:scale-105 active:scale-95 ${
          skin !== 'auto'
            ? 'bg-mint-50 border-mint-300 text-mint-700'
            : 'bg-card border-border text-foreground hover:border-mint-300 hover:bg-mint-50'
        }`}
      >
        <Palette className="w-5 h-5" strokeWidth={2.4} />
        {skin !== 'auto' && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center text-[8px]"
            style={{ background: current.color }}
            aria-hidden
          >
            {current.emoji}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-popover shadow-soft-lg p-2 z-50 animate-fade-up"
        >
          <div className="px-3 py-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Skin Adaptativo
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                La interfaz se adapta a quién eres
              </p>
            </div>
            {isManual && (
              <button
                onClick={() => {
                  resetSkin();
                  setOpen(false);
                }}
                className="text-[11px] font-semibold text-mint-700 hover:underline"
              >
                Auto
              </button>
            )}
          </div>
          <div className="h-px bg-border my-1" />
          {Object.entries(SKIN_META).map(([key, meta]) => (
            <button
              key={key}
              role="menuitemradio"
              aria-checked={skin === key}
              onClick={() => {
                setSkin(key);
                setOpen(false);
              }}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                skin === key ? 'bg-mint-50' : 'hover:bg-secondary'
              }`}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                style={{ background: meta.color, color: 'white' }}
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {meta.label}
                  </p>
                  {key === 'auto' && (
                    <Sparkles className="w-3 h-3 text-mint-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {meta.description}
                </p>
              </div>
              {skin === key && (
                <Check className="w-4 h-4 text-mint-600 flex-shrink-0 mt-1" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}