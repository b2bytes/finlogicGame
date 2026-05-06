import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, RefreshCw } from 'lucide-react';

/**
 * IndicadoresLive — Tira de indicadores económicos REALES en vivo.
 * Fuente: mindicador.cl (oficial CMF/BCCh) vía función cmfRealAPI.
 * Refresca cada 30 minutos (mismo TTL que cache backend).
 */
export default function IndicadoresLive() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('cmfRealAPI', { action: 'indicators' });
      if (res.data?.success) setData(res.data.snapshot);
    } catch (_) { /* silencioso, no romper el home */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  if (!data) {
    return (
      <section className="py-6 bg-card/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Cargando indicadores oficiales…
        </div>
      </section>
    );
  }

  const items = [
    { label: 'UF', value: data.uf.formatted, sub: 'hoy' },
    { label: 'Dólar', value: data.dolar.formatted, sub: 'observado' },
    { label: 'Euro', value: data.euro.formatted, sub: 'hoy' },
    { label: 'UTM', value: data.utm.formatted, sub: 'mes' },
    { label: 'TPM', value: `${data.tpm.valor}%`, sub: 'BCCh' },
    { label: 'IPC', value: `${data.ipc.valor}%`, sub: 'mensual' },
  ];

  const fechaCorta = new Date(data.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });

  return (
    <section className="py-5 bg-card/40 border-y border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="inline-flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-mint-400 animate-pulse-soft" />
              <span className="relative w-2 h-2 rounded-full bg-mint-500" />
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
              Indicadores oficiales · {fechaCorta}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Fuente: CMF · Banco Central de Chile
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {items.map((it) => (
            <div
              key={it.label}
              className="bg-background rounded-2xl border border-border/60 px-3 py-2.5 text-center hover:border-mint-300 transition-colors"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{it.label}</div>
              <div className="text-base sm:text-lg font-display font-bold text-foreground tabular-nums">{it.value}</div>
              <div className="text-[9px] text-muted-foreground/70">{it.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}