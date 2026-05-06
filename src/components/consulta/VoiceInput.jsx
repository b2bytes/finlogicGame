import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Modo Voz para /Consulta — usa Web Speech API nativa (gratis, sin secrets).
 * Diseñado para Don Luis: feedback visual claro, áreas táctiles grandes.
 */
export default function VoiceInput({ onTranscript, disabled }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const rec = new SpeechRecognition();
    rec.lang = 'es-CL';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else interimText += transcript;
      }
      if (finalText) onTranscript(finalText);
      setInterim(interimText);
    };

    rec.onerror = (e) => {
      setError(
        e.error === 'not-allowed'
          ? 'Permiso de micrófono denegado'
          : 'Error de reconocimiento. Intenta de nuevo.'
      );
      setListening(false);
    };

    rec.onend = () => {
      setListening(false);
      setInterim('');
    };

    recognitionRef.current = rec;
    return () => {
      try { rec.stop(); } catch (_) { /* noop */ }
    };
  }, [onTranscript]);

  const toggle = () => {
    if (!recognitionRef.current) return;
    setError(null);
    if (listening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (_) {
        setError('No se pudo activar el micrófono');
      }
    }
  };

  if (!supported) {
    return (
      <div className="flex items-start gap-2 p-3 rounded-2xl bg-secondary text-xs text-muted-foreground">
        <MicOff className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>El modo voz no está disponible en este navegador. Usa Chrome o Edge.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? 'Detener grabación' : 'Iniciar grabación de voz'}
        className={cn(
          'w-full h-16 rounded-3xl flex items-center justify-center gap-3 font-semibold transition-all border-2',
          listening
            ? 'bg-destructive text-destructive-foreground border-destructive shadow-lg animate-pulse-soft'
            : 'bg-card text-foreground border-mint-200 hover:bg-mint-50 hover:border-mint-300 shadow-soft',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {listening ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Escuchando… toca para detener
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-mint-600" />
            Hablar en lugar de escribir
          </>
        )}
      </button>

      {interim && (
        <div className="text-sm text-muted-foreground italic px-4 py-2 bg-mint-50 rounded-2xl border border-mint-100">
          {interim}…
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive px-3 py-2 bg-destructive/10 rounded-2xl">
          {error}
        </div>
      )}
    </div>
  );
}