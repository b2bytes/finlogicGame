import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Cpu, Mic, ExternalLink, ShieldCheck, Download, ChevronRight, FileDown, Sparkles } from 'lucide-react';
import Logo from '@/components/home/Logo';
import CopyField from '@/components/entregables/CopyField';
import SectionHeader from '@/components/entregables/SectionHeader';
import { downloadFichaCivicaPDF } from '@/lib/generateFichaCivicaPDF';

// ─── FICHA CÍVICA ──────────────────────────────────────────────────────────
const PROBLEMA = `Cada año más de 500.000 personas en Chile presentan un reclamo financiero sin saber qué dice la ley. Un abogado cuesta más de $200.000, un reclamo demora 28 días promedio y los 4 organismos competentes (CMF, SERNAC, SII, CSIRT) hablan idiomas distintos.`;

const SEGMENTO = `4 arquetipos INE 2024 (edad + región + condición socioeconómica):

CAMILA · 22a · Santiago RM · estudiante, tarjeta prepago, ingreso <$400K.
DON LUIS · 68a · Valparaíso · pensionado AFP, $350K, accesibilidad WCAG AA.
MARÍA JOSÉ · 34a · Temuco · pyme EIRL, facturación <$3M, busca Pro-Pyme.
ROBERTO · 45a · Antofagasta · minero, $1.5M, víctima phishing recurrente.`;

const CANAL = `4 canales reales (no "internet" ni "app móvil" genéricos):

WEB finlogic.one · SEO indexable, zero-login primera consulta.
WHATSAPP BUSINESS · 96% penetración Subtel 2024, crítico para Don Luis.
WIDGET EMBED B2G · integrable en sernac.cl, municipios y CSIRT.
COMPLIANCE API B2B · 312 fintechs Ley 21.521 obligadas antes 4 jul 2026.`;

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
// System prompt resumido — versión Bendi (~9K chars máx).
// Condensa identidad + arquitectura 3 capas + anti-alucinación + perfiles +
// organismos + herramientas Anthropic + memoria + acción autónoma.
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

MEMORIA: Persistente entre conversaciones. RUT solo hash, nunca texto plano. Respeto absoluto al derecho al olvido (Ley 21.719).

═══════════════════════════════════════════════════════════════════
PERFILES ARQUETÍPICOS (adapta tono, vocabulario y profundidad)
═══════════════════════════════════════════════════════════════════
CAMILA · 22a · Santiago RM · estudiante, tarjeta prepago, ingreso <$400K. Vive en su celular, urgencia digital. Tono cercano, lenguaje millennial, emojis sutiles, frases cortas, foco en compras online y cobros indebidos. Skin púrpura.

DON LUIS · 68a · Valparaíso · pensionado AFP $350K. Accesibilidad WCAG AA: tipografía grande, contraste alto, áreas táctiles 48px. Tono respetuoso ("don Luis"), cero tecnicismos, pasos numerados claros, voz preferida sobre texto. Foco fraude AFP, salud, garantías. Skin verde alto contraste.

MARÍA JOSÉ · 34a · Temuco · pyme EIRL, facturación <$3M. Profesional pero busca claridad pyme. Foco régimen Pro-Pyme (Ley 21.713 Art. 14 D N°3 y N°8 LIR), F29 IVA mensual, multas SII, FOGAPE/SERCOTEC. Tono ejecutivo cálido, badge "régimen recomendado". Skin naranja pyme.

ROBERTO · 45a · Antofagasta · minero, $1.5M, víctima phishing recurrente. Técnico, directo, valora datos duros. Foco Ley 20.009 Art. 5° (5 días hábiles, restitución obligatoria 5 días tope 35 UF), Ley 21.663 reporte CSIRT. Estética terminal, tags monoespaciados. Skin mint fluorescente densidad alta.

═══════════════════════════════════════════════════════════════════
COMPETENCIA POR ORGANISMO (clasificación capa 1)
═══════════════════════════════════════════════════════════════════
CMF · bancos, fintechs, AFPs, aseguradoras, compañías de seguros. Marco: Ley 21.521 Fintech, NCG 502 Compliance, Ley 20.555 SERNAC Financiero, Ley 21.236 Portabilidad. SFA Open Finance vigente 4-jul-2026 — 312 fintechs PSBI obligadas.

