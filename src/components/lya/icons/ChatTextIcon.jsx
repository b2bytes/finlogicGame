import React from 'react';

/**
 * ChatTextIcon — Ícono premium para chat de TEXTO. Burbuja con 3 líneas
 * tipográficas animadas (efecto "typing"), cursor parpadeante y cola redondeada.
 * Estética Apple/Linear sobre fondo mint.
 *
 * Props:
 *  - size: px (default 36)
 *  - typing: bool — anima las líneas como si Lya estuviera escribiendo
 */
export default function ChatTextIcon({ size = 36, typing = true }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className="text-white"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="ct-bubble" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.92)" />
        </linearGradient>
      </defs>

      {/* Burbuja principal redondeada con cola */}
      <path
        d="M 10 10
           H 38
           Q 42 10 42 14
           V 30
           Q 42 34 38 34
           H 22
           L 14 41
           L 16 34
           H 10
           Q 6 34 6 30
           V 14
           Q 6 10 10 10 Z"
        fill="url(#ct-bubble)"
      />

      {/* Línea de texto 1 (larga) */}
      <rect x="11" y="16" width="22" height="2.4" rx="1.2" fill="hsl(var(--mint-600))" opacity="0.9">
        {typing && (
          <animate
            attributeName="width"
            values="6;22;22;6"
            keyTimes="0;0.4;0.85;1"
            dur="2.4s"
            repeatCount="indefinite"
          />
        )}
      </rect>

      {/* Línea de texto 2 (media) */}
      <rect x="11" y="21" width="26" height="2.4" rx="1.2" fill="hsl(var(--mint-600))" opacity="0.75">
        {typing && (
          <animate
            attributeName="width"
            values="0;26;26;0"
            keyTimes="0;0.55;0.9;1"
            dur="2.4s"
            repeatCount="indefinite"
            begin="0.3s"
          />
        )}
      </rect>

      {/* Línea de texto 3 (corta) + cursor parpadeante */}
      <rect x="11" y="26" width="14" height="2.4" rx="1.2" fill="hsl(var(--mint-600))" opacity="0.65">
        {typing && (
          <animate
            attributeName="width"
            values="0;14;14;0"
            keyTimes="0;0.7;0.95;1"
            dur="2.4s"
            repeatCount="indefinite"
            begin="0.6s"
          />
        )}
      </rect>

      {/* Cursor que parpadea al final del último renglón */}
      <rect x="27" y="25.5" width="1.4" height="3.4" rx="0.7" fill="hsl(var(--mint-700))">
        {typing && (
          <animate
            attributeName="opacity"
            values="0;1;1;0"
            keyTimes="0;0.05;0.5;1"
            dur="0.9s"
            repeatCount="indefinite"
          />
        )}
      </rect>
    </svg>
  );
}