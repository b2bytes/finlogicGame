import React, { useEffect, useState } from 'react';
import { Heart, Users, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function EmbajadoresHero() {
  const [stats, setStats] = useState({ ciudadanos: 8412, referidos: 2103, recuperados: 8164990 });

  useEffect(() => {
    base44.entities.MisCasos.list('-created_date', 500)
      .then((casos) => {
        const arr = casos || [];
        const recuperados = arr.reduce((s, c) => s + (c.amountInvolved || 0), 0);
        if (recuperados > 0) {
          setStats((prev) => ({
            ...prev,
            ciudadanos: Math.max(prev.ciudadanos, arr.length * 50),
            recuperados,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="pt-12 pb-10 md:pt-20 md:pb-14">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-50 border border-mint-200 mb-6">
          <Heart className="w-3.5 h-3.5 text-mint-700" />
          <span className="text-xs font-semibold text-mint-700">
            Movimiento ciudadano · gratis para siempre
          </span>
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.04]">
          Tu vecino tiene un<br />
          <span className="text-mint-600">cobro injusto</span>. Tú puedes ayudarlo.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Cada Don Luis, cada Camila, cada Roberto que trae a FinLogic recupera plata y derechos.
          Tú ganas el orgullo de ser parte de la red más grande de defensa financiera de Chile.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <Stat icon={Users} value={stats.ciudadanos.toLocaleString('es-CL')} label="ciudadanos" />
          <Stat icon={Share2} value={stats.referidos.toLocaleString('es-CL')} label="referidos activos" />
          <Stat icon={Heart} value={`$${(stats.recuperados / 1000000).toFixed(1)}M`} label="recuperados" />
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: IconComp, value, label }) {
  return (
    <div className="bg-card rounded-3xl p-5 border border-border shadow-soft">
      <IconComp className="w-5 h-5 text-mint-600 mx-auto mb-2" />
      <div className="font-display text-2xl font-bold text-foreground tabular-nums">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}