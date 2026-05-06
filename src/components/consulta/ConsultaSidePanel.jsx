import React from 'react';
import { ShieldCheck, Sparkles, Clock, FileCheck2 } from 'lucide-react';

const PROMISES = [
  {
    icon: Clock,
    title: 'Respuesta en menos de 60 segundos',
    iconBg: 'bg-mint-100',
    iconColor: 'text-mint-700',
  },
  {
    icon: Sparkles,
    title: '12 normativas chilenas trabajando para ti',
    iconBg: 'bg-[#F0E5FF]',
    iconColor: 'text-purple-700',
  },
  {
    icon: FileCheck2,
    title: 'Documento legal listo para enviar',
    iconBg: 'bg-[#FFE0CC]',
    iconColor: 'text-orange-700',
  },
  {
    icon: ShieldCheck,
    title: 'Auditable en /Transparencia',
    iconBg: 'bg-[#FFF3D6]',
    iconColor: 'text-amber-700',
  },
];

export default function ConsultaSidePanel() {
  return (
    <aside className="space-y-4">
      <div className="bg-card rounded-[28px] border border-border/60 p-6 shadow-soft">
        <p className="text-xs font-semibold text-mint-600 mb-4 uppercase tracking-wider">
          Lo que puedes esperar
        </p>
        <ul className="space-y-3.5">
          {PROMISES.map((p) => (
            <li key={p.title} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-2xl ${p.iconBg} flex items-center justify-center flex-shrink-0`}>
                <p.icon className={`w-4 h-4 ${p.iconColor}`} strokeWidth={2.2} />
              </div>
              <p className="text-sm font-medium text-foreground leading-snug pt-1.5">
                {p.title}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-[28px] p-6 bg-gradient-to-br from-mint-50 to-mint-100/60 border border-mint-200">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-mint-700" />
          <p className="text-xs font-bold text-mint-700 uppercase tracking-wider">
            Confidencial
          </p>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Tus datos no se comparten con bancos. Cumplimos Ley 21.719 de protección de datos personales.
        </p>
      </div>
    </aside>
  );
}