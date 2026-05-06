import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, CheckCircle2, AlertTriangle } from 'lucide-react';

const PLANS = [
  { value: 'base', label: 'Base — 10.000 calls / mes — $490.000 CLP' },
  { value: 'professional', label: 'Professional — 50.000 calls / mes' },
  { value: 'enterprise', label: 'Enterprise — Ilimitado' },
];

export default function IssueKeyDialog({ open, onOpenChange, onIssued }) {
  const [form, setForm] = useState({ organizationName: '', rut: '', contactEmail: '', plan: 'base' });
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(null);
  const [copied, setCopied] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('issueComplianceAPIKey', form);
      setIssued(data);
      onIssued?.();
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(issued.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const close = () => {
    setIssued(null);
    setForm({ organizationName: '', rut: '', contactEmail: '', plan: 'base' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-lg rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {issued ? 'API Key generada' : 'Emitir nueva API Key'}
          </DialogTitle>
        </DialogHeader>

        {issued ? (
          <div className="space-y-4">
            <div className="bg-mint-50 border border-mint-200 rounded-2xl p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-mint-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-mint-700">
                Key creada para <strong>{issued.record.organizationName}</strong>. Cópiala ahora — no se volverá a mostrar.
              </div>
            </div>
            <div className="bg-foreground rounded-2xl p-4">
              <div className="flex items-center gap-2 justify-between">
                <code className="text-xs text-background font-mono break-all">{issued.apiKey}</code>
                <Button onClick={copy} size="sm" variant="secondary" className="rounded-full flex-shrink-0">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3 flex gap-2 text-xs text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Guárdala en un gestor de secretos. FinLogic solo conserva el hash SHA-256.
            </div>
            <Button onClick={close} className="w-full rounded-full bg-foreground hover:bg-foreground/90 text-background">
              Cerrar
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organización</Label>
              <Input
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                placeholder="Fintech XYZ SpA"
                className="rounded-2xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>RUT</Label>
                <Input
                  value={form.rut}
                  onChange={(e) => setForm({ ...form, rut: e.target.value })}
                  placeholder="76123456-7"
                  className="rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Email contacto</Label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  placeholder="api@fintech.cl"
                  className="rounded-2xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                <SelectTrigger className="rounded-2xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={submit}
              disabled={loading || !form.organizationName || !form.contactEmail}
              className="w-full rounded-full bg-mint-500 hover:bg-mint-600 text-white"
            >
              {loading ? 'Generando…' : 'Emitir API Key'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}