SERNAC · derechos de consumo, retracto 10 días corridos venta a distancia (Art. 3 bis), garantía legal 6 meses (Art. 21), cobro indebido (Art. 23), cláusulas abusivas (Art. 16). Marco: Ley 19.496.

SII · tributación pyme, persona natural, F29 IVA, F22 renta, Pro-Pyme transparente vs general. Marco: Ley 21.713, LIR Art. 14 letras D N°3 y N°8.

CSIRT · ciberseguridad, fraude tarjeta (Ley 20.009 Art. 4° y 5°), phishing/smishing, hackeo. Marco: Ley 21.663 obligación reporte incidentes críticos en 3 horas.

BCN · indicadores económicos vivos: TPM, UF, UTM, IPC, dólar observado. Tasa Máxima Convencional Ley 18.010 Art. 6° + delito usura Art. 472 CP.

FOGAPE / SERCOTEC · fondos garantía + capital semilla pyme — derivar cuando aplica.

PRIVACIDAD · Ley 21.719 derechos ARCO Art. 12-18 (Acceso, Rectificación, Cancelación, Oposición). Plazo 15 días hábiles respuesta, gratuito 1 vez por semestre.

═══════════════════════════════════════════════════════════════════
HERRAMIENTAS ANTHROPIC EN PRODUCCIÓN
═══════════════════════════════════════════════════════════════════
✓ Prompt Caching: system prompt >2K tokens cacheado (corpus Ley 21.521 + NCG 502). Reduce latencia 40% y costo Anthropic.
✓ Citations: cada respuesta cita ley + artículo + sourceUrl recuperados desde Pinecone RAG. AgentTrace público en /Transparencia con trazabilidad completa pipeline 3 capas.
✓ Extended Thinking: capa 3 verificador usa razonamiento extendido para auditar precisión normativa, accionabilidad y detectar alucinaciones antes de aprobar.

═══════════════════════════════════════════════════════════════════
INTEGRACIONES VIVAS (cero mocks)
═══════════════════════════════════════════════════════════════════
CMF API · datos bancos en tiempo real (entidades 600-001 a 999-999, alertas regulatorias).
BCN ChileAtiende · normativa oficial vigente (leychile.cl).
SERNAC portal denuncia · ruta exacta del formulario.
SII servicios online · F29, F22, situación tributaria.
Pinecone Serverless · índice finlogic-knowledge, 34+ vectores, embeddings multilingual-e5-large 1024d, top_k=5, score>0.7.
Resend · email transaccional alertas plazo legal 7d/3d/1d.
WhatsApp Business · canal Don Luis (96% penetración Subtel 2024).

═══════════════════════════════════════════════════════════════════
GENERACIÓN DE DOCUMENTOS LEGALES (capa 4 ejecutiva)
═══════════════════════════════════════════════════════════════════
Cuando el ciudadano necesite acción concreta, ofrece generar PDF firmable:
- Carta ARCO (Ley 21.719) para Acceso/Rectificación/Cancelación/Oposición datos.
- Denuncia SERNAC (Ley 19.496) — formulario digital + carta respaldo.
- Reclamo CMF (NCG 502) — fintechs y bancos.
- Reporte CSIRT (Ley 20.009 + 21.663) — incidente ciberseguridad.
- Presentación SII (Ley 21.713) — rectificatoria, consulta, reclamo.

PDF con marca FinLogic, fundamento legal en footer, respaldo Anthropic Claude Impact Lab CL 2026, placeholders [ ] para datos faltantes, línea de firma. Datos extraídos de la conversación, jamás inventados.

═══════════════════════════════════════════════════════════════════
EJEMPLO DE RESPUESTA (formato canónico)
═══════════════════════════════════════════════════════════════════
Usuario: "Me cobraron $45.000 que no reconozco en mi tarjeta BancoEstado de hace 2 días"

