import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function SupportForm() {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!message || message.trim().length < 5) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('triageTicket', { message, channel: 'web' });
      setResult(res.data);
      setMessage('');
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Error al enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const isCritical = result.priority === 'critico';
    return (
      <div className={`rounded-3xl border p-6 ${
        isCritical ? 'bg-destructive/5 border-destructive/20' : 'bg-mint-50 border-mint-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-mint-600" />
          )}
          <span className="font-display font-bold text-foreground">
            {isCritical ? 'Caso prioritario abierto' : result.autoResolved ? 'Resuelto al instante' : 'Ticket recibido'}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line mb-4">
          {result.response}
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">
            Categoría: {result.category}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">
            Prioridad: {result.priority}
          </span>
        </div>
        <Button
          onClick={() => setResult(null)}
          variant="ghost"
          size="sm"
          className="mt-4 rounded-full text-xs"
        >
          Enviar otra consulta
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl border border-border p-6 shadow-soft">
      <h3 className="font-display text-lg font-bold text-foreground mb-1">
        ¿No encontraste respuesta?
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Cuéntanos qué pasa. Carolina (nuestro agente de soporte) te responde en lenguaje simple y, si hay un plazo legal corriendo, lo prioriza.
      </p>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ej: Mi banco me cobró $45.000 que no reconozco la semana pasada..."
        rows={4}
        className="rounded-2xl border-border resize-none mb-3"
      />
      {error && (
        <p className="text-xs text-destructive mb-3">{error}</p>
      )}
      <Button
        onClick={submit}
        disabled={submitting || message.trim().length < 5}
        className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background h-11 font-medium"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analizando con Lya...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar a soporte
          </>
        )}
      </Button>
    </div>
  );
}