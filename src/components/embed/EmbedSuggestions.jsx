import React from 'react';

const SUGGESTIONS_BY_SECTOR = {
  banco: [
    'Me cobraron una comisión que no entiendo',
    '¿Qué pasa si no reconozco un cargo en mi tarjeta?',
    '¿Cuál es la TMC vigente para créditos de consumo?',
  ],
  fintech: [
    '¿La fintech está registrada en CMF?',
    '¿Qué dice la Ley 21.521 sobre Open Finance?',
    '¿Cómo verifico si una app financiera es legal?',
  ],
  seguros: [
    '¿Puedo desistir de un seguro recién contratado?',
    '¿Qué cubre el seguro obligatorio de mi crédito?',
    '¿Cómo reclamar si rechazan mi siniestro?',
  ],
  retail: [
    '¿Tengo derecho a retracto en una compra online?',
    'Me cobraron interés más alto que el contrato',
    '¿Qué hago si me cobran un servicio que no contraté?',
  ],
  general: [
    '¿Qué hago si me hicieron un fraude por phishing?',
    '¿Cómo solicito mis datos personales (ARCO)?',
    '¿Cuáles son mis derechos como consumidor?',
  ],
};

export default function EmbedSuggestions({ sector = 'general', accentBg, onPick, disabled }) {
  const items = SUGGESTIONS_BY_SECTOR[sector] || SUGGESTIONS_BY_SECTOR.general;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Prueba con
      </p>
      {items.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          disabled={disabled}
          style={{
            textAlign: 'left',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 14,
            padding: '10px 12px',
            fontSize: 13,
            color: '#1f2937',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = accentBg;
              e.currentTarget.style.background = '#fafafa';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e5e7eb';
            e.currentTarget.style.background = '#fff';
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}