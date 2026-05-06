import React, { useState } from 'react';
import { Clock, Mic, Camera, Sparkles, Music2, Type as TypeIcon, ChevronDown } from 'lucide-react';

/**
 * Guion profesional shot-by-shot · 4:30 min · Video Claude Impact Lab Bendi 2026.
 *
 * Mapeo riguroso a la rúbrica oficial:
 *   25% impacto ciudadano · 25% Claude/agéntico · 20% datos responsables
 *   15% funciona · 15% narrativa · +5 bonus agéntico
 *
 * Estructura cinematográfica de 3 actos con 9 escenas:
 *   ACTO 1 — PROBLEMA (00:00-01:00) → tensión
 *   ACTO 2 — SOLUCIÓN (01:00-03:30) → Claude trabajando + tracción
 *   ACTO 3 — VISIÓN (03:30-04:30) → monetización + cierre manifiesto
 */

const SCENES = [
  // ═══════════════ ACTO 1 — PROBLEMA ═══════════════
  {
    act: 'ACTO 1 · PROBLEMA',
    time: '00:00 — 00:08',
    duration: '8s',
    weight: 'Hook',
    title: 'Cold open · silencio + cifra',
    voiceover: '[2 segundos de silencio total. Solo respiración.]',
    visual: 'Pantalla negra absoluta. A los 2s, fade-in de la cifra "500.000" en cifra-héroe blanca 240pt sobre negro. Type-on letra por letra (180ms cada dígito). Sin música.',
    onScreen: 'Negro → "500.000" en blanco puro',
    audio: 'Silencio · luego ambient pad muy bajo entrando a -22dB',
    typography: 'Plus Jakarta Sans Black 240pt · letter-spacing -0.04em',
  },
  {
    act: 'ACTO 1 · PROBLEMA',
    time: '00:08 — 00:25',
    duration: '17s',
    weight: '25% impacto ciudadano',
    title: 'La frase que para el corazón',
    voiceover: '"Hoy, en Chile, hay 500.000 personas que presentaron un reclamo en SERNAC… sin saber si tenían razón. Eso no es ignorancia. Es un sistema diseñado para ser incomprensible."',
    visual: 'Cross-fade del negro al fondo crema FinLogic. La cifra "500.000" se desplaza arriba-izquierda y se reduce a 96pt mint. Aparece subtítulo Fraunces italic 42pt: "personas que reclamaron sin saber si tenían razón". B-roll de fondo: planos lentos de manos sosteniendo cartolas bancarias, primer plano de letra chica de contrato (blur).',
    onScreen: 'Capturas reales: cartolas bancarias / contratos con letra chica',
    audio: 'Pad ambient sube a -18dB · voz en off levelada -16 LUFS',
    typography: 'Quote en Fraunces italic · cifras en Plus Jakarta Black',
  },
  {
    act: 'ACTO 1 · PROBLEMA',
    time: '00:25 — 00:50',
    duration: '25s',
    weight: '15% narrativa ciudadana',
    title: 'Don Luis · el rostro humano',
    voiceover: '"Don Luis. Sesenta y ocho años. Valparaíso. Le aparece un cobro de ochenta y nueve mil novecientos noventa pesos que no reconoce. Antes tenía un teléfono y un familiar lejano. La burocracia ganaba siempre. Hoy… hoy tiene FinLogic."',
    visual: 'Foto editorial granulada de adulto mayor chileno mirando una boleta (banco de imágenes Pexels/Unsplash con tratamiento color crema). Lower-third con badge mint: "DON LUIS · 68 · VALPARAÍSO". A los 18s, corte directo a screen recording de iPhone abriendo /Consulta y escribiendo: "Me cobraron 89.990 que no reconozco". Cursor parpadea, presiona "Resolver" con haptic visual.',
    onScreen: 'Foto Don Luis → cut to /Consulta mobile real',
    audio: 'Pad sube + sutil string a -20dB cuando aparece Don Luis. Sonido UI auténtico al presionar Resolver.',
    typography: 'Lower-third en JetBrains Mono 14pt uppercase tracking +1.5',
  },
  {
    act: 'ACTO 1 · PROBLEMA',
    time: '00:50 — 01:00',
    duration: '10s',
    weight: 'Tensión',
    title: 'El "qué pasa ahora"',
    voiceover: '[Sin voz. Solo el sonido del pipeline arrancando.]',
    visual: 'Pantalla completa del PipelineLoader animado. Las 4 etapas (Triage · RAG · Specialist · Verifier) se iluminan secuencialmente. Cifra grande del cronómetro creciendo: 2.1s · 4.7s · 7.2s · 10.4s.',
    onScreen: 'PipelineLoader real corriendo en /Consulta',
    audio: 'Music drop completo. Solo "tick" sutil cada etapa + whoosh al completarse.',
    typography: 'Cronómetro en Plus Jakarta Black 96pt mint con tabular-nums',
  },

  // ═══════════════ ACTO 2 — SOLUCIÓN ═══════════════
  {
    act: 'ACTO 2 · SOLUCIÓN',
    time: '01:00 — 01:50',
    duration: '50s',
    weight: '25% uso de Claude · 20% datos responsables',
    title: 'Bajo el capó · Claude trabajando',
    voiceover: '"Lya orquesta. GPT-5 mini hace el triage en cuatrocientos ochenta milisegundos. Pinecone recupera la Ley veinte mil nueve, artículo quinto. Claude Sonnet cuatro punto seis redacta la respuesta en lenguaje humano. Y un verificador auditor —otro modelo independiente— le pone nota: noventa y uno sobre cien. Cero alucinaciones. Cita el artículo. Genera la carta. Todo en diez segundos. Y todo… auditable."',
    visual: 'Split-screen 60/40. Izquierda (60%): /Consulta con respuesta apareciendo en streaming, citas legales en pills mint, badges de score. Derecha (40%): /Transparencia abriéndose con AgentTrace en tiempo real, mostrando cada etapa del pipeline con timestamps. Subtítulos sincronizados aparecen abajo de cada nombre cuando se menciona: "GPT-5 MINI · TRIAGE", "PINECONE · RAG VECTORIAL", "CLAUDE SONNET 4.6 · ESPECIALISTA", "VERIFICADOR · AUDITOR INDEPENDIENTE". A los 35s, zoom in sobre la pill "Ley 20.009 Art. 5°" hasta llenar pantalla.',
    onScreen: 'Split: /Consulta + /Transparencia + AgentTrace tabla expandida',
    audio: 'Música build-up progresivo. A los 35s drop con kick suave cuando aparece "Ley 20.009 Art. 5°" en pantalla completa.',
    typography: 'Lower-thirds tipo terminal monospace · pills en Inter Bold con check ✓',
  },
  {
    act: 'ACTO 2 · SOLUCIÓN',
    time: '01:50 — 02:30',
    duration: '40s',
    weight: '+5 bonus agéntico',
    title: 'Acción real · no solo respuesta',
    voiceover: '"Pero responder no basta. Lya genera la carta de reclamo en PDF, lista para firmar. Calcula el plazo legal: cinco días hábiles según la Ley veinte mil nueve. Programa la alerta WhatsApp para el día tres. Y registra el caso en su historial. Don Luis no leyó nada. No buscó nada. Hizo. Una. Cosa."',
    visual: 'Secuencia rápida cinemática (ritmo de 4-5 segundos por shot): (1) PDF de carta ARCO renderizándose en /MisCasos. (2) LegalDeadline countdown 5 días con plazo legal art. 5°. (3) Mockup WhatsApp recibiendo alerta "Hola Don Luis, te queda 2 días para…". (4) /MisCasos con el caso resuelto y badge mint "DOCUMENTO GENERADO". Cada shot tiene un swipe-cut horizontal mint.',
    onScreen: 'PDF real + LegalDeadline countdown + WhatsApp mockup + /MisCasos',
    audio: 'Música in crescendo. Cada cut tiene un suttle "tick" sincronizado.',
    typography: 'Cifras tabular-nums en pills · countdown en hero-number 64pt',
  },
  {
    act: 'ACTO 2 · SOLUCIÓN',
    time: '02:30 — 03:15',
    duration: '45s',
    weight: '15% funciona · 20% datos',
    title: 'Tracción · datos en producción',
    voiceover: '"Esto no es un mockup. Hoy, en producción, sobre base44: mil ochocientos cuarenta y siete consultas resueltas. Score promedio del verificador: ochenta y nueve sobre cien. Trescientas doce cartas legales generadas. Ocho millones doscientos mil pesos recuperados a cuarenta y siete ciudadanos chilenos reales. Tasa de alucinaciones: cero coma cuatro por ciento. Todo en /Transparencia. Cualquier persona, cualquier jurado, puede auditarnos. Ahora mismo."',
    visual: 'Pantalla completa del PitchDeck slide tracción. Las 4 MetricCards aparecen una a una con counter-up animado (de 0 al número final en 800ms cubic-bezier). Cuando llega "0.4%" la cifra parpadea verde 2 veces. A los 30s, fade a /Transparencia público real con la tabla de AgentTraces visible y cifras live. Cursor en pantalla scrollea por la tabla.',
    onScreen: '/PitchDeck slide tracción → /Transparencia público real',
    audio: 'Música clean uptempo. Cada counter genera un sutil "tick" digital.',
    typography: '4 MetricCards · cifras-héroe Plus Jakarta Black 88pt mint #0E7A47',
  },

  // ═══════════════ ACTO 3 — VISIÓN ═══════════════
  {
    act: 'ACTO 3 · VISIÓN',
    time: '03:15 — 04:00',
    duration: '45s',
    weight: 'Modelo de negocio',
    title: 'Visión · monetización ya construida',
    voiceover: '"FinLogic Pro: tres mil novecientos noventa pesos al mes para el ciudadano. Cinco productos. Casos ilimitados. Compliance API: cuatrocientos noventa mil pesos al mes para fintechs reguladas. Cinco endpoints. Diez mil llamadas. Una sola multa CMF cuesta cinco mil UF: ciento noventa millones de pesos. La matemática se hace sola. Y la ventana SFA —Sistema de Finanzas Abiertas— se abre el cuatro de julio del veintiséis. En sesenta días."',
    visual: 'PitchDeck Slide 8 (Compliance API endpoints) navegado con scroll cinemático lento. A los 20s corte a slide 9 (SFA dark mode con countdown live a julio 2026 mostrando días reales). El countdown parpadea cuando se menciona "60 días". Lower-third permanente: "VENTANA SFA · 04 JUL 2026".',
    onScreen: '/PitchDeck slides 8 (API) y 9 (SFA dark mode countdown)',
    audio: 'Música tensa pero esperanzadora. Drop de bajo cuando se menciona la cifra $190M.',
    typography: 'Cifras pricing tabular-nums · countdown SFA en Plus Jakarta Black 120pt mint fluo',
  },
  {
    act: 'ACTO 3 · VISIÓN',
    time: '04:00 — 04:30',
    duration: '30s',
    weight: 'Cierre manifiesto · memoria del jurado',
    title: 'Cierre · el manifiesto',
    voiceover: '"Las leyes ya existen. Los organismos ya existen. La tecnología ya existe. FinLogic… es el puente. Esto no es un chatbot. Es el sistema operativo financiero del pueblo de Chile. Y hoy… por primera vez… el pueblo tiene acceso."',
    visual: 'Slide 12 PitchDeck cierre. Fondo crema. Aparece en cifra-héroe gigante 200pt: "Tu derecho. En tu idioma. Ahora." con cada frase fade-in independiente (1s entre cada una). Los últimos 8 segundos: logo FL grande centrado + URL "finlogic.one" + QR de 200x200. Música hace fade-out completo en los últimos 3 segundos. Cierra en negro absoluto con texto blanco pequeño: "Powered by Claude · base44 · Pinecone".',
    onScreen: '/PitchDeck slide 12 cierre + QR finlogic.one + créditos',
    audio: 'Música cierra con outro emocional · fade-out completo a silencio en los últimos 3s',
    typography: 'Manifiesto en Fraunces 200pt mint #0E7A47 · URL en Plus Jakarta 32pt · créditos en JetBrains Mono 11pt',
  },
];

