import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useSkin, SKIN_META } from '@/lib/SkinContext.jsx';

/**
 * SkinAutoDetectToast — feedback efímero cuando Lya auto-detecta perfil
 * y aplica un skin. Aparece bottom-right, 4s, dismissible.
 *
 * Se monta una vez en App. Escucha cambios de skin via context y muestra
 * un toast solo cuando isManual=false y skin !== 'auto'.
 */
export default function SkinAutoDetectToast() {
  const { skin, isManual } = useSkin();
  const [visible, setVisible] = useState(false);
  const [shownSkin, setShownSkin] = useState(null);

  useEffect(() => {
    if (skin && skin !== 'auto' && !isManual && skin !== shownSkin) {
      setShownSkin(skin);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 4500);
      return () => clearTimeout(t);
    }
  }, [skin, isManual, shownSkin]);

  if (!visible || !shownSkin) return null;
  const meta = SKIN_META[shownSkin];
  if (!meta) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[60] max-w-xs animate-fade-up"
      style={{ animationDuration: '0.5s' }}
    >
      <div className="rounded-3xl bg-foreground text-background shadow-soft-lg p-4 pr-3 flex items-start gap-3 backdrop-blur-xl">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: meta.color }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Sparkles className="w-3 h-3 text-mint-300" />
            <p className="text-[10px] font-bold uppercase tracking-wider text-mint-300">
              Skin adaptativo
            </p>
          </div>
          <p className="text-sm font-semibold leading-tight">
            Adapté la interfaz a <strong>{meta.label}</strong>
          </p>
          <p className="text-[11px] opacity-70 mt-0.5 leading-snug">
            {meta.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="opacity-50 hover:opacity-100 transition-opacity p-1 -m-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}