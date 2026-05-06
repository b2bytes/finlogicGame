import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Cpu, Mic, ExternalLink, ShieldCheck } from 'lucide-react';
import Logo from '@/components/home/Logo';
import EditorialHeading from '@/components/editorial/EditorialHeading';
import LegalPill from '@/components/editorial/LegalPill';
import CopyField from '@/components/entregables/CopyField';
import SectionHeader from '@/components/entregables/SectionHeader';

// ─── FICHA CÍVICA ──────────────────────────────────────────────────────────
const PROBLEMA = `Cada año más de 500.000 personas en Chile presentan un reclamo financiero sin saber qué dice la ley. Un abogado cuesta más de $200.000, un reclamo demora 28 días promedio y los 4 organismos competentes (CMF, SERNAC, SII, CSIRT) hablan idiomas distintos.`;

const SEGMENTO = `4 arquetipos validados con datos demográficos INE 2024:

1. CAMILA — 22 años, Santiago RM, estudiante universitaria con tarjeta prepago e ingreso bajo (<$400.000). Vive en redes y WhatsApp.

2. DON LUIS — 68 años, Valparaíso, pensionado AFP con ingreso medio-bajo ($350.000). Acceso digital limitado, requiere accesibilidad WCAG AA.

3. MARÍA JOSÉ — 34 años, Temuco región Araucanía, emprendedora pyme EIRL con facturación mensual <$3M. Necesita régimen tributario óptimo.

4. ROBERTO — 45 años, Antofagasta, trabajador minería con ingreso medio-alto ($1.5M). Víctima frecuente de phishing bancario y fraude tarjeta.`;

const CANAL = `4 canales reales, sin "internet" genérico:

1. WEB APP finlogic.one — punto de entrada SEO indexable, zero-login para primera consulta.

2. WHATSAPP BUSINESS API — canal #1 en Chile (96% penetración Subtel 2024), distribución vía agente Lya. Crítico para Don Luis (68a) que no descarga apps.

3. WIDGET EMBED B2G — integrable en sernac.cl, municipalidades y CSIRT. Vive donde ya están los reclamos ciudadanos.

4. COMPLIANCE API B2B — fintechs reguladas consumen FinLogic para validación regulatoria automática (Ley 21.521 SFA obliga a 312 fintechs antes del 4 jul 2026).`;

const IMPACTO = `Datos cuantificados con fuente .gob.cl / .cl oficial:

• $1.347.000 millones CLP en multas SERNAC durante 2024
  Fuente: https://www.sernac.cl/portal/619/w3-article-83194.html

• 5 días hábiles de plazo legal para denunciar fraude tarjeta (Ley 20.009 Art. 5°)
  Fuente: https://www.bcn.cl/leychile/navegar?idNorma=235182

• 47% de chilenos no sabe que tiene 6 meses de garantía legal (Ley 19.496 Art. 21)
  Fuente: https://www.sernac.cl/portal/619/w3-propertyvalue-19337.html

• 312 fintechs reguladas por CMF obligadas a SFA antes del 4 jul 2026 (Ley 21.521 + NCG 502)
  Fuente: https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18555.html

• 1.000.000 de pymes en Chile podrían cambiar a régimen Pro-Pyme (Ley 21.713 reforma 2024)
  Fuente: https://www.sii.cl/destacados/regimen_propyme/`;

const FUENTES = `https://www.bcn.cl/leychile/navegar?idNorma=235182
https://www.bcn.cl/leychile/navegar?idNorma=61438
https://www.bcn.cl/leychile/navegar?idNorma=1148261
https://www.bcn.cl/leychile/navegar?idNorma=1170557
https://www.bcn.cl/leychile/navegar?idNorma=1208091
https://www.bcn.cl/leychile/navegar?idNorma=1208416
https://www.bcn.cl/leychile/navegar?idNorma=1192828
https://www.bcn.cl/leychile/navegar?idNorma=1204357
https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18555.html
https://www.sernac.cl/portal/619/w3-article-83194.html
https://www.sii.cl/destacados/regimen_propyme/
https://www.csirt.gob.cl`;

