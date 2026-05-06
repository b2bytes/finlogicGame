import React, { useState } from 'react';
import { Code, Copy, Check, Sparkles } from 'lucide-react';

export default function EmbedSection() {
  const [copied, setCopied] = useState(false);
  const [accent, setAccent] = useState('mint');
  const [partner, setPartner] = useState('mi-sitio');

  const snippet = `<iframe
  src="https://finlogic.one/Embed/Lya?partner=${partner}&accent=${accent}"
  width="100%"
  height="560"
  style="border:1px solid #e5e7eb;border-radius:16px;max-width:480px"
  title="Lya · FinLogic"
  loading="lazy"
></iframe>`;

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-mint-50/40">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 text-mint-700 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Lya-Embed · White-label
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Embebe a Lya en tu sitio en 30 segundos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cualquier banco, fintech, mutual o medio puede ofrecer educación financiera con respaldo legal chileno. Pega el iframe y listo.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Configurador */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <p className="font-display font-bold mb-4 flex items-center gap-2">
              <Code className="w-4 h-4 text-mint-600" /> Personaliza tu embed
            </p>

            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Partner ID</label>
            <input
              value={partner}
              onChange={(e) => setPartner(e.target.value.replace(/[^a-z0-9-]/gi, '-').toLowerCase())}
              className="w-full bg-secondary/40 border border-border rounded-2xl px-4 py-2.5 text-sm mb-4 outline-none"
              placeholder="mi-sitio"
            />

            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Color de marca</label>
            <div className="flex gap-2 mb-4">
              {[
                { id: 'mint', bg: 'hsl(158 52% 42%)', label: 'Mint' },
                { id: 'navy', bg: 'hsl(220 60% 35%)', label: 'Navy' },
                { id: 'purple', bg: 'hsl(280 50% 45%)', label: 'Purple' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setAccent(c.id)}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-semibold border transition-all ${
                    accent === c.id ? 'border-foreground bg-foreground/5' : 'border-border bg-card hover:bg-secondary'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full" style={{ background: c.bg }} />
                  {c.label}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Snippet HTML</label>
            <pre className="bg-foreground text-background rounded-2xl p-4 text-[11px] overflow-x-auto leading-relaxed">
              {snippet}
            </pre>
            <button
              onClick={copy}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-mint-500 hover:bg-mint-600 text-white px-4 py-2.5 text-sm font-semibold"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado' : 'Copiar snippet'}
            </button>
          </div>

          {/* Preview en vivo */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
            <p className="font-display font-bold mb-4">Vista previa en vivo</p>
            <iframe
              key={`${accent}-${partner}`}
              src={`/Embed/Lya?partner=${partner}&accent=${accent}`}
              title="Lya Embed Preview"
              className="w-full h-[480px] rounded-2xl border border-border"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              Plan Embed: 5.000 consultas/mes desde $290.000 CLP. Más volumen, llamada directa.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}