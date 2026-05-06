// Compliance API B2B — endpoint público autenticado por API Key (header x-api-key)
// Endpoints disponibles:
//   POST /check-tmc            { rate, productType }
//   POST /verify-entity        { rut | name }
//   POST /regulatory-impact    { module, query }
//   POST /fraud-pattern-match  { description }
//   POST /consumer-rights-check{ situation }
//
// Uso desde frontend interno: base44.functions.invoke('lyaComplianceAPIEndpoint', { endpoint, payload, apiKey })
// Uso externo: POST al URL público con header x-api-key y body { endpoint, payload }

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Aceptamos body con apiKey o header x-api-key
    const body = await req.json().catch(() => ({}));
    const apiKey = body.apiKey || req.headers.get('x-api-key');
    const endpoint = body.endpoint;
    const payload = body.payload || {};

    if (!apiKey) {
      return Response.json({ error: 'Falta API key', code: 'MISSING_API_KEY' }, { status: 401 });
    }
    if (!endpoint) {
      return Response.json({ error: 'Falta endpoint', code: 'MISSING_ENDPOINT' }, { status: 400 });
    }

    // Buscar la key por hash
    const keyHash = await sha256(apiKey);
    const matches = await base44.asServiceRole.entities.ComplianceAPIKey.filter({ apiKeyHash: keyHash });
    const keyRecord = matches?.[0];

    if (!keyRecord) {
      return Response.json({ error: 'API key inválida', code: 'INVALID_KEY' }, { status: 401 });
    }
    if (keyRecord.status !== 'active' && keyRecord.status !== 'trialing') {
      return Response.json({ error: `API key ${keyRecord.status}`, code: 'KEY_DISABLED' }, { status: 403 });
    }
    if (!keyRecord.enabledEndpoints?.includes(endpoint)) {
      return Response.json({ error: `Endpoint ${endpoint} no habilitado en tu plan`, code: 'ENDPOINT_NOT_ENABLED' }, { status: 403 });
    }
    if (keyRecord.callsUsedThisMonth >= keyRecord.monthlyCallLimit) {
      return Response.json({ error: 'Límite mensual alcanzado', code: 'QUOTA_EXCEEDED' }, { status: 429 });
    }

    // Procesar endpoint con LLM
    const start = Date.now();
    const result = await processEndpoint(base44, endpoint, payload);
    const latencyMs = Date.now() - start;

    // Incrementar contador
    await base44.asServiceRole.entities.ComplianceAPIKey.update(keyRecord.id, {
      callsUsedThisMonth: (keyRecord.callsUsedThisMonth || 0) + 1,
    });

    return Response.json({
      success: true,
      endpoint,
      latencyMs,
      callsRemaining: keyRecord.monthlyCallLimit - keyRecord.callsUsedThisMonth - 1,
      data: result,
    });
  } catch (error) {
    return Response.json({ error: error.message, code: 'INTERNAL_ERROR' }, { status: 500 });
  }
});

async function processEndpoint(base44, endpoint, payload) {
  const prompts = {
    'check-tmc': `Verifica si la tasa ${payload.rate}% para el producto "${payload.productType}" excede la TMC vigente del Banco Central de Chile. Responde con JSON: { compliant, currentTMC, excess, legalBasis }`,
    'verify-entity': `Verifica si la entidad "${payload.name || payload.rut}" está registrada en el Registro CMF de proveedores fintech (Ley 21.521). JSON: { registered, registrationStatus, lastChecked, notes }`,
    'regulatory-impact': `Analiza el impacto del módulo normativo "${payload.module}" sobre la consulta: "${payload.query}". JSON: { affected, riskLevel, requiredActions, deadlines }`,
    'fraud-pattern-match': `Evalúa si esta descripción coincide con patrones de fraude tipificados en Ley 20.009: "${payload.description}". JSON: { isFraudPattern, patternType, recommendedActions, legalDeadline }`,
    'consumer-rights-check': `Verifica derechos del consumidor (Ley 19.496 + Ley 20.555) aplicables a: "${payload.situation}". JSON: { applicableRights, violations, recommendedClaim }`,
  };

  const prompt = prompts[endpoint];
  if (!prompt) throw new Error(`Endpoint desconocido: ${endpoint}`);

  const schemas = {
    'check-tmc': { type: 'object', properties: { compliant: { type: 'boolean' }, currentTMC: { type: 'number' }, excess: { type: 'number' }, legalBasis: { type: 'string' } } },
    'verify-entity': { type: 'object', properties: { registered: { type: 'boolean' }, registrationStatus: { type: 'string' }, lastChecked: { type: 'string' }, notes: { type: 'string' } } },
    'regulatory-impact': { type: 'object', properties: { affected: { type: 'boolean' }, riskLevel: { type: 'string' }, requiredActions: { type: 'array', items: { type: 'string' } }, deadlines: { type: 'array', items: { type: 'string' } } } },
    'fraud-pattern-match': { type: 'object', properties: { isFraudPattern: { type: 'boolean' }, patternType: { type: 'string' }, recommendedActions: { type: 'array', items: { type: 'string' } }, legalDeadline: { type: 'string' } } },
    'consumer-rights-check': { type: 'object', properties: { applicableRights: { type: 'array', items: { type: 'string' } }, violations: { type: 'array', items: { type: 'string' } }, recommendedClaim: { type: 'string' } } },
  };

  return await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: true,
    response_json_schema: schemas[endpoint],
    model: 'gemini_3_flash',
  });
}