// elevenLabsSTT — Speech-to-Text profesional con ElevenLabs Scribe.
// Recibe audio (base64 webm/mp3/wav), devuelve transcripción en español.
//
// Modelo: scribe_v1 (multilingüe, alta precisión en es-CL).
// Reemplaza Web Speech API en navegadores que no la soportan (Safari iOS principalmente).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    const {
      audioBase64,
      mimeType = 'audio/webm',
      languageCode = 'spa', // ISO 639-3
    } = await req.json();

    if (!audioBase64) {
      return Response.json({ error: 'audioBase64 requerido' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json(
        { error: 'ElevenLabs no configurado' },
        { status: 503 }
      );
    }

    // Decode base64 a Blob
    const binary = atob(audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const audioBlob = new Blob([bytes], { type: mimeType });

    // Construir multipart form-data para ElevenLabs Scribe
    const form = new FormData();
    form.append('file', audioBlob, `recording.${mimeType.split('/')[1] || 'webm'}`);
    form.append('model_id', 'scribe_v1');
    form.append('language_code', languageCode);
    form.append('tag_audio_events', 'false');
    form.append('diarize', 'false');

    const sttResponse = await fetch(`${ELEVENLABS_API_BASE}/speech-to-text`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: form,
    });

    if (!sttResponse.ok) {
      const errText = await sttResponse.text();
      console.error('ElevenLabs STT error:', sttResponse.status, errText);
      return Response.json(
        {
          error: `ElevenLabs STT error ${sttResponse.status}`,
          details: errText.substring(0, 300),
        },
        { status: 502 }
      );
    }

    const result = await sttResponse.json();
    const transcript = (result.text || '').trim();

    return Response.json({
      transcript,
      languageDetected: result.language_code || languageCode,
      confidence: result.language_probability || null,
      durationSeconds: result.duration || null,
    });
  } catch (error) {
    console.error('elevenLabsSTT error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});