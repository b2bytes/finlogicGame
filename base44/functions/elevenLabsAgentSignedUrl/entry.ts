// elevenLabsAgentSignedUrl — Genera una signed URL para conectarse al
// Conversational Agent de ElevenLabs (Lya) vía WebSocket bidireccional.
//
// La signed URL es de corta duración y permite que el navegador abra una
// conversación en vivo con el agente sin exponer el API key.
//
// Reference: https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get-signed-url

Deno.serve(async (req) => {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const agentId = Deno.env.get('ELEVENLABS_AGENT_ID');

    if (!apiKey || !agentId) {
      return Response.json(
        { error: 'ElevenLabs Agent no configurado (falta API key o agent ID)' },
        { status: 503 }
      );
    }

    const url = `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'xi-api-key': apiKey },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('ElevenLabs signed URL error:', res.status, errText);
      return Response.json(
        { error: `ElevenLabs error ${res.status}`, details: errText.substring(0, 300) },
        { status: 502 }
      );
    }

    const data = await res.json();
    return Response.json({
      signedUrl: data.signed_url,
      agentId,
    });
  } catch (error) {
    console.error('elevenLabsAgentSignedUrl error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});