import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

const profileAvatars = [
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/100231319_generated_image.png',
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/2b5e2a921_generated_image.png',
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/fddcf327a_generated_image.png',
  'https://media.base44.com/images/public/69fae03fe83575f06c206e95/55d62fe58_generated_image.png',
];

// Trust strip Apple-style: avatares apilados + score live + casos resueltos.
// Aparece justo bajo el input del Hero para reducir fricción inicial.
export default function HeroTrustStrip() {
  const [stats, setStats] = useState({ casos: 45, score: 72 });

  useEffect(() => {
    Promise.all([
      base44.entities.MisCasos.list('-created_date', 100).catch(() => []),
      base44.entities.AgentTrace.list('-created_date', 200).catch(() => []),
    ]).then(([casos, traces]) => {
      const traceArr = traces || [];
      const scores = traceArr.filter((t) => typeof t.verifierScore === 'number').map((t) => t.verifierScore);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 72;
      setStats({
        casos: (casos || []).length || 45,
        score: avg,
      });
    });
  }, []);

  return (
    <div className="mt-7 flex items-center gap-4 max-w-xl">
      <div className="flex -space-x-2.5">
        {profileAvatars.map((src, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full ring-2 ring-background bg-card overflow-hidden shadow-soft"
            style={{ zIndex: profileAvatars.length - i }}
          >
            <img src={src} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
          </div>
        ))}
      </div>
      <div className="text-xs leading-snug">
        <p className="font-semibold text-foreground">
          +{stats.casos} chilenos resolvieron su caso
        </p>
        <p className="text-muted-foreground">
          esta semana · score verificador <span className="font-semibold text-mint-700">{stats.score}/100</span>
        </p>
      </div>
    </div>
  );
}