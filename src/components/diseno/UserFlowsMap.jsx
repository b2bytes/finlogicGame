import React from 'react';
import { Workflow, User, Briefcase, Building2, Code2, Heart } from 'lucide-react';
import FlowDiagram from './FlowDiagram';

// Estilos literales (Tailwind no admite dynamic class names)
const ICON_STYLES = {
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  mint: 'bg-mint-50 border-mint-200 text-mint-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
};

const FLOWS = [
  {
    id: 'camila',
    archetype: 'Camila · 28 años · Ciudadana',
    icon: Heart,
    color: 'rose',
    scenario: 'Detecta cobro indebido en su tarjeta',
    steps: [
      { route: '/', title: 'Landing Home', desc: 'Hero: "Tu derecho, en tu idioma"' },
      { route: '/Consulta', title: 'Consulta libre', desc: 'Describe el problema en lenguaje natural' },
      { route: '·pipeline', title: 'Pipeline IA', desc: 'Triage → RAG → Especialista → Verificador' },
      { route: '/MisCasos/:id', title: 'Caso creado', desc: 'CMF + plazo legal + acción sugerida' },
      { route: '·doc', title: 'Genera carta', desc: 'Reclamo CMF en PDF descargable' },
      { route: '/Transparencia', title: 'Auditoría', desc: 'Ver cómo Lya llegó a la respuesta' },
    ],
  },
  {
    id: 'donluis',
    archetype: 'Don Luis · 68 años · Adulto mayor',
    icon: User,
    color: 'amber',
    scenario: 'Modo accesibilidad — voz primero',
    steps: [
      { route: '/', title: 'Activa A11y', desc: 'Texto +25%, contraste alto' },
      { route: '/AsistenteLya', title: 'Asistente Lya', desc: 'Chat con voz STT/TTS' },
      { route: '·voz', title: 'Habla a Lya', desc: '"No reconozco un cobro"' },
      { route: '·respuesta', title: 'Lya responde por voz', desc: 'Pasos en lenguaje simple' },
      { route: '/MisCasos', title: 'Caso visible', desc: 'Botones 48px, alertas WhatsApp' },
    ],
  },
  {
    id: 'mariajose',
    archetype: 'María José · 35 años · Pyme',
    icon: Briefcase,
    color: 'mint',
    scenario: 'Onboarding pyme + análisis tributario',
    steps: [
      { route: '/Pyme', title: 'Landing Pyme', desc: 'Hero + propuesta SII/IVA' },
      { route: '·onboarding', title: 'Onboarding', desc: 'RUT, giro, régimen tributario' },
      { route: '·analyze', title: 'Análisis IA', desc: 'analyzeTaxSituation → score salud' },
      { route: '/Pyme', title: 'Dashboard', desc: 'HealthScore + alertas tributarias' },
      { route: '·alert', title: 'Alerta F29', desc: 'Vencimiento IVA en 5 días' },
    ],
  },
  {
    id: 'roberto',
    archetype: 'Roberto · 42 años · Fintech B2B',
    icon: Building2,
    color: 'blue',
    scenario: 'Integración Compliance API',
    steps: [
      { route: '/api-compliance', title: 'Landing B2B', desc: 'ROI calculator + endpoints' },
      { route: '·demo', title: 'Demo en vivo', desc: 'check-tmc en tiempo real' },
      { route: '/Pricing', title: 'Pricing', desc: 'Plan base $490K CLP/mes' },
      { route: '/B2B/APIKeys', title: 'Issue API key', desc: 'Stripe + key prefix' },
      { route: '·integra', title: 'Integración', desc: 'curl + SDK + webhooks' },
    ],
  },
  {
    id: 'agente',
    archetype: 'Lya · Agente IA transversal',
    icon: Code2,
    color: 'violet',
    scenario: 'Pipeline normativo end-to-end',
    steps: [
      { route: 'input', title: 'Query usuario', desc: 'Texto/voz/WhatsApp' },
      { route: 'triage', title: 'Triage', desc: 'GPT-5-mini · <600ms' },
      { route: 'tools', title: 'Tools en vivo', desc: 'CMF · UF · TMC · Fraude' },
      { route: 'rag', title: 'RAG', desc: '12 módulos normativos' },
      { route: 'specialist', title: 'Especialista', desc: 'Claude Sonnet 4.6' },
      { route: 'verifier', title: 'Verificador', desc: 'Score 85/100 target' },
      { route: 'output', title: 'Respuesta + caso', desc: 'AgentTrace público' },
    ],
  },
];

export default function UserFlowsMap() {
  return (
    <section id="flows" className="py-20 md:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-4">
            <Workflow className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">1 · Mapa de flujos</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            5 arquetipos. <span className="text-mint-600">Una experiencia coherente.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Cada flujo está diseñado en torno a un usuario real: el problema que vive, la ruta que toma
            dentro del producto y el resultado tangible que obtiene. Todo conectado por Lya.
          </p>
        </div>

        <div className="space-y-6">
          {FLOWS.map((flow) => (
            <article
              key={flow.id}
              className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft hover:shadow-soft-lg transition-shadow"
            >
              <header className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center flex-shrink-0 ${ICON_STYLES[flow.color] || ICON_STYLES.mint}`}>
                    <flow.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Arquetipo
                    </p>
                    <h3 className="font-display text-lg md:text-xl font-bold text-foreground leading-tight">
                      {flow.archetype}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Escenario: {flow.scenario}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                  {flow.steps.length} pasos
                </span>
              </header>
              <FlowDiagram steps={flow.steps} accentColor={flow.color} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}