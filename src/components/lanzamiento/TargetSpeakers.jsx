import React from 'react';
import { ExternalLink, Target } from 'lucide-react';
import Eyebrow from '@/components/editorial/Eyebrow';

const TARGETS = [
  {
    tier: 'TIER 1 · ALIADOS NATURALES',
    color: 'mint',
    people: [
      {
        name: 'Felipe Pizarro Astudillo',
        role: 'Especialista Fraude Bancario · 17 años',
        why: 'Su tema = Ley 20.009. FinLogic genera cartas de fraude en 5 min. Match perfecto. Pídele que pruebe el endpoint /fraud-pattern-match en vivo.',
        approach: 'LinkedIn DM hoy 22:00 + saludo presencial mañana 09:30 en pasillo BancoEstado. Demo de 90 segundos.',
        link: 'https://cl.linkedin.com/in/fpizarroa',
        cta: 'Co-creación de paper anti-phishing chileno',
      },
      {
        name: 'Hugo Guerra',
        role: 'Developer · líder AI Tinkerers Santiago · Bendita IA',
        why: 'Comunidad técnica AI activa en fintech. fintech.benditaia.cl ya existe. Nosotros somos su caso de estudio. Charla conjunta natural.',
        approach: 'Llegar a su mesa en Mercado Pago Stage. Mostrar Lya en vivo desde el celular. Proponer episodio podcast Bendita IA.',
        link: 'https://www.instagram.com/benditaia/',
        cta: 'Co-host de demo técnica + caso AI Tinkerers junio',
      },
      {
        name: 'Josefina Movillo',
        role: 'Directora Ejecutiva FinteChile',
        why: 'Es LA puerta institucional. FinteChile organiza el Forum. Si ella habla bien de nosotros, +312 fintechs nos miran.',
        approach: 'Reunión post-keynote (slot 12:30). Pitch corto: "5 endpoints listos para Ley 21.521 + NCG 502". Pedir intro a 3 fintechs piloto.',
        link: 'https://www.linkedin.com/in/josefina-movillo/',
        cta: 'Membresía FinteChile + acceso a working group SFA',
      },
    ],
  },
  {
    tier: 'TIER 2 · CLIENTES B2B PRIORITARIOS',
    color: 'peach',
    people: [
      {
        name: 'Carlos Prada',
        role: 'Director Operaciones · Nubank Global',
        why: '4M clientes en Colombia. Si entran a Chile bajo SFA, Compliance API es su atajo. $490K CLP/mes vs 18 meses de in-house.',
        approach: 'Stand de Nubank o coffee break tarde. Mostrar el dashboard /api-compliance + ROI calculator.',
        link: 'https://www.linkedin.com/in/carlos-prada-nubank/',
        cta: 'POC 60 días gratis + integración antes 4 julio',
      },
      {
        name: 'Carlos Daniel Urrutia',
        role: 'GM International Expansion · Revolut',
        why: 'Revolut entra a Chile. Necesita compliance local con TMC, Ley 18.010, NCG 502. Nosotros lo cubrimos en 1 día.',
        approach: 'Anunciar en LinkedIn antes del evento. Buscarlo en ronda internacional. Pitch en inglés 2 min.',
        link: 'https://www.linkedin.com/in/carlos-daniel-urrutia-2461a761/',
        cta: 'Compliance-as-a-service para entrada Revolut Chile',
      },
      {
        name: 'Mario Braz',
        role: 'GM · Stripe Brasil',
        why: 'Stripe partner internacional. Chile = próximo mercado. /verify-entity + /regulatory-impact son sus dolores hoy.',
        approach: 'Tarjeta + QR a finlogic.one. Follow-up vía LinkedIn 8 mayo.',
        link: 'https://www.linkedin.com/in/mariokbraz/',
        cta: 'Integración Stripe Connect + FinLogic Compliance',
      },
    ],
  },
  {
    tier: 'TIER 3 · AUTORIDADES (legitimidad)',
    color: 'lilac',
    people: [
      {
        name: 'Jorge Rodrigo Trujillo',
        role: 'Director · Servicio de Impuestos Internos',
        why: 'FinLogic Capa Pyme cita SII directo. Si nos avala, tenemos sello institucional para 1.7M pymes chilenas.',
        approach: 'Saludo formal post-charla. Ficha cívica impresa (1 página). Email de seguimiento mismo día.',
        link: 'https://www.linkedin.com/in/jorge-trujillo-puentes/',
        cta: 'Convenio educativo: FinLogic como traductor SII para pymes',
      },
      {
        name: 'Claudio Raddatz',
        role: 'Gerente Política Financiera · Banco Central',
        why: 'BCN cita indicadores en cmfRealAPI. Si valida nuestro pipeline, AgentTrace gana respaldo regulatorio.',
        approach: 'Solo escuchar y tomar contacto. NO pedir nada. Carta formal después.',
        link: '#',
        cta: 'Working paper conjunto sobre IA y educación financiera',
      },
      {
        name: 'Karlfranz Koehler',
        role: 'Subsecretario Economía · Pymes',
        why: 'Política pyme = nuestro Capa 2. Pro-Pyme + 21.713. Hay potencial de piloto público.',
        approach: 'Stand de Min. Economía. Mostrar Health Score en vivo de pyme demo.',
        link: '#',
        cta: 'Piloto SERCOTEC: 100 pymes con FinLogic gratis 6 meses',
      },
    ],
  },
];

