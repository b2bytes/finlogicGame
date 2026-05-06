import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// calculateMRR — CRON diario 00:05 AM Chile
// Agrega Subscription activas + ComplianceAPIKey activos → calcula MRR
// Crea RevenueSnapshot diario + detecta MRR drop (>10%) → FinancialAlert

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verificación admin (en caso de invocación manual)
    let isAdmin = false;
    try {
      const user = await base44.auth.me();
      isAdmin = user?.role === 'admin';
    } catch (_) {
      isAdmin = false;
    }
    // Para invocación CRON sin auth, asServiceRole sigue funcionando

    const today = new Date().toISOString().split('T')[0];

    // 1. Suscripciones Pro activas
    const proSubs = await base44.asServiceRole.entities.Subscription.filter(
      { plan: 'pro', status: 'active' },
      '-currentPeriodStart',
      500
    ).catch(() => []);
    const activeProSubscribers = proSubs?.length || 0;
    const mrrPro = activeProSubscribers * 3990;

    // 2. Compliance API Keys activas
    const apiKeys = await base44.asServiceRole.entities.ComplianceAPIKey.filter(
      { status: 'active' },
      '-created_date',
      200
    ).catch(() => []);
    const activeB2BClients = apiKeys?.length || 0;
    const planPrices = { base: 490000, professional: 1200000, enterprise: 3000000 };
    const mrrComplianceAPI = (apiKeys || []).reduce(
      (sum, k) => sum + (planPrices[k.plan] || 490000),
      0
    );

    const mrrEmbed = 0;
    const mrrInsights = 0;
    const totalMRR = mrrPro + mrrComplianceAPI + mrrEmbed + mrrInsights;
    const totalARR = totalMRR * 12;

    // 3. Calcular new/churn MRR comparando con snapshot anterior
    const prevSnapshots = await base44.asServiceRole.entities.RevenueSnapshot.list(
      '-snapshotDate',
      1
    ).catch(() => []);
    const prev = prevSnapshots?.[0];
    const prevMRR = prev?.totalMRR || 0;
    const netNewMRR = totalMRR - prevMRR;
    const newMRR = netNewMRR > 0 ? netNewMRR : 0;
    const churnMRR = netNewMRR < 0 ? Math.abs(netNewMRR) : 0;

    // 4. Free users count (UserProfile sin Pro)
    const allProfiles = await base44.asServiceRole.entities.UserProfile.filter(
      { subscriptionTier: 'free' },
      '-created_date',
      500
    ).catch(() => []);
    const freeUsers = allProfiles?.length || 0;

    // 5. Resumen ejecutivo en lenguaje natural
    let executiveSummary = `MRR ${totalMRR.toLocaleString('es-CL')} CLP. ${activeProSubscribers} Pro · ${activeB2BClients} B2B · ${freeUsers} Free.`;
    if (prevMRR > 0) {
      const pct = ((totalMRR - prevMRR) / prevMRR) * 100;
      executiveSummary += ` ${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% vs ayer.`;
    }

    // 6. Crear snapshot
    await base44.asServiceRole.entities.RevenueSnapshot.create({
      snapshotDate: today,
      mrrPro,
      mrrComplianceAPI,
      mrrEmbed,
      mrrInsights,
      totalMRR,
      totalARR,
      activeProSubscribers,
      activeB2BClients,
      freeUsers,
      newMRR,
      churnMRR,
      netNewMRR,
      executiveSummary,
    });

    // 7. Detectar caída >10% MRR → FinancialAlert
    if (prevMRR > 0) {
      const dropPct = ((prevMRR - totalMRR) / prevMRR) * 100;
      if (dropPct > 10) {
        await base44.asServiceRole.entities.FinancialAlert.create({
          alertType: 'mrr_drop',
          severity: dropPct > 25 ? 'critical' : 'high',
          title: `MRR cayó ${dropPct.toFixed(1)}%`,
          message: `MRR ayer: ${prevMRR.toLocaleString('es-CL')} CLP. Hoy: ${totalMRR.toLocaleString('es-CL')} CLP. Investigar churn.`,
          amountAtRisk: prevMRR - totalMRR,
        });
      }
    }

    return Response.json({
      success: true,
      snapshot: {
        date: today,
        totalMRR,
        totalARR,
        activeProSubscribers,
        activeB2BClients,
        freeUsers,
        netNewMRR,
        executiveSummary,
      },
    });
  } catch (error) {
    console.error('calculateMRR error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});