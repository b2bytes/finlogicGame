import React from 'react';

const FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'abierto', label: 'Abiertos' },
  { key: 'en_proceso', label: 'En proceso' },
  { key: 'resuelto', label: 'Resueltos' },
  { key: 'vencido', label: 'Vencidos' },
];

export default function CasosFilters({ active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        const count = counts[f.key];
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              isActive
                ? 'bg-foreground text-background border-foreground'
                : 'bg-card text-muted-foreground border-border hover:border-foreground/30'
            }`}
          >
            {f.label}
            {typeof count === 'number' && count > 0 && (
              <span className={`ml-1.5 text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground/70'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}