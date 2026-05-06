// cmfRealAPI — Integración REAL con datos económicos oficiales chilenos
//
// Fuentes:
//  · mindicador.cl  → Indicadores diarios (UF, Dólar, Euro, UTM, IPC, IMACEC, TPM, Libra Cobre)
//                     Datos oficiales CMF + Banco Central, API REST pública gratuita.
//
// Este endpoint expone tres acciones:
//   action="indicators"     → snapshot del día (UF, dólar, euro, UTM, TPM, IPC, IMACEC)
//   action="history"        → histórico de un indicador (default: últimos 30 días)
//   action="convert"        → conversor UF↔CLP, USD↔CLP usando valor real del día
//
// Cache en memoria: 30 minutos (los indicadores cambian 1x al día como máximo).

let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchMindicador() {
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
    return { data: cache.data, fromCache: true };
  }
  const res = await fetch('https://mindicador.cl/api');
  if (!res.ok) throw new Error(`mindicador.cl status ${res.status}`);
  const data = await res.json();
  cache = { data, timestamp: now };
  return { data, fromCache: false };
}

async function fetchHistory(indicator) {
  const res = await fetch(`https://mindicador.cl/api/${indicator}`);
  if (!res.ok) throw new Error(`mindicador.cl/${indicator} status ${res.status}`);
  return await res.json();
}

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

Deno.serve(async (req) => {
  try {
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const action = body.action || 'indicators';

    if (action === 'indicators') {
      const { data, fromCache } = await fetchMindicador();
      const snapshot = {
        fecha: data.fecha,
        uf: { valor: data.uf?.valor, unidad: 'CLP', formatted: formatCLP(data.uf?.valor || 0) },
        dolar: { valor: data.dolar?.valor, unidad: 'CLP', formatted: formatCLP(data.dolar?.valor || 0) },
        euro: { valor: data.euro?.valor, unidad: 'CLP', formatted: formatCLP(data.euro?.valor || 0) },
        utm: { valor: data.utm?.valor, unidad: 'CLP', formatted: formatCLP(data.utm?.valor || 0) },
        ipc: { valor: data.ipc?.valor, unidad: '%', fecha: data.ipc?.fecha },
        tpm: { valor: data.tpm?.valor, unidad: '%', fecha: data.tpm?.fecha },
        imacec: { valor: data.imacec?.valor, unidad: '%', fecha: data.imacec?.fecha },
        libra_cobre: { valor: data.libra_cobre?.valor, unidad: 'USD', fecha: data.libra_cobre?.fecha },
      };
      return Response.json({
        success: true,
        source: 'mindicador.cl (oficial CMF/BCCh)',
        cached: fromCache,
        autor: data.autor,
        snapshot,
      });
    }

    if (action === 'history') {
      const indicator = body.indicator || 'uf';
      const days = Math.min(Math.max(parseInt(body.days) || 30, 1), 180);
      const series = await fetchHistory(indicator);
      const recent = (series.serie || []).slice(0, days).reverse();
      return Response.json({
        success: true,
        indicator,
        unit: series.unidad_medida,
        nombre: series.nombre,
        points: recent.map((p) => ({ fecha: p.fecha, valor: p.valor })),
      });
    }

    if (action === 'convert') {
      const { data } = await fetchMindicador();
      const amount = parseFloat(body.amount);
      const from = (body.from || '').toLowerCase();
      const to = (body.to || '').toLowerCase();
      if (!isFinite(amount)) {
        return Response.json({ success: false, error: 'amount inválido' }, { status: 400 });
      }
      const ufVal = data.uf?.valor;
      const usdVal = data.dolar?.valor;
      let result, formula;
      if (from === 'uf' && to === 'clp') { result = amount * ufVal; formula = `${amount} UF × ${formatCLP(ufVal)}`; }
      else if (from === 'clp' && to === 'uf') { result = amount / ufVal; formula = `${formatCLP(amount)} ÷ ${formatCLP(ufVal)}`; }
      else if (from === 'usd' && to === 'clp') { result = amount * usdVal; formula = `${amount} USD × ${formatCLP(usdVal)}`; }
      else if (from === 'clp' && to === 'usd') { result = amount / usdVal; formula = `${formatCLP(amount)} ÷ ${formatCLP(usdVal)}`; }
      else {
        return Response.json({ success: false, error: 'conversión no soportada (usa uf/clp/usd)' }, { status: 400 });
      }
      return Response.json({
        success: true,
        from, to, amount, result,
        formatted: to === 'clp' ? formatCLP(result) : result.toFixed(4),
        formula,
        sourceDate: data.fecha,
      });
    }

    return Response.json({ success: false, error: `action no reconocida: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});