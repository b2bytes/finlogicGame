import React from 'react';
import { Clock, Megaphone, Camera, MessageSquare, Send, Trophy } from 'lucide-react';
import Eyebrow from '@/components/editorial/Eyebrow';

const TIMELINE = [
  {
    when: 'HOY · 7 mayo 21:00',
    icon: Send,
    title: 'Disparo digital pre-evento',
    actions: [
      'Post LinkedIn personal de cada miembro del equipo: "Mañana en Espacio Riesco. FinLogic en vivo. ¿Te invito un café?"',
      'Tweet thread (X) etiquetando @fintechile_oficial @fpizarro y 5 fintechs sponsors',
      'Story Instagram con QR a finlogic.one + countdown 12h',
      'Email a base FinLogic existente: "Estaremos en CFF26. Búscanos."',
    ],
  },
  {
    when: 'MAÑANA 7 mayo 07:00',
    icon: Camera,
    title: 'Llegada y guerrilla visual',
    actions: [
      'Stickers FinLogic (200 unidades) repartidos en zona café',
      'Tarjetas mini con QR a /Demo (300 unidades) en welcome bag si es posible',
      'Pin "Ley 20.009 en 5 min" en solapa — abre conversación',
      'Foto del equipo en entrada Espacio Riesco → posteo coordinado 09:00',
    ],
  },
  {
    when: '7 mayo 09:00–13:00',
    icon: Megaphone,
    title: 'Bloque AM · networking dirigido',
    actions: [
      'Felipe Pizarro: 09:30 pasillo BancoEstado',
      'Hugo Guerra: 10:30 Mercado Pago Stage',
      'Josefina Movillo: 12:30 reunión formal post-keynote',
      'Demo de 90 segundos en celular: navegar → fillFormField → Lya respondiendo',
      'Cada conversación: pedir email + agendar follow-up vía Calendly',
    ],
  },
  {
    when: '7 mayo 14:00–18:00',
    icon: MessageSquare,
    title: 'Bloque PM · cierre B2B',
    actions: [
      'Carlos Prada (Nubank), Carlos Urrutia (Revolut), Mario Braz (Stripe)',
      'ROI calculator en pantalla: $490K vs 18 meses in-house',
      'Trial 60 días con onboarding personalizado',
      '3 reuniones formales agendadas para 8-15 mayo',
    ],
  },
  {
    when: '7 mayo 19:00',
    icon: Trophy,
    title: 'After + post-game',
    actions: [
      'Post LinkedIn cierre del día: "10 conversaciones, 3 demos, 1 piloto firmado"',
      'Newsletter exprés a leads capturados (mismo día)',
      'Métrica diaria pública en /Insights: leads B2B nuevos, demos en vivo',
    ],
  },
];

const TACTICAS_TRANSVERSALES = [
  { icon: '📲', title: 'finlogic.one en cada slide', desc: 'QR mint en credencial, polera, laptop. Que el QR ESTÉ EN TODAS PARTES.' },
  { icon: '🎙️', title: 'Lya como dispositivo viral', desc: 'Conversación de voz EN VIVO frente a la persona. 30 segundos de "wow" garantizado.' },
  { icon: '📊', title: 'Dato verificable + cifra editorial', desc: 'Siempre cerrar con: "$732K recuperados · 9.5 días · 89/100 score · 0.4% alucinación".' },
  { icon: '🗞️', title: 'Pull quote para prensa', desc: '"Las leyes ya existen. Los organismos ya existen. FinLogic es el puente."' },
  { icon: '🎬', title: 'Video 15s vertical al cierre', desc: 'Reel + TikTok mismo día con highlights. Distribución masiva 8 mayo 08:00.' },
  { icon: '🤝', title: 'Calendly público', desc: 'calendly.com/finlogic — slot disponible 8-15 mayo para todo lead capturado.' },
];

export default function PlanTactico() {
  return (
    <section className="px-6 lg:px-12 py-16 sm:py-20 bg-card/50 border-y border-border">
      <div className="max-w-6xl mx-auto">
        <Eyebrow size="md" className="mb-4">⏱ TIMELINE 24H · MODO GUERRA</Eyebrow>
        <h2 className="font-display tracking-tight font-bold text-foreground text-3xl sm:text-5xl mb-12 leading-tight">
          De aquí a mañana 19:00.
        </h2>

        <div className="space-y-6 max-w-4xl">
          {TIMELINE.map((step, i) => {
            const Icon = step.icon;
            return (
              <article key={i} className="bg-background rounded-3xl border border-border shadow-soft p-6 sm:p-8 flex flex-col sm:flex-row gap-5">
                <div className="flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-mint-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-mint-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-muted-foreground">Cuándo</p>
                    <p className="text-xs font-bold text-foreground whitespace-nowrap">{step.when}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-display tracking-tight text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                  <ul className="space-y-2">
                    {step.actions.map((a, j) => (
                      <li key={j} className="flex gap-2 text-sm text-foreground/85">
                        <span className="text-mint-600 font-bold flex-shrink-0">·</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16">
          <Eyebrow size="md" className="mb-4">🎯 TÁCTICAS TRANSVERSALES</Eyebrow>
          <h2 className="font-display tracking-tight font-bold text-foreground text-2xl sm:text-3xl mb-8">
            6 reglas que aplican siempre.
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TACTICAS_TRANSVERSALES.map((t) => (
              <div key={t.title} className="bg-background rounded-3xl border border-border shadow-soft p-6">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h4 className="font-display tracking-tight text-lg font-bold text-foreground mb-2">{t.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}