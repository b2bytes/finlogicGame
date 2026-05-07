import React from 'react';
import { Search } from 'lucide-react';

const STAGE_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'visitor', label: 'Visitantes' },
  { value: 'lead', label: 'Lead' },
  { value: 'activated', label: 'Activadas' },
  { value: 'engaged', label: 'Engaged' },
  { value: 'retained', label: 'Retenidas' },
  { value: 'converted', label: 'Convertidas' },
];

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todas las cuentas' },
  { value: 'b2c', label: 'B2C ciudadanos' },
  { value: 'b2b_fintech', label: 'B2B fintech' },
  { value: 'b2g_institucional', label: 'B2G institucional' },
  { value: 'pyme', label: 'Pyme' },
  { value: 'prensa', label: 'Prensa' },
];

export default function CrmFilters({ search, setSearch, stage, setStage, accountType, setAccountType }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, teléfono o consulta…"
          className="w-full h-10 pl-9 pr-3 rounded-full bg-card border border-border text-sm outline-none focus:border-mint-400 transition-colors"
        />
      </div>
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value)}
        className="h-10 px-3 rounded-full bg-card border border-border text-sm outline-none focus:border-mint-400 transition-colors"
      >
        {STAGE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        className="h-10 px-3 rounded-full bg-card border border-border text-sm outline-none focus:border-mint-400 transition-colors"
      >
        {TYPE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}