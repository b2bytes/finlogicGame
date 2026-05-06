import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { generateDocPDF } from '@/lib/generateDocPDF';

const DOC_TYPES = [
  { key: 'denuncia_sernac', label: 'Denuncia SERNAC', icon: '⚖️' },
  { key: 'reclamo_cmf', label: 'Reclamo CMF', icon: '🏦' },
  { key: 'carta_arco', label: 'Carta ARCO (datos)', icon: '🔒' },
  { key: 'reporte_csirt', label: 'Reporte CSIRT (ciber)', icon: '🛡️' },
  { key: 'declaracion_sii', label: 'Presentación SII', icon: '📊' },
  { key: 'carta_generica', label: 'Carta formal', icon: '✉️' },
];

/**
 * LyaGenerateDocButton — aparece bajo respuestas de Lya cuando hay suficiente
 * conversación. Permite generar PDF firmable basado en los hechos del chat,
 * usando los templates de generateLegalDocument vía lyaGenerateDocFromChat.
 */
export default function LyaGenerateDocButton({ history = [] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(null); // documentType en proceso
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  // Solo mostrar si hay al menos 1 turno usuario + 1 turno asistente con contenido
  const hasMaterial =
    history.filter((h) => h?.role === 'user' && (h.content || '').length > 15).length >= 1 &&
    history.filter((h) => h?.role === 'assistant' && (h.content || '').length > 30).length >= 1;

  if (!hasMaterial) return null;

  const handleGenerate = async (documentType) => {
    setLoading(documentType);
    setError(null);
    try {
      const res = await base44.functions.invoke('lyaGenerateDocFromChat', {
        history: history.slice(-12),
        documentType,
      });
      const data = res?.data;
      if (!data?.success || !data?.content) {
        throw new Error(data?.error || 'No se pudo generar el documento');
      }
      generateDocPDF({
        title: data.title,
        content: data.content,
        addressedTo: data.addressedTo,
        legalBasis: data.legalBasis,
      });
      setDone(true);
      setOpen(false);
      setTimeout(() => setDone(false), 3000);
    } catch (e) {
      setError(e.message || 'Error al generar documento');
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="self-start max-w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!!loading}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-mint-700 hover:text-mint-800 px-2.5 py-1 rounded-full bg-gradient-to-br from-mint-50 to-mint-100 border border-mint-200 transition-colors disabled:opacity-60"
      >
        {done ? (
          <>
            <CheckCircle2 className="w-3 h-3" />
            PDF descargado
          </>
        ) : loading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Redactando…
          </>
        ) : (
          <>
            <FileText className="w-3 h-3" />
            Generar documento PDF
            <ChevronDown
              className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-2 rounded-xl bg-card border border-border shadow-soft space-y-1 max-w-[280px]">
              <p className="text-[10px] text-muted-foreground px-2 py-1 leading-snug">
                Lya redactará el documento basándose en lo que conversamos. Tú lo
                revisas y firmas.
              </p>
              {DOC_TYPES.map((d) => (
                <button
                  key={d.key}
                  onClick={() => handleGenerate(d.key)}
                  className="w-full flex items-center gap-2 text-left text-xs px-2.5 py-2 rounded-lg hover:bg-mint-50 transition-colors group"
                >
                  <span className="text-base">{d.icon}</span>
                  <span className="flex-1 text-foreground/85 group-hover:text-mint-700">
                    {d.label}
                  </span>
                  <Download className="w-3 h-3 text-muted-foreground group-hover:text-mint-600" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-1.5 text-[11px] text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-2 py-1">
          {error}
        </div>
      )}
    </div>
  );
}