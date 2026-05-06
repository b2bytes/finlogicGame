import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, X, Search, ExternalLink, Home, MessageCircle, FileText, Briefcase,
  Building2, Code2, DollarSign, BarChart3, Sparkles, Activity, Users, Heart,
  Layout, Eye, ShieldCheck, Palette, Zap, Star,
} from 'lucide-react';

/**
 * QuickAdminPanel — Panel flotante público para que el equipo (4 personas)
 * navegue rápido a TODAS las páginas de FinLogic.
 *
 * Acceso:
 *  - Botón flotante (bottom-right, sobre el FAB de Lya)
 *  - Atajo de teclado: ⌘K / Ctrl+K
 *  - URL trigger: ?admin=1 abre el panel automáticamente
 *
 * No es un sistema de auth — es una shortcut de QA para el equipo.
 */

const SECTIONS = [
  {
    title: 'Público · Producto',
    color: 'mint',
    pages: [
      { path: '/', label: 'Home · Landing', icon: Home, desc: 'Página principal pública' },
      { path: '/Consulta', label: 'Consulta IA', icon: MessageCircle, desc: 'Flujo guiado con pipeline' },
      { path: '/AsistenteLya', label: 'Asistente Lya', icon: Sparkles, desc: 'Chat conversacional con voz' },
      { path: '/Casos', label: 'Casos resueltos', icon: FileText, desc: 'Galería pública de casos' },
      { path: '/Transparencia', label: 'Transparencia', icon: Eye, desc: 'Auditoría pipeline IA' },
    ],
  },
  {
    title: 'Usuario · Privado',
    color: 'blue',
    pages: [
      { path: '/MisCasos', label: 'Mis Casos', icon: Briefcase, desc: 'Dashboard ciudadano' },
      { path: '/Soporte', label: 'Soporte', icon: Heart, desc: 'Centro de ayuda + tickets' },
      { path: '/Embajadores', label: 'Embajadores', icon: Users, desc: 'Programa de referidos' },
      { path: '/Pro', label: 'FinLogic Pro', icon: Star, desc: 'Upgrade a Pro' },
    ],
  },
  {
    title: 'B2B · Empresas',
    color: 'violet',
    pages: [
      { path: '/api-compliance', label: 'Compliance API', icon: Code2, desc: 'Producto B2B fintechs' },
      { path: '/B2B/APIKeys', label: 'API Keys', icon: ShieldCheck, desc: 'Dashboard cliente B2B' },
      { path: '/Pyme', label: 'Pymes', icon: Building2, desc: 'Capa pyme + SII' },
      { path: '/Pricing', label: 'Pricing', icon: DollarSign, desc: 'Planes y precios' },
    ],
  },
  {
    title: 'Estrategia · Inversor / Jurado',
    color: 'amber',
    pages: [
      { path: '/PitchDeck', label: 'Pitch Deck', icon: Layout, desc: 'Presentación inversor' },
      { path: '/Diseno', label: 'Diseño · Entregable', icon: Palette, desc: 'Flujos + sistema + wireframes' },
      { path: '/Marca', label: 'Marca', icon: Sparkles, desc: 'Brand book' },
      { path: '/Insights', label: 'Insights', icon: BarChart3, desc: 'Reporte de mercado' },
    ],
  },
  {
    title: 'Admin · Operaciones',
    color: 'rose',
    pages: [
      { path: '/OperacionesDashboard', label: 'Ops Dashboard', icon: Activity, desc: 'Pipeline KPIs + alertas' },
      { path: '/FinancialDashboard', label: 'FinOps · MRR', icon: DollarSign, desc: 'Métricas financieras' },
      { path: '/Admin/SystemMetrics', label: 'System Metrics', icon: Zap, desc: 'Latencia + scores' },
      { path: '/Admin/ContentStudio', label: 'Content Studio', icon: FileText, desc: 'Generador social' },
      { path: '/Embed/Lya', label: 'Embed Lya', icon: Code2, desc: 'Widget embebible' },
    ],
  },
];

const COLOR_MAP = {
  mint: 'bg-mint-50 border-mint-200 text-mint-700',
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  violet: 'bg-violet-50 border-violet-200 text-violet-700',
  amber: 'bg-amber-50 border-amber-200 text-amber-700',
  rose: 'bg-rose-50 border-rose-200 text-rose-700',
};

