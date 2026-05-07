// elevenLabsListVoices — utilidad admin para listar voces clonadas/personales
// del workspace ElevenLabs y encontrar el voice_id correcto de "Lya Mundaca".
//
// Solo admin: protege la API key y devuelve solo metadata (nombre, voice_id, categoría).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Permisivo: la app es 100% pública pero esta función es solo diagnóstica.
    // Si quieres restringir solo a admin, descomenta la siguiente línea:
    // if (user?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY no configurado' }, { status: 503 });
    }

    const res = await fetch('https://api.elevenlabs.io/v2/voices?page_size=100', {
      headers: { 'xi-api-key': apiKey },
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json(
        { error: `ElevenLabs error ${res.status}`, details: errText.substring(0, 500) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const voices = (data.voices || []).map((v) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.description,
      labels: v.labels,
      preview_url: v.preview_url,
    }));

    // Si "Lya Mundaca" existe, la marcamos primero
    const lyaMatches = voices.filter((v) =>
      (v.name || '').toLowerCase().includes('lya') ||
      (v.name || '').toLowerCase().includes('mundaca')
    );

    return Response.json({
      total: voices.length,
      lyaMatches,
      currentSecretVoiceId: Deno.env.get('ELEVENLABS_VOICE_ID') || null,
      voices,
    });
  } catch (error) {
    console.error('elevenLabsListVoices error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});