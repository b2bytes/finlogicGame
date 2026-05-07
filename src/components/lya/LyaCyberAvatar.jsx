import React from 'react';

/**
 * LyaCyberAvatar — Avatar femenino cibernético (SVG, sin imágenes externas).
 * Estética: silueta de mujer, aro de neuronas, halo mint, indicadores
 * cibernéticos. Pulsa cuando `speaking=true`.
 *
 * Tamaño controlable vía prop `size` en px.
 */
export default function LyaCyberAvatar({ size = 56, speaking = false, listening = false }) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Halo exterior pulsante */}
      <span
        className={`absolute inset-0 rounded-full bg-mint-400/40 blur-md ${
          speaking ? 'animate-pulse' : ''
        }`}
      />
      {/* Anillo ring que indica escucha */}
      {listening && (
        <span className="absolute inset-[-4px] rounded-full border-2 border-emerald-400/60 animate-ping" />
      )}

      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="relative drop-shadow-[0_0_8px_rgba(110,231,183,0.4)]"
      >
        <defs>
          <linearGradient id="lya-skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id="lya-hair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <radialGradient id="lya-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(110,231,183,0.6)" />
            <stop offset="100%" stopColor="rgba(110,231,183,0)" />
          </radialGradient>
        </defs>

        {/* Anillo cibernético exterior */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="url(#lya-skin)"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          opacity="0.6"
        >
          {speaking && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 32 32"
              to="360 32 32"
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Brillo central */}
        <circle cx="32" cy="32" r="22" fill="url(#lya-glow)" />

        {/* === Silueta femenina === */}
        {/* Hombros / cuello */}
        <path
          d="M 14 60 Q 14 48 22 44 L 26 42 L 26 38 L 38 38 L 38 42 L 42 44 Q 50 48 50 60 Z"
          fill="url(#lya-skin)"
          opacity="0.95"
        />
        {/* Cuello sombra */}
        <rect x="28" y="36" width="8" height="6" rx="1" fill="#10b981" opacity="0.7" />

        {/* Cara */}
        <ellipse cx="32" cy="26" rx="10" ry="12" fill="url(#lya-skin)" />

        {/* Pelo (bob largo, look ejecutivo) */}
        <path
          d="M 21 26 Q 19 14 32 12 Q 45 14 43 26 L 43 30 Q 41 22 38 20 Q 35 21 32 21 Q 29 21 26 20 Q 23 22 21 30 Z"
          fill="url(#lya-hair)"
        />
        {/* Mechones laterales */}
        <path d="M 21 28 Q 18 36 20 42" stroke="url(#lya-hair)" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M 43 28 Q 46 36 44 42" stroke="url(#lya-hair)" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Ojos cibernéticos */}
        <ellipse cx="28" cy="26" rx="1.4" ry="1.8" fill="#0f172a" />
        <ellipse cx="36" cy="26" rx="1.4" ry="1.8" fill="#0f172a" />
        {/* Brillos en ojos */}
        <circle cx="28.5" cy="25.5" r="0.5" fill="#a7f3d0">
          {speaking && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
          )}
        </circle>
        <circle cx="36.5" cy="25.5" r="0.5" fill="#a7f3d0">
          {speaking && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Boca — sutil arco; se anima al hablar */}
        {speaking ? (
          <ellipse cx="32" cy="31" rx="2" ry="1" fill="#0f172a" opacity="0.85">
            <animate attributeName="ry" values="0.4;1.2;0.4" dur="0.5s" repeatCount="indefinite" />
          </ellipse>
        ) : (
          <path
            d="M 30 31 Q 32 32 34 31"
            stroke="#0f172a"
            strokeWidth="0.8"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        )}

        {/* Detalles cibernéticos en la sien */}
        <line x1="42" y1="24" x2="46" y2="24" stroke="#34d399" strokeWidth="0.6" />
        <circle cx="46.5" cy="24" r="0.6" fill="#34d399">
          {speaking && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
          )}
        </circle>
        <line x1="18" y1="24" x2="22" y2="24" stroke="#34d399" strokeWidth="0.6" />
        <circle cx="17.5" cy="24" r="0.6" fill="#34d399">
          {speaking && (
            <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Collar/circuito en cuello */}
        <path
          d="M 26 42 Q 32 44 38 42"
          stroke="#34d399"
          strokeWidth="0.6"
          fill="none"
          opacity="0.7"
        />
        <circle cx="32" cy="43" r="0.7" fill="#a7f3d0" />
      </svg>
    </div>
  );
}