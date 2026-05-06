import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Wand2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import PillarSelector from '@/components/social/PillarSelector';
import VariantCard from '@/components/social/VariantCard';

export default function ContentStudio() {
  const [pillar, setPillar] = useState('derecho_hoy');
  const [platform, setPlatform] = useState('instagram');
  const [topic, setTopic] = useState('');
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setVariants([]);
    try {
      const response = await base44.functions.invoke('generateSocialContent', {
        pillar,
        platform,
        topic: topic.trim() || undefined,
      });
      setVariants(response.data?.variants || []);
    } catch (err) {
      setError(err.message || 'No se pudo generar el contenido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <Logo size="sm" />
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">Admin · Content Studio</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Calendario editorial con IA
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Genera 3 variantes A/B/C de copy alineadas a los 4 pilares (40/30/20/10) para cada plataforma.
            Mandato §SocialMediaAgent.
          </p>
        </div>

        <div className="grid lg:grid-cols-[400px_1fr] gap-8">
          <aside className="space-y-5">
            <PillarSelector
              pillar={pillar}
              platform={platform}
              onChange={({ pillar: p, platform: pl }) => {
                setPillar(p);
                setPlatform(pl);
              }}
            />

            <div className="bg-card border border-border rounded-3xl p-6 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Tema (opcional)
              </p>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ej: Cobros indebidos en tarjeta de crédito Banco Estado…"
                rows={3}
                className="w-full text-sm bg-secondary/40 border border-border rounded-2xl px-4 py-3 outline-none focus:border-mint-300 focus:bg-card transition-colors resize-none"
              />

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-full bg-mint-600 hover:bg-mint-700 text-white h-11 px-5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {loading ? 'Generando…' : 'Generar 3 variantes'}
              </button>

              {error && (
                <p className="mt-3 text-xs text-destructive">{error}</p>
              )}
            </div>
          </aside>

          <section>
            {variants.length === 0 && !loading ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center bg-card/40 border border-dashed border-border rounded-3xl p-10">
                <Wand2 className="w-10 h-10 text-mint-600 mb-3" />
                <p className="font-display text-xl font-bold text-foreground">
                  Tu calendario empieza aquí
                </p>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  Selecciona un pilar editorial, una plataforma y haz clic en "Generar".
                  Recibirás 3 variantes para A/B testing.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {loading &&
                  [1, 2, 3].map((i) => (
                    <div key={i} className="h-44 bg-secondary/40 rounded-3xl animate-pulse" />
                  ))}
                {variants.map((v, i) => (
                  <VariantCard key={i} variant={v} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}