const HOVER_MAP = {
  mint: 'hover:bg-mint-50 hover:border-mint-300',
  blue: 'hover:bg-blue-50 hover:border-blue-300',
  violet: 'hover:bg-violet-50 hover:border-violet-300',
  amber: 'hover:bg-amber-50 hover:border-amber-300',
  rose: 'hover:bg-rose-50 hover:border-rose-300',
};

export default function QuickAdminPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();

  // Ocultar en widget embebible (iframe público)
  const isEmbed = location.pathname.startsWith('/Embed');

  // Atajos: ⌘K / Ctrl+K abre el panel · Esc cierra
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // ?admin=1 abre el panel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === '1') setOpen(true);
  }, []);

  // Cerrar al cambiar de ruta
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [location.pathname]);

  // Bloquear scroll del body cuando está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return SECTIONS;
    const q = query.toLowerCase();
    return SECTIONS
      .map((s) => ({
        ...s,
        pages: s.pages.filter(
          (p) =>
            p.label.toLowerCase().includes(q) ||
            p.path.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.pages.length > 0);
  }, [query]);

  const totalPages = SECTIONS.reduce((sum, s) => sum + s.pages.length, 0);

  if (isEmbed) return null;

  return (
    <>
      {/* FAB trigger — bottom-left, discreto.
          En mobile sube por encima del PWAInstallBanner (que está en bottom-3). */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
        className="fixed bottom-4 sm:bottom-5 left-4 sm:left-5 z-[60] h-9 sm:h-10 pl-2.5 pr-2.5 sm:pr-3.5 rounded-full bg-foreground/85 backdrop-blur-md text-background shadow-soft flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold hover:bg-foreground transition-colors group border border-background/10 opacity-70 hover:opacity-100"
        aria-label="Abrir panel del equipo (atajo Cmd+K)"
        title="Panel del equipo (⌘K)"
      >
        <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-500" />
        <span>Equipo</span>
        <kbd className="hidden md:inline text-[9px] font-mono bg-background/15 px-1.5 py-0.5 rounded border border-background/20">
          ⌘K
        </kbd>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-foreground/40 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-full max-w-3xl bg-card border border-border rounded-3xl shadow-soft-lg overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border bg-secondary/30">
                <div className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-base font-bold text-foreground">Panel del equipo</h2>
                  <p className="text-[11px] text-muted-foreground">
                    {totalPages} páginas · Acceso rápido para QA y revisión
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-secondary hover:bg-foreground hover:text-background transition-colors flex items-center justify-center flex-shrink-0"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar página, ruta o descripción…"
                    className="w-full h-11 pl-10 pr-4 rounded-2xl bg-secondary/50 border border-border focus:border-mint-400 focus:bg-card outline-none text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Lista */}
              <div className="max-h-[55vh] sm:max-h-[60vh] overflow-y-auto p-4 space-y-5 overscroll-contain">
                {filtered.length === 0 && (
                  <div className="text-center py-10">
                    <Search className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Sin resultados para «{query}»
                    </p>
                  </div>
                )}
                {filtered.map((section) => (
                  <div key={section.title}>
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${COLOR_MAP[section.color]}`}>
                        {section.title}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {section.pages.length}
                      </span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {section.pages.map((page) => {
                        const isActive = location.pathname === page.path;
                        return (
                          <Link
                            key={page.path}
                            to={page.path}
                            className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                              isActive
                                ? 'bg-mint-50 border-mint-300 shadow-soft'
                                : `bg-card border-border ${HOVER_MAP[section.color]}`
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${COLOR_MAP[section.color]}`}>
                              <page.icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-foreground truncate">{page.label}</p>
                                {isActive && (
                                  <span className="text-[9px] font-bold text-mint-700 bg-mint-100 px-1.5 rounded-full flex-shrink-0">
                                    ACTUAL
                                  </span>
                                )}
                              </div>
                              <code className="text-[10px] font-mono text-muted-foreground block truncate">
                                {page.path}
                              </code>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                                {page.desc}
                              </p>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0 mt-1" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border bg-secondary/30 flex items-center justify-between text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="font-mono bg-card border border-border px-1.5 py-0.5 rounded">⌘K</kbd>
                  <span>abrir / cerrar</span>
                  <span className="mx-1">·</span>
                  <kbd className="font-mono bg-card border border-border px-1.5 py-0.5 rounded">Esc</kbd>
                  <span>cerrar</span>
                </div>
                <span className="hidden sm:inline">Panel interno · Equipo FinLogic</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}