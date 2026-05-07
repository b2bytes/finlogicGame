import React, { useEffect, useState } from 'react';
import { X, Mail, Phone, Sparkles, MessageCircle, Briefcase, FileText, Save, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CrmStageBadge from './CrmStageBadge';

/**
 * CrmLeadDetail — drawer lateral con info completa de un lead.
 * - Datos personales + tipo de cuenta
 * - Conversaciones (ConsultationHistory por sessionId)
 * - Casos (MisCasos created_by email del lead)
 * - Notas internas editables
 */
export default function CrmLeadDetail({ lead, onClose, onUpdated }) {
  const [conversations, setConversations] = useState([]);
  const [cases, setCases] = useState([]);
  const [notes, setNotes] = useState(lead.notes || '');
  const [tags, setTags] = useState((lead.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    setNotes(lead.notes || '');
    setTags((lead.tags || []).join(', '));
  }, [lead.id]);

  useEffect(() => {
    const load = async () => {
      setLoadingHistory(true);
      const [conv, cas] = await Promise.all([
        lead.sessionId
          ? base44.entities.ConsultationHistory.filter({ sessionId: lead.sessionId }, '-created_date', 50).catch(() => [])
          : Promise.resolve([]),
        lead.email
          ? base44.entities.MisCasos.filter({ created_by: lead.email }, '-created_date', 20).catch(() => [])
          : Promise.resolve([]),
      ]);
      setConversations(Array.isArray(conv) ? conv : []);
      setCases(Array.isArray(cas) ? cas : []);
      setLoadingHistory(false);
    };
    load();
  }, [lead.id, lead.sessionId, lead.email]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await base44.entities.Lead.update(lead.id, {
        notes,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      onUpdated?.(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-card border-l border-border z-50 shadow-soft-lg flex flex-col animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/40">
        <div className="flex items-center gap-2">
          <CrmStageBadge stage={lead.lifecycleStage} />
          <span className="text-[10px] font-mono-editorial uppercase text-muted-foreground">
            {lead.accountType || 'b2c'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-secondary hover:bg-foreground hover:text-background transition-colors flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Identidad */}
        <section>
          <h3 className="font-display text-xl font-bold text-foreground">
            {lead.fullName || lead.email || `Anónimo · ${lead.sessionId?.slice(-6) || '?'}`}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Origen: <span className="font-semibold">{lead.source}</span> · Arquetipo: <span className="font-semibold">{lead.archetype}</span>
          </p>
          <div className="mt-3 space-y-1.5">
            {lead.email && (
              <p className="text-xs flex items-center gap-2 text-foreground/80">
                <Mail className="w-3.5 h-3.5 text-mint-600" />
                <a href={`mailto:${lead.email}`} className="hover:text-mint-700">{lead.email}</a>
              </p>
            )}
            {lead.phone && (
              <p className="text-xs flex items-center gap-2 text-foreground/80">
                <Phone className="w-3.5 h-3.5 text-mint-600" />
                <a href={`https://wa.me/${lead.phone.replace('+', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-mint-700">
                  {lead.phone} · abrir WhatsApp
                </a>
              </p>
            )}
          </div>
        </section>

        {/* KPIs lead */}
        <section className="grid grid-cols-3 gap-2">
          <div className="bg-secondary/30 rounded-xl p-3 border border-border">
            <p className="text-[10px] text-muted-foreground font-mono-editorial uppercase">Mensajes</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{lead.messagesCount || 0}</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 border border-border">
            <p className="text-[10px] text-muted-foreground font-mono-editorial uppercase">Casos</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{lead.casesCount || 0}</p>
          </div>
          <div className="bg-secondary/30 rounded-xl p-3 border border-border">
            <p className="text-[10px] text-muted-foreground font-mono-editorial uppercase">Score</p>
            <p className="text-xl font-bold text-foreground tabular-nums">{lead.priorityScore || 0}</p>
          </div>
        </section>

        {/* Notas + Tags (CRM internal) */}
        <section>
          <p className="text-[10px] uppercase font-mono-editorial text-muted-foreground mb-2">Notas internas equipo</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notas privadas del equipo FinLogic sobre esta persona…"
            rows={3}
            className="w-full p-3 rounded-2xl bg-secondary/30 border border-border text-sm outline-none focus:border-mint-400 transition-colors resize-none"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags separados por coma (ej: urgente, demo-pendiente)"
            className="w-full mt-2 px-3 h-9 rounded-full bg-secondary/30 border border-border text-xs outline-none focus:border-mint-400 transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-600 hover:bg-mint-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Guardar
          </button>
        </section>

        {/* Conversaciones */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-3.5 h-3.5 text-mint-600" />
            <p className="text-[10px] uppercase font-mono-editorial text-muted-foreground">
              Conversaciones · {conversations.length}
            </p>
          </div>
          {loadingHistory ? (
            <p className="text-xs text-muted-foreground">Cargando…</p>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Sin conversaciones registradas.</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {conversations.map((c) => (
                <div key={c.id} className="bg-secondary/20 rounded-xl p-3 border border-border">
                  <p className="text-xs font-semibold text-foreground/90 line-clamp-2">{c.userMessage}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                    <Sparkles className="w-3 h-3 inline mr-0.5 text-mint-600" />
                    {c.agentResponse?.substring(0, 180)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono-editorial">
                    {c.regulatoryBodyIdentified !== 'ninguno' && `· ${c.regulatoryBodyIdentified}`} · {c.inputChannel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Casos */}
        {cases.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-mint-600" />
              <p className="text-[10px] uppercase font-mono-editorial text-muted-foreground">
                Casos · {cases.length}
              </p>
            </div>
            <div className="space-y-2">
              {cases.map((c) => (
                <a
                  key={c.id}
                  href={`/MisCasos/${c.id}`}
                  className="block bg-secondary/20 rounded-xl p-3 border border-border hover:border-mint-300 transition-colors"
                >
                  <p className="text-xs font-semibold text-foreground/90 line-clamp-1">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {c.regulatoryBody} · {c.status}
                  </p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer · acciones rápidas */}
        <section className="pt-3 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-secondary border border-border hover:border-mint-300"
              >
                <Mail className="w-3 h-3" /> Email
              </a>
            )}
            {lead.phone && (
              <a
                href={`https://wa.me/${lead.phone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-mint-600 text-white hover:bg-mint-700"
              >
                <Phone className="w-3 h-3" /> WhatsApp
              </a>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}