import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { navigateToPath } from '@/lib/lyaNavigationTools';

/**
 * LyaSuggestionChips — Sugerencias contextuales que aparecen DESPUÉS de
 * cada respuesta de Lya en el modal de chat. Llama a searchPlatformKnowledge
 * (Pinecone) con el contenido del último turno y muestra 2-3 chips clickeables
 * que navegan directo a la página relevante.
 *
 * Estrategia:
 * - Solo se monta sobre turnos de Lya (no de usuario).
 * - Filtra paths admin/privados como defensa en profundidad.
 * - Cancela fetch si el componente se desmonta (evita race conditions).
 * - Cierra el modal después de navegar para que el usuario vea la página.
 *
 * Props:
 *  - text: string — el mensaje de Lya sobre el que generar sugerencias.
 *  - onNavigate?: () => void — callback opcional disparado al clickear un chip
 *    (útil para cerrar el modal).
 *  - currentPath?: string — para filtrar la página actual de las sugerencias.
 */

// Defensa en profundidad: estas rutas NUNCA deben aparecer al usuario
// aunque vinieran del backend (que ya las filtra al re-indexar).
const PRIVATE_PATHS = new Set([
  '/Admin/Lanzamiento',
  '/Admin/CRM',
  '/Admin/SystemMetrics',
  '/Admin/ContentStudio',
  '/B2B/APIKeys',
  '/FinancialDashboard',
  '/OperacionesDashboard',
]);

// Score mínimo para mostrar una sugerencia (evita ruido cuando Lya
// habla de algo no relacionado con páginas de la plataforma).
const MIN_SCORE = 0.62;

// Texto mínimo del turno de Lya para activar búsqueda.
const MIN_TEXT_LENGTH = 20;

export default function LyaSuggestionChips({ text, onNavigate, currentPath }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || text.length < MIN_TEXT_LENGTH) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Debounce 350ms: permite que Lya termine de "asentar" su respuesta
    const timer = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke('searchPlatformKnowledge', {
          query: text.slice(0, 500),
          topK: 5,
        });
        if (cancelled) return;
        const matches = (res.data?.results || [])
          .filter((m) => m?.path && !PRIVATE_PATHS.has(m.path))
          .filter((m) => m.path !== currentPath)
          .filter((m) => (m.score ?? 0) >= MIN_SCORE)
          .slice(0, 3);
        setResults(matches);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, currentPath]);

  const handleClick = (path, name) => {
    navigateToPath(path);
    window.dispatchEvent(
      new CustomEvent('lya:toast', {
        detail: { message: `→ ${name}`, variant: 'lya' },
      })
    );
    onNavigate?.();
  };

  if (loading && results.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-1.5 ml-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Buscando páginas relacionadas…
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-1.5 ml-1 space-y-1"
    >
      <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-mint-700/80">
        <Sparkles className="w-2.5 h-2.5" />
        Lugares relacionados
      </div>
      <div className="flex flex-wrap gap-1.5">
        {results.map((r) => (
          <button
            key={r.path}
            onClick={() => handleClick(r.path, r.name)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-50 hover:bg-mint-100 border border-mint-200 hover:border-mint-300 text-mint-800 text-[12px] font-semibold transition-all min-h-[34px] active:scale-[0.97]"
          >
            <span className="leading-none">{r.name}</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}