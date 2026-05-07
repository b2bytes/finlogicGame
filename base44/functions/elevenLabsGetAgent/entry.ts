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
    const promptBlock = data?.conversation_config?.agent?.prompt || {};
    return Response.json({
      agent_id: data?.agent_id,
      name: data?.name,
      llm: promptBlock.llm,
      tools_count: (promptBlock.tools || []).length,
      tool_ids_count: (promptBlock.tool_ids || []).length,
      built_in_tools: promptBlock.built_in_tools,
      tools_summary: (promptBlock.tools || []).map((t) => ({
        name: t.name,
        type: t.type,
        expects_response: t.expects_response,
        has_parameters: !!t.parameters,
        param_keys: t.parameters ? Object.keys(t.parameters?.properties || {}) : [],
      })),
      first_tool_full: (promptBlock.tools || [])[0] || null,
      first_message: data?.conversation_config?.agent?.first_message,
      language: data?.conversation_config?.agent?.language,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});