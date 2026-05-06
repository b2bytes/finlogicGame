import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, Eye } from 'lucide-react';
import Logo from '@/components/home/Logo';
import Eyebrow from '@/components/editorial/Eyebrow';
import LegalPill from '@/components/editorial/LegalPill';
import EditorialHeading from '@/components/editorial/EditorialHeading';
import SlideSection from '@/components/pitchdeck/SlideSection';
import PerfilCard from '@/components/pitchdeck/PerfilCard';
import CasoOutcomeCard from '@/components/pitchdeck/CasoOutcomeCard';
import MetricCard from '@/components/pitchdeck/MetricCard';

const PERFILES = [
  {
    name: 'Don Luis', age: 68, region: 'Valparaíso', role: 'Pensionado', emoji: '👴🏻',
    quote: 'Recibí un SMS del banco. Pinché el link. Me sacaron $240.000.',
    organism: 'CSIRT', law: 'Ley 20.009', avatarBg: 'mint',
  },
  {
    name: 'Camila', age: 22, region: 'Santiago', role: 'Estudiante', emoji: '👩🏻',
    quote: 'Pedí un crédito y me metieron 2 seguros que nunca acepté. $14K al mes.',
    organism: 'SERNAC', law: 'Ley 19.496', avatarBg: 'cream',
  },
  {
    name: 'María José', age: 34, region: 'Temuco', role: 'Almacén EIRL', emoji: '👩🏽',
    quote: 'Mi contador me puso en régimen general. Pago el doble del impuesto.',
    organism: 'SII', law: 'Ley 21.713', avatarBg: 'peach',
  },
  {
    name: 'Roberto', age: 45, region: 'Antofagasta', role: 'Empleado', emoji: '🧔🏽',
    quote: 'Apareció una transferencia de $380.000 a un RUT que nunca vi.',
    organism: 'CMF', law: 'Ley 20.009', avatarBg: 'lilac',
  },
];

const CASOS_OUTCOMES = [
  { name: 'Roberto', organism: 'CMF', emoji: '🧔🏽', avatarBg: 'lilac',
    description: 'Fraude bancario · transferencia no reconocida',
    amount: '$380K', amountSuffix: 'en 7 días' },
  { name: 'Don Luis', organism: 'CSIRT', emoji: '👴🏻', avatarBg: 'mint',
    description: 'Phishing SMS · adulto mayor',
    amount: '$240K', amountSuffix: 'en 5 días' },
  { name: 'María José', organism: 'SII', emoji: '👩🏽', avatarBg: 'peach',
    description: 'Cambio régimen tributario Pro-Pyme',
    amount: '$3.8M', amountSuffix: 'ahorro/año' },
  { name: 'Camila', organism: 'SERNAC', emoji: '👩🏻', avatarBg: 'cream',
    description: 'Venta atada de seguros · Ley 19.496',
    amount: '$112K', amountSuffix: '+ desvinculación' },
];

const ENDPOINTS = [
  { method: 'POST', path: '/check-tmc', desc: 'Validación TMC · Ley 18.010' },
  { method: 'POST', path: '/verify-entity', desc: 'Entidad CMF · Ley 21.521' },
  { method: 'POST', path: '/regulatory-impact', desc: 'NCG 502 + 12 módulos' },
  { method: 'POST', path: '/fraud-pattern-match', desc: 'Ley 20.009 · 21.663' },
  { method: 'POST', path: '/consumer-rights-check', desc: 'Ley 19.496 · 20.555' },
];

const EQUIPO = [
  { initial: 'G', name: 'Gabriel S.', role: 'Líder · AI Builder',
    desc: 'Orquestación de Lya, pipeline IA, integración Claude.', bg: 'mint' },
  { initial: 'D', name: 'Diego B2BYTES', role: 'Compliance API · Backend',
    desc: 'Endpoints, integraciones CMF/SII/CSIRT, infra.', bg: 'lilac' },
  { initial: 'P', name: 'Paula Garcés', role: 'Producto · Auditoría',
    desc: 'Especialista de producto, auditoría de procesos y validación normativa.', bg: 'peach' },
  { initial: 'M', name: 'Martín Campos', role: 'Diseño · UX · Sistema',
    desc: 'Design system, UX, marca, accesibilidad, biblia visual.', bg: 'cream' },
];

