import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Landmark, ShieldAlert, FileText, Sparkles } from 'lucide-react';
import { LEGAL_TEMPLATES } from '@/lib/legalTemplates';

const ICON_MAP = {
  Scale,
  Landmark,
  ShieldAlert,
  FileText,
};

const COLOR_CLASSES = {
  purple: 'border-purple-200 bg-purple-50/60 hover:border-purple-400 [&_.icon]:text-purple-700',
  mint: 'border-mint-200 bg-mint-50/60 hover:border-mint-400 [&_.icon]:text-mint-700',
  red: 'border-red-200 bg-red-50/60 hover:border-red-400 [&_.icon]:text-red-700',
  blue: 'border-blue-200 bg-blue-50/60 hover:border-blue-400 [&_.icon]:text-blue-700',
  amber: 'border-amber-200 bg-amber-50/60 hover:border-amber-400 [&_.icon]:text-amber-700',
  orange: 'border-orange-200 bg-orange-50/60 hover:border-orange-400 [&_.icon]:text-orange-700',
};

/**
 * TemplatePicker — selector visual de plantillas legales que Lya puede rellenar.
 * Tarjetas con icon, nombre, base legal y descripción corta.
 */
export default function TemplatePicker({ onSelect, suggested }) {
  return (
    <div>
      <div className="mb-5">
        <p className="text-xs font-semibold text-mint-600 uppercase tracking-wider mb-2">
          Paso 1 de 3 · Plantilla
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          ¿Qué documento legal necesitas?
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Lya va a rellenar la plantilla con los datos de tu consulta. Tú revisas, editas y firmas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEGAL_TEMPLATES.map((tpl, idx) => {
          const Icon = ICON_MAP[tpl.icon] || FileText;
          const isSuggested = suggested === tpl.id;
          return (
            <motion.button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`group relative text-left p-4 rounded-2xl border-2 transition-all hover:shadow-soft hover:-translate-y-0.5 ${
                COLOR_CLASSES[tpl.color] || COLOR_CLASSES.mint
              }`}
            >
              {isSuggested && (
                <span className="absolute -top-2 right-3 inline-flex items-center gap-1 text-[10px] font-bold text-white bg-mint-600 px-2 py-0.5 rounded-full shadow-soft">
                  <Sparkles className="w-2.5 h-2.5" />
                  Sugerido por Lya
                </span>
              )}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <Icon className="icon w-5 h-5" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground leading-tight mb-0.5">
                    {tpl.label}
                  </h3>
                  <p className="text-[11px] font-mono-editorial text-foreground/55 mb-1.5">
                    {tpl.legalBase}
                  </p>
                  <p className="text-xs text-foreground/70 leading-snug">
                    {tpl.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}