import React from 'react';

/**
 * LyaVoiceWaves — Ondas sonoras animadas estilo "Daily Design Challenge".
 * SVG ligero, sin dependencias. Cuando `active=true` las ondas pulsan;
 * en idle dibuja una línea sutil y estática.
 */
export default function LyaVoiceWaves({ active = false, color = 'rgba(110,231,183,0.95)' }) {
  return (
    <svg
      viewBox="0 0 240 60"
      className="w-full h-14"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="lya-wave-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Onda principal */}
      <path
        d="M 0 30 Q 30 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30"
        stroke="url(#lya-wave-grad)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      >
        {active && (
          <animate
            attributeName="d"
            dur="1.6s"
            repeatCount="indefinite"
            values="
              M 0 30 Q 15 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30;
              M 0 30 Q 15 12 30 30 T 60 48 T 90 18 T 120 42 T 150 14 T 180 46 T 210 22 T 240 30;
              M 0 30 Q 15 44 30 30 T 60 16 T 90 46 T 120 18 T 150 44 T 180 14 T 210 42 T 240 30;
              M 0 30 Q 15 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30
            "
          />
        )}
      </path>

      {/* Onda secundaria con offset */}
      <path
        d="M 0 30 Q 30 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30"
        stroke="url(#lya-wave-grad)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      >
        {active && (
          <animate
            attributeName="d"
            dur="2s"
            repeatCount="indefinite"
            values="
              M 0 30 Q 15 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30;
              M 0 30 Q 15 22 30 30 T 60 38 T 90 24 T 120 36 T 150 22 T 180 38 T 210 26 T 240 30;
              M 0 30 Q 15 38 30 30 T 60 22 T 90 36 T 120 24 T 150 38 T 180 22 T 210 36 T 240 30;
              M 0 30 Q 15 30 30 30 T 60 30 T 90 30 T 120 30 T 150 30 T 180 30 T 210 30 T 240 30
            "
          />
        )}
      </path>

      {/* Onda terciaria muy sutil */}
      <path
        d="M 0 30 L 240 30"
        stroke={color}
        strokeWidth="0.5"
        fill="none"
        opacity="0.25"
      />
    </svg>
  );
}