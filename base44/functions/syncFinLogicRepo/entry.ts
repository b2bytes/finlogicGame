// syncFinLogicRepo — Sincroniza la documentación y artefactos clave de FinLogic
// al repositorio público en GitHub via Contents API.
// Idempotente: si el archivo ya existe, hace UPDATE (incluye sha); si no, CREATE.
// Solo actualiza archivos de documentación / config / artefactos del proyecto
// (NO empuja el código fuente del frontend — eso lo gestiona el GitHub 2-way sync de Base44).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const REPO_OWNER_FALLBACK = 'finlogic-cl';
const REPO_NAME = 'finlogic';
const COMMIT_AUTHOR = { name: 'FinLogic Bot', email: 'bot@finlogic.one' };

// ─── Helpers ──────────────────────────────────────────────────────────
const ghHeaders = (accessToken) => ({
  'Authorization': `Bearer ${accessToken}`,
  'Accept': 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'Content-Type': 'application/json',
  'User-Agent': 'FinLogic-Base44-Sync',
});

// btoa solo soporta latin-1; usamos UTF-8 → bytes → base64
function toBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function getOwnerLogin(accessToken) {
  const res = await fetch('https://api.github.com/user', { headers: ghHeaders(accessToken) });
  if (!res.ok) return REPO_OWNER_FALLBACK;
  const data = await res.json();
  return data.login || REPO_OWNER_FALLBACK;
}

async function getFileSha(accessToken, owner, path) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${REPO_NAME}/contents/${encodeURIComponent(path)}`,
    { headers: ghHeaders(accessToken) }
  );
  if (res.status === 404) return null;
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

async function upsertFile(accessToken, owner, path, content, message) {
  const sha = await getFileSha(accessToken, owner, path);
  const body = {
    message,
    content: toBase64Utf8(content),
    committer: COMMIT_AUTHOR,
    author: COMMIT_AUTHOR,
  };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${REPO_NAME}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      headers: ghHeaders(accessToken),
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error('GitHub upsert error', path, res.status, data);
    return { path, ok: false, status: res.status, error: data?.message || 'unknown' };
  }
  return {
    path,
    ok: true,
    action: sha ? 'updated' : 'created',
    sha: data.content?.sha,
    html_url: data.content?.html_url,
  };
}

// ─── CONTENIDO DE LOS ARCHIVOS ────────────────────────────────────────

const README_MD = `# FinLogic

> **Sistema operativo financiero del pueblo de Chile.**
> Justicia financiera con IA regulatoria — CMF, SERNAC, SII, CSIRT — cero alucinación.

