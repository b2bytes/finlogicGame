import React from 'react';

/**
 * HeroNumber — cifra-héroe en serif editorial (Fraunces bold).
 * Patrón del deck v11: "$732.000", "1.847", "$200K+", "89/100".
 *
 * Props:
 *   value (string|number) — la cifra a mostrar
 *   suffix (string)       — sufijo pequeño en sans (ej: "CLP/mes", "en 7 días")
 *   tone   ('default' | 'mint' | 'accent') — color del número
 *   size   ('md' | 'lg' | 'xl' | '2xl')
 *   label  (string)       — texto debajo en muted (opcional)
 *   trend  (string)       — chip arriba derecha (ej: "↗ +24%")
 */
export default function HeroNumber({
  value,
  suffix,
  tone = 'default',
  size = 'lg',
  label,
  trend,
  className = '',
}) {
  const toneMap = {
    default: 'text-foreground',
    mint: 'text-mint-600',
    accent: 'text-destructive',
    onDark: 'text-foreground',
  };
  const sizeMap = {
    md: 'text-4xl sm:text-5xl',
    lg: 'text-5xl sm:text-6xl',
    xl: 'text-6xl sm:text-7xl',
    '2xl': 'text-7xl sm:text-8xl',
  };

  return (
    <div className={`relative ${className}`}>
      {trend && (
        <span className="absolute top-0 right-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-card border border-border text-[11px] font-mono-editorial text-muted-foreground">
          {trend}
        </span>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`hero-number ${toneMap[tone]} ${sizeMap[size]}`}>{value}</span>
        {suffix && (
          <span className="font-sans text-base sm:text-lg font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {label && (
        <p className="mt-2 text-sm text-muted-foreground leading-snug">{label}</p>
      )}
    </div>
  );
}