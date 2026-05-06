import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import Logo from './Logo';

export default function HeroNav() {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" aria-label="FinLogic — Ir al inicio">
          <Logo size="md" />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <a href="#como-funciona" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cómo funciona
          </a>
          <a href="#perfiles" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Para quién
          </a>
          <Link to="/Transparencia" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Transparencia
          </Link>
          <Link to="/MisCasos" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Mis casos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
            <span>Ley 21.521</span>
          </div>
          <Button asChild size="sm" className="rounded-full bg-foreground hover:bg-foreground/90 text-background h-9 px-4 font-medium">
            <Link to="/Consulta">Consultar gratis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}