import React from 'react';

/**
 * EditorialHeading — headline tipo deck v11.
 * Combina serif Fraunces alto contraste con énfasis mint en parte del texto.
 *
 * Uso:
 *   <EditorialHeading
 *     before="Tu derecho financiero,"
 *     accent="en tu idioma."
 *     after="Ahora."
 *     size="hero"
 *   />
 *
 *   o solo con children para texto simple:
 *   <EditorialHeading size="md">5 endpoints.</EditorialHeading>
 */
export default function EditorialHeading({
  before,
  accent,
  after,
  children,
  size = 'lg',
  as: Tag = 'h2',
  align = 'left',
  className = '',
}) {
  const sizes = {
    sm: 'text-2xl sm:text-3xl',
    md: 'text-3xl sm:text-4xl',
    lg: 'text-4xl sm:text-5xl md:text-6xl',
    xl: 'text-5xl sm:text-6xl md:text-7xl',
    hero: 'text-5xl sm:text-7xl md:text-8xl',
  };
  const aligns = {
    left: 'text-left',
    center: 'text-center',
  };

  if (children) {
    return (
      <Tag
        className={`font-display font-bold leading-[1.05] tracking-tight text-foreground ${sizes[size]} ${aligns[align]} ${className}`}
      >
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      className={`font-display font-bold leading-[1.05] tracking-tight text-foreground ${sizes[size]} ${aligns[align]} ${className}`}
    >
      {before && <span>{before}</span>}
      {before && accent && <br />}
      {accent && <span className="text-mint-600">{accent}</span>}
      {after && (
        <>
          <br />
          <span>{after}</span>
        </>
      )}
    </Tag>
  );
}