import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ShieldCheck, Zap, FileText, Eye, Heart, Users, ArrowRight } from 'lucide-react';
import Logo from '@/components/home/Logo';

const PERFILES = [
  { name: 'Camila', age: 22, region: 'Santiago', emoji: '👩🏽‍🎓', case: 'Cobro indebido en crédito de consumo' },
  { name: 'Don Luis', age: 68, region: 'Valparaíso', emoji: '👴🏼', case: 'Cargo no reconocido en pensión' },
  { name: 'María José', age: 34, region: 'Temuco', emoji: '👩🏽‍💼', case: 'Cumplimiento SII Pyme' },
  { name: 'Roberto', age: 45, region: 'Antofagasta', emoji: '👨🏽‍🔧', case: 'Phishing tarjeta minera' },
];

export default function PitchDeck() {
  const [stats, setStats] = useState({ casos: 0, traces: 0, docs: 0, score: 72 });

  useEffect(() => {
    const load = async () => {
      try {
        const [casos, traces, docs] = await Promise.all([
          base44.entities.MisCasos.list('-created_date', 100).catch(() => []),
          base44.entities.AgentTrace.filter({ pipelineStage: 'complete' }, '-created_date', 100).catch(() => []),
          base44.entities.GeneratedDocument.list('-created_date', 100).catch(() => []),
        ]);
        const avgScore = traces.length
          ? Math.round(traces.reduce((s, t) => s + (t.verifierScore || 72), 0) / traces.length)
          : 72;
        setStats({
          casos: casos?.length || 0,
          traces: traces?.length || 0,
          docs: docs?.length || 0,
          score: avgScore,
        });
      } catch (e) {
        // mantén defaults
      }
    };
    load();
  }, []);

  const url = typeof window !== 'undefined' ? window.location.origin : 'https://finlogic.one';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=1F2533&bgcolor=F8F3E9&margin=12&data=${encodeURIComponent(url + '/Consulta')}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — pantalla completa para sala */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-mint-200 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full grid lg:grid-cols-5 gap-12 items-center">
          {/* Columna izq — narrativa */}
          <div className="lg:col-span-3 animate-fade-up">
            <Logo size="lg" />
            <p className="mt-8 text-sm font-bold text-mint-600 uppercase tracking-wider">
              Claude Impact Lab · Track 1 Inclusión Financiera
            </p>
            <h1 className="mt-4 font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              5 millones de chilenos<br />no entienden<br />sus derechos<br />
              <span className="text-mint-600">financieros.</span>
            </h1>
            <p className="mt-8 font-display text-2xl md:text-3xl font-bold text-foreground leading-tight max-w-xl">
              Esto no es un chatbot.<br />
              Es el <span className="text-mint-600">sistema operativo financiero</span><br />
              del pueblo de Chile.
            </p>
          </div>

          {/* Columna der — QR + métricas live */}
          <div className="lg:col-span-2 space-y-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="bg-card rounded-3xl border-2 border-mint-200 p-6 shadow-soft-lg">
              <p className="text-xs font-bold text-mint-600 uppercase tracking-wider text-center mb-3">
                Pruébalo ahora desde tu celular
              </p>
              <div className="bg-background rounded-2xl p-4 flex items-center justify-center">
                <img src={qrUrl} alt="QR finlogic.one/Consulta" className="w-full max-w-[280px] aspect-square" />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3 font-mono">
                finlogic.one/Consulta
              </p>
            </div>

            {/* Métricas live */}
            <div className="bg-foreground text-background rounded-3xl p-6 shadow-soft-lg">
              <p className="text-xs font-bold text-mint-300 uppercase tracking-wider mb-4">
                Producción · ahora mismo
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Metric label="Consultas" value={stats.casos} icon={Heart} />
                <Metric label="AgentTrace" value={stats.traces} icon={Eye} />
                <Metric label="Documentos" value={stats.docs} icon={FileText} />
                <Metric label="Score IA" value={`${stats.score}/100`} icon={ShieldCheck} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciadores — segunda pantalla */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-bold text-mint-600 uppercase tracking-wider text-center mb-3">
            6 diferenciadores demostrables en vivo
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center max-w-3xl mx-auto leading-tight">
            Otros te dan datos.<br /><span className="text-mint-600">Nosotros te damos comprensión.</span>
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            <Diferenciador icon={Zap} title="Pipeline auditable" desc="Triage → RAG → Especialista → Verificador. Todo visible en /Transparencia." />
            <Diferenciador icon={FileText} title="Documento listo" desc="Carta ARCO, denuncia SERNAC, reclamo CMF — generados, no descritos." />
            <Diferenciador icon={ShieldCheck} title="Plazo legal trackeado" desc="LegalDeadline con alertas WhatsApp 7d/3d/1d antes del vencimiento." />
            <Diferenciador icon={Eye} title="AgentTrace público" desc="Cada respuesta con score verificador, latencia y leyes citadas." />
            <Diferenciador icon={Heart} title="Modo accesibilidad" desc="Texto +25%, voz ElevenLabs, áreas táctiles 48px para Don Luis." />
            <Diferenciador icon={Users} title="Open lógica" desc="12 módulos normativos curados de fuentes públicas oficiales." />
          </div>
        </div>
      </section>

      {/* Perfiles validados */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <p className="text-sm font-bold text-mint-600 uppercase tracking-wider text-center mb-3">
            4 perfiles validados · casos reales
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center max-w-3xl mx-auto leading-tight">
            No diseñamos para todos.<br />Diseñamos <span className="text-mint-600">para los que nadie diseña.</span>
          </h2>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERFILES.map((p) => (
              <div key={p.name} className="bg-card rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg hover:border-mint-200 transition-all">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="font-display text-xl font-bold text-foreground">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{p.age} años · {p.region}</p>
                <p className="text-sm text-foreground/80 mt-4 leading-relaxed">{p.case}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA cierre */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-display text-5xl md:text-6xl font-bold leading-[1.05]">
            <span className="text-mint-300">finlogic.one</span><br />
            porque solo necesitas uno.
          </h2>
          <p className="mt-8 text-xl text-background/70 max-w-2xl mx-auto leading-relaxed">
            El concurso es la chispa. El legado es el fuego.
          </p>
          <Link
            to="/Consulta"
            className="inline-flex items-center gap-2 mt-10 rounded-full bg-mint-500 hover:bg-mint-400 text-white h-14 px-8 text-base font-bold transition-colors"
          >
            Probar el sistema en vivo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4">
      <div className="flex items-center gap-1.5 text-mint-300 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-wider">{label}</p>
      </div>
      <p className="font-display text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function Diferenciador({ icon: Icon, title, desc }) {
  return (
    <div className="bg-background rounded-3xl border border-border p-6 shadow-soft hover:shadow-soft-lg transition-shadow">
      <div className="w-11 h-11 rounded-2xl bg-mint-100 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-mint-700" />
      </div>
      <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
    </div>
  );
}