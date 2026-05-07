// seedPageKnowledge — Indexa el catálogo estructurado de páginas FinLogic
// en Pinecone (namespace 'finlogic-pages') y persiste cada registro en la
// entidad PageKnowledge. Permite a Lya descubrir contenido por similitud
// semántica + keywords. Idempotente: borra el namespace antes de re-upsert.
//
// Solo admin. Usa el mismo índice 'finlogic-knowledge' del corpus normativo
// para reutilizar infraestructura, pero en namespace separado.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-pages';
const EMBED_MODEL = 'multilingual-e5-large';

// ─── Catálogo de páginas (fuente de verdad) ────────────────────────────
const PAGES = [
  {
    path: '/',
    name: 'Home',
    title: 'FinLogic — Tu derecho financiero, en tu idioma',
    summary: 'Landing principal. Hero con propuesta de valor, indicadores live (UF, dólar, IPC, TPM), capas FinLogic (B2C ciudadana, Pyme, B2B Compliance API), perfiles de los 4 arquetipos (Camila, Don Luis, María José, Roberto), antes/después, casos resueltos recientes, organismos cubiertos (CMF, SERNAC, SII, CSIRT, BCN, FOGAPE, SERCOTEC), media logos y CTA al asistente Lya.',
    keywords: ['home', 'inicio', 'landing', 'principal', 'hero', 'propuesta', 'finlogic', 'que es', 'introducción'],
    segment: 'general',
    audience: ['general', 'jurado', 'prensa'],
    sections: [
      { id: 'hero', label: 'Hero principal', summary: 'Propuesta de valor + CTA' },
      { id: 'indicadores', label: 'Indicadores live', summary: 'UF, dólar, IPC, TPM en tiempo real' },
      { id: 'capas', label: 'Las 3 capas FinLogic', summary: 'B2C, Pyme, B2B Compliance API' },
      { id: 'perfiles', label: 'Perfiles ciudadanos', summary: '4 arquetipos: Camila, Don Luis, María José, Roberto' },
      { id: 'casos', label: 'Casos resueltos', summary: 'Casos reales con métricas' },
    ],
    priority: 100,
    tags: ['landing', 'b2c', 'b2b', 'pyme'],
  },
  {
    path: '/Consulta',
    name: 'Consulta',
    title: 'Hacer una consulta legal-financiera',
    summary: 'Página principal de consulta ciudadana. El usuario escribe o habla su situación; el pipeline IA (triage → RAG Pinecone → especialista Claude → verificador) responde con normativa chilena citada. Soporta voz (Whisper STT + ElevenLabs TTS). Muestra UrgencyBadge, AgentTrace y opción de generar documento legal.',
    keywords: ['consulta', 'preguntar', 'pregunta', 'ayuda legal', 'derechos', 'duda financiera', 'asesoría', 'caso'],
    segment: 'b2c',
    audience: ['camila', 'don_luis', 'maria_jose', 'roberto', 'general'],
    sections: [
      { id: 'consulta-form', label: 'Formulario de consulta', summary: 'Texto + voz' },
      { id: 'pipeline-loader', label: 'Pipeline IA en vivo', summary: 'Etapas del procesamiento' },
      { id: 'response-card', label: 'Respuesta y documentos', summary: 'Citas + acciones' },
    ],
    ctas: [
      { action: 'consulta-submit', label: 'Enviar consulta al pipeline' },
      { action: 'consulta-voice', label: 'Activar entrada por voz' },
    ],
    priority: 95,
    tags: ['consulta', 'pipeline', 'rag'],
  },
  {
    path: '/Transparencia',
    name: 'Transparencia',
    title: 'Transparencia algorítmica — AgentTrace público',
    summary: 'Auditoría pública de cada decisión IA. Lista pública de AgentTraces con verifierScore, latencia, leyes citadas, herramientas usadas. Diferenciador competitivo central de FinLogic: el ciudadano puede ver cómo el sistema llegó a su respuesta.',
    keywords: ['transparencia', 'auditoría', 'agenttrace', 'pipeline', 'cómo funciona', 'verificador', 'score', 'alucinación', 'explicabilidad'],
    segment: 'concurso',
    audience: ['jurado', 'prensa', 'general'],
    sections: [
      { id: 'stats', label: 'Estadísticas globales', summary: 'Score promedio, latencia, hallucination rate' },
      { id: 'trace-list', label: 'Lista de traces', summary: 'AgentTraces públicos consultables' },
    ],
    priority: 90,
    tags: ['transparencia', 'concurso', 'diferenciador'],
  },
  {
    path: '/Casos',
    name: 'Casos',
    title: 'Casos resueltos públicos',
    summary: 'Casos ciudadanos resueltos con métricas reales: monto recuperado, días de resolución, organismo. Muestra impacto del sistema. Filtros por organismo (CMF, SERNAC, SII, CSIRT) y prioridad. Cada caso linkea al detalle.',
    keywords: ['casos', 'resueltos', 'historias', 'impacto', 'recuperado', 'resultados'],
    segment: 'b2c',
    audience: ['general', 'jurado', 'prensa'],
    priority: 75,
    tags: ['casos', 'impacto'],
  },
  {
    path: '/MisCasos',
    name: 'Mis Casos',
    title: 'Mis casos personales',
    summary: 'Bandeja personal del usuario logueado. Sus casos abiertos, en proceso, resueltos. Plazos legales con countdown. Documentos generados. Solo accesible al ciudadano dueño.',
    keywords: ['mis casos', 'mi bandeja', 'mis trámites', 'mis denuncias', 'historial personal'],
    segment: 'b2c',
    audience: ['camila', 'don_luis', 'maria_jose', 'roberto'],
    priority: 70,
    tags: ['mis-casos', 'personal'],
  },
  {
    path: '/Pyme',
    name: 'Pyme',
    title: 'Pyme — Análisis tributario y salud financiera',
    summary: 'Capa pyme de FinLogic. Onboarding Pyme con RUT, régimen tributario, ventas. Health Score de salud financiera. Alertas SII (vencimientos IVA, F29, F22). Recomendación régimen Pro-Pyme vs Pro-Pyme Transparente vs General.',
    keywords: ['pyme', 'empresa', 'tributario', 'sii', 'iva', 'f29', 'f22', 'pro-pyme', 'régimen', 'eirl', 'spa'],
    segment: 'pyme',
    audience: ['maria_jose'],
    priority: 80,
    tags: ['pyme', 'sii', 'tributario'],
  },
  {
    path: '/api-compliance',
    name: 'API Compliance',
    title: 'B2B Compliance API — 5 endpoints para fintech',
    summary: 'Compliance API para fintechs reguladas. 5 endpoints: check-tmc (Ley 18.010), verify-entity (Ley 21.521), regulatory-impact (NCG 502 + 12 módulos), fraud-pattern-match (Ley 20.009 + 21.663), consumer-rights-check (Ley 19.496 + 20.555). Plan base $490.000 CLP/mes con 10K llamadas. ROI calculator. Demo check-TMC. Ventana SFA 4 jul 2026.',
    keywords: ['api', 'compliance', 'b2b', 'fintech', 'endpoints', 'tmc', 'sfa', 'precio', '490000', 'pricing api', 'developers'],
    segment: 'b2b',
    audience: ['fintech'],
    sections: [
      { id: 'endpoints', label: 'Los 5 endpoints', summary: 'TMC, entity, regulatory, fraud, rights' },
      { id: 'demo', label: 'Demo check-TMC', summary: 'Validación TMC en vivo' },
      { id: 'roi', label: 'Calculadora ROI', summary: 'Multa CMF evitada vs costo API' },
    ],
    priority: 85,
    tags: ['api', 'b2b', 'compliance', 'fintech'],
  },
  {
    path: '/Pricing',
    name: 'Pricing',
    title: 'Pricing — Free, Pro, Compliance API',
    summary: 'Tres planes: Free (gratis para ciudadanos), Pro ($3.990 CLP/mes con prioridad y documentos ilimitados), Compliance API ($490.000 CLP/mes para fintechs B2B con 10K llamadas).',
    keywords: ['pricing', 'precio', 'planes', 'cuánto cuesta', 'free', 'pro', 'gratis', 'cuanto vale'],
    segment: 'general',
    audience: ['general', 'fintech', 'jurado'],
    priority: 75,
    tags: ['pricing', 'planes'],
  },
  {
    path: '/Pro',
    name: 'Pro',
    title: 'Plan Pro Ciudadano',
    summary: 'Suscripción Pro $3.990 CLP/mes. Beneficios: documentos legales ilimitados, prioridad en pipeline, alertas WhatsApp, comparador de planes vs Free, calculadora de valor, conversión Stripe.',
    keywords: ['pro', 'suscripción', 'premium', 'pagar', '3990'],
    segment: 'b2c',
    audience: ['camila', 'don_luis', 'maria_jose', 'roberto'],
    priority: 70,
    tags: ['pro', 'suscripcion'],
  },
  {
    path: '/Soporte',
    name: 'Soporte',
    title: 'Centro de soporte y FAQ',
    summary: 'Centro de soporte ciudadano. SmartSearch sobre FAQs. Acordeón con preguntas frecuentes. Canales WhatsApp, Telegram, email. Formulario de ticket con triaje IA.',
    keywords: ['soporte', 'ayuda', 'faq', 'pregunta frecuente', 'contacto', 'ticket', 'whatsapp'],
    segment: 'general',
    audience: ['general'],
    priority: 60,
    tags: ['soporte', 'faq'],
  },
  {
    path: '/MisSoporte',
    name: 'Mis Soporte',
    title: 'Mis tickets de soporte',
    summary: 'Tickets de soporte abiertos del usuario logueado.',
    keywords: ['mis tickets', 'mis consultas soporte', 'estado ticket'],
    segment: 'b2c',
    audience: ['general'],
    priority: 50,
    tags: ['soporte', 'personal'],
  },
  {
    path: '/Insights',
    name: 'Insights',
    title: 'Insights — Métricas agregadas de impacto',
    summary: 'Dashboard público con métricas de uso e impacto: total casos, casos por organismo, top normativas consultadas, breakdown regulatorio, tendencia mensual.',
    keywords: ['insights', 'métricas', 'estadísticas', 'datos', 'impacto', 'dashboard'],
    segment: 'concurso',
    audience: ['jurado', 'prensa', 'general'],
    priority: 80,
    tags: ['insights', 'metricas'],
  },
  {
    path: '/Embajadores',
    name: 'Embajadores',
    title: 'Programa de Embajadores',
    summary: 'Programa de referidos. Cada usuario tiene un código único. Por cada amigo que invita y se registra, gana puntos. Ranking público. Storytelling del impacto colectivo.',
    keywords: ['embajadores', 'referidos', 'invitar', 'amigos', 'código referido', 'compartir'],
    segment: 'b2c',
    audience: ['general'],
    priority: 55,
    tags: ['embajadores', 'referidos'],
  },
  {
    path: '/Marca',
    name: 'Marca',
    title: 'Marca — Brand kit FinLogic',
    summary: 'Identidad de marca: logo, colores (mint #0E7A47), tipografías (Inter, Plus Jakarta Sans, Fraunces, JetBrains Mono), tono de voz, sistema visual editorial estilo Apple + Wise + Mercado Pago.',
    keywords: ['marca', 'brand', 'logo', 'colores', 'tipografía', 'identidad'],
    segment: 'marca',
    audience: ['prensa', 'general'],
    priority: 50,
    tags: ['marca', 'brand'],
  },
  {
    path: '/Diseno',
    name: 'Diseño',
    title: 'Sistema de Diseño FinLogic',
    summary: 'Sistema de diseño completo. Skins adaptativos por arquetipo (Camila, Don Luis, María José, Roberto). User flows. Wireframes. Showcase de skins. Modo accesibilidad. Componentes editoriales.',
    keywords: ['diseño', 'design system', 'skins', 'flujos', 'accesibilidad', 'wireframes'],
    segment: 'marca',
    audience: ['prensa', 'jurado', 'general'],
    priority: 65,
    tags: ['diseno', 'system'],
  },
  {
    path: '/PitchDeck',
    name: 'Pitch Deck',
    title: 'Pitch Deck Claude Impact Lab',
    summary: 'Pitch deck completo del Claude Impact Lab Chile 2026. 12 slides: hero, problema, perfiles, demo Lya, casos, tracción, Compliance API, ventana SFA, equipo, cierre. Lya conversacional bidireccional integrada como mediadora con el jurado. QR a finlogic.one.',
    keywords: ['pitch', 'deck', 'presentación', 'concurso', 'claude impact lab', 'demo', 'jurado'],
    segment: 'concurso',
    audience: ['jurado', 'prensa'],
    sections: [
      { id: 'slide-hero', label: 'Apertura', summary: 'Hero + QR finlogic.one' },
      { id: 'slide-problema', label: 'El problema', summary: '500K reclamos sin abogado' },
      { id: 'slide-perfiles', label: '4 perfiles', summary: 'Camila, Don Luis, María José, Roberto' },
      { id: 'slide-demo', label: 'Demo en vivo', summary: 'Lya orquestando agentes' },
      { id: 'slide-casos', label: 'Casos resueltos', summary: '$732K recuperados, 9.5 días promedio' },
      { id: 'slide-traccion', label: 'Tracción', summary: 'Métricas en producción últimos 7 días' },
      { id: 'slide-api', label: 'Compliance API', summary: '5 endpoints, $490K CLP/mes' },
      { id: 'slide-sfa', label: 'Ventana SFA', summary: 'Sistema de Finanzas Abiertas 4 jul 2026' },
      { id: 'slide-equipo', label: 'Equipo', summary: 'Gabriel, Diego, Paula, Martín' },
      { id: 'slide-cierre', label: 'Cierre', summary: 'CTA: 3 fintechs piloto + convenio CMF' },
    ],
    priority: 100,
    tags: ['pitch', 'concurso', 'jurado'],
  },
  {
    path: '/Demo',
    name: 'Demo',
    title: 'Demo en video del producto',
    summary: 'Video demo del producto FinLogic. Player de video, checklist de funcionalidades, especificaciones técnicas, script narrado.',
    keywords: ['demo', 'video', 'tutorial', 'cómo funciona'],
    segment: 'concurso',
    audience: ['jurado', 'prensa'],
    priority: 70,
    tags: ['demo', 'video'],
  },
  {
    path: '/Rubrica',
    name: 'Rúbrica',
    title: 'Rúbrica de evaluación Claude Impact Lab',
    summary: 'Dashboard de auto-validación contra los criterios del concurso. Verificación en tiempo real de impacto ciudadano, precisión normativa, arquitectura agéntica, madurez del CRM y pipeline.',
    keywords: ['rubrica', 'evaluación', 'concurso', 'criterios', 'puntaje'],
    segment: 'concurso',
    audience: ['jurado'],
    priority: 90,
    tags: ['rubrica', 'concurso'],
  },
  {
    path: '/Entregables',
    name: 'Entregables',
    title: 'Entregables formales del concurso',
    summary: 'Hub de entregables del concurso. Ficha cívica, ficha técnica, system prompts, PDFs descargables, repos GitHub, pitch deck.',
    keywords: ['entregables', 'documentación', 'concurso', 'pdf', 'descargas'],
    segment: 'concurso',
    audience: ['jurado'],
    priority: 85,
    tags: ['entregables', 'concurso'],
  },
  {
    path: '/AsistenteLya',
    name: 'Asistente Lya',
    title: 'Asistente Lya — Conversación completa',
    summary: 'Página dedicada de conversación con Lya en formato chat completo. Voz + texto. Historia persistente. Sugerencias contextuales.',
    keywords: ['lya', 'asistente', 'chat', 'conversación', 'hablar con lya'],
    segment: 'b2c',
    audience: ['general'],
    priority: 80,
    tags: ['lya', 'asistente'],
  },
  {
    path: '/Lanzamiento',
    name: 'Lanzamiento',
    title: 'Lanzamiento Chile Fintech Forum 2026',
    summary: 'Plan de marketing táctico para tomar el Chile Fintech Forum 2026 en Espacio Riesco (6-7 mayo). Targets priorizados (Felipe Pizarro, Hugo Guerra, Josefina Movillo, Carlos Prada Nubank, Carlos Urrutia Revolut, Mario Braz Stripe, autoridades CMF/SII/BCN). Timeline 24h, mensajes copy-paste, KPIs medibles.',
    keywords: ['lanzamiento', 'fintech forum', 'cff26', 'espacio riesco', 'marketing', 'plan', 'pizarro', 'hugo guerra', 'movillo', 'speakers', 'evento'],
    segment: 'concurso',
    audience: ['jurado', 'prensa', 'fintech', 'general'],
    priority: 95,
    tags: ['lanzamiento', 'cff26', 'marketing'],
  },
];