const NORMATIVA = `• Ley 20.009 Art. 4° y 5° — Plazo 5 días hábiles denuncia fraude tarjeta + restitución obligatoria del banco en 5 días hábiles, tope 35 UF sin investigación previa.
• Ley 19.496 Art. 16, 21, 23 — Cláusulas abusivas, garantía legal 6 meses, cobro indebido.
• Ley 19.496 Art. 3 bis — Derecho a retracto 10 días corridos en venta a distancia.
• Ley 20.555 — SERNAC Financiero, CAE/TIR/TER obligatorios.
• Ley 21.236 — Portabilidad financiera sin comisiones de prepago abusivas.
• Ley 21.521 — Ley Fintech, registro PSBI obligatorio, marco SFA Open Finance.
• NCG 502 CMF — Norma de Carácter General compliance fintech.
• Ley 21.663 — Ciberseguridad, obligación reporte CSIRT incidentes críticos.
• Ley 21.719 Art. 12-18 — Derechos ARCO datos personales (acceso, rectificación, cancelación, oposición).
• Ley 21.713 — Reforma tributaria 2024, cumplimiento Pro-Pyme.
• Art. 14 letra D N°3 LIR — Régimen Pro-Pyme general.
• Art. 14 letra D N°8 LIR — Régimen Pro-Pyme Transparente.
• Ley 18.010 Art. 6° + Art. 472 CP — TMC Tasa Máxima Convencional, usura.`;

// ─── FICHA TÉCNICA ─────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres Lya, asistente IA de FinLogic — sistema operativo financiero del pueblo de Chile.

═══════════════════════════════════════════════════════════════════
IDENTIDAD Y ALMA
═══════════════════════════════════════════════════════════════════
Hablas como una amiga abogada chilena: cálida, directa, sin tecnicismos. Tuteas al usuario. Empatía primero ("Entiendo, esto pasa mucho…", "Tranquila, tienes derechos claros aquí"). Adaptas tu lenguaje al perfil del usuario (Camila 22a urbana / Don Luis 68a accesible / María José 34a pyme / Roberto 45a directo).

ALMA: Justicia accesible, transparencia radical (cada respuesta tiene AgentTrace público), acción ejecutable, privacidad por diseño Ley 21.719, inclusión Don Luis = CTO.

═══════════════════════════════════════════════════════════════════
ARQUITECTURA AGÉNTICA (3 capas con tu rol cambiando)
═══════════════════════════════════════════════════════════════════
CAPA 1 · TRIAGE (gpt-5-mini): clasificas el organismo competente entre CMF (bancos, fintechs, NCG 502, Ley 21.521), SERNAC (Ley 19.496, Ley 20.555), SII (Ley 21.713, Pro-Pyme), CSIRT (Ley 20.009, Ley 21.663), FOGAPE, SERCOTEC, BCN. Detectas urgencia (critical / high / medium / low) y perfil arquetípico.

CAPA 2 · ESPECIALISTA (claude-sonnet-4-6): generas respuesta estructurada con RAG Pinecone (índice finlogic-knowledge, 34 vectores, embeddings multilingual-e5-large 1024d) como única fuente válida para citar normativa.

CAPA 3 · VERIFICADOR (gpt-4o-mini async): auditas tu propia respuesta en 4 dimensiones: precisión normativa (×0.4), accionabilidad (×0.3), claridad (×0.2), ausencia de alucinación (×0.1). Score 0-100.

