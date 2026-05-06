import React from 'react';
import Eyebrow from '@/components/editorial/Eyebrow';

export default function SectionHeader({ eyebrow, title, description, status = 'ready' }) {
  const statusConfig = {
    ready: { label: 'Listo para copiar', color: 'bg-mint-500' },
    pending: { label: 'Pendiente de input manual', color: 'bg-orange-500' },
  }[status];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <Eyebrow size="sm">{eyebrow}</Eyebrow>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-editorial">
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} animate-pulse-soft`} />
          {statusConfig.label}
        </span>
      </div>
      <h2 className="font-display tracking-tight text-3xl sm:text-4xl font-bold text-foreground">
        {title}
      </h2>
      {description && <p className="mt-3 text-muted-foreground max-w-3xl">{description}</p>}
    </div>
  );
}