import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Lya Voice — Web Speech API nativa (gratis, sin secrets).
 * STT: SpeechRecognition  · TTS: speechSynthesis
 *
 * Voz objetivo: femenina, ~37 años, español de Chile.
 * Selección priorizada:
 *  1. es-CL femenino (Google/Apple/Microsoft Antonio/Catalina/Sabina/Soledad)
 *  2. es-419 / es-MX / es-US femenino con tono neutro
 *  3. cualquier es-* femenino
 *  4. fallback: primera voz es-*
 */

// Patrones de nombres femeninos comunes en TTS hispanos
const FEMALE_NAME_HINTS = [
  'female', 'mujer', 'femenina',
  'sabina', 'soledad', 'catalina', 'paulina', 'francisca', 'isidora',
  'helena', 'paloma', 'lupe', 'esperanza', 'ximena', 'andrea',
  'monica', 'mónica', 'carolina', 'lucia', 'lucía', 'maria', 'maría',
  'elena', 'cecilia', 'sofia', 'sofía', 'valentina', 'camila',
];

const MALE_NAME_HINTS = [
  'male', 'hombre', 'masculino',
  'jorge', 'diego', 'pablo', 'carlos', 'miguel', 'juan', 'pedro',
  'antonio', 'ricardo', 'roberto', 'fernando', 'arturo',
];

function isLikelyFemale(voice) {
  const name = (voice.name || '').toLowerCase();
  if (FEMALE_NAME_HINTS.some((h) => name.includes(h))) return true;
  if (MALE_NAME_HINTS.some((h) => name.includes(h))) return false;
  if (name.includes('google') && name.includes('español')) return true;
  return null;
}

function pickBestSpanishFemaleVoice(voices) {
  if (!voices || voices.length === 0) return null;

  const esVoices = voices.filter((v) => (v.lang || '').toLowerCase().startsWith('es'));
  if (esVoices.length === 0) return null;

  const tiers = [
    esVoices.filter((v) => v.lang === 'es-CL' && isLikelyFemale(v) === true),
    esVoices.filter((v) => v.lang === 'es-CL' && isLikelyFemale(v) !== false),
    esVoices.filter((v) =>
      ['es-419', 'es-MX', 'es-US', 'es-CO', 'es-AR', 'es-PE'].includes(v.lang) &&
      isLikelyFemale(v) === true
    ),
    esVoices.filter((v) => isLikelyFemale(v) === true),
    esVoices.filter((v) => isLikelyFemale(v) !== false),
    esVoices,
  ];

  for (const tier of tiers) {
    if (tier.length > 0) return tier[0];
  }
  return null;
}

function sanitizeForSpeech(text) {
  if (!text) return '';
  return String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-•·]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/—/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useLyaVoice() {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const [voice, setVoice] = useState(null);

  const recognitionRef = useRef(null);
  const onFinalRef = useRef(null);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    setTtsSupported(true);

    const loadVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const best = pickBestSpanishFemaleVoice(voices);
      if (best) setVoice(best);
    };

    loadVoice();
    window.speechSynthesis.onvoiceschanged = loadVoice;
    return () => {
      try { window.speechSynthesis.onvoiceschanged = null; } catch (_) { /* noop */ }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSttSupported(false);
      return;
    }
    setSttSupported(true);
    const rec = new SR();
    rec.lang = 'es-CL';
    rec.continuous = false;
    rec.interimResults = true;

    rec.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      setInterim(interimText);
      if (finalText && onFinalRef.current) {
        onFinalRef.current(finalText.trim());
      }
    };

    rec.onerror = (e) => {
      setError(
        e.error === 'not-allowed'
          ? 'Permiso de micrófono denegado. Habilítalo en el navegador.'
          : e.error === 'no-speech'
            ? null
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
  }, []);

  const startListening = useCallback((onFinal) => {
    if (!recognitionRef.current) return;
    onFinalRef.current = onFinal;
    setError(null);
    try {
      if (window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
      recognitionRef.current.start();
      setListening(true);
    } catch (_) {
      try { recognitionRef.current.stop(); } catch (__) { /* noop */ }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (_) { /* noop */ }
  }, []);

  const speak = useCallback((text) => {
    if (!ttsSupported || !text) return;
    const clean = sanitizeForSpeech(text);
    if (!clean) return;

    try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = voice?.lang || 'es-CL';
    if (voice) u.voice = voice;
    u.rate = 1.0;
    u.pitch = 1.05;
    u.volume = 1.0;

    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);

    utteranceRef.current = u;
    window.speechSynthesis.speak(u);
  }, [ttsSupported, voice]);

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
    setSpeaking(false);
  }, [ttsSupported]);

  return {
    sttSupported,
    ttsSupported,
    listening,
    speaking,
    interim,
    error,
    voiceName: voice?.name || null,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}