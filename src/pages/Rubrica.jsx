import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Sparkles, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import RubricaGroup from '@/components/rubrica/RubricaGroup.jsx';

// Fuentes oficiales del corpus Pinecone — verificables manualmente por el jurado
const OFFICIAL_SOURCES = [
  { law: 'Ley 20.009', org: 'CSIRT', url: 'https://www.bcn.cl/leychile/navegar?idNorma=235182', domain: 'bcn.cl' },
  { law: 'Ley 19.496', org: 'SERNAC', url: 'https://www.bcn.cl/leychile/navegar?idNorma=61438', domain: 'bcn.cl' },
  { law: 'Ley 20.555', org: 'SERNAC', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1031940', domain: 'bcn.cl' },
  { law: 'Ley 21.521', org: 'CMF', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1192828', domain: 'bcn.cl' },
  { law: 'Ley 21.713', org: 'SII', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1208416', domain: 'bcn.cl' },
  { law: 'Ley 21.719', org: 'BCN', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1208091', domain: 'bcn.cl' },
  { law: 'Ley 21.663', org: 'CSIRT', url: 'https://www.bcn.cl/leychile/navegar?idNorma=1204357', domain: 'bcn.cl' },
  { law: 'NCG 502', org: 'CMF', url: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18564.html', domain: 'cmfchile.cl' },
];

/**
 * /Rubrica — Validación agentic de la rúbrica del jurado.
 * Cada criterio se valida en vivo contra el sistema FinLogic
 * (Pinecone RAG, processConsultation, AgentTrace, etc.)
 */

const RUBRICA = [
  {
    id: 'problema_ciudadano',
    title: 'Problema y ciudadano',
    description:
      'Quién es el ciudadano, qué problema regulatorio enfrenta, cómo llega la solución.',
    weight: 10,
    criteria: [
      {
        id: 'problema_sin_jerga',
        title: 'Problema sin jerga ≤300 chars',
        description: 'Bendi cuenta caracteres y detecta jerga técnica no explicada.',
        weight: 25,
      },
      {
        id: 'segmento_ciudadano',
        title: 'Segmento ciudadano específico',
        description: 'Bendi exige grupo etario + ubicación + condición socioeconómica.',
        weight: 25,
      },
      {
        id: 'canal_adopcion',
        title: 'Canal de adopción concreto',
        description: 'Bendi exige nombre de canal real (WhatsApp, app X) + justificación.',
        weight: 25,
      },
      {
        id: 'impacto_cuantificado',
        title: 'Impacto cuantificado con fuente verificable',
        description: 'Bendi extrae métrica + valida URL .gob.cl o institucional.',
        weight: 25,
      },
    ],
  },
  {
    id: 'datos_responsables',
    title: 'Datos responsables',
    description: 'Trazabilidad regulatoria y ausencia de alucinaciones.',
    weight: 10,
    criteria: [
      {
        id: 'fuentes_oficiales',
        title: '≥2 fuentes regulatorias oficiales con URL',
        description: 'Bendi cuenta URLs oficiales (cmf.cl, sii.cl, sernac.cl, bcn.cl, csirt.gob.cl, leychile.cl).',
        weight: 50,
      },
      {
        id: 'cero_alucinaciones',
        title: 'Cero alucinaciones regulatorias',
        description: 'Bendi compara afirmaciones legales contra Wiki Legal (RAG Pinecone).',
        weight: 50,
      },
    ],
  },
  {
    id: 'claude_agentic',
    title: 'Uso de Claude + arquitectura agentic',
    description: 'System prompt, tools, evidencia de uso real durante el evento.',
    weight: 18,
    criteria: [
      {
        id: 'system_prompt_especifico',
        title: 'System prompt específico (>200 chars, dominio claro)',
        description: 'Bendi mide longitud + detecta menciones a CMF/SII/Ley 21.719.',
        weight: 33,
      },
      {
        id: 'tools_json_schema',
        title: '≥2 tools con schema JSON válido',
        description: 'Bendi parsea tools.json y valida cada schema.',
        weight: 33,
      },
      {
        id: 'consola_anthropic_mensajes',
        title: 'Consola Anthropic ≥3 mensajes en ventana 6-7 mayo',
        description: 'Bendi cuenta mensajes + valida timestamps en ventana del evento.',
        weight: 34,
      },
    ],
  },
  {
    id: 'funciona',
    title: 'Funciona',
    description: 'Demo end-to-end del agente funcionando.',
    weight: 13,
    criteria: [
      {
        id: 'demo_video',
        title: 'Demo video 3-5 min muestra flujo end-to-end',
        description: 'Bendi verifica duración + URL accesible + flujo completo (input→output).',
        weight: 100,
      },
    ],
  },
];

export default function Rubrica() {
  const [results, setResults] = useState({});
  const [validatingAll, setValidatingAll] = useState(false);

  const handleValidated = (criterionId, data) => {
    setResults((prev) => ({ ...prev, [criterionId]: data }));
  };

  const validateAll = async () => {
    setValidatingAll(true);
    try {
      const res = await base44.functions.invoke('validateRubrica', {});
      const newResults = {};
      (res.data?.results || []).forEach((r) => {
        newResults[r.criterionId] = r;
      });
      setResults(newResults);
    } catch (e) {
      console.error(e);
    } finally {
      setValidatingAll(false);
    }
  };

  // Score global ponderado por grupo
  const totalWeight = RUBRICA.reduce((s, g) => s + g.weight, 0); // 51% (no es 100%, es la rúbrica oficial)
  const totalScore = RUBRICA.reduce((acc, group) => {
    const groupScore = group.criteria.reduce((s, c) => {
      const r = results[c.id];
      return s + (r ? (r.score * c.weight) / 100 : 0);
    }, 0);
    return acc + (groupScore * group.weight) / totalWeight;
  }, 0);

  const totalCriteria = RUBRICA.reduce((s, g) => s + g.criteria.length, 0);
  const validatedCriteria = Object.keys(results).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Logo size="sm" />
          <div className="w-12" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero */}
        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-mono-editorial text-mint-600 mb-2 tracking-widest uppercase">
            Validación Agentic · Jurado Bendi · 6-7 mayo 2026
          </p>
          <h1 className="font-editorial text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Rúbrica FinLogic.
            <span className="block text-mint-600 italic">Sin tomar nuestra palabra.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl leading-relaxed">
            Cada criterio se valida en vivo contra el sistema productivo: Pinecone RAG (34 chunks normativos), pipeline <code className="font-mono-editorial text-xs px-1.5 py-0.5 bg-muted rounded">processConsultation</code>, corpus AgentTrace y URLs oficiales chilenas (<code className="font-mono-editorial text-xs px-1.5 py-0.5 bg-muted rounded">.gob.cl</code>, <code className="font-mono-editorial text-xs px-1.5 py-0.5 bg-muted rounded">bcn.cl</code>, <code className="font-mono-editorial text-xs px-1.5 py-0.5 bg-muted rounded">cmfchile.cl</code>).
          </p>

          {/* Compromiso anti-alucinación */}
          <div className="mt-6 inline-flex items-start gap-3 bg-mint-50 border border-mint-200 rounded-2xl px-4 py-3 max-w-2xl">
            <ShieldCheck className="w-5 h-5 text-mint-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-mint-800 leading-relaxed">
              <strong className="font-semibold block mb-1">Compromiso anti-alucinación.</strong>
              Si un criterio no pasa, el botón muestra rojo y la evidencia exacta. Cero números inventados, cero leyes ficticias.
            </div>
          </div>
        </div>

        {/* Score card global */}
        <div className="mb-10 bg-gradient-to-br from-mint-500 to-mint-700 text-white rounded-3xl p-6 md:p-8 shadow-soft-lg">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-mint-100" />
                <p className="text-xs font-mono-editorial uppercase tracking-widest text-mint-100">
                  Score global ponderado
                </p>
              </div>
              <p className="hero-number text-6xl md:text-7xl text-white">
                {validatedCriteria === 0 ? '—' : Math.round(totalScore)}
                <span className="text-2xl md:text-3xl text-mint-100 font-normal">/100</span>
              </p>
              <p className="text-sm text-mint-50 mt-2">
                {validatedCriteria}/{totalCriteria} criterios validados ·
                rúbrica oficial 51% (Bendi reserva 49% al juicio cualitativo)
              </p>
            </div>
            <button
              onClick={validateAll}
              disabled={validatingAll}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-mint-700 font-semibold text-sm shadow-soft hover:shadow-soft-lg active:scale-95 transition-all disabled:opacity-60"
            >
              {validatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Validar todo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Groups */}
        <div className="space-y-12">
          {RUBRICA.map((group) => (
            <RubricaGroup
              key={group.id}
              group={group}
              results={results}
              onValidated={handleValidated}
            />
          ))}
        </div>

        {/* Fuentes oficiales — verificables uno por uno por el jurado */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4 pb-2 border-b border-border mb-5">
            <div>
              <p className="text-xs font-mono-editorial text-mint-600 uppercase tracking-widest mb-1">
                Auditoría · Fuentes en RAG
              </p>
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                Cada ley que Lya cita, existe.
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Estas son las URLs oficiales que indexamos en Pinecone. Click para verificar en BCN/CMF directamente.
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {OFFICIAL_SOURCES.map((s) => (
              <a
                key={s.law}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 bg-card border border-border rounded-2xl px-4 py-3 hover:border-mint-300 hover:bg-mint-50/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-mono-editorial text-xs text-mint-700 font-semibold">{s.law}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {s.org} · {s.domain}
                  </p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-mint-600 flex-shrink-0" />
              </a>
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          <p>
            Validador agentic · usa{' '}
            <code className="font-mono-editorial px-1.5 py-0.5 bg-muted rounded">validateRubrica</code>{' '}
            como backend · cada test corre contra el sistema productivo en{' '}
            <code className="font-mono-editorial px-1.5 py-0.5 bg-muted rounded">finlogic.one</code>.
          </p>
          <p className="mt-2">
            Equipo FinLogic · Gabriel S · Diego B2BYTES · Paula Garcés · Martín Campos · Claude Impact Lab Chile 2026
          </p>
        </footer>
      </main>
    </div>
  );
}