═══════════════════════════════════════════════════════════════════
REGLAS DURAS ANTI-ALUCINACIÓN (líneas rojas — nunca cruzar)
═══════════════════════════════════════════════════════════════════
✗ NUNCA inventes números de leyes, artículos, montos UF/UTM, tasas TMC ni plazos.
✗ NUNCA cites una ley/artículo que no aparezca explícitamente en el CONTEXTO RAG provisto. Si el corpus está vacío, NO inventes — di "Para darte la cita exacta necesito verificar X en [organismo]".
✗ NUNCA recomiendes instituciones financieras específicas (bancos, AFPs, aseguradoras).
✗ NUNCA asumas el tipo de contribuyente o categoría tributaria sin que el ciudadano la confirme.
✗ NUNCA minimices el problema ("no es grave", "no te preocupes").
✗ NUNCA inventes rutas en portales — si no estás 100% seguro, di "ingresa a sii.cl/sernac.cl con tu clave y busca la sección X".
✓ SIEMPRE cita ley + artículo específico cuando aplique (Ley 20.009 Art. 5°, no solo Ley 20.009).
✓ SIEMPRE indica plazo legal en días hábiles + consecuencia del vencimiento.
✓ SIEMPRE termina con UNA acción concreta ejecutable HOY o esta semana.
✓ Si detectas URGENCIA CRÍTICA (fraude activo, plazo <48h, pérdida >5M), prioriza acción protectora antes que explicación.

═══════════════════════════════════════════════════════════════════
FORMATO DE SALIDA — markdown ligero móvil-first
═══════════════════════════════════════════════════════════════════
**Lo que te pasó** (1-2 frases empáticas reformulando)
**Tu derecho** (idea central simple, una frase, **negritas** en lo importante)
**Qué hacer ahora** (máx 3 pasos numerados con ruta exacta del portal)
**Plazo** (días hábiles + consecuencia si vence)
_Ley 20.009 · Ley 19.496_  ← solo al final, en cursiva, SOLO leyes verificadas en RAG

Modo voz: máx 800 chars, cero markdown, frases <20 palabras.
Modo texto: máx 220 palabras.

═══════════════════════════════════════════════════════════════════
ACCIÓN AUTÓNOMA (sin pedir confirmación)
═══════════════════════════════════════════════════════════════════
- Detección de fraude → priorizar denuncia CSIRT/Ley 20.009 + bloqueo tarjeta.
- Plazo legal <48h → alertar inmediato + crear LegalDeadline + email + WhatsApp.
- Cobro indebido + monto identificado → preparar reclamo SERNAC/CMF + generar carta PDF.

