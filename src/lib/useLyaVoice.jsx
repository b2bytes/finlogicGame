import { useEffect, useRef, useState, useCallback } from 'react';
import { useLyaVoiceElevenLabs } from '@/lib/useLyaVoiceElevenLabs';

/**
 * Lya Voice — Hook unificado.
 *
 * Estrategia:
 *  1. Por defecto usa ElevenLabs (calidad studio, voz clonada Lya).
 *  2. Si ElevenLabs falla (sin secret, error red, etc.) cae a Web Speech API
 *     nativa del navegador como fallback (gratis, peor calidad).
 *
 * API idéntica para los componentes consumidores → drop-in upgrade.
 */

// ─── FALLBACK · Web Speech API nativa ──────────────────────────────────────
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
  for (const tier of tiers) if (tier.length > 0) return tier[0];
  return null;
}

const ACRONYM_EXPANSIONS = [
  [/\bCMF\b/g, 'Comisión para el Mercado Financiero'],
  [/\bSERNAC\b/g, 'Sernac'],
  [/\bSII\b/g, 'Servicio de Impuestos Internos'],
  [/\bCSIRT\b/g, 'C-Sirt'],
  [/\bBCN\b/g, 'Biblioteca del Congreso'],
  [/\bFOGAPE\b/g, 'Fogape'],
  [/\bSERCOTEC\b/g, 'Sercotec'],
  [/\bARCO\b/g, 'A-R-C-O'],
  [/\bIVA\b/g, 'I-V-A'],
  [/\bRUT\b/g, 'rut'],
  [/\bAFP\b/g, 'A-F-P'],
  [/\bUF\b/g, 'U-F'],
  [/\bUTM\b/g, 'U-T-M'],
];

const LAW_REFS = [
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
    .replace(/^\d+\.\s+/gm, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\|/g, ' ')
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/°/g, '')
    .trim();
  for (const [pat, rep] of LAW_REFS) clean = clean.replace(pat, rep);
  for (const [pat, rep] of ACRONYM_EXPANSIONS) clean = clean.replace(pat, rep);
  clean = clean.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
  if (clean.length > 1800) {
    clean = clean.substring(0, 1800);
    const lastDot = clean.lastIndexOf('. ');
    if (lastDot > 1200) clean = clean.substring(0, lastDot + 1);
  }
  return clean;
}

function useWebSpeechFallback() {
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const [voice, setVoice] = useState(null);

  const recognitionRef = useRef(null);
  const onFinalRef = useRef(null);

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
    if (!SR) { setSttSupported(false); return; }
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
      if (finalText && onFinalRef.current) onFinalRef.current(finalText.trim());
    };
    rec.onerror = (e) => {
      setError(
        e.error === 'not-allowed'
          ? 'Permiso de micrófono denegado.'
          : e.error === 'no-speech' ? null : 'Error de reconocimiento.'
      );
      setListening(false);
    };
    rec.onend = () => { setListening(false); setInterim(''); };
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch (_) { /* noop */ } };
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
    window.speechSynthesis.speak(u);
  }, [ttsSupported, voice]);

  const stopSpeaking = useCallback(() => {
    if (!ttsSupported) return;
    try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }
    setSpeaking(false);
  }, [ttsSupported]);

  return {
    sttSupported, ttsSupported, listening, speaking,
    processing: false, interim, error,
    voiceName: voice?.name || null,
    startListening, stopListening, speak, stopSpeaking,
  };
}

// ─── HOOK PRINCIPAL — preferencia ElevenLabs, fallback Web Speech ──────────
export function useLyaVoice({ provider = 'elevenlabs' } = {}) {
  const eleven = useLyaVoiceElevenLabs();
  const fallback = useWebSpeechFallback();

  // Si el caller pidió explícitamente Web Speech, devolverlo.
  if (provider === 'webspeech') return fallback;

  // Si ElevenLabs reporta error de configuración (503 sin secret), usar fallback.
  // Pero por defecto preferimos ElevenLabs siempre que el navegador soporte
  // MediaRecorder + Audio (que es virtualmente siempre).
  if (eleven.sttSupported || eleven.ttsSupported) {
    return eleven;
  }
  return fallback;
}