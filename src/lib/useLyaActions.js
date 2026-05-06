import { useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useLyaActions — Detector + ejecutor de "acciones reales" sobre datos en vivo CMF.
 *
 * Sobre la navegación pura, este hook permite a Lya RESPONDER con datos reales:
 *   · "¿Cuánto vale la UF hoy?"            → cmfRealAPI indicators
 *   · "Convierte 2 millones a UF"          → cmfRealAPI convert
 *   · "Valor del dólar"                    → cmfRealAPI indicators
 *   · "¿Cuál es la TPM?" / "TPM actual"    → cmfRealAPI indicators
 *
 * 100% local en detección (regex), datos 100% reales vía función backend.
 */

function normalize(t) {
  return (t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Convierte "dos millones", "1.5 millones", "500 mil" → número
function parseAmount(text) {
  const t = normalize(text).replace(/\./g, '').replace(/,/g, '.');
  // patrón con multiplicador
  const m = t.match(/([\d]+(?:\.[\d]+)?)\s*(millones?|mill|millon|mil|k|m)?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (!isFinite(n)) return null;
  const unit = m[2];
  if (unit === 'millones' || unit === 'millon' || unit === 'mill' || unit === 'm') n *= 1_000_000;
  else if (unit === 'mil' || unit === 'k') n *= 1_000;
  return n;
}

function detectIndicatorIntent(text) {
  const n = normalize(text);
  const indicators = [
    { key: 'uf', triggers: ['uf', 'unidad de fomento', 'valor uf'] },
    { key: 'dolar', triggers: ['dolar', 'usd', 'valor dolar', 'tipo de cambio'] },
    { key: 'euro', triggers: ['euro', 'eur'] },
    { key: 'utm', triggers: ['utm', 'unidad tributaria'] },
    { key: 'tpm', triggers: ['tpm', 'tasa politica monetaria', 'tasa de politica'] },
    { key: 'ipc', triggers: ['ipc', 'inflacion'] },
    { key: 'imacec', triggers: ['imacec'] },
    { key: 'libra_cobre', triggers: ['cobre', 'libra de cobre', 'libra cobre'] },
  ];
  // pregunta tipo "cuanto vale", "valor de", "cual es"
  const askingValue = /(cuanto|cu[aá]l|valor|precio|hoy|actual)/.test(n);
  for (const ind of indicators) {
    if (ind.triggers.some((tr) => new RegExp(`(^|\\s)${tr}(\\s|$|\\?)`).test(n))) {
      if (askingValue || ind.triggers.some((tr) => tr.length >= 3 && n.includes(tr))) {
        return ind.key;
      }
    }
  }
  return null;
}

function detectConvertIntent(text) {
  const n = normalize(text);
  // patrones: "convierte X uf a clp", "X uf en pesos", "cuanto son X clp en uf"
  const conv = /(?:convierte|cuanto\s+(?:es|son|equivale)|pasa)\s+([\d.,]+\s*(?:millones?|mill|mil|k|m)?)\s*(uf|clp|peso|pesos|usd|dolares?|dolar)\s+(?:a|en)\s+(uf|clp|peso|pesos|usd|dolares?|dolar)/;
  const m = n.match(conv);
  if (!m) return null;
  const amount = parseAmount(m[1]);
  if (!amount) return null;
  const map = (s) => {
    if (/^uf$/.test(s)) return 'uf';
    if (/peso|clp/.test(s)) return 'clp';
    if (/usd|dolar/.test(s)) return 'usd';
    return null;
  };
  const from = map(m[2]);
  const to = map(m[3]);
  if (!from || !to || from === to) return null;
  return { amount, from, to };
}

export function useLyaActions() {
  /**
   * Intenta resolver con datos REALES CMF.
   * Retorna { handled: bool, response: string | null }
   */
  const tryAction = useCallback(async (text) => {
    // 1. Conversión explícita (más específico, va primero)
    const conv = detectConvertIntent(text);
    if (conv) {
      try {
        const { data } = await base44.functions.invoke('cmfRealAPI', {
          action: 'convert', amount: conv.amount, from: conv.from, to: conv.to,
        });
        if (data?.success) {
          const fromLabel = conv.from.toUpperCase();
          const toLabel = conv.to === 'clp' ? 'pesos chilenos' : conv.to.toUpperCase();
          return {
            handled: true,
            response: `Según el valor oficial CMF de hoy, **${conv.amount.toLocaleString('es-CL')} ${fromLabel}** equivalen a **${data.formatted}** ${toLabel}.\n\n_Cálculo: ${data.formula}_`,
            source: 'CMF · Banco Central de Chile',
          };
        }
      } catch (_) { return { handled: false }; }
    }

    // 2. Indicador puntual
    const indKey = detectIndicatorIntent(text);
    if (indKey) {
      try {
        const { data } = await base44.functions.invoke('cmfRealAPI', { action: 'indicators' });
        if (data?.success && data.snapshot[indKey]) {
          const ind = data.snapshot[indKey];
          const labels = {
            uf: 'La **UF** hoy está en',
            dolar: 'El **dólar observado** hoy está en',
            euro: 'El **euro** hoy está en',
            utm: 'La **UTM** del mes es',
            tpm: 'La **TPM** vigente del Banco Central es',
            ipc: 'El último **IPC** mensual es',
            imacec: 'El último **IMACEC** publicado es',
            libra_cobre: 'La **libra de cobre** está en',
          };
          const valor = ind.formatted || `${ind.valor}${ind.unidad === '%' ? '%' : ''}`;
          return {
            handled: true,
            response: `${labels[indKey] || indKey} **${valor}**.\n\n_Fuente: CMF · Banco Central de Chile · ${new Date(data.snapshot.fecha).toLocaleDateString('es-CL')}_`,
            source: 'CMF · Banco Central de Chile',
          };
        }
      } catch (_) { return { handled: false }; }
    }

    return { handled: false };
  }, []);

  return { tryAction };
}