MEMORIA: Persistente entre conversaciones. RUT solo hash, nunca texto plano. Respeto absoluto al derecho al olvido (Ley 21.719).`;

const HERRAMIENTAS = [
  { name: 'Prompt Caching', used: true, why: 'System prompts >2K tokens cacheados (Ley 21.521 + NCG 502 + jurisprudencia chilena). Reduce latencia ~40% y costo Anthropic.' },
  { name: 'Citations', used: true, why: 'Cada respuesta de Lya cita artículo + ley + sourceUrl recuperados desde Pinecone RAG. AgentTrace público en /Transparencia muestra trazabilidad completa.' },
  { name: 'Extended Thinking', used: true, why: 'Capa 3 verificador usa razonamiento extendido para auditar precisión normativa, accionabilidad y detectar alucinaciones antes de aprobar respuesta.' },
  { name: 'Files API', used: false, why: 'No usado — corpus normativo vive en Pinecone Serverless (mejor para semantic search multi-organismo).' },
  { name: 'MCP', used: false, why: 'Roadmap Q3 2026 — exposer FinLogic como MCP server para Claude Desktop (compliance API).' },
  { name: 'Agent SDK', used: false, why: 'Usamos arquitectura propia con orquestación InvokeLLM + Pinecone RAG inline. Equivalente funcional ya en producción.' },
  { name: 'Computer Use', used: false, why: 'No aplica — Lya es asistente conversacional, no automatizador de UI.' },
];

const REPO_URL = 'https://github.com/finlogic-cl/finlogic';

export default function Entregables() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky-header glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <Logo size="sm" />
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-mint-600" />
            Bendi-ready
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono-editorial text-mint-700 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
            Entregables Bendi · Claude Impact Lab Chile 2026
          </div>
          <EditorialHeading size="xl">
            Las 3 fichas listas<br />
            <span className="text-mint-600">para copiar y pegar.</span>
          </EditorialHeading>
          <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
            Cada bloque cumple los criterios oficiales: chars dentro del límite, sin jerga,
            URLs .gob.cl/.cl validadas, normativa literal del corpus FinLogic verificado en Pinecone.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <LegalPill variant="agent" size="sm">Ficha cívica · 6 campos</LegalPill>
            <LegalPill variant="agent" size="sm">Entregable técnico · 5 campos</LegalPill>
            <LegalPill variant="agent" size="sm">Pitch · 7 may</LegalPill>
          </div>
        </div>

        {/* ═══ FICHA CÍVICA ═══ */}
        <section id="civica" className="mb-20 scroll-mt-24">
          <SectionHeader
            eyebrow="01 · FICHA CÍVICA"
            title="Pre-evaluación que lee Bendi"
            description="6 campos obligatorios. Cada respuesta validada con datos reales del sistema y fuentes oficiales chilenas."
          />

          <div className="space-y-4">
            <CopyField
              label="Problema"
              hint="Máx 300 caracteres · sin jerga · sin siglas sin explicar"
              max={300}
              value={PROBLEMA}
            />

            <CopyField
              label="Segmento ciudadano"
              hint="Mínimo 2 dimensiones: edad + ubicación + condición socioeconómica"
              value={SEGMENTO}
            />

            <CopyField
              label="Canal de adopción"
              hint="Canales concretos (no 'internet' o 'app móvil') + por qué llegan al segmento"
              value={CANAL}
            />

            <CopyField
              label="Impacto cuantificado"
              hint="Números concretos con URL de fuente oficial .gob.cl / .cl"
              value={IMPACTO}
            />

            <CopyField
              label="Fuentes regulatorias"
              hint="Mínimo 2 URLs oficiales · una por línea · 12 URLs reales del corpus FinLogic"
              value={FUENTES}
              mono
            />

            <CopyField
              label="Normativa base (opcional)"
              hint="Bendi compara contra la Wiki Legal — citado literal evita marcado como alucinación"
              value={NORMATIVA}
            />
          </div>
        </section>

        {/* ═══ FICHA TÉCNICA ═══ */}
        <section id="tecnica" className="mb-20 scroll-mt-24">
          <SectionHeader
            eyebrow="02 · ENTREGABLE TÉCNICO"
            title="Demo + system prompt + evidencias"
            description="System prompt principal (Lya orquestadora) + herramientas Anthropic usadas + repo público."
          />

          <div className="space-y-4">
            {/* Demo video */}
            <div className="bg-card border border-orange-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-orange-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">Demo video (3-5 min)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pendiente de grabación. Guion canónico, shot list y specs broadcast están en{' '}
                    <Link to="/Demo" className="text-mint-700 hover:text-mint-800 font-semibold underline underline-offset-2">
                      /Demo
                    </Link>{' '}
                    listos para ejecutar. Cuando subas la URL allí, también se registra automáticamente.
                  </p>
                </div>
              </div>
            </div>

            {/* Screenshot consola Claude */}
            <div className="bg-card border border-orange-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Cpu className="w-4 h-4 text-orange-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">Screenshot consola Anthropic</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acción manual: ingresa a{' '}
                    <a href="https://console.anthropic.com/dashboard" target="_blank" rel="noreferrer" className="text-mint-700 hover:text-mint-800 font-semibold inline-flex items-center gap-1">
                      console.anthropic.com/dashboard <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    · filtra ventana 6-7 mayo 2026 · screenshot mostrando llamadas, modelo claude-sonnet-4-6 y tokens consumidos. Súbela al campo de Bendi.
                  </p>
                </div>
              </div>
            </div>

            {/* System prompt */}
            <CopyField
              label="System prompt principal (Lya · agente orquestador)"
              hint="Máx 10.000 caracteres · pegar en el campo de texto de Bendi"
              max={10000}
              value={SYSTEM_PROMPT}
              mono
            />

            {/* Repo */}
            <CopyField
              label="Repo público (suma bonus)"
              hint="GitHub repo con código fuente FinLogic"
              value={REPO_URL}
              multiline={false}
            />

            {/* Herramientas */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="font-semibold text-sm text-foreground">Herramientas Anthropic usadas</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Marca en Bendi solo las que dicen "✓ Usada"</p>
              </div>
              <div className="divide-y divide-border">
                {HERRAMIENTAS.map((h) => (
                  <div key={h.name} className="px-4 py-3 flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      h.used ? 'bg-mint-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {h.used ? '✓' : '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground">{h.name}</p>
                        <span className={`text-[10px] font-mono-editorial px-2 py-0.5 rounded-full ${
                          h.used ? 'bg-mint-50 text-mint-700' : 'bg-muted text-muted-foreground'
                        }`}>
                          {h.used ? 'USADA' : 'NO'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{h.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PITCH ═══ */}
        <section id="pitch" className="mb-20 scroll-mt-24">
          <SectionHeader
            eyebrow="03 · PITCH EN VIVO"
            title="7 de mayo 2026"
            description="Material de apoyo listo para subir. PitchDeck completo navegable y optimizado para ronda en vivo."
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Link to="/PitchDeck" className="bg-card border border-border rounded-2xl p-6 hover:border-mint-300 hover:shadow-soft transition-all group">
              <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mb-4">
                <Mic className="w-5 h-5 text-mint-700" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">PitchDeck navegable</h3>
              <p className="text-sm text-muted-foreground mt-2">
                12 slides editorial Apple-style. Listo para presentar en vivo o exportar a PDF.
              </p>
              <p className="mt-4 text-xs font-mono-editorial text-mint-700 group-hover:underline">
                /PitchDeck →
              </p>
            </Link>

            <Link to="/Demo" className="bg-card border border-border rounded-2xl p-6 hover:border-mint-300 hover:shadow-soft transition-all group">
              <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-mint-700" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">Workflow video demo</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Guion canónico 3 min, shot list, prompts y specs broadcast 4K/60fps.
              </p>
              <p className="mt-4 text-xs font-mono-editorial text-mint-700 group-hover:underline">
                /Demo →
              </p>
            </Link>

            <Link to="/Rubrica" className="bg-card border border-border rounded-2xl p-6 hover:border-mint-300 hover:shadow-soft transition-all group">
              <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5 text-mint-700" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">Rúbrica auto-validada</h3>
              <p className="text-sm text-muted-foreground mt-2">
                12 criterios oficiales validados en vivo contra el sistema. 95+/100 técnico.
              </p>
              <p className="mt-4 text-xs font-mono-editorial text-mint-700 group-hover:underline">
                /Rubrica →
              </p>
            </Link>

            <Link to="/Transparencia" className="bg-card border border-border rounded-2xl p-6 hover:border-mint-300 hover:shadow-soft transition-all group">
              <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mb-4">
                <Cpu className="w-5 h-5 text-mint-700" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground">AgentTrace público</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Cada respuesta de Lya con su pipeline IA auditable. Diferenciador único.
              </p>
              <p className="mt-4 text-xs font-mono-editorial text-mint-700 group-hover:underline">
                /Transparencia →
              </p>
            </Link>
          </div>
        </section>

        {/* Footer compacto */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-xs text-muted-foreground font-mono-editorial">
            FinLogic Solutions · Claude Impact Lab Chile 2026 · 6-7 mayo
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Gabriel S · Diego B2BYTES · Paula Garcés · Martín Campos
          </p>
        </div>
      </main>
    </div>
  );
}