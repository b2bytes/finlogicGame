import React from 'react';
import { motion } from 'framer-motion';

/**
 * HeroVortex — vórtice IA central tipo "esfera de datos" Apple Intelligence.
 * Anillos orbitando, partículas, núcleo brillante mint. Puramente decorativo.
 */

export default function HeroVortex({ size = 280 }) {
  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Glow externo aurora */}
      <div
        className="absolute inset-0 rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34,197,94,0.35) 0%, rgba(34,197,94,0.1) 40%, transparent 70%)',
        }}
      />

      {/* Anillos orbitales */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-mint-400/20"
          style={{
            transform: `scale(${1 - i * 0.15})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 18 + i * 6, repeat: Infinity, ease: 'linear' }}
        >
          {/* Punto luminoso en el anillo */}
          <div
            className="absolute w-2 h-2 rounded-full bg-mint-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]"
            style={{ top: '50%', left: i % 2 === 0 ? '0%' : '100%', transform: 'translate(-50%, -50%)' }}
          />
        </motion.div>
      ))}

      {/* Núcleo central — espiral mint */}
      <motion.div
        className="absolute inset-[22%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(167,243,208,0.95) 0%, rgba(34,197,94,0.7) 40%, rgba(6,78,59,0.4) 80%, transparent 100%)',
          boxShadow:
            '0 0 60px rgba(34,197,94,0.5), inset 0 0 40px rgba(255,255,255,0.3)',
        }}
        animate={{ scale: [1, 1.05, 1], rotate: 360 }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 24, repeat: Infinity, ease: 'linear' },
        }}
      >
        {/* Patrón espiral interno */}
        <div
          className="absolute inset-2 rounded-full opacity-60 mix-blend-screen"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.6) 90deg, transparent 180deg, rgba(167,243,208,0.5) 270deg, transparent 360deg)',
          }}
        />
      </motion.div>

      {/* Partículas flotantes */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = size * 0.42;
        return (
          <motion.div
            key={`p-${i}`}
            className="absolute w-1 h-1 rounded-full bg-mint-200"
            style={{
              top: '50%',
              left: '50%',
              boxShadow: '0 0 8px rgba(167,243,208,0.8)',
            }}
            animate={{
              x: [Math.cos(angle) * r, Math.cos(angle + 0.4) * r, Math.cos(angle) * r],
              y: [Math.sin(angle) * r, Math.sin(angle + 0.4) * r, Math.sin(angle) * r],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}
    </div>
  );
}