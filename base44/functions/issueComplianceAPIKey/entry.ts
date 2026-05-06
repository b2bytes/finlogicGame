// Genera una API key nueva para un cliente B2B. Solo admin.
// Devuelve la key en texto plano UNA SOLA VEZ. Se guarda como hash.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateApiKey() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `fl_live_${random}`;
}

const PLAN_LIMITS = {
  base: 10000,
  professional: 50000,
  enterprise: 999999999,
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });

    const { organizationName, rut, contactEmail, plan = 'base' } = await req.json();
    if (!organizationName || !contactEmail) {
      return Response.json({ error: 'organizationName y contactEmail son obligatorios' }, { status: 400 });
    }

    const apiKey = generateApiKey();
    const apiKeyHash = await sha256(apiKey);
    const apiKeyPrefix = apiKey.substring(0, 12);

    const now = new Date();
    const renewal = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const record = await base44.asServiceRole.entities.ComplianceAPIKey.create({
      organizationName,
      rut: rut || '',
      contactEmail,
      apiKeyHash,
      apiKeyPrefix,
      plan,
      monthlyCallLimit: PLAN_LIMITS[plan] || 10000,
      callsUsedThisMonth: 0,
      lastResetDate: now.toISOString(),
      enabledEndpoints: ['check-tmc', 'verify-entity', 'regulatory-impact', 'fraud-pattern-match', 'consumer-rights-check'],
      status: 'trialing',
      contractStart: now.toISOString().split('T')[0],
      renewalDate: renewal.toISOString().split('T')[0],
    });

    return Response.json({
      success: true,
      apiKey, // ⚠️ solo se muestra una vez
      record: { id: record.id, organizationName, plan, apiKeyPrefix },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});