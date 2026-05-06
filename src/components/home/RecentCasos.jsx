import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const profileEmojis = {
  camila: '👩🏽‍🎓',
  don_luis: '👴🏼',
  maria_jose: '👩🏽‍💼',
  roberto: '👨🏽‍🔧',
  general: '👤',
};

export default function RecentCasos() {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.MisCasos
      .filter({ status: 'resuelto' }, '-created_date', 4)
      .then((data) => {
        setCasos(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || casos.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
          <div>
            <p className="text-sm font-semibold text-mint-600 mb-2 uppercase tracking-wide">
              Casos resueltos · prueba social
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
              Lo que un sistema de justicia financiera<br /><span className="text-mint-600">realmente parece.</span>
            </h2>
          </div>
          <Link
            to="/Casos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint-700 hover:text-mint-600 transition-colors"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {casos.map((c) => (
            <Link
              key={c.id}
              to="/Casos"
              className="group bg-card rounded-3xl border border-border p-5 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl" aria-hidden="true">
                  {profileEmojis[c.userProfile] || profileEmojis.general}
                </span>
                <span className="text-[10px] font-bold text-mint-700 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Resuelto
                </span>
              </div>
              <h3 className="font-display text-sm font-bold text-foreground leading-snug line-clamp-3 mb-2">
                {c.title}
              </h3>
              {c.amountInvolved > 0 && (
                <p className="text-xs font-bold text-mint-700 tabular-nums mt-2">
                  ${c.amountInvolved.toLocaleString('es-CL')} CLP
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-wide font-semibold">
                {c.regulatoryBody}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}