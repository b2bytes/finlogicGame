import React from 'react';

export default function Logo({ className = '', size = 'md' }) {
  const sizes = {
    sm: { mark: 28, text: 'text-lg' },
    md: { mark: 36, text: 'text-xl' },
    lg: { mark: 56, text: 'text-3xl' },
  };
  const s = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={s.mark} height={s.mark} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="hsl(var(--mint-500))" />
        {/* F */}
        <path d="M11 12V28M11 12H20M11 20H18" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        {/* L */}
        <path d="M24 12V28H30" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`font-display font-bold tracking-tight text-foreground ${s.text}`}>
        Fin<span className="text-mint-600">Logic</span>
      </span>
    </div>
  );
}