// elevenLabsTTS — Text-to-Speech profesional con voz clonada de Lya (ElevenLabs).
// Recibe texto sanitizado, devuelve MP3 base64 listo para <audio src="data:audio/mpeg;base64,...">
//
// Modelo: eleven_multilingual_v2 (calidad superior, español de Chile)
// Voice settings calibrados para tono cálido + empático tipo "amiga abogada chilena".

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    // Permitimos consultas anónimas (zero-friction) — Lya es pública.
    // Si quisiéramos limitar, descomentar:
    // const user = await base44.auth.me();
    // if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { text, voiceId, modelId = 'eleven_multilingual_v2' } = await req.json();

    if (!text || typeof text !== 'string') {
      return Response.json({ error: 'text requerido' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const defaultVoice = Deno.env.get('ELEVENLABS_VOICE_ID');
    const finalVoiceId = voiceId || defaultVoice;

    if (!apiKey || !finalVoiceId) {
      return Response.json(
        { error: 'ElevenLabs no configurado (falta API key o voice ID)' },
        { status: 503 }
      );
    }

    // ElevenLabs cobra por carácter — recortamos a 1500 chars (suficiente para
    // una respuesta completa de Lya). Cierre limpio en último punto.
    let cleanText = text.trim();
    if (cleanText.length > 1500) {
      const cut = cleanText.substring(0, 1500);
      const lastDot = cut.lastIndexOf('. ');
      cleanText = lastDot > 1000 ? cut.substring(0, lastDot + 1) : cut + '.';
    }

    const ttsResponse = await fetch(
      `${ELEVENLABS_API_BASE}/text-to-speech/${finalVoiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: modelId,
          // Calibración Lya: cálida, clara, con leve emoción (amiga abogada chilena).
          // Calibración Camila (es-CL profesional conversacional):
          // - stability 0.45: expresiva, natural, con respiraciones (no robótica)
          // - similarity_boost 0.80: respeta timbre Camila pero deja modular
          // - style 0.55: tono cálido amiga abogada, con emoción real
          // - speaker_boost: mejora claridad sobre fondos ruidosos (mobile)
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.80,
            style: 0.55,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text();
      console.error('ElevenLabs TTS error:', ttsResponse.status, errText);
      return Response.json(
        {
          error: `ElevenLabs error ${ttsResponse.status}`,
          details: errText.substring(0, 300),
        },
        { status: 502 }
      );
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    // Encode a base64 sin desbordar memoria (chunks de 8KB).
    const bytes = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const audioBase64 = btoa(binary);

    return Response.json({
      audioBase64,
      mimeType: 'audio/mpeg',
      charactersUsed: cleanText.length,
      voiceId: finalVoiceId,
      modelId,
    });
  } catch (error) {
    console.error('elevenLabsTTS error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});