import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-gradient-to-b from-card/40 to-mint-50/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Tu derecho. En tu idioma. Ahora. FinLogic captura el conocimiento del Estado y lo traduce en acción ciudadana.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-soft">
                <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
                <span className="text-xs font-semibold text-foreground">Registrada CMF</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border shadow-soft">
                <span className="text-xs font-semibold text-foreground">Ley 21.521</span>
              </div>
            </div>

            <p className="mt-5 text-xs text-muted-foreground">
              finlogic.one · Hecho con <Heart className="inline w-3 h-3 text-mint-600 fill-mint-600 -translate-y-0.5" /> en Chile
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-bold text-foreground mb-4">Producto</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/Consulta" className="hover:text-mint-700 transition-colors">Consultar</Link></li>
              <li><Link to="/MisCasos" className="hover:text-mint-700 transition-colors">Mis Casos</Link></li>
              <li><Link to="/Transparencia" className="hover:text-mint-700 transition-colors">Transparencia</Link></li>
              <li><Link to="/Embajadores" className="hover:text-mint-700 transition-colors">Embajadores</Link></li>
              <li><Link to="/Marca" className="hover:text-mint-700 transition-colors">Manual de marca</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-bold text-foreground mb-4">Para empresas</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/api-compliance" className="hover:text-mint-700 transition-colors">Compliance API</Link></li>
              <li><Link to="/Insights" className="hover:text-mint-700 transition-colors">FinLogic Insights</Link></li>
              <li><Link to="/Pyme" className="hover:text-mint-700 transition-colors">Pyme</Link></li>
              <li><Link to="/Pricing" className="hover:text-mint-700 transition-colors">Precios</Link></li>
              <li><a href="https://github.com/b2bytes/finlogic" target="_blank" rel="noreferrer" className="hover:text-mint-700 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 FinLogic Solutions. Todos los derechos reservados.</p>
          <p className="font-medium">El sistema operativo financiero del pueblo de Chile.</p>
        </div>
      </div>
    </footer>
  );
}