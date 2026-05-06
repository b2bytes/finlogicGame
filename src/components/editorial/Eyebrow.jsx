import React from 'react';

/**
 * Eyebrow — label superior monoespaciada con bullet ● mint.
 * Patrón distintivo del FinLogic Deck v11.
 *
 * Uso:
 *   <Eyebrow>EL PROBLEMA · CHILE 2026</Eyebrow>
 *   <Eyebrow tone="accent">DEMO EN VIVO</Eyebrow>
 *   <Eyebrow as="div" size="lg">TRACCIÓN REAL · PRODUCCIÓN · ÚLTIMOS 7 DÍAS</Eyebrow>
 */
export default function Eyebrow({
  children,
  tone = 'mint',
  size = 'sm',
  className = '',
  as: Tag = 'p',
  bullet = true,
  ...props
}) {
  const toneMap = {
    mint: 'text-mint-600',
    foreground: 'text-foreground',
    muted: 'text-muted-foreground',
    accent: 'text-destructive',
    onDark: 'text-mint-400',
  };
  const sizeMap = {
    xs: 'text-[10px]',
    sm: 'text-[11px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <Tag
      className={`font-mono-editorial font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 ${toneMap[tone]} ${sizeMap[size]} ${className}`}
      {...props}
    >
      {bullet && (
        <span
          aria-hidden
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            tone === 'accent'
              ? 'bg-destructive'
              : tone === 'foreground'
              ? 'bg-foreground'
              : 'bg-mint-500'
          }`}
        />
      )}
      <span>{children}</span>
    </Tag>
  );
}