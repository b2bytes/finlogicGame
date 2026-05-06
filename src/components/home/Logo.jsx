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
        <path
          d="M12 26V14C12 12.8954 12.8954 12 14 12H22C24.7614 12 27 14.2386 27 17C27 19.7614 24.7614 22 22 22H17"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 22V28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="28" cy="28" r="2.5" fill="white" />
      </svg>
      <span className={`font-display font-bold tracking-tight text-foreground ${s.text}`}>
        Fin<span className="text-mint-600">Logic</span>
      </span>
    </div>
  );
}