const COLORS = {
  mint: 'border-mint-300 bg-mint-50/40',
  peach: 'border-[hsl(28_60%_75%)] bg-[hsl(28_80%_94%)]/40',
  lilac: 'border-[hsl(280_50%_75%)] bg-[hsl(280_60%_95%)]/40',
};

export default function TargetSpeakers() {
  return (
    <section className="px-6 lg:px-12 py-16 sm:py-20">
      <div className="max-w-6xl mx-auto">
        <Eyebrow size="md" className="mb-4">🎯 TARGETING TÁCTICO</Eyebrow>
        <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-5xl mb-4 leading-tight">
          9 personas. 3 tiers.<br />
          <span className="text-mint-600">Conversión: 3 pilotos B2B + 1 convenio público.</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl">
          Datos verificados desde fuentes públicas (LinkedIn, chilefintechforum.com/speakers-2026, prensa).
          Cada contacto tiene un ángulo único alineado a nuestros 12 módulos normativos.
        </p>

        <div className="mt-12 space-y-12">
          {TARGETS.map((tier) => (
            <div key={tier.tier}>
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-4 h-4 text-mint-600" />
                <h3 className="font-mono-editorial text-xs font-bold uppercase tracking-wider text-foreground">
                  {tier.tier}
                </h3>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {tier.people.map((p) => (
                  <article key={p.name} className={`rounded-3xl border-2 p-6 shadow-soft ${COLORS[tier.color]}`}>
                    <h4 className="font-display tracking-tight text-xl font-bold text-foreground">{p.name}</h4>
                    <p className="text-xs font-mono-editorial text-mint-700 mt-1 mb-4">{p.role}</p>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-muted-foreground mb-1">¿Por qué?</p>
                        <p className="text-foreground/85 leading-relaxed">{p.why}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-muted-foreground mb-1">Approach</p>
                        <p className="text-foreground/85 leading-relaxed">{p.approach}</p>
                      </div>
                      <div className="pt-3 border-t border-border/60">
                        <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-muted-foreground mb-1">Pitch específico</p>
                        <p className="text-foreground font-semibold leading-snug">{p.cta}</p>
                      </div>
                    </div>
                    {p.link && p.link !== '#' && (
                      <a
                        href={p.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-mint-700 hover:text-mint-800"
                      >
                        Perfil <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}