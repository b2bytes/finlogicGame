import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingTier({ tier }) {
  const { name, tagline, price, unit, priceNote, cta, ctaHref, features, highlight } = tier;

  return (
    <div
      className={`relative rounded-3xl p-7 flex flex-col ${
        highlight
          ? 'bg-foreground text-background shadow-soft-lg ring-1 ring-foreground'
          : 'bg-card border border-border shadow-soft'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-mint-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-mint">
          Más popular
        </span>
      )}

      <div className="mb-6">
        <h3 className={`font-display text-2xl font-bold ${highlight ? 'text-background' : 'text-foreground'}`}>
          {name}
        </h3>
        <p className={`mt-1 text-sm ${highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
          {tagline}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display text-4xl font-bold tracking-tight ${highlight ? 'text-background' : 'text-foreground'}`}>
            {price}
          </span>
          <span className={`text-sm ${highlight ? 'text-background/70' : 'text-muted-foreground'}`}>
            {unit}
          </span>
        </div>
        {priceNote && (
          <p className={`mt-1 text-xs ${highlight ? 'text-background/60' : 'text-muted-foreground'}`}>
            {priceNote}
          </p>
        )}
      </div>

      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check
              className={`w-4 h-4 mt-0.5 shrink-0 ${highlight ? 'text-mint-300' : 'text-mint-600'}`}
            />
            <span className={highlight ? 'text-background/90' : 'text-foreground/90'}>{f}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        size="lg"
        className={`rounded-full w-full font-medium ${
          highlight
            ? 'bg-mint-500 hover:bg-mint-600 text-white'
            : 'bg-foreground hover:bg-foreground/90 text-background'
        }`}
      >
        <Link to={ctaHref}>{cta}</Link>
      </Button>
    </div>
  );
}