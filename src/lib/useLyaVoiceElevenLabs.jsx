import { useEffect, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useLyaVoiceElevenLabs — Hook profesional de voz para Lya con ElevenLabs.
 *
 * TTS: ElevenLabs Multilingual v2 con voz clonada (vía función backend elevenLabsTTS).
 * STT: MediaRecorder + ElevenLabs Scribe v1 (vía función backend elevenLabsSTT).
 *
 * Misma API que useLyaVoice (Web Speech) → drop-in upgrade.
 * Calidad de voz studio-grade, español de Chile, tono cálido amiga abogada.
 */

// Sanitización rápida del texto antes de mandarlo a ElevenLabs (mantenemos
// expansiones de siglas y leyes que ya teníamos en useLyaVoice).
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
  [/\bIVA\b/g, 'I-V-A'],
  [/\bRUT\b/g, 'rut'],
  [/\bAFP\b/g, 'A-F-P'],
  [/\bF22\b/g, 'formulario 22'],
  [/\bF29\b/g, 'formulario 29'],
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
    .replace(/—/g, ', ')
    .replace(/–/g, ', ')
    .replace(/°/g, '')
    .trim();

  for (const [pat, rep] of LAW_REFS) clean = clean.replace(pat, rep);
  for (const [pat, rep] of ACRONYM_EXPANSIONS) clean = clean.replace(pat, rep);

  clean = clean.replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();

  if (clean.length > 2800) {
    const lastDot = clean.substring(0, 2800).lastIndexOf('. ');
    clean = lastDot > 2000 ? clean.substring(0, lastDot + 1) : clean.substring(0, 2800) + '.';
  }
  return clean;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      // result viene como "data:audio/webm;base64,XXXX"
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function useLyaVoiceElevenLabs() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [processing, setProcessing] = useState(false); // STT en curso
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioElRef = useRef(null);
  const onFinalRef = useRef(null);

  // Capabilities — siempre disponibles si el navegador tiene MediaRecorder + Audio
  const sttSupported =
    typeof window !== 'undefined' &&
    !!window.MediaRecorder &&
    !!navigator.mediaDevices?.getUserMedia;
  const ttsSupported = typeof window !== 'undefined' && !!window.Audio;

  // ── STT: graba audio del mic, lo manda a elevenLabsSTT, devuelve transcripción
  const startListening = useCallback(async (onFinal) => {
    if (!sttSupported) {
      setError('Tu navegador no soporta grabación de audio.');
      return;
    }
    onFinalRef.current = onFinal;
    setError(null);
    setInterim('');

    try {
      // Detener TTS si está hablando (no superponer)
      if (audioElRef.current) {
        try { audioElRef.current.pause(); } catch (_) { /* noop */ }
        setSpeaking(false);
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Preferir webm/opus (universal y comprimido)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // Liberar mic
        try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) { /* noop */ }
        streamRef.current = null;
        setListening(false);

        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 1000) {
          // Audio muy corto (<1KB) — probablemente click sin hablar
          return;
        }

        setProcessing(true);
        setInterim('Transcribiendo…');
        try {
          const audioBase64 = await blobToBase64(audioBlob);
          const res = await base44.functions.invoke('elevenLabsSTT', {
            audioBase64,
            mimeType,
            languageCode: 'spa',
          });
          const transcript = res.data?.transcript || '';
          setInterim('');
          if (transcript && onFinalRef.current) {
            onFinalRef.current(transcript);
          } else if (!transcript) {
            setError('No pude entender el audio. Intenta de nuevo, hablando claro.');
          }
        } catch (err) {
          console.error('STT error:', err);
          setError('Error al transcribir. Intenta de nuevo.');
        } finally {
          setProcessing(false);
        }
      };

      recorder.start();
      setListening(true);
    } catch (err) {
      console.error('getUserMedia error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Permiso de micrófono denegado. Habilítalo en el navegador.'
          : 'No pude acceder al micrófono.'
      );
      setListening(false);
    }
  }, [sttSupported]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (_) { /* noop */ }
    }
  }, []);

  // ── TTS: manda texto a elevenLabsTTS, reproduce el MP3 resultante
  const speak = useCallback(async (text) => {
    if (!ttsSupported || !text) return;
    const clean = sanitizeForSpeech(text);
    if (!clean) return;

    // Detener cualquier audio previo
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.src = '';
      } catch (_) { /* noop */ }
    }

    setSpeaking(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('elevenLabsTTS', { text: clean });
      const audioBase64 = res.data?.audioBase64;
      const mimeType = res.data?.mimeType || 'audio/mpeg';
      if (!audioBase64) {
        throw new Error('Respuesta TTS vacía');
      }
      const src = `data:${mimeType};base64,${audioBase64}`;
      const audio = new Audio(src);
      audioElRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => {
        setSpeaking(false);
        setError('Error al reproducir audio.');
      };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setSpeaking(false);
      setError('No pude generar la voz. Intenta de nuevo.');
    }
  }, [ttsSupported]);

  const stopSpeaking = useCallback(() => {
    if (audioElRef.current) {
      try {
        audioElRef.current.pause();
        audioElRef.current.currentTime = 0;
      } catch (_) { /* noop */ }
    }
    setSpeaking(false);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch (_) { /* noop */ }
      try { audioElRef.current?.pause(); } catch (_) { /* noop */ }
    };
  }, []);

  return {
    sttSupported,
    ttsSupported,
    listening,
    speaking,
    processing,
    interim,
    error,
    voiceName: 'Lya · Camila es-CL',
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
}