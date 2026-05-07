import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, FileText, Check, Loader2, X } from 'lucide-react';
import { generateDocPDF } from '@/lib/generateDocPDF';
import { base44 } from '@/api/base44Client';

/**
 * LyaDocumentCard — Tarjeta de documento generado por Lya, embebida en el chat.
 * Pensada para usuarios mayores (Don Luis 68): tipografía grande, contraste alto,
 * dos CTAs prominentes: DESCARGAR PDF y ENVIAR POR CORREO.
 *
 * Props:
 *  - doc: { title, content, addressedTo, legalBasis, documentType }
 *  - defaultEmail?: string (pre-llenar input email)
 */
export default function LyaDocumentCard({ doc, defaultEmail = '' }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const [emailTo, setEmailTo] = useState(defaultEmail);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  if (!doc?.title || !doc?.content) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setError(null);
    try {
      generateDocPDF({
        title: doc.title,
        content: doc.content,
        addressedTo: doc.addressedTo,
        legalBasis: doc.legalBasis,
      });
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (e) {
      setError(e.message || 'No pudimos generar el PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault?.();
    if (!emailTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      setError('Escribe un correo válido');
      return;
    }
    setSending(true);
    setError(null);
    try {
      await base44.functions.invoke('lyaSendDocByEmail', {
        to: emailTo,
        title: doc.title,
        content: doc.content,
        addressedTo: doc.addressedTo,
        legalBasis: doc.legalBasis,
        documentType: doc.documentType,
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setEmailMode(false);
      }, 3000);
    } catch (e) {
      setError(e.message || 'No pudimos enviar el correo');
    } finally {
      setSending(false);
    }
  };

  const typeLabel = (() => {
    const map = {
      cotizacion: 'Cotización',
      correo_formal: 'Correo formal',
      carta_comercial: 'Carta comercial',
      carta_arco: 'Carta ARCO',
      denuncia_sernac: 'Denuncia SERNAC',
      reclamo_cmf: 'Reclamo CMF',
      reporte_csirt: 'Reporte CSIRT',
      declaracion_sii: 'Presentación SII',
      carta_generica: 'Carta formal',
    };
    return map[doc.documentType] || 'Documento';
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="rounded-2xl bg-white border-2 border-mint-200 shadow-soft-lg overflow-hidden"
    >
      {/* Banda mint con título del doc */}
      <div className="bg-gradient-to-br from-mint-500 to-mint-700 text-white px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/95 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-mint-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-mint-100/95 leading-none mb-1">
              {typeLabel} · listo
            </p>
            <p className="text-[14px] font-bold leading-tight truncate">{doc.title}</p>
          </div>
        </div>
      </div>

      {/* Preview corto */}
      <div className="px-4 py-3 bg-mint-50/40 border-b border-mint-100">
        {doc.addressedTo && (
          <div className="text-[12px] text-foreground/80 mb-1">
            <span className="font-mono uppercase tracking-wider text-mint-700 text-[10px] mr-1.5">Para:</span>
            <span className="font-medium">{doc.addressedTo}</span>
          </div>
        )}
        {doc.legalBasis && (
          <div className="text-[12px] text-foreground/80">
            <span className="font-mono uppercase tracking-wider text-mint-700 text-[10px] mr-1.5">Base:</span>
            {doc.legalBasis}
          </div>
        )}
      </div>

      {/* CTAs grandes para Don Luis */}
      <div className="p-3 space-y-2">
        {!emailMode ? (
          <>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full min-h-[52px] px-4 rounded-xl bg-mint-600 hover:bg-mint-700 active:bg-mint-700 text-white font-bold text-[15px] inline-flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 shadow-soft"
            >
              {downloading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Generando PDF…</>
              ) : downloaded ? (
                <><Check className="w-5 h-5" /> ¡PDF descargado!</>
              ) : (
                <><Download className="w-5 h-5" /> Descargar PDF</>
              )}
            </button>
            <button
              onClick={() => setEmailMode(true)}
              className="w-full min-h-[48px] px-4 rounded-xl bg-white border-2 border-mint-300 hover:border-mint-500 hover:bg-mint-50 text-mint-700 font-semibold text-[14px] inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4" /> Enviar por correo
            </button>
          </>
        ) : (
          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-mint-700">
                Enviar a este correo
              </label>
              <button
                type="button"
                onClick={() => { setEmailMode(false); setError(null); }}
                aria-label="Cancelar envío"
                className="w-7 h-7 rounded-full hover:bg-muted inline-flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="ejemplo@correo.cl"
              autoFocus
              className="w-full min-h-[48px] px-4 rounded-xl border-2 border-mint-200 focus:border-mint-500 outline-none bg-white text-[15px]"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || sent}
              className="w-full min-h-[52px] px-4 rounded-xl bg-mint-600 hover:bg-mint-700 text-white font-bold text-[15px] inline-flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50 shadow-soft"
            >
              {sending ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Enviando…</>
              ) : sent ? (
                <><Check className="w-5 h-5" /> ¡Enviado a {emailTo}!</>
              ) : (
                <><Mail className="w-5 h-5" /> Enviar ahora</>
              )}
            </button>
          </form>
        )}

        {error && (
          <p className="text-[12px] text-destructive font-medium px-1">{error}</p>
        )}
      </div>
    </motion.div>
  );
}