import React, { useState } from 'react';
import { FileSignature, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { getStoredReferral } from '@/lib/useReferralCapture';

const BODY_TO_MODULE = {
  CMF: 'ley_fintech_21521',
  SERNAC: 'ley_19496_sernac',
  SII: 'ley_21713_tributaria',
  CSIRT: 'ley_21663_ciberseguridad',
  BCN: 'ley_19496_sernac',
};

export default function LyaActionCTA({ query, response, regulatoryBody, suggestedAction }) {
  const [creating, setCreating] = useState(false);
  const [casoId, setCasoId] = useState(null);
  const navigate = useNavigate();

  if (!regulatoryBody || regulatoryBody === 'ninguno' || regulatoryBody === 'multiple') return null;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const title = suggestedAction?.slice(0, 80) || query.slice(0, 80);
      const caso = await base44.entities.MisCasos.create({
        title,
        description: query,
        regulatoryBody,
        normativeModule: BODY_TO_MODULE[regulatoryBody] || 'ley_19496_sernac',
        status: 'abierto',
        priority: 'media',
        urgencyLevel: 'medium',
        channel: 'web',
      });
      setCasoId(caso.id);

      // Cerrar loop de referidos: si hay código guardado, registrar atribución
      const refCode = getStoredReferral();
      if (refCode) {
        try {
          await base44.functions.invoke('registerReferral', { referralCode: refCode });
        } catch {
          /* ignore — no bloquea creación del caso */
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (casoId) {
    return (
      <div className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-mint-50 border border-mint-200 cursor-pointer hover:bg-mint-100 transition-colors"
        onClick={() => navigate(`/MisCasos/${casoId}`)}
      >
        <CheckCircle2 className="w-4 h-4 text-mint-700" />
        <span className="text-sm font-semibold text-mint-700">Caso creado · Ver detalle →</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={creating}
      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-foreground hover:bg-foreground/90 text-background text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSignature className="w-4 h-4" />}
      {creating ? 'Creando caso…' : `Crear caso ante ${regulatoryBody}`}
    </button>
  );
}