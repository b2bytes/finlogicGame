import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import PreferencesMenu from '@/components/a11y/PreferencesMenu.jsx';

const navItems = [
  { label: 'Lya IA', to: '/AsistenteLya' },
  { label: 'Casos', to: '/Casos' },
  { label: 'Pyme', to: '/Pyme' },
  { label: 'API B2B', to: '/api-compliance' },
  { label: 'Precios', to: '/Pricing' },
  { label: 'Transparencia', to: '/Transparencia' },
  { label: '⚡ CFF26', to: '/Lanzamiento' },
];

export default function HeroNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40">
      {/* Skip-link accesible */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-full focus:bg-foreground focus:text-background focus:text-xs focus:font-semibold"
      >
        Saltar al contenido
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        <Link
          to="/"
          aria-label="FinLogic — Ir al inicio"
          className="flex-shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
        >
          <Logo size="md" />
        </Link>

        <nav aria-label="Navegación principal" className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`relative text-sm font-medium px-3 py-1.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground bg-mint-50/60 border border-mint-200/60 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3 h-3 text-mint-600" aria-hidden />
            <span className="font-semibold text-mint-700">Ley 21.521</span>
          </div>

          <PreferencesMenu />

          <Button
            asChild
            size="sm"
            className="hidden sm:inline-flex rounded-full bg-foreground hover:bg-foreground/90 text-background h-9 px-4 font-semibold gap-1.5 focus-visible:ring-2 focus-visible:ring-mint-500 focus-visible:ring-offset-2"
          >
            <Link to="/Consulta">
              Consultar gratis
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="md:hidden w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-mint-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="md:hidden border-t border-border/40 bg-card/95 backdrop-blur">
          <nav aria-label="Navegación móvil" className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`text-sm font-medium px-3 py-3 rounded-2xl transition-colors min-h-[48px] flex items-center ${
                    active
                      ? 'text-mint-700 bg-mint-50'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/Consulta"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground text-background h-12 px-4 text-sm font-semibold"
            >
              Consultar gratis
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}