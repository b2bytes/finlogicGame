import React from 'react';
import { Video, AudioLines, Type, Palette, Download, Wand2 } from 'lucide-react';

/**
 * Especificaciones técnicas profesionales · calidad broadcast.
 * Cada bloque es lo mínimo no-negociable para que el video se vea
 * a la altura de Apple keynote / Linear launch / Stripe Sessions.
 */

const SPECS = [
  {
    icon: Video,
    title: 'Captura de pantalla',
    items: [
      'Resolución: 3840×2160 (4K) editado a 1920×1080 (downsample = más nitidez)',
      'Frame rate: 60fps consistente · sin variable',
      'Codec: ProRes 422 HQ master · H.264 entrega final',
      'Herramienta: Screen Studio (Mac) · Cleanshot X · OBS con escena programada',
      'Cursor: magnificado +30%, color mint #0E7A47, click ripple visible',
      'Browser Chrome incognito · viewport 1440×900 · zoom 100%',
      'Cero notificaciones · MacOS focus mode activo · WiFi estable',
    ],
  },
  {
    icon: AudioLines,
    title: 'Voz en off',
    items: [
      'ElevenLabs · voz "Sabina" o "Catalina" es-CL (modelo Multilingual v2)',
      'Settings: stability 0.45 · similarity 0.75 · style 0.30 · speaker boost ON',
      'Si grabación humana: micrófono Shure SM7B + Cloudlifter · cabina tratada',
      'Levelado a -16 LUFS integrado (estándar broadcast/streaming)',
      'True Peak máximo -1 dBTP · sin clipping',
      'De-esser sutil + EQ high-pass a 80Hz · compresión 3:1 ratio',
      'Pausas dramáticas de 800ms en momentos clave (después de "500.000")',
    ],
  },
  {
    icon: Type,
    title: 'Tipografía y subtítulos',
    items: [
      'Subtítulos cerrados: SRT incluido · accesibilidad WCAG 2.1 AA',
      'On-screen: Plus Jakarta Sans Bold 32pt blanco · drop shadow 0 2 8 #000/40',
      'Cifras-héroe: Plus Jakarta Black 96-240pt mint #0E7A47 · tabular-nums',
      'Quotes editoriales: Fraunces italic 36-48pt · letter-spacing -0.03em',
      'Eyebrows / lower-thirds: JetBrains Mono Bold 12pt UPPERCASE tracking +1.5',
      'Animación texto: type-on por palabra (no por letra) · 80ms entre palabras',
      'Safe area: 5% margen lados · 10% margen arriba/abajo (TV-safe)',
    ],
  },
  {
    icon: Palette,
    title: 'Color grading FinLogic',
    items: [
      'Fondo crema: #FAF6EC (HSL 42 45 96) · NO blanco puro',
      'Mint primario: #0E7A47 (HSL 152 79 26) · firma visual',
      'Coral editorial: #E25A3B para cifras críticas (multas, plazos vencidos)',
      'Dark mode (slide SFA): #0E1217 + mint fluo #2DD181',
      'LUT Apple-style: shadows lift +5%, highlights -8%, vibrance +12%',
      'Transiciones: cross-fade 400ms cubic-bezier(.22,1,.36,1)',
      'Cuts secos en momentos de tensión (Acto 1 final, drop musical)',
    ],
  },
  {
    icon: Wand2,
    title: 'Música y diseño sonoro',
    items: [
      'Track principal: Epidemic Sound · "Restoration" o "Coastline" (cinematic ambient)',
      'Build-up gradual: -22dB → -14dB siguiendo arco emocional 3 actos',
      'Drop musical en min 1:50 (cuando aparece "Cero alucinaciones")',
      'SFX UI auténticos: clicks reales del producto · no genéricos',
      'Silencio dramático: 2s al inicio + 800ms post "el pueblo tiene acceso"',
      'Ducking automático -8dB cuando hay voz en off',
      'Outro: fade-out completo en últimos 3 segundos al silencio absoluto',
    ],
  },
  {
    icon: Download,
    title: 'Entrega final',
    items: [
      'Master: MP4 1080p H.264 · CRF 18 · ~150-250 MB',
      'Backup: ProRes 422 HQ · ~2-3 GB para edición posterior',
      'Plataforma: YouTube unlisted (max calidad) + Vimeo Pro (backup)',
      'Subtítulos SRT en español + inglés (jurado bilingüe)',
      'Thumbnail: cierre del video con manifiesto + logo + QR',
      'Pegar URL en components/demo/DemoVideoPlayer línea 13',
      'Notificar a Bendi: email con link público + transcripción + dossier técnico',
    ],
  },
];

export default function DemoSpecs() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
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