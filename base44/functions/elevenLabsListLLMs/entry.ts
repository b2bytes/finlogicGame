// elevenLabsListLLMs — Lista los LLMs disponibles para el agente conversacional.
// Solo admin. Útil para descubrir el nombre exacto del modelo al configurar.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const res = await fetch('https://api.elevenlabs.io/v1/convai/llm-prices', {
      headers: { 'xi-api-key': apiKey },
    });
    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});