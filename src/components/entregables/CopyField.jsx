import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * CopyField — bloque de respuesta lista para copiar a Bendi.
 * Muestra contador de chars, valida límite y entrega botón "Copiar" con feedback.
 */
export default function CopyField({ label, value, max, hint, multiline = true, mono = false }) {
  const [copied, setCopied] = useState(false);
  const len = (value || '').length;
  const overLimit = max && len > max;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-foreground">{label}</p>
          {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {max && (
            <span className={`text-[11px] font-mono-editorial ${overLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
              {len}/{max}
            </span>
          )}
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              copied
                ? 'bg-mint-500 text-white'
                : 'bg-foreground text-background hover:bg-foreground/85'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar</>}
          </button>
        </div>
      </div>
      <div className={`px-4 py-3 ${mono ? 'font-mono-editorial text-[12px]' : 'text-sm'} ${multiline ? 'whitespace-pre-wrap' : ''} text-foreground/90 leading-relaxed break-words`}>
        {value}
      </div>
    </div>
  );
}