import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Copy, Check } from 'lucide-react';

const SAMPLE_REQUEST = `curl -X POST https://api.finlogic.one/v1/lyaComplianceAPIEndpoint \\
  -H "x-api-key: fl_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint": "check-tmc",
    "payload": {
      "rate": 65,
      "productType": "consumo_no_reajustable"
    }
  }'`;

const SAMPLE_RESPONSE = {
  success: true,
  endpoint: 'check-tmc',
  latencyMs: 340,
  callsRemaining: 9847,
  data: {
    compliant: false,
    currentTMC: 49.92,
    excess: 15.08,
    legalBasis: 'Art. 6 bis Ley 18.010 · TMC publicada CMF',
  },
};

export default function DemoCheckTMC() {
  const [showResponse, setShowResponse] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_REQUEST);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="demo" className="py-20 md:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-mint-700 uppercase tracking-wide mb-3">Demo en vivo</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            <code className="font-mono text-mint-700">/check-tmc</code> en acción.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Crédito de consumo de $5M a 24 meses con tasa anual del 65%. Veamos qué responde la API.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Request */}
          <div className="bg-foreground rounded-3xl overflow-hidden shadow-soft-lg">
            <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-mint-500 text-white tracking-wider">POST</span>
                <code className="text-xs font-mono text-white/80">endpoint: check-tmc</code>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-white/60 hover:text-white flex items-center gap-1.5 min-h-[32px] px-2"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <pre className="p-5 text-xs md:text-sm text-mint-300 font-mono overflow-x-auto leading-relaxed">
              {SAMPLE_REQUEST}
            </pre>
            <div className="px-5 pb-5">
              <Button
                onClick={() => setShowResponse(true)}
                className="w-full rounded-full bg-mint-500 hover:bg-mint-600 text-white min-h-[48px] font-semibold"
              >
                <Play className="w-4 h-4 mr-2" />
                Ejecutar
              </Button>
            </div>
          </div>

          {/* Response */}
          <div className="bg-card rounded-3xl border border-border shadow-soft-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-white tracking-wider">200 OK</span>
                <code className="text-xs font-mono text-muted-foreground">application/json</code>
              </div>
              <span className="text-xs text-muted-foreground">~340ms</span>
            </div>
            {showResponse ? (
              <pre className="p-5 text-xs md:text-sm text-foreground font-mono overflow-x-auto leading-relaxed animate-fade-up">
                {JSON.stringify(SAMPLE_RESPONSE, null, 2)}
              </pre>
            ) : (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Pulsa <span className="font-semibold text-foreground">Ejecutar</span> para ver la respuesta JSON.
                </p>
              </div>
            )}
          </div>
        </div>

        {showResponse && (
          <div className="mt-8 bg-destructive/5 border border-destructive/20 rounded-3xl p-6 animate-fade-up">
            <p className="text-xs font-semibold text-destructive uppercase tracking-wide mb-2">Resultado</p>
            <p className="text-foreground leading-relaxed">
              Tasa propuesta <strong>65%</strong> excede la TMC vigente (<strong>49,92%</strong>) en 15,08 puntos.
              Si emites este crédito sin ajuste, expones a la fintech a una multa CMF de hasta <strong>5.000 UF</strong>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}