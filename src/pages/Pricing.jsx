import React from 'react';
import HeroNav from '@/components/home/HeroNav';
import Footer from '@/components/home/Footer';
import PricingTier from '@/components/pricing/PricingTier';

const TIERS = [
  {
    name: 'Free',
    tagline: 'Para todo ciudadano de Chile.',
    price: '$0',
    unit: '/ siempre',
    cta: 'Consultar gratis',
    ctaHref: '/Consulta',
    features: [
      'Consultas ilimitadas en lenguaje simple',
      'Cartas ARCO y reclamos SERNAC/CMF',
      'Modo voz y accesibilidad',
      'AgentTrace público auditable',
      'Plazos legales con alertas',
    ],
  },
  {
    name: 'Pro',
    tagline: 'Para quien quiere ir un paso más allá.',
    price: '$3.990',
    unit: 'CLP / mes',
    priceNote: 'Cancelable cuando quieras',
    cta: 'Probar 7 días gratis',
    ctaHref: '/Consulta',
    highlight: true,
    features: [
      'Todo lo de Free',
      'Memoria persistente entre consultas',
      'Alertas WhatsApp de plazos legales',
      'Generación PDF prioritaria',
      'Asesoría 1:1 trimestral con aliado',
      'Score verificador detallado',
    ],
  },
  {
    name: 'Compliance API',
    tagline: 'Para fintechs reguladas.',
    price: '$490.000',
    unit: 'CLP / mes',
    priceNote: '10.000 llamadas + $0,008 USD c/u extra',
    cta: 'Hablar con ventas',
    ctaHref: '/api-compliance',
    features: [
      '5 endpoints regulatorios',
      '/check-tmc, /verify-entity, /regulatory-impact',
      '/fraud-pattern-match, /consumer-rights-check',
      'SLA <500ms p95',
      'Margen vs multa CMF (5.000 UF) inmediato',
      'Soporte dedicado',
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <HeroNav />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-mint-600 mb-3 uppercase tracking-wide">
            Precios honestos
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Gratis para Chile.<br />
            <span className="text-mint-600">Premium para fintechs.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            La capa ciudadana es y será gratuita. El B2B subsidia el flywheel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TIERS.map((t) => (
            <PricingTier key={t.name} tier={t} />
          ))}
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Pricing canónico FinLogic · Ley 21.521 · Registrada CMF
        </p>
      </main>

      <Footer />
    </div>
  );
}