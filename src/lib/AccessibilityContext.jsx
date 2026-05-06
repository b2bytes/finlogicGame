import React, { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext({ accessible: false, toggle: () => {} });

export function AccessibilityProvider({ children }) {
  const [accessible, setAccessible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('finlogic_accessible') === 'true';
  });

  useEffect(() => {
    if (accessible) {
      document.documentElement.classList.add('a11y-mode');
      localStorage.setItem('finlogic_accessible', 'true');
    } else {
      document.documentElement.classList.remove('a11y-mode');
      localStorage.setItem('finlogic_accessible', 'false');
    }
  }, [accessible]);

  const toggle = () => setAccessible((prev) => !prev);

  return (
    <AccessibilityContext.Provider value={{ accessible, toggle }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);