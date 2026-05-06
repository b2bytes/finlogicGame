import React from 'react';
import Eyebrow from '@/components/editorial/Eyebrow';

/**
 * SlideSection — wrapper de sección tipo slide del deck v11.
 * Mantiene altura mínima de pantalla, padding consistente, fondo opcional.
 */
export default function SlideSection({
  eyebrow,
  eyebrowTone = 'mint',
  children,
  variant = 'cream',
  fullHeight = false,
  className = '',
  id,
}) {
  const variants = {
    cream: 'bg-background text-foreground',
    card: 'bg-card text-foreground',
    dark: 'bg-[hsl(215_23%_7%)] text-[hsl(60_30%_96%)]',
  };

  return (
    <section
      id={id}
      className={`relative ${fullHeight ? 'min-h-screen flex items-center' : 'py-20 md:py-28'} px-6 lg:px-12 ${variants[variant]} ${className}`}
    >
      <div className="max-w-7xl mx-auto w-full">
        {eyebrow && (
          <Eyebrow
            tone={variant === 'dark' ? 'onDark' : eyebrowTone}
            size="md"
            className="mb-6"
          >
            {eyebrow}
          </Eyebrow>
        )}
        {children}
      </div>
    </section>
  );
}