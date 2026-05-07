import React from 'react';

/**
 * VoiceWaveIcon — Ícono premium de voz con ondas animadas + micrófono central.
 * Estética: 5 barras simétricas con ecualizador en vivo + halo radial.
 * Optimizado para FAB sobre fondo oscuro/mint.
 *
 * Props:
 *  - size: px (default 44)
 *  - active: bool — si está hablando/escuchando, las ondas se animan más rápido
 */
export default function VoiceWaveIcon({ size = 44, active = true }) {
  return (
    <svg
      viewBox="0 0 56 56"
      width={size}
      height={size}
      className="text-white"
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="vw-bar" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.65)" />
        </linearGradient>
        <radialGradient id="vw-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.30)" />
          <stop offset="70%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {/* Halo central radial */}
      <circle cx="28" cy="28" r="22" fill="url(#vw-halo)" />

      {/* Ondas exteriores izquierda — barra corta */}
      <rect
        x="6"
        y="22"
        width="3.5"
        height="12"
        rx="1.75"
        fill="url(#vw-bar)"
        opacity="0.55"
      >
        {active && (
          <>
            <animate attributeName="height" values="6;14;6" dur="1.6s" repeatCount="indefinite" />
            <animate attributeName="y" values="25;21;25" dur="1.6s" repeatCount="indefinite" />
          </>
        )}
      </rect>

      {/* Onda izquierda media */}
      <rect
        x="13"
        y="17"
        width="3.5"
        height="22"
        rx="1.75"
        fill="url(#vw-bar)"
        opacity="0.85"
      >
        {active && (
          <>
            <animate attributeName="height" values="14;28;14" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="y" values="21;14;21" dur="1.2s" repeatCount="indefinite" />
          </>
        )}
      </rect>

      {/* Cápsula del micrófono central */}
      <rect x="23" y="14" width="10" height="20" rx="5" fill="white" />
      {/* Líneas internas del mic (sensor) */}
      <line x1="26" y1="20" x2="30" y2="20" stroke="hsl(var(--mint-700))" strokeWidth="0.8" opacity="0.5" />
      <line x1="26" y1="24" x2="30" y2="24" stroke="hsl(var(--mint-700))" strokeWidth="0.8" opacity="0.5" />
      <line x1="26" y1="28" x2="30" y2="28" stroke="hsl(var(--mint-700))" strokeWidth="0.8" opacity="0.5" />
      {/* Base del mic (arco + soporte) */}
      <path
        d="M 20 30 Q 20 38 28 38 Q 36 38 36 30"
        stroke="white"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="28" y1="38" x2="28" y2="44" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="24" y1="44" x2="32" y2="44" stroke="white" strokeWidth="2.2" strokeLinecap="round" />

      {/* Onda derecha media */}
      <rect
        x="39.5"
        y="17"
        width="3.5"
        height="22"
        rx="1.75"
        fill="url(#vw-bar)"
        opacity="0.85"
      >
        {active && (
          <>
            <animate attributeName="height" values="14;26;14" dur="1.3s" repeatCount="indefinite" />
            <animate attributeName="y" values="21;15;21" dur="1.3s" repeatCount="indefinite" />
          </>
        )}
      </rect>

      {/* Onda exterior derecha — barra corta */}
      <rect
        x="46.5"
        y="22"
        width="3.5"
        height="12"
        rx="1.75"
        fill="url(#vw-bar)"
        opacity="0.55"
      >
        {active && (
          <>
            <animate attributeName="height" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="25;22;25" dur="1.5s" repeatCount="indefinite" />
          </>
        )}
      </rect>
    </svg>
  );
}