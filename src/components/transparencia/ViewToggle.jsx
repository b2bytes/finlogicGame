import React from 'react';
import { User, Code2 } from 'lucide-react';

export default function ViewToggle({ value, onChange }) {
  return (
    <div className="inline-flex items-center bg-card border border-border rounded-full p-1 shadow-soft">
      <button
        onClick={() => onChange('citizen')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          value === 'citizen' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        Vista Ciudadano
      </button>
      <button
        onClick={() => onChange('technical')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          value === 'technical' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Code2 className="w-3.5 h-3.5" />
        Vista Técnica
      </button>
    </div>
  );
}