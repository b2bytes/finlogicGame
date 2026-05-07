import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowLeft } from 'lucide-react';

/**
 * ConsultaInput — paso donde el usuario describe su caso para que Lya lo
 * rellene en la plantilla. Muestra ejemplos según la plantilla elegida.
 */
const EXAMPLES = {
  demanda_sernac: 'Compré una lavadora hace 2 meses en una tienda de retail. A los 15 días empezó a fallar. La llevé al servicio técnico 3 veces y siguen sin repararla. Quiero que me devuelvan los $450.000 que pagué.',
  recurso_reposicion_cmf: 'Mi banco me cobró comisiones que nunca aparecieron en el contrato. Reclamé en sucursal y me dijeron que es política interna. Necesito que CMF revise.',
  denuncia_csirt: 'Recibí un SMS del banco con un link sospechoso. Hice click y me pidió la clave. Después vi 3 transferencias por $180.000 que no hice.',
  carta_arco: 'Una empresa de cobranza tiene mis datos personales y me llama todos los días aunque ya pagué la deuda. Quiero que borren mis datos.',
  reclamo_cmf: 'El banco me bloqueó la cuenta sin avisar. Llevo 20 días sin acceso a mi sueldo y no me dan respuesta clara.',
  denuncia_fraude_ley_20009: 'Ayer 5 de mayo a las 14:30 hubo 4 transferencias desde mi cuenta del Banco X a un destinatario que no conozco, total $380.000. Yo estaba en el trabajo, mi tarjeta nunca salió de mi billetera.',
  recurso_proteccion: 'Mi AFP me cambió de fondo sin mi autorización y perdí dinero. Atenta contra mi derecho de propiedad.',
  carta_cobro_indebido: 'Mi banco me cobró $24.000 en comisiones que no estaban en el contrato. Quiero que las devuelvan.',
};

export default function ConsultaInput({ template, onBack, onSubmit, loading, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length < 20) return;
    onSubmit(query.trim());
  };

  const example = EXAMPLES[template.id] || '';

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Cambiar plantilla
      </button>

      <div className="mb-5">
        <p className="text-xs font-semibold text-mint-600 uppercase tracking-wider mb-2">
          Paso 2 de 3 · Cuéntale a Lya
        </p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          {template.label}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Describe lo que pasó con tus palabras. Lya rellena la plantilla con los hechos, leyes aplicables y formato legal correcto.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ejemplo: ${example}`}
          disabled={loading}
          rows={8}
          className="w-full p-4 rounded-2xl border-2 border-border focus:border-mint-400 outline-none text-sm resize-none bg-card transition-colors leading-relaxed disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-muted-foreground">
            {query.length} caracteres · mínimo 20
          </p>
          <button
            type="submit"
            disabled={query.trim().length < 20 || loading}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-mint-600 hover:bg-mint-700 text-white font-bold text-sm shadow-soft disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Lya está rellenando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Que Lya redacte el documento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}