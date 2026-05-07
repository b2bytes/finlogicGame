import React from 'react';
import ErrorBoundary from '@/components/ErrorBoundary';

/**
 * SafeRoute — envuelve cada página de la app en su propio ErrorBoundary
 * con scope identificable. Si una página crashea, solo se afecta esa ruta,
 * no toda la app.
 *
 * Uso:
 *   <Route path="/Pyme" element={<SafeRoute name="Pyme"><Pyme /></SafeRoute>} />
 */
export default function SafeRoute({ name, children }) {
  return (
    <ErrorBoundary scope={`route:${name}`} key={name}>
      {children}
    </ErrorBoundary>
  );
}