import React from 'react';
import LegalPill from '@/components/editorial/LegalPill';

/**
 * PerfilCard — card de perfil ciudadano tipo deck v11 slide 3.
 * Avatar circular pastel + nombre + región + cita + pill legal.
 */
export default function PerfilCard({
  name,
  age,
  region,
  role,
  emoji,
  quote,
  organism,
  law,
  avatarBg = 'mint',
}) {
  const avatarBgs = {
    mint: 'bg-mint-100',
    peach: 'bg-[hsl(28_80%_92%)]',
    lilac: 'bg-[hsl(280_60%_94%)]',
    cream: 'bg-[hsl(45_85%_92%)]',
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all">
      <div className={`w-14 h-14 rounded-full ${avatarBgs[avatarBg]} flex items-center justify-center text-3xl mb-5`}>
        {emoji}
      </div>

      <h3 className="font-editorial text-2xl font-bold text-foreground">
        {name} <span className="text-foreground/60">· {age}</span>
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        {region} · {role}
      </p>

      <p className="mt-5 text-[15px] text-foreground/85 leading-relaxed font-editorial-italic">
        "{quote}"
      </p>

      <div className="mt-6">
        <LegalPill variant="law" size="sm">
          {organism} · {law}
        </LegalPill>
      </div>
    </div>
  );
}