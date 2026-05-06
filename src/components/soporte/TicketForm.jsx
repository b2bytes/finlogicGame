import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'plazo_legal', label: 'Plazo legal urgente (<72h)' },
  { value: 'fraude_urgente', label: 'Fraude activo / phishing' },
  { value: 'documento', label: 'Problema con documento generado' },
  { value: 'latencia', label: 'La app va lenta o no responde' },
  { value: 'compliance_api', label: 'Compliance API (B2B fintech)' },
  { value: 'credibilidad', label: 'Duda sobre exactitud de respuesta' },
  { value: 'accesibilidad', label: 'Accesibilidad / adulto mayor' },
  { value: 'billing', label: 'Pagos y suscripción Pro' },
  { value: 'otro', label: 'Otro' },
];

export default function TicketForm() {
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !category) return;
    setSending(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('triageTicket', {
        message,
        subject,
        channel: 'web',
      });
      setResult(res.data);
      setMessage('');
      setSubject('');
      setCategory('');
    } catch (err) {
      setError(err?.response?.data?.error || 'No pudimos enviar tu ticket. Reintenta en un minuto.');
    } finally {
      setSending(false);
    }
  };

  if (result?.success) {
    const isCritical = result.priority === 'critico';
    return (
      <div className="bg-card rounded-3xl border border-border shadow-soft p-6 md:p-8">
        <div className="flex items-start gap-3 mb-4">
          {isCritical ? (
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-mint-600 shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">
              {isCritical ? 'Ticket marcado como crítico' : 'Ticket recibido'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {result.autoResolved
                ? 'Respondemos al tiro con esta guía:'
                : isCritical
                  ? 'Lo escalamos al nivel 3 y respondemos en menos de 5 minutos.'
                  : 'Te respondemos por email a la brevedad.'}
            </p>
          </div>
        </div>
        {result.response && (
          <div className="mt-4 p-4 bg-mint-50 rounded-2xl border border-mint-200">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {result.response}
            </p>
          </div>
        )}
        <Button
          onClick={() => setResult(null)}
          variant="outline"
          className="mt-5 rounded-full"
        >
          Enviar otro ticket
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card rounded-3xl border border-border shadow-soft p-6 md:p-8 space-y-4"
    >
      <div>
        <label className="text-sm font-semibold text-foreground mb-1.5 block">
          ¿De qué se trata?
        </label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="rounded-2xl h-11">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-1.5 block">
          Asunto (opcional)
        </label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ej: No me llegó el documento ARCO"
          className="rounded-2xl h-11"
        />
      </div>

      <div>
        <label className="text-sm font-semibold text-foreground mb-1.5 block">
          Cuéntanos qué pasó
        </label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe la situación con el detalle que quieras. Si tienes plazo legal, indícalo."
          className="rounded-2xl min-h-32"
          required
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-2xl border border-destructive/20">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={sending || !message.trim() || !category}
        className="w-full rounded-full h-11 bg-foreground hover:bg-foreground/90 text-background font-semibold"
      >
        {sending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando…
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar ticket
          </>
        )}
      </Button>
    </form>
  );
}