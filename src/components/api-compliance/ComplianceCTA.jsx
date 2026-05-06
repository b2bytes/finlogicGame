import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';

export default function ComplianceCTA() {
  return (
    <section className="py-20 md:py-28 bg-foreground text-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-mint-300 mb-4">
          Prueba 30 días · Setup en 24h
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight leading-tight">
          Empieza con 10.000 llamadas gratis.
        </h2>
        <p className="mt-5 text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
          Si en 30 días no reduces al menos un riesgo regulatorio detectado, no pagas el primer mes.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-mint-500 hover:bg-mint-600 text-white h-12 px-7 font-semibold min-h-[48px] shadow-mint"
          >
            <a href="mailto:b2b@finlogic.one?subject=Prueba%20Compliance%20API">
              <Mail className="w-4 h-4 mr-2" />
              Solicitar prueba
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full bg-transparent border-white/20 text-background hover:bg-white/10 h-12 px-7 font-semibold min-h-[48px]"
          >
            <Link to="/B2B/APIKeys">
              Panel API Keys
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        <p className="mt-10 text-xs opacity-60">
          b2b@finlogic.one · <a href="#endpoints" className="underline hover:text-mint-300 transition-colors">Documentación pública de endpoints</a> · OpenAPI 3.1 disponible
        </p>
      </div>
    </section>
  );
}