import React from 'react';
import { Clock, Mic, Camera, Sparkles } from 'lucide-react';

/**
 * Guion canónico shot-by-shot del video Bendi (3 min).
 * Basado en docs/mandato/paginas-361-420.md §1 (Pitch Claude Impact Lab).
 * Pesos rúbrica: 25% impacto · 25% Claude · 20% datos · 15% funciona · 15% narrativa · +5 bonus.
 */

const SCENES = [
  {
    time: '00:00 — 00:20',
    weight: '25% impacto ciudadano',
    title: 'Apertura · cifra que para el corazón',
    voiceover: '"Hoy, en Chile, hay 500.000 personas que presentaron un reclamo en SERNAC sin saber si tenían razón. Eso no es ignorancia. Es un sistema diseñado para ser incomprensible."',
    visual: 'Texto editorial sobre fondo crema FinLogic. Cifra "500.000" en cifra-héroe Plus Jakarta Sans 96pt mint #0E7A47, animación type-on. Cierra con plano del logo FL.',
    onScreen: 'Captura full-page de Home → eyebrow "EL PROBLEMA · CHILE 2026"',
  },
  {
    time: '00:20 — 00:45',
    weight: '15% narrativa ciudadana',
    title: 'Don Luis · el rostro humano',
    voiceover: '"Don Luis, 68 años, Valparaíso. Le aparece un cobro de $89.990 que no reconoce. Antes tenía un teléfono y un familiar lejano. Hoy tiene FinLogic."',
    visual: 'Foto editorial Don Luis (banco de imágenes adulto mayor chileno) → corte a su mensaje real escrito en /Consulta. Mostrar tipografía Fraunces para el quote.',
    onScreen: 'Screen recording: usuario escribe en /Consulta el caso Don Luis y presiona Resolver',
  },
  {
    time: '00:45 — 01:30',
    weight: '25% uso de Claude + 20% datos',
    title: 'Pipeline en vivo · Claude trabajando',
    voiceover: '"Lya orquesta. GPT-5 mini hace triage en 480 milisegundos. Pinecone recupera la Ley 20.009. Claude Sonnet 4.6 redacta. El verificador audita el score. Cita el artículo 5°. Genera la carta. Auditable, en /Transparencia."',
    visual: 'Split-screen: izquierda /Consulta con PipelineLoader animado (Triage→RAG→Specialist→Verifier). Derecha /Transparencia con AgentTrace real abriéndose, leyes citadas en pills mint. Subtítulos sincronizados con cada etapa.',
    onScreen: 'PipelineLoader real + AgentTrace: Ley 20.009 Art. 5° · Score 91/100 · 10620ms total',
  },
  {
    time: '01:30 — 02:00',
    weight: '15% funciona',
    title: 'Tracción real · números en producción',
    voiceover: '"Esto no es un mockup. Hoy en producción: 1.847 consultas resueltas, score promedio 89 sobre 100, 312 cartas generadas, 8.2 millones de pesos recuperados a 47 ciudadanos. Cero alucinaciones. 0.4%."',
    visual: 'Recorrido por PitchDeck Slide 7 (4 MetricCards). Cifras-héroe animadas con counter-up. Cerrar con badge "↗ Top 1%".',
    onScreen: 'Screenshot animado de /PitchDeck slide tracción',
  },
  {
    time: '02:00 — 02:30',
    weight: '+5 bonus agéntico',
    title: 'Visión · monetización ya construida',
    voiceover: '"Pro a 3.990 pesos al mes para el ciudadano. Compliance API a 490.000 pesos al mes para fintechs. Una multa CMF cuesta 5.000 UF, 190 millones. La matemática es simple. La ventana SFA se abre el 4 de julio."',
    visual: 'Slide 8 PitchDeck (Compliance API endpoints) + slide 9 SFA dark mode con countdown.',
    onScreen: '/PitchDeck slides 8 y 9 navegados con scroll cinemático',
  },
  {
    time: '02:30 — 03:00',
    weight: 'Cierre memorable',
    title: 'Cierre · el manifiesto',
    voiceover: '"Las leyes ya existen. Los organismos ya existen. FinLogic es el puente. Esto no es un chatbot. Es el sistema operativo financiero del pueblo de Chile. Y hoy, por primera vez, el pueblo tiene acceso."',
    visual: 'Slide 12 cierre PitchDeck. "Tu derecho. En tu idioma. Ahora." en cifra-héroe. QR finlogic.one en esquina. Logo FL fade-out.',
    onScreen: '/PitchDeck slide 12 cierre + QR',
  },
];

export default function DemoScript() {
  return (
    <div className="space-y-3">
      {SCENES.map((scene, i) => (
        <div
          key={i}
          className="bg-card rounded-3xl border border-border p-6 sm:p-7 shadow-soft hover:shadow-soft-lg transition-shadow"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-mint-700 text-sm">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="min-w-0">
                <p className="font-display font-bold text-foreground text-lg leading-tight">{scene.title}</p>
                <p className="text-xs font-mono-editorial text-muted-foreground mt-0.5 inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {scene.time}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-mint-50 text-mint-700 text-[10px] font-mono-editorial uppercase tracking-wider border border-mint-200 flex-shrink-0">
              {scene.weight}
            </span>
          </div>

          <div className="space-y-3 pl-12">
            <div>
              <p className="text-[10px] font-mono-editorial uppercase tracking-widest text-mint-700 mb-1.5 inline-flex items-center gap-1.5">
                <Mic className="w-3 h-3" /> Voz en off
              </p>
              <p className="font-editorial italic text-foreground/90 leading-relaxed text-[15px] border-l-2 border-mint-300 pl-4">
                {scene.voiceover}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono-editorial uppercase tracking-widest text-muted-foreground mb-1.5 inline-flex items-center gap-1.5">
                <Camera className="w-3 h-3" /> Visual
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">{scene.visual}</p>
            </div>

            <div className="bg-secondary rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 max-w-full">
              <Sparkles className="w-3 h-3 text-mint-700 flex-shrink-0" />
              <p className="text-xs font-mono-editorial text-foreground/70 truncate">{scene.onScreen}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}