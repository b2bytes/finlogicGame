import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Building2,
  Bot,
  Code2,
  Eye,
  ArrowUpRight,
} from 'lucide-react';

const CAPAS = [
  {
    n: '01',
    icon: User,
    eyebrow: 'Capa 1 · Ciudadana',
    title: 'Tu derecho, en tu idioma.',
    desc: 'Banco, fraude, datos personales o cripto. Carta lista en 60 segundos.',
    to: '/Consulta',
    cta: 'Consultar gratis',
    accent: 'bg-mint-50 border-mint-200',
    icon_bg: 'bg-mint-100 text-mint-700',
    span: 'lg:col-span-2 lg:row-span-2',
    big: true,
  },
  {
    n: '02',
    icon: Building2,
    eyebrow: 'Capa 2 · Pyme',
    title: 'Salud financiera SII.',
    desc: 'Score 0-100, alertas IVA / F29 y beneficios Pro-Pyme.',
    to: '/Pyme',
    cta: 'Diagnóstico Pyme',
    accent: 'bg-[#FFF3E0] border-[#FFE0B2]',
    icon_bg: 'bg-white/70 text-orange-700',
  },
  {
    n: '03',
    icon: Bot,
    eyebrow: 'Capa 3 · Agéntica',
    title: 'Lya orquesta 7 agentes.',
    desc: 'Triage, especialista, verificador y plazo legal — todo auditable.',
    to: '/AsistenteLya',
    cta: 'Hablar con Lya',
    accent: 'bg-[#F0E5FF] border-[#E0CCFF]',
    icon_bg: 'bg-white/70 text-purple-700',
  },
  {
    n: '04',
    icon: Code2,
    eyebrow: 'Capa 4 · B2B',
    title: 'Compliance API.',
    desc: '5 endpoints listos. Multa CMF 5.000 UF vs $490K/mes.',
    to: '/api-compliance',
    cta: 'Ver endpoints',
    accent: 'bg-foreground text-background border-transparent',
    icon_bg: 'bg-mint-500/20 text-mint-300',
    dark: true,
  },
  {
    n: '05',
    icon: Eye,
    eyebrow: 'Capa 5 · Transparencia',
    title: 'Cada respuesta es auditable.',
    desc: 'Pipeline IA público con leyes citadas y score del verificador.',
    to: '/Transparencia',
    cta: 'Ver el pipeline',
    accent: 'bg-card border-border',
    icon_bg: 'bg-secondary text-foreground',
  },
];

export default function CapasFinLogic() {
  return (
    <section id="capas" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold text-mint-600 mb-3 tracking-wider uppercase">
              5 capas · 1 sistema operativo
            </p>
            <h2 className="font-display text-3xl md:text-[44px] font-bold tracking-tight text-foreground leading-[1.02]">
              FinLogic no es un chatbot.<br />
              <span className="text-mint-600">Es un sistema operativo financiero.</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Una sola plataforma que conecta ciudadanos, pymes, fintechs y reguladores bajo el mismo motor IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CAPAS.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.n}
                to={c.to}
                className={`group relative rounded-[28px] border ${c.accent} ${c.span || ''} p-6 md:p-7 flex flex-col hover:-translate-y-1 hover:shadow-soft-lg transition-all duration-300 min-h-[260px] overflow-hidden`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-11 h-11 rounded-2xl ${c.icon_bg} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <span className={`text-[10px] font-bold tracking-[0.18em] ${c.dark ? 'text-background/40' : 'text-foreground/30'}`}>
                    {c.n}
                  </span>
                </div>

                <div>
                  <p className={`text-[10px] font-bold tracking-wider uppercase mb-2 ${c.dark ? 'text-mint-300' : 'text-mint-700'}`}>
                    {c.eyebrow}
                  </p>
                  <h3 className={`font-display ${c.big ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-lg md:text-xl'} font-bold tracking-tight leading-[1.05] ${c.dark ? 'text-background' : 'text-foreground'}`}>
                    {c.title}
                  </h3>
                  <p className={`${c.big ? 'text-base mt-3' : 'text-sm mt-2'} leading-relaxed ${c.dark ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {c.desc}
                  </p>

                  <div className={`${c.big ? 'mt-5' : 'mt-4'} inline-flex items-center gap-1 ${c.big ? 'text-sm' : 'text-xs'} font-semibold ${c.dark ? 'text-mint-300' : 'text-mint-700'} group-hover:gap-2 transition-all`}>
                    {c.cta}
                    <ArrowUpRight className={c.big ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
                  </div>
                </div>

                {/* Decoración visual para la card grande Capa 1 — llena el espacio */}
                {c.big && (
                  <div aria-hidden className="hidden lg:block mt-auto pt-8">
                    <div className="flex items-end justify-between gap-2">
                      {[
                        { h: 'h-16', label: 'Ley 21.521', tone: 'bg-mint-100 text-mint-700 border-mint-200' },
                        { h: 'h-24', label: 'Ley 19.496', tone: 'bg-mint-200/60 text-mint-700 border-mint-300' },
                        { h: 'h-20', label: 'Ley 21.713', tone: 'bg-mint-100 text-mint-700 border-mint-200' },
                        { h: 'h-28', label: 'Ley 20.009', tone: 'bg-mint-300/70 text-mint-700 border-mint-300' },
                        { h: 'h-16', label: 'Ley 21.719', tone: 'bg-mint-100 text-mint-700 border-mint-200' },
                      ].map((b) => (
                        <div key={b.label} className={`flex-1 min-w-0 ${b.h} rounded-2xl border ${b.tone} flex items-end justify-center pb-1.5 transition-all group-hover:scale-[1.02] group-hover:-translate-y-0.5`}>
                          <span className="text-[8.5px] font-mono font-semibold whitespace-nowrap px-1">{b.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}