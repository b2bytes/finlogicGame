import React from 'react';
import { Scale, ShieldCheck, Share2 } from 'lucide-react';

const moduleLabels = {
  ley_fintech_21521: 'Ley Fintech 21.521',
  ncg_502_cmf: 'NCG 502 CMF',
  ley_19496_sernac: 'Ley 19.496 SERNAC',
  ley_20555: 'Ley 20.555',
  ley_21719_datos: 'Ley 21.719',
  ley_20009_fraude: 'Ley 20.009 Fraude',
  ley_21663_ciberseguridad: 'Ley 21.663 Ciber',
  lir_propyme: 'LIR Pro-Pyme',
  ley_21713_tributaria: 'Ley 21.713',
  tributacion_cripto: 'Tributación Cripto',
  open_finance: 'Open Finance',
  csirt: 'CSIRT',
};

const organismColors = {
  CMF: 'bg-mint-50 text-mint-700 border-mint-200',
  SERNAC: 'bg-accent text-accent-foreground border-border',
  SII: 'bg-secondary text-secondary-foreground border-border',
  CSIRT: 'bg-destructive/10 text-destructive border-destructive/20',
  BCN: 'bg-mint-50 text-mint-700 border-mint-200',
  multiple: 'bg-secondary text-secondary-foreground border-border',
};

const profileEmojis = {
  camila: '👩🏽‍🎓',
  don_luis: '👴🏼',
  maria_jose: '👩🏽‍💼',
  roberto: '👨🏽‍🔧',
  general: '👤',
};

export default function CasoPublicCard({ caso, onShare }) {
  const handleShare = (e) => {
    e.stopPropagation();
    const text = `Caso resuelto en FinLogic: ${caso.title}\n\nFundamento: ${moduleLabels[caso.normativeModule] || caso.normativeModule}\n\nResuelve tu caso gratis: https://finlogic.one/Consulta`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onShare?.(caso);
  };

  return (
    <article className="group bg-card rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden="true">
            {profileEmojis[caso.userProfile] || profileEmojis.general}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${organismColors[caso.regulatoryBody] || organismColors.multiple}`}>
            {caso.regulatoryBody}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-mint-700">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="font-semibold">Resuelto</span>
        </div>
      </div>

      <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-2 line-clamp-2">
        {caso.title}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
        {caso.description}
      </p>

      {caso.amountInvolved > 0 && (
        <div className="bg-mint-50 border border-mint-200 rounded-2xl px-3 py-2 mb-4">
          <p className="text-[10px] font-bold text-mint-600 uppercase tracking-wider">Recuperado</p>
          <p className="text-base font-bold text-mint-700 tabular-nums">
            ${caso.amountInvolved.toLocaleString('es-CL')} CLP
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 text-xs">
        <Scale className="w-3.5 h-3.5 text-mint-600 flex-shrink-0" />
        <span className="text-muted-foreground truncate">
          {moduleLabels[caso.normativeModule] || caso.normativeModule}
        </span>
      </div>

      <button
        onClick={handleShare}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary hover:bg-mint-50 border border-border text-sm font-semibold text-foreground transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Compartir en WhatsApp
      </button>
    </article>
  );
}