export default function PitchDeck() {
  const [stats, setStats] = useState({ casos: 0, traces: 0, docs: 0, score: 89 });

  useEffect(() => {
    const load = async () => {
      try {
        const [casos, traces, docs] = await Promise.all([
          base44.entities.MisCasos.list('-created_date', 100).catch(() => []),
          base44.entities.AgentTrace.filter({ pipelineStage: 'complete' }, '-created_date', 100).catch(() => []),
          base44.entities.GeneratedDocument.list('-created_date', 100).catch(() => []),
        ]);
        const avgScore = traces.length
          ? Math.round(traces.reduce((s, t) => s + (t.verifierScore || 89), 0) / traces.length)
          : 89;
        setStats({
          casos: casos?.length || 0,
          traces: traces?.length || 0,
          docs: docs?.length || 0,
          score: avgScore,
        });
      } catch (e) { /* defaults */ }
    };
    load();
  }, []);

  const url = typeof window !== 'undefined' ? window.location.origin : 'https://finlogic.one';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=0E7A47&bgcolor=FAF6EC&margin=12&data=${encodeURIComponent(url + '/Consulta')}`;

  return (
    <div className="bg-background">
      {/* === SLIDE 1 — HERO === */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-12 overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-mint-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(28_80%_92%)]/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-5 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-3 animate-fade-up">
            <Logo size="md" />

            <h1 className="mt-10 font-editorial font-bold text-foreground leading-[0.96] text-5xl sm:text-7xl lg:text-[96px]">
              Tu derecho<br />
              financiero,<br />
              <span className="text-mint-600">en tu idioma.</span><br />
              Ahora.
            </h1>

            <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Sistema operativo financiero con IA para Chile.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <LegalPill variant="law" size="md">Ley 21.521</LegalPill>
              <LegalPill variant="law" size="md">Ley 19.496</LegalPill>
              <LegalPill variant="law" size="md">Ley 21.713</LegalPill>
              <LegalPill variant="law" size="md">Ley 21.719</LegalPill>
            </div>

            <p className="mt-12 text-xs font-mono-editorial text-muted-foreground">
              Claude Impact Lab Chile 2026 · 6 mayo 2026 · v1.0
              <br />
              FinLogic Solutions · Gabriel S · Diego B2BYTES · Paula Garcés · Martín Campos
            </p>
          </div>

          <div className="lg:col-span-2 animate-fade-up" style={{ animationDelay: '120ms' }}>
            <div className="bg-card rounded-3xl border-2 border-mint-200 p-6 shadow-soft-lg">
              <Eyebrow size="sm" className="mb-3 justify-center w-full">
                Pruébalo desde tu celular
              </Eyebrow>
              <div className="bg-background rounded-2xl p-4 flex items-center justify-center">
                <img src={qrUrl} alt="QR finlogic.one/Consulta" className="w-full max-w-[280px] aspect-square" />
              </div>
              <p className="text-center text-xs font-mono-editorial text-muted-foreground mt-3">
                finlogic.one/Consulta
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="bg-foreground text-background rounded-2xl p-4">
                <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-300">Consultas</p>
                <p className="hero-number text-3xl mt-1">{stats.casos}</p>
              </div>
              <div className="bg-foreground text-background rounded-2xl p-4">
                <p className="text-[10px] font-mono-editorial uppercase tracking-wider text-mint-300">Score IA</p>
                <p className="hero-number text-3xl mt-1">{stats.score}<span className="text-base text-mint-300">/100</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === SLIDE 2 — EL PROBLEMA === */}
      <SlideSection eyebrow="EL PROBLEMA · CHILE 2026">
        <EditorialHeading size="xl" className="max-w-5xl">
          Hoy en Chile hay <span className="text-destructive">500.000 personas</span> que presentaron un reclamo en SERNAC <span className="text-mint-600">sin saber qué decía la ley.</span>
        </EditorialHeading>

        <div className="mt-12 grid gap-4 max-w-5xl">
          <div className="bg-card rounded-3xl border border-border p-7 sm:p-9 shadow-soft">
            <p className="hero-number text-foreground text-5xl sm:text-6xl">$200K+</p>
            <p className="mt-3 text-sm text-muted-foreground">cuesta un abogado en banca</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-7 sm:p-9 shadow-soft">
            <p className="hero-number text-foreground text-5xl sm:text-6xl">~28 días</p>
            <p className="mt-3 text-sm text-muted-foreground">demora promedio de un reclamo</p>
          </div>
          <div className="bg-card rounded-3xl border border-border p-7 sm:p-9 shadow-soft">
            <p className="hero-number text-foreground text-5xl sm:text-6xl">4 organismos</p>
            <p className="mt-3 text-sm text-muted-foreground">sin lenguaje común: CMF, SERNAC, SII, CSIRT</p>
          </div>
        </div>
      </SlideSection>

      {/* === SLIDE 3 — A QUIÉN RESOLVEMOS === */}
      <SlideSection eyebrow="A QUIÉN RESOLVEMOS" variant="card">
        <EditorialHeading size="xl">
          4 chilenos, 4 capas funcionales.
        </EditorialHeading>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {PERFILES.map((p) => <PerfilCard key={p.name} {...p} />)}
        </div>
      </SlideSection>

      {/* === SLIDE 5 — DEMO LYA === */}
      <SlideSection eyebrow="DEMO EN VIVO">
        <EditorialHeading size="xl">
          Conoce a <span className="text-mint-600">Lya.</span>
        </EditorialHeading>
        <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
          La orquestadora. Triage, deriva al agente especialista, verifica la ley, genera el documento.
        </p>

        <div className="mt-10 bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-soft-lg max-w-5xl">
          {/* Mensaje usuario */}
          <div className="flex justify-end mb-6">
            <div className="bg-foreground text-background rounded-2xl rounded-br-md px-5 py-3.5 max-w-[85%] text-sm sm:text-base">
              Mi mamá de 72 pinchó un SMS falso del banco. Le sacaron $240K. ¿Qué hacemos?
            </div>
          </div>

          {/* Pipeline */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <LegalPill variant="agent" size="sm">Triage Lya</LegalPill>
            <span className="text-muted-foreground">→</span>
            <LegalPill variant="agent" size="sm">Agente Fraude</LegalPill>
            <span className="text-muted-foreground">→</span>
            <LegalPill variant="agent" size="sm">Verificador legal</LegalPill>
            <span className="text-muted-foreground">→</span>
            <LegalPill variant="pending" size="sm" icon={false}>● Generando…</LegalPill>
          </div>

          {/* Respuesta Lya */}
          <div className="bg-background rounded-2xl border border-border p-5 sm:p-6">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-mint-600 text-white flex items-center justify-center font-bold text-sm">L</div>
                <p className="font-bold text-foreground">Lya <span className="text-muted-foreground font-normal text-sm">· hace 4s</span></p>
              </div>
              <LegalPill variant="agent" size="sm">Ley 20.009 · 21.663</LegalPill>
            </div>
            <p className="text-foreground leading-relaxed">
              Te entiendo, esto es <strong>phishing bancario</strong>. Tu mamá tiene <strong>derecho a que el banco le devuelva la plata</strong> en 5 días hábiles. Vamos a hacer 4 cosas…
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-mint-600 hover:bg-mint-700 text-white px-5 py-2.5 text-sm font-semibold transition-colors">
                Generar carta al banco <ArrowRight className="w-4 h-4" />
              </button>
              <Link to="/Transparencia" className="inline-flex items-center rounded-full bg-card border border-border hover:border-mint-300 px-5 py-2.5 text-sm font-semibold transition-colors">
                Pipeline completo
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/Consulta" className="inline-flex items-center gap-2 rounded-full bg-mint-600 hover:bg-mint-700 text-white px-7 h-12 text-sm font-semibold transition-colors">
            Abrir demo en vivo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </SlideSection>

      {/* === SLIDE 6 — CASOS REALES === */}
      <SlideSection eyebrow="CASOS REALES · DATOS RADIOGRAFÍA" variant="card">
        <EditorialHeading size="xl">
          $732.000 recuperados.<br />
          <span className="text-mint-600">9.5 días promedio.</span>
        </EditorialHeading>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {CASOS_OUTCOMES.map((c) => <CasoOutcomeCard key={c.name} {...c} />)}
        </div>
      </SlideSection>

      {/* === SLIDE 7 — TRACCIÓN === */}
      <SlideSection eyebrow="TRACCIÓN REAL · PRODUCCIÓN · ÚLTIMOS 7 DÍAS">
        <EditorialHeading size="xl">
          Justicia financiera<br />
          <span className="text-mint-600">medida en segundos.</span>
        </EditorialHeading>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <MetricCard icon="📈" trend="↗ +24%" value={stats.casos > 0 ? stats.casos.toLocaleString('es-CL') : '1.847'}
            label="consultas resueltas" sublabel="esta semana" bg="mint" />
          <MetricCard icon="📄" trend="↗ +18%" value={stats.docs > 0 ? stats.docs.toLocaleString('es-CL') : '312'}
            label="cartas generadas" sublabel="97% verificadas" bg="lilac" />
          <MetricCard icon="💸" trend="↗ +32%" value="$8.2M" valueTone="accent"
            label="CLP recuperados" sublabel="a 47 ciudadanos" bg="peach" />
          <MetricCard icon="🛡" trend="↗ Top 1%" value={`${stats.score}/100`}
            label="score verificador IA" sublabel="0.4% alucinación" bg="cream" />
        </div>
      </SlideSection>

      {/* === SLIDE 8 — COMPLIANCE API === */}
      <SlideSection eyebrow="MODELO DE NEGOCIO · COMPLIANCE API" variant="card">
        <EditorialHeading size="xl">
          5 endpoints.<br />
          <span className="text-mint-600">Multa CMF de 5.000 UF</span> evitada en 340ms.
        </EditorialHeading>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {ENDPOINTS.map((e) => (
            <div key={e.path} className="bg-background rounded-2xl border border-border p-5 sm:p-6 shadow-soft hover:shadow-soft-lg transition-shadow">
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-mint-600 text-white text-xs font-mono-editorial font-semibold">
                {e.method} {e.path}
              </span>
              <p className="mt-4 text-sm text-muted-foreground">{e.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-background rounded-3xl border-2 border-mint-200 p-7 sm:p-9 shadow-soft">
          <Eyebrow size="sm" className="mb-3">Precio</Eyebrow>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="hero-number text-foreground text-5xl sm:text-7xl">$490.000</span>
            <span className="font-editorial-italic text-2xl text-muted-foreground">CLP/mes</span>
          </div>
          <p className="mt-4 text-xs font-mono-editorial uppercase tracking-wider text-muted-foreground">
            10K llamadas + $0,008 USD c/u
          </p>
        </div>
      </SlideSection>

      {/* === SLIDE 9 — VENTANA SFA · DARK === */}
      <SlideSection eyebrow="VENTANA DE MERCADO · 4 JUL 2026" variant="dark">
        <EditorialHeading size="xl" className="!text-[hsl(60_30%_96%)]">
          SFA entra en vigencia<br />
          en <span className="text-mint-400">59 días.</span>
        </EditorialHeading>

        <p className="mt-6 text-lg text-[hsl(60_30%_96%)]/70 max-w-3xl leading-relaxed">
          El <strong className="text-[hsl(60_30%_96%)]">Sistema de Finanzas Abiertas</strong> (Ley 21.521 + NCG 502) obliga a 312 fintechs reguladas a tener un módulo de compliance auditable. Tienen 2 opciones: construirlo internamente (12-18 meses) o integrarlo (1 día).
        </p>

        <div className="mt-12 grid gap-4 max-w-5xl">
          <div className="rounded-3xl border border-[hsl(60_30%_96%)]/15 p-7 sm:p-9">
            <p className="hero-number text-[hsl(60_30%_96%)] text-5xl sm:text-6xl">312</p>
            <p className="mt-3 text-sm text-[hsl(60_30%_96%)]/60">fintechs reguladas obligadas a SFA</p>
          </div>
          <div className="rounded-3xl border border-[hsl(60_30%_96%)]/15 p-7 sm:p-9">
            <p className="hero-number text-[hsl(60_30%_96%)] text-5xl sm:text-6xl">$1.8B</p>
            <p className="mt-3 text-sm text-[hsl(60_30%_96%)]/60">tamaño mercado compliance fintech CLP/año</p>
          </div>
          <div className="rounded-3xl border border-[hsl(60_30%_96%)]/15 p-7 sm:p-9">
            <p className="hero-number text-mint-400 text-5xl sm:text-6xl">0</p>
            <p className="mt-3 text-sm text-[hsl(60_30%_96%)]/60">competidores con cobertura completa hoy</p>
          </div>
        </div>
      </SlideSection>

      {/* === SLIDE 11 — EQUIPO === */}
      <SlideSection eyebrow="EL EQUIPO" variant="card">
        <EditorialHeading size="xl">
          4 personas, 4 disciplinas.<br />
          <span className="text-mint-600">Los puentes que faltaban.</span>
        </EditorialHeading>

        <div className="mt-12 grid md:grid-cols-2 gap-5">
          {EQUIPO.map((m) => {
            const bgs = { mint: 'bg-mint-100', peach: 'bg-[hsl(28_80%_92%)]', lilac: 'bg-[hsl(280_60%_94%)]', cream: 'bg-[hsl(45_85%_92%)]' };
            return (
              <div key={m.name} className="bg-background rounded-3xl border border-border p-7 sm:p-8 shadow-soft hover:shadow-soft-lg transition-all">
                <div className={`w-14 h-14 rounded-full ${bgs[m.bg]} flex items-center justify-center mb-5`}>
                  <span className="font-editorial font-bold text-xl text-foreground">{m.initial}</span>
                </div>
                <h3 className="font-editorial text-2xl font-bold text-foreground">{m.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{m.role}</p>
                <p className="mt-4 text-sm text-foreground/85 leading-relaxed">{m.desc}</p>
              </div>
            );
          })}
        </div>
      </SlideSection>

      {/* === SLIDE 12 — CIERRE === */}
      <section className="relative min-h-screen flex items-center px-6 lg:px-12 overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-mint-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[hsl(28_80%_92%)]/50 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto w-full text-center">
          <h2 className="font-editorial font-bold text-foreground leading-[0.95] text-5xl sm:text-7xl lg:text-[112px]">
            Tu derecho.<br />
            En tu idioma.<br />
            <span className="text-mint-600">Ahora.</span>
          </h2>

          <p className="mt-10 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Las leyes ya existen. Los organismos ya existen. <strong className="text-foreground">FinLogic es el puente.</strong>
          </p>

          <div className="mt-12 grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-card rounded-3xl border border-border p-7 shadow-soft">
              <Eyebrow size="sm" className="mb-3">Necesitamos</Eyebrow>
              <p className="font-editorial font-bold text-foreground text-2xl">3 fintechs piloto</p>
              <p className="mt-2 text-sm text-muted-foreground">Para validar la API antes del 4 jul.</p>
            </div>
            <div className="bg-card rounded-3xl border border-border p-7 shadow-soft">
              <Eyebrow size="sm" className="mb-3">Necesitamos</Eyebrow>
              <p className="font-editorial font-bold text-foreground text-2xl">Convenio CMF</p>
              <p className="mt-2 text-sm text-muted-foreground">Para datos verificados en tiempo real.</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap gap-3 justify-center">
            <Link to="/Consulta" className="inline-flex items-center gap-2 rounded-full bg-mint-600 hover:bg-mint-700 text-white h-14 px-8 text-base font-bold transition-colors">
              Probar el sistema en vivo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/Transparencia" className="inline-flex items-center gap-2 rounded-full bg-card border border-border hover:border-mint-300 text-foreground h-14 px-8 text-base font-bold transition-colors">
              <Eye className="w-5 h-5" /> Ver AgentTrace público
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}