// ─── Helpers Pinecone ───────────────────────────────────────────────────
async function pineconeFetch(apiKey, url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Pinecone-API-Version': '2024-10',
      ...(options.headers || {}),
    },
  });
}

async function getIndexHost(apiKey) {
  const res = await pineconeFetch(apiKey, `${PINECONE_API}/indexes/${INDEX_NAME}`);
  if (!res.ok) throw new Error(`Índice ${INDEX_NAME} no encontrado. Ejecuta seedKnowledgeBase primero.`);
  const data = await res.json();
  return data.host;
}

async function embedBatch(apiKey, texts) {
  const res = await pineconeFetch(apiKey, `${PINECONE_API}/embed`, {
    method: 'POST',
    body: JSON.stringify({
      model: EMBED_MODEL,
      inputs: texts.map(t => ({ text: t.substring(0, 4000) })),
      parameters: { input_type: 'passage', truncate: 'END' },
    }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data.map(d => d.values);
}

// ─── Handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const apiKey = Deno.env.get('PINECONE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'PINECONE_API_KEY no configurada' }, { status: 500 });
    }

    const startTime = Date.now();
    const host = await getIndexHost(apiKey);

    // 1. Limpiar namespace antes de re-upsert (idempotencia)
    await pineconeFetch(apiKey, `https://${host}/vectors/delete`, {
      method: 'POST',
      body: JSON.stringify({ namespace: NAMESPACE, deleteAll: true }),
    }).catch(() => {});

    // 2. Embeddings — texto enriquecido por página
    const texts = PAGES.map(p =>
      `${p.title}\n${p.name}\n${p.summary}\nKeywords: ${(p.keywords || []).join(', ')}\nSegmento: ${p.segment}\nAudiencia: ${(p.audience || []).join(', ')}`
    );
    const embeddings = await embedBatch(apiKey, texts);

    // 3. Upsert vectores
    const vectors = PAGES.map((p, i) => ({
      id: `page_${p.path.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
      values: embeddings[i],
      metadata: {
        path: p.path,
        name: p.name,
        title: p.title,
        summary: p.summary,
        keywords: p.keywords || [],
        segment: p.segment || 'general',
        audience: p.audience || ['general'],
        priority: p.priority || 50,
        tags: p.tags || [],
      },
    }));

    const upsertRes = await pineconeFetch(apiKey, `https://${host}/vectors/upsert`, {
      method: 'POST',
      body: JSON.stringify({ namespace: NAMESPACE, vectors }),
    });
    if (!upsertRes.ok) {
      throw new Error(`Upsert failed: ${upsertRes.status} ${await upsertRes.text()}`);
    }

    // 4. Persistir en entidad PageKnowledge (limpio + re-crear)
    const existing = await base44.asServiceRole.entities.PageKnowledge.list().catch(() => []);
    for (const e of existing) {
      try { await base44.asServiceRole.entities.PageKnowledge.delete(e.id); } catch (_) {}
    }
    const created = [];
    for (const p of PAGES) {
      try {
        const rec = await base44.asServiceRole.entities.PageKnowledge.create({
          ...p,
          vectorId: `page_${p.path.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
          lastIndexedAt: new Date().toISOString(),
        });
        created.push(rec.id);
      } catch (e) {
        console.warn(`No se pudo persistir ${p.path}:`, e.message);
      }
    }

    return Response.json({
      success: true,
      provider: 'pinecone',
      namespace: NAMESPACE,
      indexed: vectors.length,
      persisted: created.length,
      pages: PAGES.map(p => ({ path: p.path, name: p.name, segment: p.segment })),
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('seedPageKnowledge error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});