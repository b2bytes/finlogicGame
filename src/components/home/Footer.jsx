import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Tu derecho. En tu idioma. Ahora. FinLogic captura el conocimiento del Estado y lo traduce en acción ciudadana.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              finlogic.one · Registrada CMF · Ley 21.521
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/Consulta" className="hover:text-foreground transition-colors">Consultar</Link></li>
              <li><Link to="/MisCasos" className="hover:text-foreground transition-colors">Mis Casos</Link></li>
              <li><Link to="/Transparencia" className="hover:text-foreground transition-colors">Transparencia</Link></li>
              <li><Link to="/Embajadores" className="hover:text-foreground transition-colors">Embajadores</Link></li>
              <li><Link to="/Marca" className="hover:text-foreground transition-colors">Manual de marca</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Para empresas</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/api-compliance" className="hover:text-foreground transition-colors">Compliance API</Link></li>
              <li><Link to="/Insights" className="hover:text-foreground transition-colors">FinLogic Insights</Link></li>
              <li><Link to="/Pyme" className="hover:text-foreground transition-colors">Pyme</Link></li>
              <li><Link to="/Pricing" className="hover:text-foreground transition-colors">Precios</Link></li>
              <li><a href="https://github.com/b2bytes/finlogic" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 FinLogic Solutions. Hecho con cuidado en Chile.</p>
          <p>El sistema operativo financiero del pueblo de Chile.</p>
        </div>
      </div>
    </footer>
  );
}