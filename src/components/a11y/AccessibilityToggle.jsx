import React from 'react';
import { Accessibility } from 'lucide-react';
import { useAccessibility } from '@/lib/AccessibilityContext';

export default function AccessibilityToggle() {
  const { accessible, toggle } = useAccessibility();

  return (
    <button
      onClick={toggle}
      aria-pressed={accessible}
      aria-label={accessible ? 'Desactivar modo accesible' : 'Activar modo accesible (texto grande, alto contraste)'}
      title={accessible ? 'Desactivar modo accesible' : 'Modo accesible: texto grande y alto contraste'}
      className={`flex items-center justify-center rounded-full border-2 transition-all min-w-[48px] min-h-[48px] ${
        accessible
          ? 'bg-mint-600 border-mint-700 text-white shadow-mint'
          : 'bg-card border-border text-foreground hover:border-mint-300 hover:bg-mint-50'
      }`}
    >
      <Accessibility className="w-5 h-5" strokeWidth={2.4} />
    </button>
  );
}