import React, { useEffect, useState, useMemo } from 'react';
import { Eye, MapPin, Clock, Smartphone, Monitor, Tablet, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const DEVICE_ICON = { mobile: Smartphone, desktop: Monitor, tablet: Tablet, unknown: Monitor };

function formatDuration(sec) {
  if (!sec) return '0s';
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function timeAgo(iso) {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function VisitTracesPanel() {
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.VisitTrace.list('-lastSeenAt', 60);
      setTraces(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error('Load traces:', e);
      setTraces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const now = Date.now();
    const last24h = traces.filter((t) => now - new Date(t.lastSeenAt).getTime() < 86400000);
    const totalPv = traces.reduce((s, t) => s + (t.totalPageviews || 0), 0);
    const totalErr = traces.reduce((s, t) => s + (t.errorsTotal || 0), 0);
    const lyaInteract = traces.filter((t) => t.interactedWithLya).length;
    return {
      sessions: traces.length,
      sessions24h: last24h.length,
      totalPv,
      totalErr,
      lyaPct: traces.length ? Math.round((lyaInteract / traces.length) * 100) : 0,
    };
  }, [traces]);

  return (
    <div className="rounded-3xl bg-card border border-border shadow-soft overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center">
            <Eye className="w-5 h-5 text-violet-700" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Recorridos privados</h2>
            <p className="text-xs text-muted-foreground">
              Sesiones reales · solo visible para admin
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full bg-secondary hover:bg-foreground hover:text-background text-xs font-semibold transition-colors disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-5 border-b border-border bg-secondary/20">
        <Stat label="Sesiones totales" value={stats.sessions} />
        <Stat label="Últ. 24h" value={stats.sessions24h} accent />
        <Stat label="Pageviews" value={stats.totalPv} />
        <Stat label="Errores JS" value={stats.totalErr} warn={stats.totalErr > 0} />
        <Stat label="% con Lya" value={`${stats.lyaPct}%`} />
      </div>

      <div className="grid md:grid-cols-2">
        {/* Lista de sesiones */}
        <div className="border-r border-border max-h-[500px] overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-sm text-muted-foreground">Cargando…</div>
          )}
          {!loading && traces.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Sin sesiones registradas todavía.
            </div>
          )}
          {traces.map((t) => {
            const Icon = DEVICE_ICON[t.deviceType] || Monitor;
            const active = selected?.id === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t)}
                className={`w-full text-left px-4 py-3 border-b border-border/60 transition-colors ${
                  active ? 'bg-mint-50' : 'hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <code className="text-[10px] font-mono text-muted-foreground truncate">
                        {t.sessionId}
                      </code>
                      {t.userEmail && (
                        <span className="text-[9px] font-bold text-mint-700 bg-mint-100 px-1.5 rounded-full">
                          {t.userRole === 'admin' ? 'ADMIN' : 'USER'}
                        </span>
                      )}
                      {t.interactedWithLya && (
                        <Sparkles className="w-3 h-3 text-mint-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {t.entryPath} → {t.exitPath}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span>{t.totalPageviews} vistas</span>
                      <span>·</span>
                      <span>{formatDuration(t.totalDurationSec)}</span>
                      <span>·</span>
                      <span>{timeAgo(t.lastSeenAt)}</span>
                    </div>
                  </div>
                  {t.errorsTotal > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      {t.errorsTotal}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de sesión seleccionada */}
        <div className="max-h-[500px] overflow-y-auto p-4">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground py-12">
              Selecciona una sesión para ver el recorrido completo.
            </div>
          ) : (
            <SessionDetail trace={selected} />
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent, warn }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2.5 ${
        warn ? 'bg-red-50 border-red-200' : accent ? 'bg-mint-50 border-mint-200' : 'bg-card border-border'
      }`}
    >
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold tabular-nums mt-0.5 ${
        warn ? 'text-red-700' : accent ? 'text-mint-700' : 'text-foreground'
      }`}>
        {value}
      </p>
    </div>
  );
}

function SessionDetail({ trace }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">Sesión</p>
        <code className="text-xs font-mono break-all">{trace.sessionId}</code>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Field label="Inicio" value={timeAgo(trace.firstSeenAt) + ' atrás'} />
        <Field label="Última" value={timeAgo(trace.lastSeenAt) + ' atrás'} />
        <Field label="Vistas" value={trace.totalPageviews} />
        <Field label="Tiempo total" value={formatDuration(trace.totalDurationSec)} />
        <Field label="Dispositivo" value={trace.deviceType || '—'} />
        <Field label="País" value={trace.country || '—'} />
        {trace.referrer && <Field label="Referrer" value={trace.referrer.slice(0, 30)} colspan />}
        {trace.utmSource && <Field label="UTM" value={`${trace.utmSource} / ${trace.utmCampaign || '—'}`} colspan />}
      </div>

      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
          <MapPin className="w-3 h-3" /> Recorrido ({(trace.hits || []).length})
        </p>
        <div className="space-y-1">
          {(trace.hits || []).map((h, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-secondary/40 text-xs"
            >
              <span className="text-[10px] font-mono text-muted-foreground w-5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <code className="flex-1 truncate font-mono text-foreground/90">{h.path}</code>
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(h.durationSec || 0)}
              </span>
              {h.scrollDepthPct > 0 && (
                <span className="text-[10px] font-mono text-mint-700 flex-shrink-0">
                  {h.scrollDepthPct}%
                </span>
              )}
              {h.errors > 0 && (
                <AlertTriangle className="w-3 h-3 text-red-600 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, colspan }) {
  return (
    <div className={colspan ? 'col-span-2' : ''}>
      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs text-foreground/90 truncate">{value}</p>
    </div>
  );
}