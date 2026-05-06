// useReferralCapture — captura ?ref=CODIGO y lo persiste en localStorage.
// Mandato §GrowthMarketing — flywheel de referidos.

import { useEffect } from 'react';

const STORAGE_KEY = 'finlogic_ref';
const TTL_DAYS = 30;

export function useReferralCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && /^FL-[A-Z0-9]{4,10}$/.test(ref)) {
        const payload = { code: ref, ts: Date.now() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      }
    } catch {
      /* ignore */
    }
  }, []);
}

export function getStoredReferral() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { code, ts } = JSON.parse(raw);
    const ageDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    if (ageDays > TTL_DAYS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}