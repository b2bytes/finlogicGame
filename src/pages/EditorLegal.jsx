import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSignature, Download, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { getTemplateById } from '@/lib/legalTemplates';

import HeroNav from '@/components/home/HeroNav';
import TemplatePicker from '@/components/legal-editor/TemplatePicker';
import ConsultaInput from '@/components/legal-editor/ConsultaInput';
import DocumentEditor from '@/components/legal-editor/DocumentEditor';
import SignaturePad from '@/components/legal-editor/SignaturePad';
import LyaSidebar from '@/components/legal-editor/LyaSidebar';

/**
 * EditorLegal — editor colaborativo de documentos legales.
 * Workflow:
 *  1. Pick template
 *  2. Describe el caso → Lya rellena con IA
 *  3. Revisa, edita, firma → guarda en LegalDocumentDraft → genera PDF y opcionalmente envía
 */

export default function EditorLegal() {
  const { user } = useAuth();
  const [step, setStep] = useState('pick'); // pick | consulta | review | sign | done
  const [template, setTemplate] = useState(null);
  const [consultaQuery, setConsultaQuery] = useState('');
  const [draft, setDraft] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [sending, setSending] = useState(false);

  // Pre-llenado desde URL ?template=demanda_sernac&query=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tplId = params.get('template');
    const q = params.get('query');
    if (tplId) {
      const tpl = getTemplateById(tplId);
      if (tpl) {
        setTemplate(tpl);
        setStep('consulta');
      }
    }
    if (q) setConsultaQuery(q);
  }, []);

  const handleTemplateSelect = (tpl) => {
    setTemplate(tpl);
    setStep('consulta');
  };

  const handleConsultaSubmit = async (query) => {
    if (!template) return;
    setLoading(true);
    setConsultaQuery(query);
    try {
      const res = await base44.functions.invoke('lyaFillLegalTemplate', {
        templateId: template.id,
        consultaQuery: query,
        userData: {
          fullName: user?.full_name,
          email: user?.email,
        },
      });
      const data = res.data;
      if (!data?.success) throw new Error(data?.error || 'No se pudo rellenar');

      // Crea el draft persistido
      const created = await base44.entities.LegalDocumentDraft.create({
        title: data.title,
        templateId: template.id,
        consultaQuery: query,
        fields: data.extractedFields,
        content: data.content,
        lawsCited: data.lawsCited,
        regulatoryBody: template.regulatoryBody,
        addressedTo: data.addressedTo,
        status: 'review',
        lyaConfidence: data.confidence,
        verifierScore: data.verifierScore,
      });

      setDraft({ ...created, missingFieldsForUser: data.missingFieldsForUser });
      setDraftId(created.id);
      setStep('review');
      toast.success('Lya redactó tu documento. Revísalo y fírmalo.');
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = async (newContent) => {
    if (!draftId) return;
    const previousValue = draft.content;
    const updated = {
      content: newContent,
      userEdits: [
        ...(draft.userEdits || []),
        {
          ts: new Date().toISOString(),
          fieldOrSection: 'content',
          previousValue: previousValue.slice(0, 200),
          newValue: newContent.slice(0, 200),
        },
      ],
      status: 'user_editing',
    };
    setDraft({ ...draft, ...updated });
    await base44.entities.LegalDocumentDraft.update(draftId, updated);
    toast.success('Cambios guardados');
  };

  const handleSign = async (signatureDataUrl) => {
    if (!draftId) return;
    const signedAt = new Date().toISOString();
    const update = {
      signatureDataUrl,
      signedAt,
      signedBy: user?.email || 'anonymous',
      status: 'signed',
    };
    await base44.entities.LegalDocumentDraft.update(draftId, update);
    setDraft({ ...draft, ...update });
    setSigning(false);
    setStep('done');
    toast.success('Documento firmado correctamente');
  };

  const handleDownloadPDF = async () => {
    if (!draft) return;
    try {
      const { generateDocPDF } = await import('@/lib/generateDocPDF.js');
      await generateDocPDF({
        title: draft.title,
        content: draft.content,
        addressedTo: draft.addressedTo,
        legalBasis: (draft.lawsCited || []).join(', '),
        documentType: draft.templateId,
        signatureDataUrl: draft.signatureDataUrl,
        signedBy: draft.signedBy,
      });
    } catch (e) {
      toast.error('No se pudo generar PDF');
    }
  };

  const handleSendEmail = async () => {
    if (!draft) return;
    const to = window.prompt('¿A qué correo enviamos el documento firmado?', user?.email || '');
    if (!to) return;
    setSending(true);
    try {
      await base44.functions.invoke('lyaSendDocByEmail', {
        to,
        subject: draft.title,
        title: draft.title,
        content: draft.content,
        addressedTo: draft.addressedTo,
        legalBasis: (draft.lawsCited || []).join(', '),
        documentType: draft.templateId,
      });
      await base44.entities.LegalDocumentDraft.update(draftId, {
        status: 'sent',
        sentTo: to,
      });
      setDraft({ ...draft, status: 'sent', sentTo: to });
      toast.success(`Enviado a ${to}`);
    } catch (e) {
      toast.error(`Error enviando: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  // Estado de Lya según paso
  const lyaState = (() => {
    if (loading) return 'filling';
    if (sending) return 'sending';
    if (step === 'done' && draft?.status === 'sent') return 'sent';
    if (step === 'done') return 'signed';
    if (signing) return 'signing';
    if (step === 'review') return 'review';
    return 'filling';
  })();

  return (
    <div className="min-h-screen bg-background">
      <HeroNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Inicio
          </Link>
          <span>·</span>
          <span className="text-foreground font-semibold">Editor legal colaborativo</span>
        </div>

        {/* Header */}
        <div className="mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-mint-50 border border-mint-200">
            <FileSignature className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-[11px] font-bold text-mint-700 tracking-wider uppercase">
              Lya redacta · Tú firmas
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Tu documento legal,{' '}
            <span className="text-mint-600">listo para firmar.</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-3 max-w-2xl">
            Cuéntale a Lya tu caso. Ella redacta el documento con la base legal correcta, tú lo revisas, lo editas si quieres y lo firmas. Sin abogado.
          </p>
        </div>

        {/* Step 1 — Picker */}
        {step === 'pick' && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-soft">
            <TemplatePicker onSelect={handleTemplateSelect} />
          </div>
        )}

        {/* Step 2 — Consulta */}
        {step === 'consulta' && template && (
          <div className="bg-card border border-border rounded-3xl p-5 sm:p-7 shadow-soft">
            <ConsultaInput
              template={template}
              onBack={() => setStep('pick')}
              onSubmit={handleConsultaSubmit}
              loading={loading}
              initialQuery={consultaQuery}
            />
          </div>
        )}

        {/* Step 3+ — Editor split */}
        {(step === 'review' || step === 'done') && draft && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="space-y-4 min-w-0">
              <DocumentEditor
                draft={draft}
                onContentChange={handleContentChange}
              />

              {/* Acciones según estado */}
              {step === 'review' && !signing && (
                <div className="bg-card border border-border rounded-3xl p-5 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-sm font-bold text-foreground">¿Listo para firmar?</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cuando firmes, el documento queda válido para enviar.
                    </p>
                  </div>
                  <button
                    onClick={() => setSigning(true)}
                    className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-mint-600 hover:bg-mint-700 text-white font-bold text-sm shadow-soft transition-all"
                  >
                    <FileSignature className="w-4 h-4" />
                    Firmar documento
                  </button>
                </div>
              )}

              {signing && (
                <div className="bg-card border border-border rounded-3xl p-5">
                  <h3 className="font-bold text-foreground mb-1">Firma aquí</h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Dibuja con el mouse o el dedo. Quedará incrustada en el PDF final.
                  </p>
                  <SignaturePad
                    onConfirm={handleSign}
                    onCancel={() => setSigning(false)}
                  />
                </div>
              )}

              {step === 'done' && (
                <div className="bg-mint-50 border border-mint-200 rounded-3xl p-5">
                  <h3 className="font-bold text-mint-900 mb-1">
                    {draft.status === 'sent' ? '✓ Enviado' : '✓ Documento firmado'}
                  </h3>
                  <p className="text-sm text-mint-800/80 mb-4">
                    {draft.status === 'sent'
                      ? `Enviado a ${draft.sentTo}. Tienes copia en tu correo.`
                      : 'Ahora puedes descargarlo o enviarlo directamente al destinatario.'}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleDownloadPDF}
                      className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background font-bold text-sm hover:opacity-90"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Descargar PDF
                    </button>
                    {draft.status !== 'sent' && (
                      <button
                        onClick={handleSendEmail}
                        disabled={sending}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-mint-600 hover:bg-mint-700 text-white font-bold text-sm disabled:opacity-60"
                      >
                        {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                        Enviar al destinatario
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Lya sidebar */}
            <div className="lg:sticky lg:top-20 lg:self-start">
              <LyaSidebar
                state={lyaState}
                extractedFields={draft.fields}
                missingFields={draft.missingFieldsForUser}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}