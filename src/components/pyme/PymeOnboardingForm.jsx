import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const RUT_PATTERN = /^[0-9]{7,8}-[0-9Kk]$/;

export default function PymeOnboardingForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    businessName: '',
    rut: '',
    businessType: 'persona_natural',
    economicActivity: '',
    taxRegime: 'pro_pyme',
    monthlyRevenue: '',
    vatObligations: true,
    employeeCount: 0,
    region: '',
  });
  const [error, setError] = useState('');

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.businessName.trim()) return setError('Falta razón social');
    if (!RUT_PATTERN.test(form.rut)) return setError('RUT inválido (ej: 12345678-9)');
    setError('');
    onSubmit({
      ...form,
      monthlyRevenue: form.monthlyRevenue ? Number(form.monthlyRevenue) : undefined,
      employeeCount: Number(form.employeeCount) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="businessName">Razón social *</Label>
          <Input
            id="businessName"
            value={form.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            placeholder="Almacén Don Luis EIRL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rut">RUT empresa *</Label>
          <Input
            id="rut"
            value={form.rut}
            onChange={(e) => handleChange('rut', e.target.value)}
            placeholder="76543210-K"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo societario</Label>
          <Select value={form.businessType} onValueChange={(v) => handleChange('businessType', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="persona_natural">Persona Natural con giro</SelectItem>
              <SelectItem value="eirl">EIRL</SelectItem>
              <SelectItem value="spa">SpA</SelectItem>
              <SelectItem value="ltda">Ltda.</SelectItem>
              <SelectItem value="sa">S.A.</SelectItem>
              <SelectItem value="cooperativa">Cooperativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Régimen tributario</Label>
          <Select value={form.taxRegime} onValueChange={(v) => handleChange('taxRegime', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pro_pyme">Pro-Pyme General (14 D N°3)</SelectItem>
              <SelectItem value="pro_pyme_transparente">Pro-Pyme Transparente</SelectItem>
              <SelectItem value="regimen_general">Régimen General (14 A)</SelectItem>
              <SelectItem value="renta_presunta">Renta Presunta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="economicActivity">Giro / actividad económica</Label>
          <Input
            id="economicActivity"
            value={form.economicActivity}
            onChange={(e) => handleChange('economicActivity', e.target.value)}
            placeholder="Comercio al por menor"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyRevenue">Facturación mensual aprox (CLP)</Label>
          <Input
            id="monthlyRevenue"
            type="number"
            value={form.monthlyRevenue}
            onChange={(e) => handleChange('monthlyRevenue', e.target.value)}
            placeholder="3500000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employeeCount">N° trabajadores</Label>
          <Input
            id="employeeCount"
            type="number"
            value={form.employeeCount}
            onChange={(e) => handleChange('employeeCount', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">Región</Label>
          <Input
            id="region"
            value={form.region}
            onChange={(e) => handleChange('region', e.target.value)}
            placeholder="Metropolitana"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-mint-600 hover:bg-mint-700 text-white h-11 px-6 font-semibold shadow-mint"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analizando…
            </>
          ) : (
            'Analizar mi pyme'
          )}
        </Button>
      </div>
    </form>
  );
}