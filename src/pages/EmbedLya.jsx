import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Send, Loader2, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * /Embed/Lya — Versión iframe-friendly de Lya para partners (Lya-Embed).
 * Query params:
 *   ?partner=banco-xxx           identificador del partner (tracking + UTM)
 *   ?accent=mint|navy|purple     color primario
 *   ?placeholder=texto            placeholder del input
 *   ?compact=1                    layout compacto (sin header)
 */
export default function EmbedLya() {
  const params = new URLSearchParams(window.location.search);
  const partnerId = params.get('partner') || 'public';
  const accent = params.get('accent') || 'mint';
  const placeholder = params.get('placeholder') || '¿Cobro raro? ¿Plazo legal? Pregunta a Lya…';
  const compact = params.get('compact') === '1';

  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const accentMap = {
    mint: { bg: 'hsl(158 52% 42%)', tint: 'hsl(158 50% 96%)', tintBorder: 'hsl(158 46% 80%)' },
    navy: { bg: 'hsl(220 60% 35%)', tint: 'hsl(220 60% 96%)', tintBorder: 'hsl(220 50% 80%)' },
    purple: { bg: 'hsl(280 50% 45%)', tint: 'hsl(280 50% 96%)', tintBorder: 'hsl(280 50% 80%)' },
  };
  const colors = accentMap[accent] || accentMap.mint;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuery('');
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('lyaEmbedQuery', { query: q, partnerId });
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: data.response, ctaUrl: data.ctaUrl, shouldEscalate: data.shouldEscalate },
      ]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Hubo un problema. Intenta nuevamente o visita finlogic.one.', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {!compact && (
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Pregúntale a Lya</p>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>powered by FinLogic</p>
          </div>
        </header>
      )}

      <main ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ background: colors.tint, border: `1px solid ${colors.tintBorder}`, borderRadius: 16, padding: 14, fontSize: 13, color: '#1f2937' }}>
            👋 Hola, soy Lya. Te ayudo a entender tus derechos financieros chilenos: fraude en tarjetas, cobros indebidos, datos personales (ARCO), créditos, plazos legales.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
            <div
              style={{
                background: m.role === 'user' ? '#111827' : '#f9fafb',
                color: m.role === 'user' ? '#fff' : '#111827',
                padding: '10px 14px',
                borderRadius: 16,
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                border: m.role === 'user' ? 'none' : '1px solid #e5e7eb',
              }}
            >
              {m.text}
            </div>
            {m.role === 'assistant' && m.ctaUrl && (
              <a
                href={m.ctaUrl}
                target="_blank"
                rel="noreferrer"
                style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: colors.bg, textDecoration: 'none', fontWeight: 600 }}
              >
                Abrir caso completo en FinLogic <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 6, color: '#6b7280', fontSize: 13 }}>
            <Loader2 size={14} className="animate-spin" /> Lya está pensando…
          </div>
        )}
      </main>

      <form onSubmit={send} style={{ borderTop: '1px solid #e5e7eb', padding: 12, display: 'flex', gap: 8, background: '#fff' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={loading}
          style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 999, padding: '10px 16px', fontSize: 14, outline: 'none' }}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{ background: colors.bg, color: '#fff', border: 'none', borderRadius: 999, padding: '0 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: loading || !query.trim() ? 0.5 : 1 }}
        >
          <Send size={14} /> Enviar
        </button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', padding: '6px 12px 10px' }}>
        FinLogic · Ley 21.521 · No reemplaza asesoría legal humana
      </div>
    </div>
  );
}