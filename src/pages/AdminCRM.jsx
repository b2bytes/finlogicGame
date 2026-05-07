import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Inbox, Download, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import CrmStats from '@/components/crm/CrmStats';
import CrmFilters from '@/components/crm/CrmFilters';
import CrmLeadRow from '@/components/crm/CrmLeadRow';
import CrmLeadDetail from '@/components/crm/CrmLeadDetail';

/**
 * /Admin/CRM — Bandeja CRM unificada FinLogic (B2C, B2B fintech, B2G institucional).
 *
 * Pipeline de recepción:
 *  · Cualquier visitante que escribe a Lya queda registrado (zero-friction).
 *  · El backend `crmRegisterLead` upserta por email > phone > sessionId.
 *  · Cada turno enriquece: lifecycleStage, priorityScore, lastQuery, etc.
 *  · Aquí el equipo ve la bandeja, filtra, marca, agrega notas y contacta.
 *
 * Visible solo para admin (la entity Lead tiene RLS admin-only).
 */
export default function AdminCRM() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('all');
  const [accountType, setAccountType] = useState('all');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Lead.list('-updated_date', 200).catch(() => []);
      setLeads(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let out = leads;
    if (stage !== 'all') out = out.filter((l) => l.lifecycleStage === stage);
    if (accountType !== 'all') out = out.filter((l) => (l.accountType || 'b2c') === accountType);
    if (search.trim()) {
      const q = search.toLowerCase();
      out = out.filter((l) =>
        [l.fullName, l.email, l.phone, l.lastQuery, l.firstQuery, l.notes]
          .filter(Boolean)
          .some((x) => x.toLowerCase().includes(q))
      );
    }
    // Orden: priorityScore desc, luego lastContactAt desc
    return [...out].sort((a, b) => {
      const ps = (b.priorityScore || 0) - (a.priorityScore || 0);
      if (ps !== 0) return ps;
      const at = new Date(a.lastContactAt || a.created_date || 0).getTime();
      const bt = new Date(b.lastContactAt || b.created_date || 0).getTime();
      return bt - at;
    });
  }, [leads, search, stage, accountType]);

  const exportCSV = () => {
    const headers = ['fullName', 'email', 'phone', 'accountType', 'lifecycleStage', 'priorityScore', 'messagesCount', 'casesCount', 'lastContactAt', 'lastQuery'];
    const rows = filtered.map((l) =>
      headers.map((h) => `"${String(l[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finlogic-crm-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky-header glass border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="w-9 h-9 rounded-full bg-secondary hover:bg-foreground hover:text-background flex items-center justify-center transition-colors"
              title="Recargar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={exportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 h-9 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint-50 border border-mint-200 mb-3">
            <Inbox className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-mono-editorial text-mint-700 uppercase tracking-wider">
              CRM Unificado · B2C · B2B · B2G
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Bandeja de personas.
            <br />
            <span className="text-mint-600">Una vista. Toda FinLogic.</span>
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Pipeline inteligente de recepción. Cualquier persona que conversa con Lya queda
            registrada (anónima si no se identifica) y evoluciona automáticamente por las
            etapas <strong>visitor → activated → engaged → retained → converted</strong>.
          </p>
        </div>

        <CrmStats leads={leads} />
        <CrmFilters
          search={search}
          setSearch={setSearch}
          stage={stage}
          setStage={setStage}
          accountType={accountType}
          setAccountType={setAccountType}
        />

        {loading ? (
          <div className="text-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-mint-600" />
            <p className="text-sm text-muted-foreground mt-3">Cargando bandeja…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl py-16 px-6 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Bandeja vacía con estos filtros</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {leads.length === 0
                ? 'Aún no hay registros. Cuando alguien escriba a Lya en /AsistenteLya o el widget flotante, aparecerá aquí automáticamente.'
                : 'Ajusta los filtros de etapa, tipo de cuenta o búsqueda para ver más personas.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-mono-editorial mb-3">
              {filtered.length} de {leads.length} personas
            </p>
            {filtered.map((lead) => (
              <CrmLeadRow
                key={lead.id}
                lead={lead}
                active={selected?.id === lead.id}
                onClick={() => setSelected(lead)}
              />
            ))}
          </div>
        )}
      </main>

      {selected && (
        <CrmLeadDetail
          lead={selected}
          onClose={() => setSelected(null)}
          onUpdated={(updated) => {
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setSelected(updated);
          }}
        />
      )}
    </div>
  );
}