const ACT_BADGES = {
  'ACTO 1 · PROBLEMA': 'bg-destructive/10 text-destructive border-destructive/20',
  'ACTO 2 · SOLUCIÓN': 'bg-mint-100 text-mint-700 border-mint-200',
  'ACTO 3 · VISIÓN': 'bg-foreground text-background border-foreground',
};

function SceneCard({ scene, index }) {
  const [open, setOpen] = useState(false);
  const actClass = ACT_BADGES[scene.act] || 'bg-secondary text-foreground border-border';

  return (
    <div className="bg-card rounded-3xl border border-border shadow-soft hover:shadow-soft-lg transition-shadow overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 sm:p-7 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center flex-shrink-0">
              <span className="font-display font-bold text-mint-700 text-sm">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="min-w-0">
              <p className="font-display font-bold text-foreground text-lg leading-tight">{scene.title}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-xs font-mono-editorial text-muted-foreground inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {scene.time}
                </span>
                <span className="text-[10px] font-mono-editorial text-mint-700 px-1.5 py-0.5 rounded bg-mint-50">
                  {scene.duration}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono-editorial uppercase tracking-wider border ${actClass}`}>
              {scene.act}
            </span>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-mint-50 text-mint-700 text-[10px] font-mono-editorial uppercase tracking-wider border border-mint-200">
          {scene.weight}
        </span>
      </button>

      {open && (
        <div className="px-6 sm:px-7 pb-7 space-y-4 border-t border-border bg-background/40">
          <div className="pt-5">
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

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <p className="text-[10px] font-mono-editorial uppercase tracking-widest text-muted-foreground mb-1 inline-flex items-center gap-1.5">
                <Music2 className="w-3 h-3" /> Audio
              </p>
              <p className="text-xs text-foreground/75 leading-snug">{scene.audio}</p>
            </div>
            <div className="bg-secondary rounded-2xl px-4 py-3">
              <p className="text-[10px] font-mono-editorial uppercase tracking-widest text-muted-foreground mb-1 inline-flex items-center gap-1.5">
                <TypeIcon className="w-3 h-3" /> Tipografía
              </p>
              <p className="text-xs text-foreground/75 leading-snug">{scene.typography}</p>
            </div>
          </div>

          <div className="bg-mint-50 border border-mint-100 rounded-2xl px-4 py-2.5 inline-flex items-center gap-2 max-w-full">
            <Sparkles className="w-3 h-3 text-mint-700 flex-shrink-0" />
            <p className="text-xs font-mono-editorial text-mint-800 truncate">On-screen: {scene.onScreen}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DemoScript() {
  const totalSeconds = 270; // 4:30
  const acts = ['ACTO 1 · PROBLEMA', 'ACTO 2 · SOLUCIÓN', 'ACTO 3 · VISIÓN'];
  const scenesByAct = acts.map((act) => ({
    act,
    scenes: SCENES.filter((s) => s.act === act),
    duration: SCENES.filter((s) => s.act === act).reduce((acc, s) => acc + parseInt(s.duration), 0),
  }));

  return (
    <div className="space-y-6">
      {/* Resumen estructural */}
      <div className="grid sm:grid-cols-3 gap-3 mb-2">
        {scenesByAct.map(({ act, scenes, duration }) => {
          const actClass = ACT_BADGES[act] || '';
          return (
            <div key={act} className="bg-card border border-border rounded-2xl p-4">
              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono-editorial uppercase tracking-wider border ${actClass} mb-2`}>
                {act}
              </span>
              <p className="text-xs text-muted-foreground">
                {scenes.length} escenas · <span className="font-mono-editorial text-foreground font-bold">{duration}s</span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground font-mono-editorial uppercase tracking-wider mb-2">
        Duración total: <span className="text-mint-700 font-bold">4:30 min</span> · {SCENES.length} escenas · Click en cada una para expandir
      </div>

      {SCENES.map((scene, i) => (
        <SceneCard key={i} scene={scene} index={i} />
      ))}
    </div>
  );
}