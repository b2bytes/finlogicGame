import React from 'react';
import { Video, AudioLines, Type, Palette, Download } from 'lucide-react';

/**
 * Especificaciones técnicas del video — para que el operador (humano o IA)
 * grabe con calidad broadcast aplicable al jurado Bendi.
 */

const SPECS = [
  {
    icon: Video,
    title: 'Captura de pantalla',
    items: [
      'Resolución 1920×1080 · 60fps · MP4 H.264',
      'Cleanshot X / Loom / Screen Studio (Mac)',
      'Cursor magnificado + clicks visibles',
      'Browser en modo incognito sin extensiones',
      'Zoom 100% · viewport 1440×900 visible',
    ],
  },
  {
    icon: AudioLines,
    title: 'Voz en off',
    items: [
      'ElevenLabs · voz "Sabina" o "Catalina" es-CL',
      'Si grabación humana: micrófono cardioide condensador',
      'Levelado a -16 LUFS (estándar broadcast)',
      'Música de fondo: Epidemic Sound · "calm corporate"',
      'Mezcla: voz -3dB, música -18dB ducked',
    ],
  },
  {
    icon: Type,
    title: 'Tipografía y subtítulos',
    items: [
      'Subtítulos: Plus Jakarta Sans Bold 28pt blanco',
      'Cifras-héroe: Inter / Jakarta 96pt mint #0E7A47',
      'Quotes editoriales: Fraunces italic 36pt',
      'Eyebrows: JetBrains Mono 12pt uppercase tracking +1.5',
      'Lower-thirds: badge mint 16pt con eyebrow + título',
    ],
  },
  {
    icon: Palette,
    title: 'Color grading FinLogic',
    items: [
      'Fondo crema #FAF6EC (HSL 42 45 96)',
      'Mint primario #0E7A47 (HSL 152 79 26)',
      'Coral editorial #E25A3B para cifras críticas',
      'Dark mode (slide SFA): #0E1217 + mint fluo #2DD181',
      'Transiciones: cross-fade 400ms cubic-bezier(.22,1,.36,1)',
    ],
  },
  {
    icon: Download,
    title: 'Entrega final',
    items: [
      'Master: MP4 1080p H.264 · ~80-150 MB',
      'Subido a YouTube unlisted o Loom · link público',
      'Backup en Vimeo Pro para alta calidad jurado',
      'Pegar URL en components/demo/DemoVideoPlayer',
      'Notificar a Bendi con link directo + transcripción',
    ],
  },
];

export default function DemoSpecs() {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {SPECS.map((spec, i) => {
        const Icon = spec.icon;
        return (
          <div
            key={i}
            className="bg-background rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg transition-shadow"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-full bg-mint-100 flex items-center justify-center">
                <Icon className="w-4 h-4 text-mint-700" />
              </div>
              <h4 className="font-display font-bold text-foreground">{spec.title}</h4>
            </div>
            <ul className="space-y-2">
              {spec.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
                  <span className="text-mint-600 font-bold mt-0.5 flex-shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}