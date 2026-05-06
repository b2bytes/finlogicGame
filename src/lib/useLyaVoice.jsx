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

// Siglas que el TTS pronuncia mal (letra por letra raro o se traba).
// Las expandimos a su nombre real en español chileno.
const ACRONYM_EXPANSIONS = [
  [/\bCMF\b/g, 'Comisión para el Mercado Financiero'],
  [/\bSERNAC\b/g, 'Sernac'],
  [/\bSII\b/g, 'Servicio de Impuestos Internos'],
  [/\bCSIRT\b/g, 'C-Sirt'],
  [/\bBCN\b/g, 'Biblioteca del Congreso'],
  [/\bFOGAPE\b/g, 'Fogape'],
  [/\bSERCOTEC\b/g, 'Sercotec'],
  [/\bARCO\b/g, 'A-R-C-O'],
  [/\bTMC\b/g, 'Tasa Máxima Convencional'],
  [/\bCAE\b/g, 'C-A-E'],
  [/\bTIR\b/g, 'T-I-R'],
  [/\bTER\b/g, 'T-E-R'],
  [/\bIVA\b/g, 'I-V-A'],
  [/\bRUT\b/g, 'rut'],
  [/\bAFP\b/g, 'A-F-P'],
  [/\bNCG\b/g, 'norma de carácter general'],
  [/\bLPC\b/g, 'Ley del Consumidor'],
  [/\bLIR\b/g, 'Ley de la Renta'],
  [/\bF22\b/g, 'formulario 22'],
  [/\bF29\b/g, 'formulario 29'],
  [/\bUF\b/g, 'U-F'],
  [/\bUTM\b/g, 'U-T-M'],
];

// Lectura natural de leyes y artículos
const LAW_REFS = [
  // "Ley 19.496" → "Ley diecinueve mil cuatrocientos noventa y seis" es complejo;
  // dejamos que el TTS lo lea como número con punto eliminado
  [/Ley\s+(\d{1,2})\.(\d{3})/g, 'Ley $1$2'],
  [/Art\.\s*(\d+)/g, 'artículo $1'],
  [/Artículo\s*(\d+)°?/g, 'artículo $1'],
];

function sanitizeForSpeech(text) {
  if (!text) return '';
  let clean = String(text)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-•·]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '') // listas numeradas "1. " → quita marcador
    .replace(/https?:\/\/\S+/g, '') // urls (TTS las lee carácter por carácter)
    .replace(/\|/g, ' ')
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/°/g, '')
    .replace(/\$\s?(\d)/g, '$$$1') // mantiene "$" pegado al número
    .trim();

  // Expandir leyes/artículos PRIMERO (antes de tocar números)
  for (const [pat, rep] of LAW_REFS) clean = clean.replace(pat, rep);
  // Luego siglas
  for (const [pat, rep] of ACRONYM_EXPANSIONS) clean = clean.replace(pat, rep);

  // Limpieza final de espacios
  clean = clean.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();

  // TTS móvil corta enunciados largos (~32k chars es teórico, pero en práctica
  // muchos engines fallan >2-3k). Truncamos a 1800 con cierre limpio.
  if (clean.length > 1800) {
    clean = clean.substring(0, 1800);
    const lastDot = clean.lastIndexOf('. ');
    if (lastDot > 1200) clean = clean.substring(0, lastDot + 1);
  }
  return clean;
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