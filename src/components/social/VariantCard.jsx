import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

export default function VariantCard({ variant }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullText = [variant.copy, variant.cta, (variant.hashtags || []).join(' ')]
      .filter(Boolean)
      .join('\n\n');
    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-5 shadow-soft hover:shadow-soft-lg transition-all">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-mint-50 text-mint-700 text-xs font-bold border border-mint-200">
          {variant.label}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-mint-700 transition-colors"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-mint-600" /> Copiado
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copiar
            </>
          )}
        </button>
      </div>

      {variant.hook && (
        <p className="text-xs font-bold uppercase tracking-wider text-mint-600 mb-2">
          {variant.hook}
        </p>
      )}

      <p className="text-sm text-foreground leading-relaxed mb-3 whitespace-pre-wrap">
        {variant.copy}
      </p>

      <p className="text-sm font-semibold text-mint-700 mb-3">
        → {variant.cta}
      </p>

      {variant.hashtags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {variant.hashtags.map((h) => (
            <span
              key={h}
              className="text-[11px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full"
            >
              {h.startsWith('#') ? h : `#${h}`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}