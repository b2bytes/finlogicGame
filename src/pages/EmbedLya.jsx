import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, Send, Loader2, ExternalLink, Mic, MicOff, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useLyaVoice } from '@/lib/useLyaVoice.jsx';
import EmbedSuggestions from '@/components/embed/EmbedSuggestions.jsx';
import EmbedSources from '@/components/embed/EmbedSources.jsx';

/**
 * /Embed/Lya — Versión iframe-friendly de Lya para partners (Lya-Embed B2B white-label).
 *
 * Query params:
 *   ?partner=banco-xxx           identificador del partner (tracking + UTM)
 *   ?sector=banco|fintech|seguros|retail|general   sugerencias contextuales
 *   ?accent=mint|navy|purple|orange    color primario
 *   ?placeholder=texto                  placeholder del input
 *   ?compact=1                          layout compacto (sin header)
 *   ?voice=1                            habilitar botón de voz STT/TTS
 *   ?title=texto                        título del header
 */
export default function EmbedLya() {
  const params = new URLSearchParams(window.location.search);
  const partnerId = params.get('partner') || 'public';
  const sector = params.get('sector') || 'general';
  const accent = params.get('accent') || 'mint';
  const placeholder = params.get('placeholder') || '¿Cobro raro? ¿Plazo legal? Pregunta a Lya…';
  const compact = params.get('compact') === '1';
  const voiceEnabled = params.get('voice') === '1';
  const title = params.get('title') || 'Pregúntale a Lya';

  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const scrollRef = useRef(null);
  const containerRef = useRef(null);

  const voice = useLyaVoice();

  const accentMap = {
    mint: { bg: 'hsl(158 52% 42%)', tint: 'hsl(158 50% 96%)', tintBorder: 'hsl(158 46% 80%)' },
    navy: { bg: 'hsl(220 60% 35%)', tint: 'hsl(220 60% 96%)', tintBorder: 'hsl(220 50% 80%)' },
    purple: { bg: 'hsl(280 50% 45%)', tint: 'hsl(280 50% 96%)', tintBorder: 'hsl(280 50% 80%)' },
    orange: { bg: 'hsl(28 80% 50%)', tint: 'hsl(28 80% 96%)', tintBorder: 'hsl(28 70% 80%)' },
  };
  const colors = accentMap[accent] || accentMap.mint;

  // Auto-scroll al final
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // postMessage al parent para autoresize del iframe
  useEffect(() => {
    const sendHeight = () => {
      if (!containerRef.current) return;
      const h = containerRef.current.scrollHeight;
      try {
        window.parent?.postMessage({ type: 'finlogic-lya-resize', height: h, partnerId }, '*');
      } catch (_) { /* noop */ }
    };
    sendHeight();
    const ro = new ResizeObserver(sendHeight);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [messages, partnerId]);

  const send = useCallback(
    async (textOverride) => {
      const q = (textOverride ?? query).trim();
      if (!q || loading) return;

      setMessages((m) => [...m, { role: 'user', text: q }]);
      setQuery('');
      setLoading(true);

      try {
        const { data } = await base44.functions.invoke('lyaEmbedQuery', {
          query: q,
          partnerId,
          sector,
        });

        const assistantMsg = {
          role: 'assistant',
          text: data.response,
          sources: data.sources,
          confidence: data.confidence,
          verifierScore: data.verifierScore,
          hallucinationRisk: data.hallucinationRisk,
          regulatoryBody: data.regulatoryBody,
          shouldEscalate: data.shouldEscalate,
          ctaUrl: data.ctaUrl,
        };
        setMessages((m) => [...m, assistantMsg]);

        // notificar al parent (analítica B2B)
        try {
          window.parent?.postMessage(
            {
              type: 'finlogic-lya-message',
              partnerId,
              regulatoryBody: data.regulatoryBody,
              shouldEscalate: data.shouldEscalate,
            },
            '*'
          );
        } catch (_) { /* noop */ }

        if (autoSpeak && voice.ttsSupported) voice.speak(data.response);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: 'Hubo un problema procesando tu consulta. Intenta nuevamente o visita finlogic.one.',
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [query, loading, partnerId, sector, autoSpeak, voice]
  );

  const handleSubmit = (e) => {
    e?.preventDefault();
    send();
  };

  const handleMicClick = () => {
    if (!voice.sttSupported) return;
    if (voice.listening) {
      voice.stopListening();
    } else {
      if (!autoSpeak) setAutoSpeak(true);
      voice.startListening((finalText) => {
        send(finalText);
      });
    }
  };

  const showSuggestions = messages.length === 0;

  return (
    <div
      ref={containerRef}
      style={{
        background: '#fff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {!compact && (
        <header
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: colors.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={15} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.2, flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{title}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#6b7280' }}>
              powered by FinLogic · Ley 21.521
            </p>
          </div>
          {voiceEnabled && voice.ttsSupported && (
            <button
              type="button"
              onClick={() => {
                if (voice.speaking) voice.stopSpeaking();
                setAutoSpeak((v) => !v);
              }}
              title={autoSpeak ? 'Desactivar voz' : 'Activar voz'}
              style={{
                background: autoSpeak ? colors.tint : 'transparent',
                border: `1px solid ${autoSpeak ? colors.tintBorder : '#e5e7eb'}`,
                borderRadius: 999,
                width: 32,
                height: 32,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: autoSpeak ? colors.bg : '#6b7280',
              }}
            >
              {autoSpeak ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          )}
        </header>
      )}

      <main
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {showSuggestions && (
          <>
            <div
              style={{
                background: colors.tint,
                border: `1px solid ${colors.tintBorder}`,
                borderRadius: 16,
                padding: 14,
                fontSize: 13,
                color: '#1f2937',
                lineHeight: 1.5,
              }}
            >
              👋 Hola, soy <strong>Lya</strong>. Te ayudo a entender tus derechos financieros chilenos:
              fraude en tarjetas, cobros indebidos, datos personales (ARCO), créditos, plazos legales.
            </div>
            <EmbedSuggestions
              sector={sector}
              accentBg={colors.bg}
              onPick={(s) => send(s)}
              disabled={loading}
            />
          </>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
            }}
          >
            <div
              style={{
                background: m.role === 'user' ? '#111827' : m.error ? '#fef2f2' : '#f9fafb',
                color: m.role === 'user' ? '#fff' : m.error ? '#991b1b' : '#111827',
                padding: '10px 14px',
                borderRadius: 16,
                fontSize: 14,
                lineHeight: 1.55,
                whiteSpace: 'pre-wrap',
                border: m.role === 'user' ? 'none' : `1px solid ${m.error ? '#fecaca' : '#e5e7eb'}`,
              }}
            >
              {m.error && (
                <AlertTriangle
                  size={12}
                  style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }}
                />
              )}
              {m.text}
            </div>

            {m.role === 'assistant' && !m.error && (
              <>
                <EmbedSources
                  sources={m.sources}
                  confidence={m.confidence}
                  verifierScore={m.verifierScore}
                  hallucinationRisk={m.hallucinationRisk}
                  regulatoryBody={m.regulatoryBody}
                  accentBg={colors.bg}
                />
                {(m.shouldEscalate || m.ctaUrl) && (
                  <a
                    href={m.ctaUrl || 'https://finlogic.one/AsistenteLya'}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 8,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      color: '#fff',
                      background: colors.bg,
                      textDecoration: 'none',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 999,
                    }}
                  >
                    {m.shouldEscalate ? 'Abrir caso formal con respaldo legal' : 'Ver en FinLogic'}{' '}
                    <ExternalLink size={11} />
                  </a>
                )}
              </>
            )}
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#6b7280',
              fontSize: 13,
              padding: '10px 14px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 16,
            }}
          >
            <Loader2 size={14} className="animate-spin" /> Lya está consultando la normativa…
          </div>
        )}

        {voice.listening && voice.interim && (
          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '88%',
              padding: '8px 14px',
              borderRadius: 16,
              background: '#1f2937',
              color: '#fff',
              fontSize: 13,
              fontStyle: 'italic',
              opacity: 0.7,
            }}
          >
            {voice.interim}…
          </div>
        )}
      </main>

      <form
        onSubmit={handleSubmit}
        style={{
          borderTop: '1px solid #e5e7eb',
          padding: 12,
          display: 'flex',
          gap: 8,
          background: '#fff',
          alignItems: 'center',
        }}
      >
        {voiceEnabled && voice.sttSupported && (
          <button
            type="button"
            onClick={handleMicClick}
            disabled={loading}
            title={voice.listening ? 'Detener micrófono' : 'Hablar con Lya'}
            style={{
              background: voice.listening ? '#ef4444' : colors.tint,
              color: voice.listening ? '#fff' : colors.bg,
              border: `1px solid ${voice.listening ? '#ef4444' : colors.tintBorder}`,
              borderRadius: 999,
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.15s',
            }}
          >
            {voice.listening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={voice.listening ? 'Escuchando…' : placeholder}
          disabled={loading || voice.listening}
          style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: 999,
            padding: '10px 16px',
            fontSize: 14,
            outline: 'none',
            minWidth: 0,
          }}
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          style={{
            background: colors.bg,
            color: '#fff',
            border: 'none',
            borderRadius: 999,
            padding: '0 16px',
            height: 40,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            opacity: loading || !query.trim() ? 0.5 : 1,
            flexShrink: 0,
          }}
        >
          <Send size={14} />
          <span style={{ display: window.innerWidth < 380 ? 'none' : 'inline' }}>Enviar</span>
        </button>
      </form>

      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: '#9ca3af',
          padding: '6px 12px 10px',
        }}
      >
        FinLogic · Ley 21.521 · No reemplaza asesoría legal humana
      </div>
    </div>
  );
}