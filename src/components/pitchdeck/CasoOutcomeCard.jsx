import React from 'react';

/**
 * CasoOutcomeCard — slide 6 del deck: $380K en 7 días.
 * Avatar + nombre·organismo + descripción + cifra-héroe mint.
 */
export default function CasoOutcomeCard({
  name,
  organism,
  description,
  amount,
  amountSuffix,
  emoji,
  avatarBg = 'mint',
}) {
  const avatarBgs = {
    mint: 'bg-mint-100',
    peach: 'bg-[hsl(28_80%_92%)]',
    lilac: 'bg-[hsl(280_60%_94%)]',
    cream: 'bg-[hsl(45_85%_92%)]',
  };

  return (
    <div className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-soft hover:shadow-soft-lg transition-all">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-12 h-12 rounded-full ${avatarBgs[avatarBg]} flex items-center justify-center text-2xl flex-shrink-0`}>
          {emoji}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-foreground">
            {name} <span className="text-muted-foreground font-normal">· {organism}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

      <div className="mt-6 pt-5 border-t border-dashed border-border flex items-baseline gap-2 flex-wrap">
        <span className="hero-number text-mint-600 text-4xl sm:text-5xl">{amount}</span>
        {amountSuffix && (
          <span className="text-sm text-muted-foreground font-medium">{amountSuffix}</span>
        )}
      </div>
    </div>
  );
}