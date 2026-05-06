import React from 'react';
import { Check } from 'lucide-react';

/**
 * LegalPill — pill monoespaciada para leyes / endpoints / tags técnicos.
 * Patrón deck v11: ⊘ Ley 21.521, POST /check-tmc, ✓ Triage Lya
 *
 * Variants:
 *   - 'law'      → outline mint con check (Ley 21.521)
 *   - 'endpoint' → solid mint white (POST /check-tmc)
 *   - 'agent'    → mint suave con tick (✓ Triage Lya)
 *   - 'neutral'  → outline neutral
 */
export default function LegalPill({
  children,
  variant = 'law',
  icon = true,
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    law: 'border-mint-300 bg-mint-50 text-mint-700',
    endpoint: 'bg-mint-600 text-white border-mint-600',
    agent: 'bg-mint-50 text-mint-700 border-mint-200',
    neutral: 'border-border bg-card text-foreground',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const sizes = {
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono-editorial font-medium whitespace-nowrap ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && (variant === 'law' || variant === 'agent') && (
        <Check className="w-3 h-3 flex-shrink-0" strokeWidth={3} aria-hidden />
      )}
      {children}
    </span>
  );
}