import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Sparkles } from 'lucide-react';
import { useLyaPersistent } from '@/lib/LyaPersistentContext.jsx';

/**
 * LyaOrb — el orbe central ES Lya. Click → activa la conversación de voz
 * persistente (sobrevive a navegación). Reactiva visualmente al estado:
 *  - idle: rotación lenta, halo suave
 *  - connecting: pulse rápido + spinner
 *  - listening (connected, !muted, !speaking): respiración + ondas mint
 *  - speaking: vibración + ondas amplias + glow máximo
 *  - error: tinte coral
 *
 * Tamaño configurable. Sin BG cards (lo provee el padre).
 */

export default function LyaOrb({ size = 300 }) {
  const {
    status,
    agentSpeaking,
    muted,
    error,
    startConversation,
  } = useLyaPersistent();

  const [hovering, setHovering] = useState(false);

  // Estado visual derivado
  const isConnecting = status === 'connecting';
  const isConnected = status === 'connected';
  const isListening = isConnected && !muted && !agentSpeaking;
  const isSpeaking = isConnected && agentSpeaking;
  const isError = status === 'error';
  const isIdle = status === 'idle';

  // Intensity 0..1 — cuánto "vivo" se ve el orbe
  const intensity = isSpeaking ? 1 : isListening ? 0.75 : isConnecting ? 0.5 : isIdle ? 0.4 : 0.3;

  // Color base según estado
  const coreColor = isError
    ? 'rgba(251,113,89,0.85)'
    : isSpeaking
    ? 'rgba(110,231,183,1)'
    : 'rgba(110,231,183,0.85)';

  const handleClick = async () => {
    if (isConnecting || isConnected) return;
    await startConversation();
  };

  // Si no se pasa size, ocupa el 100% del contenedor padre (responsive)
  const containerStyle = size
    ? { width: size, height: size }
    : { width: '100%', height: '100%' };

  return (
    <div
      className="relative mx-auto select-none"
      style={containerStyle}
    >
      {/* Halo aurora externo — varía con intensidad */}
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
        animate={{
          opacity: 0.3 + intensity * 0.5,
          scale: isSpeaking ? [1, 1.15, 1] : 1,
        }}
        transition={{
          opacity: { duration: 0.6 },
          scale: { duration: 0.8, repeat: isSpeaking ? Infinity : 0, ease: 'easeInOut' },
        }}
        style={{
          background: `radial-gradient(circle, ${coreColor.replace('0.85', '0.45').replace('1)', '0.55)')} 0%, ${coreColor.replace('0.85', '0.15').replace('1)', '0.2)')} 40%, transparent 70%)`,
        }}
      />

      {/* Anillos orbitales — más rápidos cuando habla */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          aria-hidden
          className="absolute inset-0 rounded-full border pointer-events-none"
          style={{
            transform: `scale(${1 - i * 0.13})`,
            borderColor: isError
              ? `rgba(251,113,89,${0.15 + intensity * 0.25})`
              : `rgba(110,231,183,${0.12 + intensity * 0.25})`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{
            duration: isSpeaking ? 8 + i * 3 : 18 + i * 6,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: '50%',
              left: i % 2 === 0 ? '0%' : '100%',
              transform: 'translate(-50%, -50%)',
              background: coreColor,
              boxShadow: `0 0 ${8 + intensity * 16}px ${coreColor}`,
            }}
          />
        </motion.div>
      ))}

      {/* Ondas de voz expandiéndose — solo cuando habla o escucha */}
      <AnimatePresence>
        {(isSpeaking || isListening) && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={`wave-${i}`}
                aria-hidden
                className="absolute inset-0 rounded-full border-2 pointer-events-none"
                style={{
                  borderColor: isSpeaking
                    ? 'rgba(110,231,183,0.5)'
                    : 'rgba(110,231,183,0.3)',
                }}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: isSpeaking ? 1.6 : 2.4,
                  repeat: Infinity,
                  delay: i * (isSpeaking ? 0.5 : 0.8),
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Núcleo central interactivo — botón click */}
      <motion.button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={isConnecting || isConnected}
        aria-label={
          isConnected
            ? 'Lya conectada — está hablando contigo'
            : isConnecting
            ? 'Conectando con Lya…'
            : 'Hablar con Lya'
        }
        className="absolute inset-[22%] rounded-full overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-300 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0a1410] disabled:cursor-default group"
        style={{
          background: isError
            ? 'radial-gradient(circle at 30% 30%, rgba(254,202,202,0.95) 0%, rgba(251,113,89,0.7) 40%, rgba(127,29,29,0.4) 80%, transparent 100%)'
            : 'radial-gradient(circle at 30% 30%, rgba(167,243,208,0.95) 0%, rgba(34,197,94,0.7) 40%, rgba(6,78,59,0.4) 80%, transparent 100%)',
          boxShadow: `0 0 ${40 + intensity * 60}px ${coreColor.replace('0.85', '0.5').replace('1)', '0.6)')}, inset 0 0 40px rgba(255,255,255,0.3)`,
        }}
        animate={{
          scale: isSpeaking ? [1, 1.08, 1] : hovering && isIdle ? 1.05 : 1,
          rotate: 360,
        }}
        transition={{
          scale: {
            duration: isSpeaking ? 0.6 : 0.3,
            repeat: isSpeaking ? Infinity : 0,
            ease: 'easeInOut',
          },
          rotate: {
            duration: isSpeaking ? 12 : 24,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        {/* Patrón espiral interno */}
        <div
          className="absolute inset-2 rounded-full opacity-60 mix-blend-screen pointer-events-none"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.6) 90deg, transparent 180deg, rgba(167,243,208,0.5) 270deg, transparent 360deg)',
          }}
        />

        {/* Centro brillante */}
        <div
          className="absolute inset-[35%] rounded-full opacity-90 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(167,243,208,0.5) 60%, transparent 100%)',
            filter: 'blur(2px)',
          }}
        />

        {/* Indicador de estado en hover (idle) o connecting */}
        <AnimatePresence>
          {(hovering && isIdle) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ counterRotate: 360 }}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-xl"
                style={{ animation: 'spin 24s linear infinite reverse' }}
              >
                <Mic className="w-5 h-5 text-mint-700" />
              </div>
            </motion.div>
          )}
          {isConnecting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Loader2 className="w-7 h-7 text-white drop-shadow-lg animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Partículas flotantes — más activas si Lya está hablando */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const r = size * 0.42;
        return (
          <motion.div
            key={`p-${i}`}
            aria-hidden
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              background: coreColor,
              boxShadow: `0 0 ${6 + intensity * 8}px ${coreColor}`,
            }}
            animate={{
              x: [Math.cos(angle) * r, Math.cos(angle + 0.4) * r, Math.cos(angle) * r],
              y: [Math.sin(angle) * r, Math.sin(angle + 0.4) * r, Math.sin(angle) * r],
              opacity: [0.3 + intensity * 0.3, 0.8 + intensity * 0.2, 0.3 + intensity * 0.3],
            }}
            transition={{
              duration: isSpeaking ? 1.5 + i * 0.1 : 3 + i * 0.2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        );
      })}

      {/* Label de estado debajo del orbe */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap pointer-events-none"
        style={{ top: `calc(100% + 12px)` }}
      >
        {isIdle && (
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 text-[10px] font-grotesk uppercase tracking-[0.2em] text-mint-300/80"
          >
            <Sparkles className="w-3 h-3" />
            Toca para hablar con Lya
          </motion.span>
        )}
        {isConnecting && (
          <span className="text-[10px] font-grotesk uppercase tracking-[0.2em] text-mint-200">
            Conectando…
          </span>
        )}
        {isListening && (
          <span className="text-[10px] font-grotesk uppercase tracking-[0.2em] text-mint-300">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint-400 mr-1.5 animate-pulse" />
            Escuchando
          </span>
        )}
        {isSpeaking && (
          <span className="text-[10px] font-grotesk uppercase tracking-[0.2em] text-mint-200">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-mint-300 mr-1.5 animate-ping" />
            Lya hablando
          </span>
        )}
        {isError && (
          <span className="text-[10px] font-grotesk uppercase tracking-[0.2em] text-red-300">
            {error || 'Error de conexión'}
          </span>
        )}
      </div>
    </div>
  );
}