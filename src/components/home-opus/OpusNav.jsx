import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, SlidersHorizontal } from 'lucide-react';

/**
 * OpusNav — header dark glass para la home Opus 4.7.
 * Mantiene la identidad FinLogic (logo FL en cuadrado mint) pero adaptado
 * al fondo oscuro: tipografía blanca, hover mint, pills translúcidas.
 */

const navItems = [
  { label: 'Lya IA', to: '/AsistenteLya' },
  { label: 'Editor legal', to: '/EditorLegal' },
  { label: 'Casos', to: '/Casos' },
  { label: 'Pyme', to: '/Pyme' },
  { label: 'API B2B', to: '/api-compliance' },
  { label: 'Precios', to: '/Pricing' },
  { label: 'Transparencia', to: '/Transparencia' },
];

export default function OpusNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a1410]/80 backdrop-blur-2xl">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:px-3 focus:py-2 focus:rounded-full focus:bg-white focus:text-[#0a1410] focus:text-xs focus:font-semibold"
      >
        Saltar al contenido
      </a>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Logo FL — adaptado dark */}
        <Link to="/" aria-label="FinLogic — Ir al inicio" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-mint-400 to-mint-600 flex items-center justify-center shadow-[0_0_24px_rgba(34,197,94,0.35)]">
            <span className="text-white font-geist font-bold text-[14px] tracking-tight">FL</span>
          </div>
          <span className="font-geist font-bold tracking-tight text-white text-lg">
            FinLogic
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={`text-[13px] font-geist font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                  active
                    ? 'text-mint-300 bg-mint-500/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Pill Ley 21.521 */}
          <div className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-mint-200 bg-mint-500/10 border border-mint-400/20 px-3 py-1.5 rounded-full font-geist">
            <ShieldCheck className="w-3 h-3 text-mint-300" aria-hidden />
            <span className="font-semibold tracking-tight">Ley 21.521</span>
          </div>

          {/* Preferencias */}
          <button
            type="button"
            className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-geist text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" aria-hidden />
            <span className="font-medium">Preferencias</span>
          </button>

          {/* CTA principal */}
          <Link
            to="/Consulta"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-white/95 text-[#0a1410] h-9 px-4 text-[13px] font-geist font-bold transition-all hover:scale-[1.02]"
          >
            Consultar gratis
            <ArrowRight className="w-3.5 h-3.5" aria-hidden />
          </Link>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="lg:hidden w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-[#0a1410]/95 backdrop-blur-xl">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-[14px] font-medium px-3 py-3 rounded-2xl text-white/80 hover:text-white hover:bg-white/5 min-h-[48px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/Consulta"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-white text-[#0a1410] h-12 px-4 text-sm font-bold"
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