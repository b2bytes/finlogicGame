import React from 'react';
import { Frame, CheckCircle2, Circle, Construction } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Pantallas faltantes / por iterar — wireframes de alta fidelidad
 * Estado: built · in_progress · planned
 */
const SCREENS = [
  {
    title: 'Detalle de caso · Timeline',
    route: '/MisCasos/:id',
    status: 'in_progress',
    description: 'Timeline normativo con plazos legales, documentos generados y trazabilidad IA.',
    mock: <CaseDetailMock />,
  },
  {
    title: 'Onboarding Pyme · 3 pasos',
    route: '/Pyme/onboarding',
    status: 'planned',
    description: 'Captura RUT, giro y régimen tributario en 3 pasos. Validación SII en tiempo real.',
    mock: <OnboardingMock />,
  },
  {
    title: 'Dashboard B2B · API Keys',
    route: '/B2B/APIKeys',
    status: 'in_progress',
    description: 'Issue/rotate keys, usage en tiempo real, billing Stripe, webhooks logs.',
    mock: <APIKeysMock />,
  },
  {
    title: 'Centro de notificaciones',
    route: '/Notificaciones',
    status: 'planned',
    description: 'Inbox unificado: plazos legales, novedades de caso, alertas tributarias.',
    mock: <NotificationsMock />,
  },
  {
    title: 'Perfil & Suscripción',
    route: '/Perfil',
    status: 'planned',
    description: 'Datos personales, plan actual, upgrade Pro, accesibilidad, idioma, voz.',
    mock: <ProfileMock />,
  },
  {
    title: 'Búsqueda global',
    route: '·command-k',
    status: 'planned',
    description: 'Comando ⌘K transversal: casos, docs, normativas, navegación. Lya integrado.',
    mock: <SearchMock />,
  },
];

const STATUS_MAP = {
  built: { icon: CheckCircle2, label: 'Construida', cls: 'bg-mint-50 border-mint-200 text-mint-700' },
  in_progress: { icon: Construction, label: 'En progreso', cls: 'bg-amber-50 border-amber-200 text-amber-700' },
  planned: { icon: Circle, label: 'Planificada', cls: 'bg-secondary border-border text-muted-foreground' },
};

export default function WireframesGallery() {
  return (
    <section id="wireframes" className="py-20 md:py-28 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-4">
            <Frame className="w-3.5 h-3.5 text-mint-700" />
            <span className="text-xs font-semibold text-mint-700">3 · Wireframes faltantes</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Lo que falta por construir,
            <span className="block text-mint-600">ya está diseñado.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Mockups de alta fidelidad para las 6 pantallas pendientes. Cada uno respeta el sistema
            de diseño y se integra con flujos existentes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {SCREENS.map((s, idx) => {
            const status = STATUS_MAP[s.status];
            return (
              <motion.article
                key={s.route}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-shadow group"
              >
                <div className="relative bg-gradient-to-br from-secondary/60 to-mint-50/40 p-5 sm:p-6 border-b border-border">
                  {/* Mockup phone frame */}
                  <div className="relative mx-auto w-48 sm:w-56">
                    <div className="bg-foreground rounded-[20px] p-1.5 shadow-soft-lg">
                      <div className="bg-card rounded-[14px] overflow-hidden h-56 sm:h-64">
                        {s.mock}
                      </div>
                      {/* Notch */}
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-foreground/20" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground leading-tight group-hover:text-mint-700 transition-colors">{s.title}</h3>
                      <code className="text-[10px] font-mono text-muted-foreground">{s.route}</code>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${status.cls} flex-shrink-0`}>
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ===== MOCKUPS ===== */

function CaseDetailMock() {
  return (
    <div className="p-3 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-mint-500" />
        <div className="h-2 w-24 rounded bg-foreground/80" />
        <span className="ml-auto text-[8px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">5 días</span>
      </div>
      <div className="flex-1 space-y-2 mt-1 overflow-hidden">
        <div className="h-2 w-3/4 rounded bg-secondary" />
        <div className="h-2 w-2/3 rounded bg-secondary" />
        <div className="mt-3 space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1 ${i === 1 ? 'bg-mint-500' : 'bg-border'}`} />
              <div className="flex-1">
                <div className="h-1.5 w-full rounded bg-secondary/80" />
                <div className="h-1.5 w-1/2 rounded bg-secondary/60 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 h-7 rounded-full bg-mint-600" />
    </div>
  );
}

function OnboardingMock() {
  return (
    <div className="p-3 h-full flex flex-col items-center justify-center text-center">
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`h-1 rounded-full ${i === 1 ? 'w-8 bg-mint-500' : 'w-4 bg-border'}`} />
        ))}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-mint-50 border border-mint-200 mb-3" />
      <div className="h-2 w-32 rounded bg-foreground/80 mb-1.5" />
      <div className="h-1.5 w-40 rounded bg-secondary mb-4" />
      <div className="w-full max-w-[180px] space-y-2">
        <div className="h-7 rounded-xl bg-secondary border border-border" />
        <div className="h-7 rounded-xl bg-secondary border border-border" />
        <div className="h-7 rounded-full bg-foreground mt-2" />
      </div>
    </div>
  );
}