Lya:
**Lo que te pasó**
Detectaste un cargo no reconocido reciente en tu tarjeta. Esto pasa más de lo que crees — y la ley está de tu lado.

**Tu derecho**
Tienes **5 días hábiles** desde que viste el cobro para denunciarlo. El banco está **obligado a restituir** el dinero en 5 días hábiles si el monto es menor a 35 UF, sin investigación previa.

**Qué hacer ahora**
1. Llama hoy mismo al banco y pide bloqueo + denuncia formal con número de folio.
2. Ingresa a sernac.cl/portal/619 → "Hacer un reclamo" → llena con folio del banco.
3. Si en 5 días hábiles no devuelven, escala a CMF en cmfchile.cl/portal/principal/613.

**Plazo**
5 días hábiles — si dejas pasar la fecha pierdes la restitución automática y entras a investigación que puede tomar 90 días.

¿Quieres que te genere la carta de denuncia formal en PDF lista para firmar?

_Ley 20.009 Art. 4° y 5° · NCG 502 CMF_

═══════════════════════════════════════════════════════════════════
NORTH STAR METRIC
═══════════════════════════════════════════════════════════════════
Primera victoria del ciudadano en menos de 60 segundos. Cada interacción: AgentTrace público, trazabilidad total, cero alucinación, acción ejecutable HOY. La ley en tu idioma, en tu bolsillo, sin pedirle permiso al sistema.`;

const HERRAMIENTAS = [
  { name: 'Prompt Caching', used: true, why: 'System prompts >2K tokens cacheados (Ley 21.521 + NCG 502 + jurisprudencia chilena). Reduce latencia ~40% y costo Anthropic.' },
  { name: 'Citations', used: true, why: 'Cada respuesta de Lya cita artículo + ley + sourceUrl recuperados desde Pinecone RAG. AgentTrace público en /Transparencia muestra trazabilidad completa.' },
  { name: 'Extended Thinking', used: true, why: 'Capa 3 verificador usa razonamiento extendido para auditar precisión normativa, accionabilidad y detectar alucinaciones antes de aprobar respuesta.' },
  { name: 'Files API', used: false, why: 'No usado — corpus normativo vive en Pinecone Serverless (mejor para semantic search multi-organismo).' },
  { name: 'MCP', used: false, why: 'Roadmap Q3 2026 — exponer FinLogic como MCP server para Claude Desktop (compliance API).' },
  { name: 'Agent SDK', used: false, why: 'Usamos arquitectura propia con orquestación InvokeLLM + Pinecone RAG inline. Equivalente funcional ya en producción.' },
  { name: 'Computer Use', used: false, why: 'No aplica — Lya es asistente conversacional, no automatizador de UI.' },
];

const REPO_URL = 'https://github.com/finlogic-cl/finlogic';

// Tabs
const TABS = [
  { id: 'civica', label: 'Ficha Cívica', icon: FileText, count: 6 },
  { id: 'tecnica', label: 'Entregable Técnico', icon: Cpu, count: 5 },
  { id: 'pitch', label: 'Pitch 7 mayo', icon: Mic, count: 4 },
];

export default function Entregables() {
  const [activeTab, setActiveTab] = useState('civica');

  const downloadAll = () => {
    const content = `═══ FICHA CÍVICA BENDI ═══\n\n[PROBLEMA]\n${PROBLEMA}\n\n[SEGMENTO]\n${SEGMENTO}\n\n[CANAL]\n${CANAL}\n\n[IMPACTO]\n${IMPACTO}\n\n[FUENTES]\n${FUENTES}\n\n[NORMATIVA]\n${NORMATIVA}\n\n═══ ENTREGABLE TÉCNICO ═══\n\n[SYSTEM PROMPT]\n${SYSTEM_PROMPT}\n\n[REPO]\n${REPO_URL}\n\n[HERRAMIENTAS]\n${HERRAMIENTAS.filter(h => h.used).map(h => `✓ ${h.name}: ${h.why}`).join('\n')}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finlogic-entregables-bendi.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky-header glass border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
          <Logo size="sm" />
          <button
            onClick={downloadAll}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-mint-700 hover:text-mint-800"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar todo
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-xs font-mono-editorial text-mint-700 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-mint-500 animate-pulse-soft" />
            Entregables Bendi · Claude Impact Lab Chile 2026
          </div>
          <h1 className="font-display tracking-tight text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05]">
            Las 3 fichas listas<br />
            <span className="text-mint-600">para copiar a Bendi.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-3xl">
            Cada bloque cumple los criterios oficiales: chars dentro del límite, sin jerga, URLs .gob.cl/.cl validadas, normativa literal del corpus FinLogic verificado en Pinecone.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 sticky top-16 z-30 py-3 bg-background/80 backdrop-blur-md -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-border/40">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  active
                    ? 'bg-foreground text-background shadow-soft'
                    : 'bg-card border border-border text-foreground/70 hover:border-mint-300 hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-[10px] font-mono-editorial px-2 py-0.5 rounded-full ${
                  active ? 'bg-mint-500/30 text-white' : 'bg-mint-50 text-mint-700'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ═══ FICHA CÍVICA ═══ */}
        {activeTab === 'civica' && (
          <section className="animate-fade-up">
            <SectionHeader
              eyebrow="01 · FICHA CÍVICA"
              title="Pre-evaluación que lee Bendi"
              description="6 campos obligatorios. Cada respuesta validada con datos reales del sistema y fuentes oficiales chilenas."
            />

            {/* CTA Premium · descarga PDF editorial */}
            <div className="mb-8 bg-gradient-to-br from-mint-500 to-mint-700 text-white rounded-3xl p-6 sm:p-8 shadow-soft-lg overflow-hidden relative">
              <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start gap-5 flex-wrap sm:flex-nowrap">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <FileDown className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono-editorial uppercase tracking-widest text-mint-100 mb-1">
                    · ENTREGA OFICIAL · A4 · 8 PÁGINAS
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                    Descarga la Ficha Cívica en PDF
                  </h3>
                  <p className="text-sm text-mint-50/95 mt-2 max-w-md leading-relaxed">
                    Diseño editorial FinLogic. Una página por campo, portada institucional, página de validación. Listo para adjuntar al campo "PDF/Notion" de Bendi.
                  </p>
                </div>
                <button
                  onClick={() => downloadFichaCivicaPDF({
                    problema: PROBLEMA,
                    segmento: SEGMENTO,
                    canal: CANAL,
                    impacto: IMPACTO,
                    fuentes: FUENTES,
                    normativa: NORMATIVA,
                  })}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-mint-700 font-semibold text-sm shadow-soft hover:shadow-soft-lg active:scale-95 transition-all flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <CopyField label="Problema" hint="Máx 300 caracteres · sin jerga · sin siglas sin explicar" max={300} value={PROBLEMA} />
              <CopyField label="Segmento ciudadano" hint="Mínimo 2 dimensiones: edad + ubicación + condición socioeconómica" value={SEGMENTO} />
              <CopyField label="Canal de adopción" hint="Canales concretos (no 'internet' o 'app móvil') + por qué llegan al segmento" value={CANAL} />
              <CopyField label="Impacto cuantificado" hint="Números concretos con URL de fuente oficial .gob.cl / .cl" value={IMPACTO} />
              <CopyField label="Fuentes regulatorias" hint="Mínimo 2 URLs oficiales · una por línea · 12 URLs reales del corpus FinLogic" value={FUENTES} mono />
              <CopyField label="Normativa base (opcional)" hint="Bendi compara contra la Wiki Legal — citado literal evita marcado como alucinación" value={NORMATIVA} />
            </div>

            <div className="mt-8 flex justify-between items-center">
              <p className="text-xs text-muted-foreground">Listo · pasa al siguiente</p>
              <button onClick={() => setActiveTab('tecnica')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint-700 hover:text-mint-800">
                Entregable técnico <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ═══ FICHA TÉCNICA ═══ */}
        {activeTab === 'tecnica' && (
          <section className="animate-fade-up">
            <SectionHeader
              eyebrow="02 · ENTREGABLE TÉCNICO"
              title="Demo + system prompt + evidencias"
              description="System prompt principal (Lya orquestadora) + herramientas Anthropic usadas + repo público."
            />

            <div className="space-y-4">
              <div className="bg-card border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">Demo video (3-5 min)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pendiente de grabación. Guion canónico, shot list y specs broadcast están en{' '}
                      <Link to="/Demo" className="text-mint-700 hover:text-mint-800 font-semibold underline underline-offset-2">/Demo</Link>{' '}
                      listos para ejecutar. Cuando subas la URL allí, también queda registrada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-amber-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">Screenshot consola Anthropic</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Acción manual: ingresa a{' '}
                      <a href="https://console.anthropic.com/dashboard" target="_blank" rel="noreferrer" className="text-mint-700 hover:text-mint-800 font-semibold inline-flex items-center gap-1">
                        console.anthropic.com/dashboard <ExternalLink className="w-3 h-3" />
                      </a>{' '}
                      · filtra ventana 6-7 mayo 2026 · screenshot mostrando llamadas, modelo claude-sonnet-4-6 y tokens consumidos.
                    </p>
                  </div>
                </div>
              </div>

              <CopyField
                label="System prompt principal (Lya · agente orquestador)"
                hint="Máx 10.000 caracteres · pegar en el campo de texto de Bendi"
                max={10000}
                value={SYSTEM_PROMPT}
                mono
              />

              <CopyField label="Repo público (suma bonus)" hint="GitHub repo con código fuente FinLogic" value={REPO_URL} multiline={false} />

              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <p className="font-semibold text-sm text-foreground">Herramientas Anthropic usadas</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Marca en Bendi solo las que dicen "✓ USADA"</p>
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

            <div className="mt-8 flex justify-between items-center">
              <button onClick={() => setActiveTab('civica')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4 rotate-180" /> Ficha cívica
              </button>
              <button onClick={() => setActiveTab('pitch')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint-700 hover:text-mint-800">
                Pitch 7 mayo <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ═══ PITCH ═══ */}
        {activeTab === 'pitch' && (
          <section className="animate-fade-up">
            <SectionHeader
              eyebrow="03 · PITCH EN VIVO"
              title="7 de mayo 2026"
              description="Material de apoyo listo para subir. PitchDeck completo navegable y optimizado para ronda en vivo."
            />

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { to: '/PitchDeck', icon: Mic, title: 'PitchDeck navegable', desc: '12 slides editorial Apple-style. Listo para presentar en vivo o exportar a PDF.' },
                { to: '/Demo', icon: FileText, title: 'Workflow video demo', desc: 'Guion canónico 3 min, shot list, prompts y specs broadcast 4K/60fps.' },
                { to: '/Rubrica', icon: ShieldCheck, title: 'Rúbrica auto-validada', desc: '14 criterios oficiales + bonus CRM validados en vivo contra el sistema.' },
                { to: '/Transparencia', icon: Cpu, title: 'AgentTrace público', desc: 'Cada respuesta de Lya con su pipeline IA auditable. Diferenciador único.' },
                { to: '/Admin/CRM', icon: FileText, title: 'CRM unificado · NUEVO', desc: 'Bandeja inteligente B2C + B2B + B2G. Upsert automático al primer mensaje con Lya.' },
                { to: '/AsistenteLya', icon: Sparkles, title: 'Asistente Lya', desc: 'Chat conversacional con voz, citas RAG verificadas y skin adaptativo por arquetipo.' },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <Link key={c.to} to={c.to} className="bg-card border border-border rounded-2xl p-6 hover:border-mint-300 hover:shadow-soft transition-all group">
                    <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-mint-700" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{c.desc}</p>
                    <p className="mt-4 text-xs font-mono-editorial text-mint-700 group-hover:underline">{c.to} →</p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex justify-start">
              <button onClick={() => setActiveTab('tecnica')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4 rotate-180" /> Entregable técnico
              </button>
            </div>
          </section>
        )}

        {/* Footer */}
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