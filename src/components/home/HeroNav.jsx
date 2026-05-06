import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import AccessibilityToggle from '@/components/a11y/AccessibilityToggle';

const navItems = [
  { label: 'Lya IA', to: '/AsistenteLya' },
  { label: 'Casos', to: '/Casos' },
  { label: 'Pyme', to: '/Pyme' },
  { label: 'API B2B', to: '/api-compliance' },
  { label: 'Precios', to: '/Pricing' },
  { label: 'Transparencia', to: '/Transparencia' },
];

export default function HeroNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" aria-label="FinLogic — Ir al inicio">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? 'text-mint-700 bg-mint-50'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-mint-50/60 border border-mint-200/60 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-mint-600" />
            <span className="font-semibold text-mint-700">Ley 21.521</span>
          </div>
          <AccessibilityToggle />
          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex rounded-full bg-foreground hover:bg-foreground/90 text-background h-9 px-4 font-semibold gap-1.5"
          >
            <Link to="/Consulta">
              Consultar gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Abrir menú"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur">
          <nav className="px-6 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium px-3 py-2.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/Consulta"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background h-11 px-4 text-sm font-semibold"
            >
              Consultar gratis
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}