function APIKeysMock() {
  return (
    <div className="p-3 h-full">
      <div className="flex items-center justify-between mb-2">
        <div className="h-2 w-20 rounded bg-foreground/80" />
        <div className="h-5 w-14 rounded-full bg-mint-600" />
      </div>
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border border-border">
            <div className="w-2 h-2 rounded-full bg-mint-500" />
            <div className="flex-1">
              <div className="h-1.5 w-24 rounded bg-foreground/60 mb-0.5" />
              <div className="h-1 w-32 rounded bg-secondary" />
            </div>
            <div className="text-[8px] font-mono text-muted-foreground">42K</div>
          </div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded-lg bg-secondary border border-border flex items-center justify-center">
            <div className="h-1.5 w-6 rounded bg-mint-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsMock() {
  return (
    <div className="p-3 h-full">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-24 rounded bg-foreground/80" />
        <div className="ml-auto h-4 w-4 rounded-full bg-destructive text-[8px] text-white flex items-center justify-center font-bold">3</div>
      </div>
      <div className="space-y-1.5">
        {[
          { color: 'bg-destructive', label: 'Plazo' },
          { color: 'bg-amber-500', label: 'Caso' },
          { color: 'bg-mint-500', label: 'Doc' },
          { color: 'bg-blue-500', label: 'Tip' },
        ].map((n, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-xl bg-secondary/40 border border-border">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n.color} flex-shrink-0`} />
            <div className="flex-1">
              <div className="h-1.5 w-full rounded bg-foreground/60 mb-1" />
              <div className="h-1 w-2/3 rounded bg-secondary" />
            </div>
            <div className="text-[8px] text-muted-foreground">{i + 1}h</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileMock() {
  return (
    <div className="p-3 h-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full bg-mint-500" />
        <div className="flex-1">
          <div className="h-2 w-20 rounded bg-foreground/80 mb-1" />
          <div className="h-1.5 w-28 rounded bg-secondary" />
        </div>
        <div className="text-[8px] font-bold text-mint-700 bg-mint-50 border border-mint-200 px-1.5 py-0.5 rounded">PRO</div>
      </div>
      <div className="space-y-1.5">
        {['Cuenta', 'Plan', 'Accesibilidad', 'Voz'].map((label) => (
          <div key={label} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/40 border border-border">
            <div className="h-1.5 w-16 rounded bg-foreground/60" />
            <div className="ml-auto h-3 w-6 rounded-full bg-mint-500/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchMock() {
  return (
    <div className="p-3 h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-[200px] bg-card border-2 border-mint-200 rounded-2xl p-2 shadow-soft-lg">
        <div className="flex items-center gap-2 px-1 mb-2">
          <div className="w-2 h-2 rounded-full bg-mint-500" />
          <div className="h-1.5 flex-1 rounded bg-secondary" />
          <div className="text-[7px] font-mono text-muted-foreground">⌘K</div>
        </div>
        <div className="space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-secondary">
              <div className="w-3 h-3 rounded bg-mint-100" />
              <div className="h-1 flex-1 rounded bg-foreground/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}