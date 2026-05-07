// elevenLabsGetAgent — Lee la configuración actual del agente.
// Útil para inspeccionar qué LLM/voz/tools están configurados.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const agentId = Deno.env.get('ELEVENLABS_AGENT_ID');
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': apiKey } }
    );
    const data = await res.json();
    return Response.json({
      agent_id: data?.agent_id,
      name: data?.name,
      prompt_block: data?.conversation_config?.agent?.prompt,
      first_message: data?.conversation_config?.agent?.first_message,
      language: data?.conversation_config?.agent?.language,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});