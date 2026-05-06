// analyzeTaxSituation — Capa 2 Pyme
// Recibe pymeProfileId, ejecuta InvokeLLM con contexto tributario chileno (Ley 21.713, LIR Pro-Pyme,
// SII F29/F22), calcula financialHealthScore 0-100 y crea TaxAlerts pendientes (vencimientos IVA/PPM/Renta,
// beneficios disponibles, multas detectadas).
// Devuelve { score, label, alerts: [...] }.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SCHEMA = {
  type: 'object',
  properties: {
    financialHealthScore: { type: 'number', minimum: 0, maximum: 100 },
    financialHealthLabel: {
      type: 'string',
      enum: ['critico', 'en_riesgo', 'estable', 'saludable', 'excelente'],
    },
    summary: { type: 'string' },
    alerts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          alertType: {
            type: 'string',
            enum: [
              'vencimiento_iva',
              'vencimiento_ppm',
              'declaracion_renta',
              'multa_detectada',
              'beneficio_disponible',
              'cambio_normativo',
              'salud_financiera',
            ],
          },
          title: { type: 'string' },
          description: { type: 'string' },
          amountAtRisk: { type: 'number' },
          deadline: { type: 'string' },
          priority: { type: 'string', enum: ['critico', 'alto', 'medio', 'bajo'] },
          actionRequired: { type: 'string' },
          siiFormReference: { type: 'string' },
          legalBasis: { type: 'string' },
        },
        required: ['alertType', 'title', 'description', 'priority'],
      },
    },
  },
  required: ['financialHealthScore', 'financialHealthLabel', 'alerts'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pymeProfileId } = await req.json();
    if (!pymeProfileId) {
      return Response.json({ error: 'Falta pymeProfileId' }, { status: 400 });
    }

    const pyme = await base44.entities.PymeProfile.get(pymeProfileId);
    if (!pyme) {
      return Response.json({ error: 'Pyme no encontrada' }, { status: 404 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = `Eres un contador-auditor experto en tributación chilena (LIR, Código Tributario, Ley 21.713 modernización tributaria, régimen Pro-Pyme y Pro-Pyme Transparente, IVA Ley 825, F29 mensual y F22 anual).

Hoy es ${today}. Analiza la siguiente pyme chilena y entrega:
1. Score de salud financiera 0-100 considerando régimen tributario, facturación, próximo vencimiento, tipo societario.
2. Etiqueta cualitativa: critico (<30), en_riesgo (30-49), estable (50-69), saludable (70-84), excelente (85-100).
3. Resumen ejecutivo de 1-2 frases en lenguaje pyme directo.
4. Lista de 3 a 5 alertas accionables (vencimientos IVA/PPM, declaración renta, beneficios LIR Pro-Pyme disponibles, riesgos de multa SII). Cada alerta con prioridad, fecha límite realista (próximos 60 días), monto en riesgo en CLP cuando aplique, formulario SII referenciado y base legal.

Datos de la pyme:
- Razón social: ${pyme.businessName}
- RUT: ${pyme.rut}
- Tipo: ${pyme.businessType}
- Giro: ${pyme.economicActivity || 'No declarado'}
- Régimen tributario: ${pyme.taxRegime}
- Facturación mensual aprox: ${pyme.monthlyRevenue ? `$${pyme.monthlyRevenue.toLocaleString('es-CL')} CLP` : 'No declarada'}
- Obligación IVA: ${pyme.vatObligations ? 'Sí (F29 mensual)' : 'No'}
- Empleados: ${pyme.employeeCount || 0}
- Región: ${pyme.region || 'No declarada'}

Responde estrictamente en el JSON schema indicado.`;

    const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: SCHEMA,
      model: 'gemini_3_flash',
    });

    // Persist score on pyme
    await base44.entities.PymeProfile.update(pymeProfileId, {
      financialHealthScore: analysis.financialHealthScore,
      financialHealthLabel: analysis.financialHealthLabel,
      lastAnalysisAt: new Date().toISOString(),
    });

    // Persist alerts
    const created = [];
    for (const a of analysis.alerts || []) {
      const rec = await base44.entities.TaxAlert.create({
        pymeProfileId,
        alertType: a.alertType,
        title: a.title,
        description: a.description,
        amountAtRisk: a.amountAtRisk,
        deadline: a.deadline,
        priority: a.priority,
        actionRequired: a.actionRequired,
        siiFormReference: a.siiFormReference,
        legalBasis: a.legalBasis,
        status: 'pendiente',
      });
      created.push(rec);
    }

    return Response.json({
      success: true,
      score: analysis.financialHealthScore,
      label: analysis.financialHealthLabel,
      summary: analysis.summary,
      alertsCreated: created.length,
      alerts: created,
    });
  } catch (error) {
    console.error('[analyzeTaxSituation] error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});