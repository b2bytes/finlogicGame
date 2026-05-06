import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Film, Sparkles } from 'lucide-react';
import Logo from '@/components/home/Logo';
import Eyebrow from '@/components/editorial/Eyebrow';
import EditorialHeading from '@/components/editorial/EditorialHeading';
import DemoVideoPlayer from '@/components/demo/DemoVideoPlayer';
import DemoScript from '@/components/demo/DemoScript';
import DemoSpecs from '@/components/demo/DemoSpecs';
import DemoChecklist from '@/components/demo/DemoChecklist';

/**
 * /Demo — página de producción del video Bendi (3 min).
 *
 * Estructura:
 *   1. Player con el video (o placeholder si no hay URL)
 *   2. Guion shot-by-shot oficial — voz en off + visual + on-screen
 *   3. Especificaciones técnicas — captura, audio, color, entrega
 *
 * Esta página sirve dos audiencias:
 *   - Equipo FinLogic: producción profesional del video
 *   - Jurado Bendi: validación del rigor que pusimos en la entrega
 */
export default function Demo() {
  return (
    <div className="bg-background min-h-screen">
      {/* Header sticky */}
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <Logo size="sm" />
          <Link
            to="/Rubrica"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono-editorial uppercase tracking-wider text-mint-700 hover:text-mint-800 transition-colors"
          >
            <Award className="w-3.5 h-3.5" /> Rúbrica
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero */}
        <div className="mb-12 animate-fade-up">
          <Eyebrow size="md" className="mb-5">
            <Film className="w-3 h-3" />
            Video oficial · Claude Impact Lab Chile · 6-7 mayo 2026
          </Eyebrow>
          <EditorialHeading size="xl">
            4:30 minutos para<br />
            <span className="text-mint-600">tumbarlos.</span>
          </EditorialHeading>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl leading-relaxed">
            Guion cinematográfico de 3 actos sobre la rúbrica oficial Bendi: 25% impacto, 25% Claude, 20% datos, 15% funciona, 15% narrativa. Bonus agéntico +5. Cada segundo mapeado a un criterio.
          </p>
        </div>

        {/* Player */}
        <section className="mb-16">
          <DemoVideoPlayer />
        </section>

        {/* Guion */}
        <section className="mb-16">
          <div className="mb-7">
            <Eyebrow size="sm" className="mb-3">Guion cinematográfico · 9 escenas · 3 actos</Eyebrow>
            <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-4xl">
              Cada escena pesa un criterio.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Voz en off en español chileno (ElevenLabs Sabina). Pacing emocional 3 actos: tensión → solución → manifiesto. Producto real en producción. Sin mockups.
            </p>
          </div>
          <DemoScript />
        </section>

        {/* Specs técnicas */}
        <section className="mb-16">
          <div className="mb-7">
            <Eyebrow size="sm" className="mb-3">Especificaciones técnicas · calidad broadcast</Eyebrow>
            <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-4xl">
              Cómo lo grabamos.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Apple keynote · Linear launch · Stripe Sessions. Mismo lenguaje visual del PitchDeck (mint editorial + crema cálido + Fraunces).
            </p>
          </div>
          <DemoSpecs />
        </section>

        {/* Pre-flight checklist */}
        <section className="mb-16">
          <div className="mb-7">
            <Eyebrow size="sm" className="mb-3">Pre-flight checklist</Eyebrow>
            <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-4xl">
              Todo listo antes del REC.
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              28 items que validar antes de presionar grabar. El progreso se guarda en este navegador.
            </p>
          </div>
          <DemoChecklist />
        </section>

        {/* CTA */}
        <Link
          to="/Rubrica"
          className="group block bg-gradient-to-br from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-700 text-white rounded-3xl p-7 sm:p-9 shadow-soft-lg transition-all hover:shadow-mint"
        >
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[280px]">
              <Eyebrow size="sm" className="mb-3 !text-mint-100">
                <Award className="w-3 h-3" /> Validación cruzada
              </Eyebrow>
              <h3 className="font-display tracking-tight text-2xl sm:text-3xl font-bold leading-tight">
                Cuando el video esté grabado,<br />
                <span className="text-mint-200">la rúbrica lo valida en vivo.</span>
              </h3>
              <p className="mt-4 text-sm text-mint-50/85 max-w-2xl leading-relaxed">
                El criterio "Funciona · 13%" del validador agentic chequea automáticamente que el video sea accesible y dure entre 3 y 5 minutos.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white text-mint-700 h-12 px-6 font-bold text-sm shadow-soft group-hover:scale-[1.03] transition-transform">
              <Sparkles className="w-4 h-4" />
              Abrir rúbrica
            </div>
          </div>
        </Link>
      </main>
    </div>
  );
}