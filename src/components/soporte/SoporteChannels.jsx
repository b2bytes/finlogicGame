import React from 'react';
import { MessageCircle, Mail, Phone, Send } from 'lucide-react';

const CHANNELS = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    detail: 'Canal principal · respuesta <5min',
    sla: 'Don Luis y casos urgentes',
  },
  {
    icon: Send,
    label: 'Telegram',
    detail: 'Técnico y equipo · <10min',
    sla: 'Roberto / fraude activo',
  },
  {
    icon: Mail,
    label: 'Email',
    detail: 'B2B y consultas no urgentes · <1h SLA',
    sla: 'Compliance API y partners',
  },
  {
    icon: Phone,
    label: 'Voz',
    detail: 'Llamada guiada · <5min',
    sla: 'Modo accesibilidad activo',
  },
];

export default function SoporteChannels() {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {CHANNELS.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="bg-card rounded-3xl border border-border p-5 shadow-soft hover:shadow-soft-lg transition-shadow"
          >
            <div className="w-10 h-10 rounded-2xl bg-mint-50 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-mint-700" />
            </div>
            <div className="font-display font-bold text-foreground">{c.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.detail}</div>
            <div className="text-xs text-mint-700 font-medium mt-2">{c.sla}</div>
          </div>
        );
      })}
    </div>
  );
}