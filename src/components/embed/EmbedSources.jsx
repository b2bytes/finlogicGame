import React from 'react';
import { ShieldCheck, BookOpen } from 'lucide-react';

export default function EmbedSources({ sources, confidence, regulatoryBody, accentBg }) {
  if ((!sources || sources.length === 0) && confidence == null) return null;

  const confidencePct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <div
      style={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontSize: 11,
        color: '#4b5563',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {regulatoryBody && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#f3f4f6',
              color: '#374151',
              padding: '2px 8px',
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            <ShieldCheck size={10} /> {regulatoryBody}
          </span>
        )}
        {confidencePct != null && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: confidencePct >= 80 ? '#047857' : confidencePct >= 60 ? '#b45309' : '#991b1b',
              fontWeight: 600,
              fontSize: 10,
            }}
          >
            Confianza {confidencePct}%
          </span>
        )}
      </div>

      {sources && sources.length > 0 && (
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 10,
              fontWeight: 600,
              color: accentBg,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            <BookOpen size={10} /> Fuentes
          </div>
          {sources.map((src, i) => (
            <div key={i} style={{ fontSize: 11, color: '#4b5563', lineHeight: 1.4 }}>
              · {src}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}