import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Copy, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const DOC_TYPES_BY_ORGANISM = {
  CMF: [{ value: 'reclamo_cmf', label: 'Reclamo CMF' }],
  SERNAC: [{ value: 'denuncia_sernac', label: 'Denuncia SERNAC' }],
  SII: [{ value: 'declaracion_sii', label: 'Presentación SII' }],
  CSIRT: [{ value: 'reporte_csirt', label: 'Reporte CSIRT' }],
};

const UNIVERSAL_DOCS = [
  { value: 'carta_arco', label: 'Carta ARCO (datos personales)' },
  { value: 'carta_generica', label: 'Carta formal genérica' },
];

export default function GenerateDocDialog({ caso, open, onOpenChange, onGenerated }) {
  const [generating, setGenerating] = useState(false);
  const [doc, setDoc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const orgDocs = DOC_TYPES_BY_ORGANISM[caso?.regulatoryBody] || [];
  const allDocs = [...orgDocs, ...UNIVERSAL_DOCS];

  const handleGenerate = async (documentType) => {
    setGenerating(true);
    setError(null);
    try {
      const { data } = await base44.functions.invoke('generateLegalDocument', {
        casoId: caso.id,
        documentType,
      });
      if (data?.success) {
        setDoc(data);
        onGenerated?.();
      } else {
        setError(data?.error || 'No pudimos generar el documento');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!doc?.content) return;
    await navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = (val) => {
    if (!val) {
      setDoc(null);
      setError(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="w-5 h-5 text-mint-600" />
            {doc ? doc.title : 'Generar documento legal'}
          </DialogTitle>
          {!doc && (
            <DialogDescription>
              FinLogic redacta el documento por ti, citando la normativa correcta. Listo para enviar.
            </DialogDescription>
          )}
        </DialogHeader>

        {!doc && !generating && (
          <div className="space-y-2 mt-2">
            {allDocs.map((d) => (
              <button
                key={d.value}
                onClick={() => handleGenerate(d.value)}
                className="w-full text-left p-4 rounded-2xl border border-border hover:border-mint-300 hover:bg-mint-50/50 transition-all flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-mint-600 flex-shrink-0" />
                <span className="font-medium text-foreground">{d.label}</span>
              </button>
            ))}
            {error && (
              <p className="text-sm text-destructive mt-3">{error}</p>
            )}
          </div>
        )}

        {generating && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-mint-600 animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Redactando con citas legales…</p>
          </div>
        )}

        {doc && (
          <div className="space-y-4 mt-2">
            <div className="bg-secondary rounded-2xl p-5 max-h-[50vh] overflow-y-auto prose prose-sm prose-slate max-w-none">
              <ReactMarkdown>{doc.content}</ReactMarkdown>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1 rounded-full h-11"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copiado' : 'Copiar texto'}
              </Button>
              <Button
                onClick={() => handleClose(false)}
                className="flex-1 rounded-full h-11 bg-mint-500 hover:bg-mint-600 text-white"
              >
                Listo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Documento guardado en tu caso · {doc.addressedTo}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}