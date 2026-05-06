import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — Fuerza scroll al inicio en cada cambio de ruta.
 * Se monta una sola vez dentro del Router. No renderiza nada.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantáneo en cambios de ruta (no animado, comportamiento app nativo)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}