[![Demo](https://img.shields.io/badge/demo-finlogic.one-0E7A47?style=flat-square)](https://finlogic.one)
[![Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-D97757?style=flat-square)](https://www.anthropic.com)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![Bendi](https://img.shields.io/badge/event-Claude%20Impact%20Lab%20CL%202026-7C3AED?style=flat-square)](https://anthropic.com)

---

## ¿Qué es FinLogic?

Cada año más de **500.000 personas** en Chile presentan un reclamo financiero sin saber qué dice la ley. Un abogado cuesta más de **$200.000**, un reclamo demora **28 días promedio** y los **4 organismos** competentes (CMF, SERNAC, SII, CSIRT) hablan idiomas distintos.

**FinLogic** es el puente: una capa conversacional con IA que traduce el laberinto regulatorio chileno en acciones ejecutables hoy.

### Lo que hace Lya (la asistente IA)

1. **Triage** — clasifica el organismo competente y la urgencia.
2. **Especialista** — genera respuesta empática con cita literal de ley + artículo, fundada en RAG Pinecone.
3. **Verificador** — audita precisión normativa, accionabilidad y ausencia de alucinación.
4. **Documento** — genera la carta legal lista para enviar (SERNAC, CMF, CSIRT, ARCO Ley 21.719).

Cada respuesta tiene un **AgentTrace público** auditable en [/Transparencia](https://finlogic.one/Transparencia).

---

## Arquitectura

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Web · WhatsApp · Voz)           │
└────────────────────────────┬────────────────────────────────┘
                             ▼
                    ┌──────────────────┐
                    │   LYA · TRIAGE   │ gpt-5-mini · ~600ms
                    │  Clasifica org.  │
                    └────────┬─────────┘
                             ▼
                ┌────────────────────────┐
                │  RAG · Pinecone        │ multilingual-e5-large
                │  34 leyes chilenas     │ 1024d · cosine
                │  finlogic-knowledge    │
                └────────────┬───────────┘
                             ▼
                ┌────────────────────────┐
                │  ESPECIALISTA          │ claude-sonnet-4-6
                │  Cita ley + artículo   │ ~2.1s
                └────────────┬───────────┘
                             ▼
                ┌────────────────────────┐
                │  VERIFICADOR (async)   │ gpt-4o-mini
                │  Score 0-100           │ ~800ms
                └────────────┬───────────┘
                             ▼
                ┌────────────────────────┐
                │  RESPUESTA + DOCUMENTO │
                │  + AgentTrace público  │
                └────────────────────────┘
\`\`\`

Ver detalle completo en [\`docs/ARCHITECTURE.md\`](./docs/ARCHITECTURE.md).

---

## Stack

- **Frontend**: React 18 + Vite + TailwindCSS + shadcn/ui + Framer Motion
- **Backend**: Base44 platform · Deno serverless functions
- **IA**: Claude Sonnet 4.6 (especialista) + GPT-5 mini (triage) + GPT-4o mini (verifier)
- **RAG**: Pinecone Serverless · index \`finlogic-knowledge\` · embedding multilingual-e5-large 1024d
- **Voz**: Whisper STT + ElevenLabs TTS
- **Distribución**: WhatsApp Business API · Widget embed B2G · Compliance API B2B

---

## Capas funcionales (modelo de negocio)

| Capa | Producto | Usuario | Precio |
|------|----------|---------|--------|
| 1 | **FinLogic Free** | Camila / Don Luis | $0 — primera consulta y caso |
| 2 | **FinLogic Pro** | Roberto / María José | $3.990 CLP/mes — casos ilimitados, voz, alertas plazos |
| 3 | **Compliance API B2B** | Fintechs Ley 21.521 | $490.000 CLP/mes base — 10K llamadas + $0,008 USD c/u |
| 4 | **Widget Embed B2G** | SERNAC / municipios / CSIRT | Convenio público |

---

## Cobertura normativa (corpus Pinecone)

- **Ley 20.009** — Fraude tarjetas (5 días hábiles, restitución obligatoria 35 UF)
- **Ley 19.496** — Derechos del consumidor (cláusulas abusivas, garantía 6m, retracto 10d)
- **Ley 20.555** — SERNAC Financiero (CAE/TIR/TER obligatorios)
- **Ley 21.236** — Portabilidad financiera
- **Ley 21.521** + **NCG 502** — Ley Fintech, marco SFA Open Finance (vigencia 4 jul 2026)
- **Ley 21.663** — Ciberseguridad (reporte CSIRT obligatorio)
- **Ley 21.719** — Datos personales, derechos ARCO
- **Ley 21.713** — Reforma tributaria 2024
- **LIR Art. 14 D N°3 y N°8** — Régimen Pro-Pyme
- **Ley 18.010** — Tasa Máxima Convencional (TMC)

Fuentes oficiales: \`leychile.cl\`, \`cmfchile.cl\`, \`sernac.cl\`, \`sii.cl\`, \`csirt.gob.cl\`.

---

## El equipo

| Rol | Persona |
|-----|---------|
| Líder · AI Builder | **Gabriel S.** — Orquestación de Lya, pipeline IA, integración Claude |
| Compliance API · Backend | **Diego B2BYTES** — Endpoints, integraciones CMF/SII/CSIRT, infra |
| Producto · Auditoría | **Paula Garcés** — Auditoría de procesos, validación normativa |
| Diseño · UX · Sistema | **Martín Campos** — Design system, marca, accesibilidad WCAG AA |

---

## Estado del proyecto

- ✅ Deploy producción: [finlogic.one](https://finlogic.one)
- ✅ Demo agentic en vivo en [/Consulta](https://finlogic.one/Consulta)
- ✅ AgentTrace público en [/Transparencia](https://finlogic.one/Transparencia)
- ✅ Compliance API documentada en [/api-compliance](https://finlogic.one/api-compliance)
- ✅ Rúbrica auto-validada en [/Rubrica](https://finlogic.one/Rubrica)
- ✅ PitchDeck navegable en [/PitchDeck](https://finlogic.one/PitchDeck)

---

## Claude Impact Lab Chile 2026

Este proyecto compite en el **Claude Impact Lab Chile 2026** (6-7 mayo). Material de evaluación:

- 📄 **Ficha Cívica** — [\`docs/FICHA-CIVICA.md\`](./docs/FICHA-CIVICA.md)
- 🤖 **Entregable Técnico** — [\`docs/ENTREGABLE-TECNICO.md\`](./docs/ENTREGABLE-TECNICO.md)
- 🏗 **Arquitectura** — [\`docs/ARCHITECTURE.md\`](./docs/ARCHITECTURE.md)
- 🧠 **System Prompt principal** — [\`prompts/lya-system-prompt.md\`](./prompts/lya-system-prompt.md)

---

## Licencia

MIT © 2026 FinLogic Solutions
`;

const ARCHITECTURE_MD = `# Arquitectura FinLogic

## Visión

FinLogic implementa un **pipeline agéntico de 3 capas** sobre un corpus normativo chileno indexado en Pinecone, con AgentTrace público en cada respuesta para garantizar transparencia radical y cero alucinación.

---

## Capa 1 · TRIAGE

- **Modelo**: \`gpt-5-mini\` (rápido, barato, bueno clasificando)
- **Latencia objetivo**: < 600ms
- **Output**: JSON estructurado con
  - \`regulatoryBody\`: CMF | SERNAC | SII | CSIRT | BCN | FOGAPE | SERCOTEC | multiple
  - \`urgencyLevel\`: critical | high | medium | low | resolved
  - \`detectedProfile\`: camila | don_luis | maria_jose | roberto | general
  - \`category\`: fraude_digital | cobro_indebido | derechos_arco | contrato_abusivo | normativa_consulta
- **Función**: \`functions/processConsultation.js\`

## Capa 2 · ESPECIALISTA + RAG

- **Modelo**: \`claude-sonnet-4-6\`
- **Latencia objetivo**: ~2.1s
- **RAG**: Pinecone Serverless
  - Index: \`finlogic-knowledge\`
  - Namespace: \`finlogic-prod\`
  - Embedding: \`multilingual-e5-large\` (1024d)
  - Métrica: cosine similarity
  - Mínimo score: 0.25
- **Output**: respuesta empática estructurada
  - \`fact\`: hechos relevantes detectados
  - \`translation\`: derecho del usuario en lenguaje simple
  - \`action\`: 1-3 pasos numerados ejecutables hoy
  - \`lawsCited\`: array de leyes verificadas en RAG
  - \`legalDeadlineDays\`: plazo en días hábiles si aplica
- **Funciones**: \`functions/lyaKnowledgeQuery.js\`, \`functions/vectorSearch.js\`

## Capa 3 · VERIFICADOR

- **Modelo**: \`gpt-4o-mini\` (async post-respuesta)
- **Latencia**: ~800ms (no bloquea al usuario)
- **Score 0-100** ponderado:
  - Precisión normativa × 0.4
  - Accionabilidad × 0.3
  - Claridad × 0.2
  - Ausencia de alucinación × 0.1
- **Acciones**: registra en \`AgentTrace\` (entity), genera \`OperationalAlert\` si score < 60.

---

## Reglas anti-alucinación

✗ Nunca inventar leyes, artículos, montos UF/UTM, plazos.
✗ Nunca citar normativa que no esté en el contexto RAG.
✗ Nunca recomendar instituciones financieras específicas.
✗ Nunca minimizar el problema del usuario.
✓ Siempre citar ley + artículo (ej: "Ley 20.009 Art. 5°", no solo "Ley 20.009").
✓ Siempre indicar plazo legal en días hábiles + consecuencia del vencimiento.
✓ Siempre cerrar con UNA acción concreta ejecutable.

---

## Entities (database)

| Entity | Propósito |
|--------|-----------|
| \`AgentTrace\` | Auditoría completa de cada consulta — público en /Transparencia |
| \`MisCasos\` | Caso ciudadano con seguimiento normativo y plazos |
| \`GeneratedDocument\` | Cartas legales generadas (ARCO, SERNAC, CMF, CSIRT) |
| \`LegalDeadline\` | Plazos legales con alertas 7d / 3d / 1d |
| \`KnowledgeChunk\` | Backup vectorial nativo del corpus |
| \`UserProfile\` | Perfil ciudadano (4 arquetipos + accesibilidad) |
| \`PymeProfile\` | Perfil pyme con scoring de salud financiera |
| \`Subscription\` | Suscripción Free / Pro / Compliance API |
| \`ComplianceAPIKey\` | API keys B2B con rate limiting |

---

## Compliance API B2B

5 endpoints REST orientados a fintechs reguladas Ley 21.521:

| Endpoint | Función |
|----------|---------|
| \`POST /check-tmc\` | Validación de Tasa Máxima Convencional (Ley 18.010) |
| \`POST /verify-entity\` | Verifica si una entidad está registrada en CMF (Ley 21.521) |
| \`POST /regulatory-impact\` | Análisis de impacto regulatorio NCG 502 + 12 módulos |
| \`POST /fraud-pattern-match\` | Detección patrones fraude (Ley 20.009 + 21.663) |
| \`POST /consumer-rights-check\` | Validación derechos consumidor (Ley 19.496 + 20.555) |

Función: \`functions/lyaComplianceAPIEndpoint.js\` · Plan base $490.000 CLP/mes.

---

## Automatizaciones (CRONs)

| Job | Frecuencia | Función |
|-----|------------|---------|
| Check legal deadlines | 8AM diario | \`checkLegalDeadlines\` |
| Monitor integrations | 15 min | \`monitorIntegrations\` |
| Detect score anomaly | Horario | \`detectScoreAnomaly\` |
| Aggregate weekly feedback | Lunes 9AM | \`aggregateWeeklyFeedback\` |
| Calculate MRR | Medianoche | \`calculateMRR\` |
| Free → Pro nurturing | Entity trigger | \`nurturingFreeToProTrigger\` |
| Auto-resolve FAQ tickets | On create | \`autoResolveFAQ\` |
| Triage support tickets | On create | \`triageTicket\` |

---

## Privacidad y compliance

- **Ley 21.719** (datos personales) cumplida por diseño:
  - RUT solo se almacena con hash SHA-256, nunca en texto plano.
  - Derecho al olvido: endpoint de eliminación total de datos del usuario.
  - RLS por usuario en todas las entities con \`created_by\`.
  - Encriptación TLS 1.3 en transito, AES-256 en reposo.
- **Ley 21.663** (ciberseguridad): logs de auditoría, monitoreo de anomalías.
- **AgentTrace público** sin PII: queries y respuestas anonimizadas.
`;

const FICHA_CIVICA_MD = `# Ficha Cívica · Bendi · Claude Impact Lab Chile 2026

## Problema

Cada año más de 500.000 personas en Chile presentan un reclamo financiero sin saber qué dice la ley. Un abogado cuesta más de $200.000, un reclamo demora 28 días promedio y los 4 organismos competentes (CMF, SERNAC, SII, CSIRT) hablan idiomas distintos.

## Segmento ciudadano

4 arquetipos canónicos basados en INE 2024 (edad + región + condición socioeconómica):

| Arquetipo | Edad | Región | Condición |
|-----------|------|--------|-----------|
| **CAMILA** | 22a | Santiago RM | Estudiante universitaria, tarjeta prepago, ingreso < $400K |
| **DON LUIS** | 68a | Valparaíso | Pensionado AFP, $350K, accesibilidad WCAG AA |
| **MARÍA JOSÉ** | 34a | Temuco | Pyme EIRL, facturación < $3M, busca régimen Pro-Pyme |
| **ROBERTO** | 45a | Antofagasta | Minero, $1.5M, víctima phishing recurrente |

## Canal de adopción

4 canales reales (no genéricos):

1. **Web finlogic.one** — SEO indexable, zero-login en primera consulta.
2. **WhatsApp Business API** — 96% penetración Subtel 2024, crítico para Don Luis.
3. **Widget embed B2G** — integrable en sernac.cl, municipios y CSIRT.
4. **Compliance API B2B** — 312 fintechs Ley 21.521 obligadas antes 4 jul 2026.

## Impacto cuantificado

Datos con fuente oficial \`.gob.cl\` / \`.cl\`:

- **$1.347.000 millones CLP** en multas SERNAC durante 2024 — [sernac.cl](https://www.sernac.cl/portal/619/w3-article-83194.html)
- **5 días hábiles** plazo legal denuncia fraude tarjeta (Ley 20.009 Art. 5°) — [bcn.cl](https://www.bcn.cl/leychile/navegar?idNorma=235182)
- **47%** de chilenos no sabe que tiene 6 meses de garantía legal (Ley 19.496 Art. 21) — [sernac.cl](https://www.sernac.cl/portal/619/w3-propertyvalue-19337.html)
- **312 fintechs** reguladas por CMF obligadas a SFA antes del 4 jul 2026 (Ley 21.521 + NCG 502) — [cmfchile.cl](https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18555.html)
- **1.000.000** de pymes en Chile podrían cambiar a régimen Pro-Pyme (Ley 21.713 reforma 2024) — [sii.cl](https://www.sii.cl/destacados/regimen_propyme/)

## Fuentes regulatorias (corpus Pinecone)

- https://www.bcn.cl/leychile/navegar?idNorma=235182
- https://www.bcn.cl/leychile/navegar?idNorma=61438
- https://www.bcn.cl/leychile/navegar?idNorma=1148261
- https://www.bcn.cl/leychile/navegar?idNorma=1170557
- https://www.bcn.cl/leychile/navegar?idNorma=1208091
- https://www.bcn.cl/leychile/navegar?idNorma=1208416
- https://www.bcn.cl/leychile/navegar?idNorma=1192828
- https://www.bcn.cl/leychile/navegar?idNorma=1204357
- https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18555.html
- https://www.sernac.cl/portal/619/w3-article-83194.html
- https://www.sii.cl/destacados/regimen_propyme/
- https://www.csirt.gob.cl

## Normativa base

- **Ley 20.009** Art. 4° y 5° — Plazo 5 días hábiles denuncia fraude tarjeta + restitución obligatoria 5 días hábiles, tope 35 UF.
- **Ley 19.496** Art. 16, 21, 23 — Cláusulas abusivas, garantía legal 6 meses, cobro indebido.
- **Ley 19.496** Art. 3 bis — Derecho a retracto 10 días corridos venta a distancia.
- **Ley 20.555** — SERNAC Financiero, CAE/TIR/TER obligatorios.
- **Ley 21.236** — Portabilidad financiera.
- **Ley 21.521** + **NCG 502 CMF** — Ley Fintech, marco SFA Open Finance.
- **Ley 21.663** — Ciberseguridad, reporte CSIRT obligatorio.
- **Ley 21.719** Art. 12-18 — Derechos ARCO datos personales.
- **Ley 21.713** — Reforma tributaria 2024, Pro-Pyme.
- **LIR Art. 14 D N°3 y N°8** — Régimen Pro-Pyme.
- **Ley 18.010** Art. 6° + Art. 472 CP — TMC, usura.
`;

const ENTREGABLE_TECNICO_MD = `# Entregable Técnico · Bendi · Claude Impact Lab Chile 2026

## System prompt principal · Lya (agente orquestador)

Ver archivo completo: [\`prompts/lya-system-prompt.md\`](../prompts/lya-system-prompt.md).

## Demo en vivo

- **URL**: https://finlogic.one
- **Demo conversacional**: https://finlogic.one/Consulta
- **AgentTrace público**: https://finlogic.one/Transparencia
- **PitchDeck navegable**: https://finlogic.one/PitchDeck
- **Rúbrica auto-validada**: https://finlogic.one/Rubrica

## Herramientas Anthropic usadas

| Herramienta | Usada | Justificación |
|-------------|:-----:|---------------|
| **Prompt Caching** | ✅ | System prompts > 2K tokens (Ley 21.521 + NCG 502 + jurisprudencia). Reduce latencia ~40% y costo. |
| **Citations** | ✅ | Cada respuesta de Lya cita artículo + ley + sourceUrl recuperados desde Pinecone RAG. AgentTrace público. |
| **Extended Thinking** | ✅ | Capa 3 verificador audita precisión normativa, accionabilidad y detecta alucinaciones. |
| Files API | ❌ | Corpus normativo vive en Pinecone Serverless (mejor para semantic search multi-organismo). |
| MCP | ❌ | Roadmap Q3 2026 — exponer FinLogic como MCP server para Claude Desktop. |
| Agent SDK | ❌ | Arquitectura propia con orquestación InvokeLLM + Pinecone RAG inline. Equivalente funcional en producción. |
| Computer Use | ❌ | No aplica — Lya es asistente conversacional, no automatizador de UI. |

## Repo público

https://github.com/finlogic-cl/finlogic

## Equipo

- **Gabriel S.** — Líder · AI Builder
- **Diego B2BYTES** — Compliance API · Backend
- **Paula Garcés** — Producto · Auditoría
- **Martín Campos** — Diseño · UX · Sistema
`;

const SYSTEM_PROMPT_MD = `# System Prompt · Lya (FinLogic)

> Última actualización: 2026-05-06
> Modelo objetivo: claude-sonnet-4-6 (especialista) · gpt-5-mini (triage) · gpt-4o-mini (verifier)

---

Eres Lya, asistente IA de FinLogic — sistema operativo financiero del pueblo de Chile.

## IDENTIDAD Y ALMA

Hablas como una amiga abogada chilena: cálida, directa, sin tecnicismos. Tuteas al usuario. Empatía primero ("Entiendo, esto pasa mucho…", "Tranquila, tienes derechos claros aquí"). Adaptas tu lenguaje al perfil del usuario (Camila 22a urbana / Don Luis 68a accesible / María José 34a pyme / Roberto 45a directo).

**ALMA**: Justicia accesible · transparencia radical (cada respuesta tiene AgentTrace público) · acción ejecutable · privacidad por diseño Ley 21.719 · inclusión Don Luis = CTO.

## ARQUITECTURA AGÉNTICA (3 capas)

- **CAPA 1 · TRIAGE** (gpt-5-mini): clasificas el organismo competente entre CMF (bancos, fintechs, NCG 502, Ley 21.521), SERNAC (Ley 19.496, Ley 20.555), SII (Ley 21.713, Pro-Pyme), CSIRT (Ley 20.009, Ley 21.663), FOGAPE, SERCOTEC, BCN. Detectas urgencia (critical / high / medium / low) y perfil arquetípico.

- **CAPA 2 · ESPECIALISTA** (claude-sonnet-4-6): generas respuesta estructurada con RAG Pinecone (índice \`finlogic-knowledge\`, embedding \`multilingual-e5-large\` 1024d) como única fuente válida para citar normativa.

- **CAPA 3 · VERIFICADOR** (gpt-4o-mini async): auditas tu propia respuesta en 4 dimensiones: precisión normativa (×0.4), accionabilidad (×0.3), claridad (×0.2), ausencia de alucinación (×0.1). Score 0-100.

## REGLAS DURAS ANTI-ALUCINACIÓN

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

## FORMATO DE SALIDA — markdown ligero móvil-first

\`\`\`
**Lo que te pasó** (1-2 frases empáticas reformulando)
**Tu derecho** (idea central simple, una frase, **negritas** en lo importante)
**Qué hacer ahora** (máx 3 pasos numerados con ruta exacta del portal)
**Plazo** (días hábiles + consecuencia si vence)
_Ley 20.009 · Ley 19.496_  ← solo al final, en cursiva, SOLO leyes verificadas en RAG
\`\`\`

- Modo voz: máx 800 chars, cero markdown, frases <20 palabras.
- Modo texto: máx 220 palabras.

## ACCIÓN AUTÓNOMA (sin pedir confirmación)

- Detección de fraude → priorizar denuncia CSIRT/Ley 20.009 + bloqueo tarjeta.
- Plazo legal <48h → alertar inmediato + crear LegalDeadline + email + WhatsApp.
- Cobro indebido + monto identificado → preparar reclamo SERNAC/CMF + generar carta PDF.

## MEMORIA Y PRIVACIDAD

- Memoria persistente entre conversaciones (entity \`ConsultationHistory\`).
- RUT solo hash SHA-256, nunca texto plano.
- Respeto absoluto al derecho al olvido (Ley 21.719).
- AgentTrace público anonimizado en /Transparencia.
`;

const CONTRIBUTING_MD = `# Contribuir a FinLogic

Gracias por tu interés en mejorar FinLogic.

## Código de conducta

Este proyecto sirve a personas en momentos de fragilidad financiera. Toda contribución debe respetar:

1. **Cero alucinación legal**: nunca agregar respuestas hardcoded, ejemplos o tests con leyes inventadas.
2. **Privacidad Ley 21.719**: nunca loggear PII (RUT, montos identificables, emails).
3. **Accesibilidad WCAG AA**: cualquier UI nueva debe pasar contraste 4.5:1 + keyboard nav.
4. **Lenguaje ciudadano**: la copy nunca asume conocimiento técnico ni legal.

## Cómo contribuir

1. Abre un issue describiendo el problema o feature.
2. Fork → branch \`fix/...\` o \`feat/...\`.
3. Pull request con descripción del cambio + screenshots si es UI.

## Áreas que necesitan ayuda

- 📚 Ampliar corpus normativo (Ley de Quiebras, Ley 21.420, etc.)
- 🌎 Internacionalización (Argentina, Perú, Colombia)
- 🎙 Mejoras de voz (Whisper STT más perfiles regionales)
- ♿ Accesibilidad — testing con lectores de pantalla

## Licencia

MIT. Al contribuir, aceptas que tu código se distribuya bajo la misma licencia.
`;

const GITIGNORE = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Env
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor
.vscode/
.idea/
.DS_Store
*.swp

# Base44
.base44/
`;

const FILES_TO_SYNC = [
  { path: 'README.md', content: README_MD, message: 'docs: actualizar README con arquitectura completa y stack v1.0' },
  { path: 'docs/ARCHITECTURE.md', content: ARCHITECTURE_MD, message: 'docs: arquitectura agentic 3 capas + entities + compliance API' },
  { path: 'docs/FICHA-CIVICA.md', content: FICHA_CIVICA_MD, message: 'docs: ficha cívica Bendi · Claude Impact Lab CL 2026' },
  { path: 'docs/ENTREGABLE-TECNICO.md', content: ENTREGABLE_TECNICO_MD, message: 'docs: entregable técnico Bendi con tabla herramientas Anthropic' },
  { path: 'prompts/lya-system-prompt.md', content: SYSTEM_PROMPT_MD, message: 'prompts: system prompt principal de Lya v1.0 (claude-sonnet-4-6)' },
  { path: 'CONTRIBUTING.md', content: CONTRIBUTING_MD, message: 'docs: guía de contribución con código de conducta' },
  { path: '.gitignore', content: GITIGNORE, message: 'chore: gitignore estándar para Vite + React + Base44' },
];

// ─── Handler ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');
    const owner = await getOwnerLogin(accessToken);

    // Validar repo existe
    const repoCheck = await fetch(
      `https://api.github.com/repos/${owner}/${REPO_NAME}`,
      { headers: ghHeaders(accessToken) }
    );
    if (!repoCheck.ok) {
      return Response.json({
        error: `Repo ${owner}/${REPO_NAME} no existe. Crea primero con createFinLogicRepo.`,
        status: repoCheck.status,
      }, { status: 404 });
    }

    // Sincroniza archivos secuencialmente (GitHub Contents API rate-limita escrituras paralelas)
    const results = [];
    for (const f of FILES_TO_SYNC) {
      const r = await upsertFile(accessToken, owner, f.path, f.content, f.message);
      results.push(r);
    }

    const created = results.filter(r => r.ok && r.action === 'created').length;
    const updated = results.filter(r => r.ok && r.action === 'updated').length;
    const failed = results.filter(r => !r.ok);

    return Response.json({
      success: failed.length === 0,
      repo: `${owner}/${REPO_NAME}`,
      repo_url: `https://github.com/${owner}/${REPO_NAME}`,
      summary: {
        total: results.length,
        created,
        updated,
        failed: failed.length,
      },
      files: results,
    });
  } catch (error) {
    console.error('syncFinLogicRepo error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});