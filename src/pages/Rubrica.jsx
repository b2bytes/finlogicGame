import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Logo from '@/components/home/Logo';
import RubricaGroup from '@/components/rubrica/RubricaGroup.jsx';

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
            Validación Agentic · Jurado Bendi
          </p>
          <h1 className="font-editorial text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.05]">
            Rúbrica FinLogic
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Cada criterio se valida en vivo contra el sistema: Pinecone RAG,
            pipeline <code className="font-mono-editorial text-xs px-1.5 py-0.5 bg-muted rounded">processConsultation</code>,
            corpus AgentTrace y URLs oficiales chilenas.
          </p>
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

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          <p>
            Validador agentic · usa{' '}
            <code className="font-mono-editorial px-1.5 py-0.5 bg-muted rounded">validateRubrica</code>{' '}
            como backend · cada test corre contra el sistema productivo en{' '}
            <code className="font-mono-editorial px-1.5 py-0.5 bg-muted rounded">finlogic.one</code>.
          </p>
        </footer>
      </main>
    </div>
  );
}