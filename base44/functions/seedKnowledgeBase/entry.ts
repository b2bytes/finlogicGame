// seedKnowledgeBase — Carga inicial del corpus normativo FinLogic en Pinecone Serverless.
// Crea el índice "finlogic-knowledge" si no existe (modelo integrado multilingual-e5-large,
// dimension 1024, métrica cosine, región AWS us-east-1). Solo admin. Idempotente.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-prod';
const EMBED_MODEL = 'multilingual-e5-large';
const EMBED_DIM = 1024;

const CORPUS = [
  // ── LEY 20.009 — FRAUDE TARJETAS ──────────────────────────────────────
  {
    module: 'ley_20009_fraude',
    regulatoryBody: 'CSIRT',
    title: 'Ley 20.009 Art. 5° — Responsabilidad del banco y carga de la prueba',
    lawReference: 'Ley 20.009 Art. 5°',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=235182',
    tags: ['fraude_tarjeta', 'carga_prueba', 'banco'],
    content: `La Ley 20.009 (modificada por Ley 21.234) establece que el emisor (banco) responde por las operaciones no reconocidas por el usuario. La carga de la prueba del dolo o culpa grave del usuario recae en el emisor. El usuario debe denunciar el desconocimiento dentro de 5 días hábiles desde que tomó conocimiento. El banco debe restituir los montos cuestionados dentro de 5 días hábiles siguientes a la denuncia, salvo que pruebe dolo o culpa grave del usuario por sentencia judicial.`,
  },
  {
    module: 'ley_20009_fraude',
    regulatoryBody: 'CSIRT',
    title: 'Ley 20.009 — Plazos clave fraude',
    lawReference: 'Ley 20.009 Art. 4° y 5°',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=235182',
    tags: ['plazo_legal', 'fraude_tarjeta'],
    content: `Plazos críticos: (1) Denuncia del usuario: 5 días hábiles desde que tomó conocimiento del cargo no reconocido. (2) Restitución del banco: 5 días hábiles siguientes a la denuncia. (3) Tope de restitución obligatoria sin investigación: 35 UF por operación; sobre ese monto el banco puede investigar antes de restituir, pero no puede negarse arbitrariamente.`,
  },

  // ── LEY 19.496 — SERNAC ──────────────────────────────────────────────
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 19.496 Art. 21 — Garantía legal triple opción',
    lawReference: 'Ley 19.496 Art. 21',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=61438',
    tags: ['garantia_legal', 'producto_defectuoso'],
    content: `El consumidor tiene 6 meses desde la compra para ejercer la garantía legal sobre productos. La garantía legal otorga TRIPLE OPCIÓN al consumidor (a su elección, no del proveedor): (1) reparación gratuita, (2) cambio del producto, (3) devolución del dinero pagado. Esta garantía aplica además de cualquier garantía voluntaria del fabricante. Si el producto tiene defecto oculto, el plazo se cuenta desde que el defecto se manifiesta.`,
  },
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 19.496 Art. 16 — Cláusulas abusivas',
    lawReference: 'Ley 19.496 Art. 16',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=61438',
    tags: ['contrato_abusivo', 'clausula_nula'],
    content: `Son nulas de pleno derecho las cláusulas en contratos de adhesión que: (a) otorguen al proveedor facultad de modificar unilateralmente el contrato, (b) eximan al proveedor de responsabilidad por defectos, (c) contengan limitaciones absolutas de responsabilidad, (d) inviertan la carga de la prueba, (e) contengan espacios en blanco no llenados antes de firmar, (f) impongan al consumidor obligaciones desproporcionadas, (g) hagan responsable al consumidor por hechos de terceros.`,
  },
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 19.496 Art. 3 bis — Derecho de retracto',
    lawReference: 'Ley 19.496 Art. 3 bis',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=61438',
    tags: ['retracto', 'compra_distancia'],
    content: `El consumidor puede retractarse dentro de 10 días corridos contados desde la recepción del producto o celebración del contrato (lo que sea posterior) en: compras a distancia (internet, catálogo, telemarketing), reuniones convocadas por el proveedor fuera del local comercial, y contratos de servicios educacionales superior. El derecho de retracto NO requiere justificación y no genera costos para el consumidor (salvo gastos de envío de retorno en algunos casos).`,
  },

  // ── LEY 20.555 — SERNAC FINANCIERO ──────────────────────────────────
  {
    module: 'ley_20555',
    regulatoryBody: 'SERNAC',
    title: 'Ley 20.555 — CAE Carga Anual Equivalente obligatoria',
    lawReference: 'Ley 20.555',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1031940',
    tags: ['cae', 'credito', 'transparencia'],
    content: `La Ley 20.555 (SERNAC Financiero) obliga a todo oferente de productos financieros a informar la CAE (Carga Anual Equivalente) de forma destacada y previa a la contratación. La CAE incluye intereses, comisiones, seguros asociados y todo costo del crédito anualizado. El proveedor debe entregar Hoja Resumen estandarizada antes de la firma. La omisión de la CAE permite al consumidor demandar nulidad de cláusulas o ajuste del costo.`,
  },

  // ── LEY 21.521 — FINTECH ────────────────────────────────────────────
  {
    module: 'ley_fintech_21521',
    regulatoryBody: 'CMF',
    title: 'Ley 21.521 Fintech — Registro PSBI obligatorio',
    lawReference: 'Ley 21.521 Art. 4°',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1192828',
    tags: ['fintech', 'registro_psbi', 'cmf'],
    content: `La Ley 21.521 crea el Registro de Prestadores de Servicios Basados en Tecnologías Financieras (PSBI) en la CMF. Servicios obligados a registrarse: asesoría de inversión, plataformas de financiamiento colectivo (crowdfunding), custodia de instrumentos financieros, ruteadores de órdenes, sistemas alternativos de transacción. Plazo de registro: antes de iniciar operaciones. El registro es público en cmfchile.cl. Operar sin registro constituye infracción grave.`,
  },
  {
    module: 'open_finance',
    regulatoryBody: 'CMF',
    title: 'Ley 21.521 Open Finance — Portabilidad de datos financieros',
    lawReference: 'Ley 21.521 Título III',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1192828',
    tags: ['open_finance', 'portabilidad', 'datos'],
    content: `Open Finance Chile establece la obligación de instituciones financieras de compartir los datos del cliente con terceros autorizados, previo consentimiento expreso del cliente. Permite portabilidad de información financiera entre proveedores. La CMF dicta normas técnicas (NCG) sobre estándares de seguridad e interoperabilidad. El cliente puede revocar el consentimiento en cualquier momento.`,
  },

  // ── LEY 21.713 — REFORMA TRIBUTARIA 2024 ────────────────────────────
  {
    module: 'ley_21713_tributaria',
    regulatoryBody: 'SII',
    title: 'Ley 21.713 — Reforma tributaria 2024 cumplimiento',
    lawReference: 'Ley 21.713',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208416',
    tags: ['reforma_tributaria', 'sii', 'cumplimiento'],
    content: `La Ley 21.713 (publicada octubre 2024) refuerza el cumplimiento tributario. Principales cambios: (1) Norma General Antielusiva fortalecida (Art. 4° bis CT), (2) deber de informar esquemas tributarios, (3) ampliación de facultades fiscalizadoras del SII, (4) nuevas obligaciones para plataformas digitales y marketplaces, (5) modificaciones a Pro-Pyme y Pro-Pyme Transparente, (6) trazabilidad de transferencias electrónicas sobre 50 UTM mensuales acumuladas (delación a SII).`,
  },
  {
    module: 'lir_propyme',
    regulatoryBody: 'SII',
    title: 'LIR Pro-Pyme — Régimen 14 D N°3',
    lawReference: 'Art. 14 letra D N°3 LIR',
    sourceUrl: 'https://www.sii.cl/destacados/regimen_propyme/',
    tags: ['propyme', 'regimen_tributario', 'pyme'],
    content: `El régimen Pro-Pyme (Art. 14 D N°3 LIR) aplica a contribuyentes con promedio anual de ingresos del giro de los últimos 3 ejercicios ≤ 75.000 UF. Tributa con tasa 25% Primera Categoría, contabilidad simplificada, depreciación instantánea de activos fijos, postergación de IVA hasta 2 meses, retiros y dividendos quedan registrados en RAI. Los socios tributan en base a retiros efectivos (no devengado).`,
  },
  {
    module: 'lir_propyme',
    regulatoryBody: 'SII',
    title: 'F22 vs F29 — Diferencias contribuyente persona natural',
    lawReference: 'DL 824 LIR Art. 65',
    sourceUrl: 'https://www.sii.cl',
    tags: ['f22', 'f29', 'persona_natural', 'declaracion'],
    content: `Para PERSONA NATURAL sin actividad económica formal (sin giro), solo aplica F22 anual (declaración de Impuesto a la Renta, abril/mayo). NO existe declaración mensual ni acceso a información mensual del SII. Devolución eventual se gestiona solo en operación renta. Para PERSONA NATURAL con giro o PERSONA JURÍDICA, aplica F29 mensual (IVA, PPM, retenciones honorarios, impuesto único trabajadores) y F22 anual. El registro de compras y ventas mensual solo está disponible para contribuyentes con giro.`,
  },
  {
    module: 'lir_propyme',
    regulatoryBody: 'SII',
    title: 'Primera vs Segunda Categoría — Cómo verificar',
    lawReference: 'Art. 20 y 42 LIR',
    sourceUrl: 'https://www.sii.cl',
    tags: ['categoria', 'lir', 'verificacion'],
    content: `Primera Categoría (Art. 20 LIR): rentas del capital y empresas comerciales, industriales, mineras, etc. Segunda Categoría (Art. 42 LIR): rentas del trabajo — N°1 sueldos dependientes, N°2 honorarios profesionales independientes. Para verificar tu categoría: ingresar a sii.cl con RUT + Clave Tributaria → Mi SII → Mis Datos → Actividades Económicas. Ahí aparece el giro registrado y su categoría asociada. Una persona puede tener actividades en ambas categorías simultáneamente.`,
  },

  // ── LEY 21.719 — PROTECCIÓN DE DATOS ────────────────────────────────
  {
    module: 'ley_21719_datos',
    regulatoryBody: 'BCN',
    title: 'Ley 21.719 — Derechos ARCOPOL',
    lawReference: 'Ley 21.719 Art. 4°',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208091',
    tags: ['arco', 'datos_personales', 'derechos'],
    content: `La Ley 21.719 (publicada diciembre 2024, vigencia diferida) moderniza la protección de datos personales en Chile. Establece derechos ARCOPOL del titular: Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Bloqueo y Limitación. Se crea la Agencia de Protección de Datos Personales como autoridad de control. Multas hasta 20.000 UTM o 4% facturación anual. Obligación de delegado de protección de datos para tratamientos masivos.`,
  },

  // ── LEY 21.663 — CIBERSEGURIDAD ─────────────────────────────────────
  {
    module: 'ley_21663_ciberseguridad',
    regulatoryBody: 'CSIRT',
    title: 'Ley 21.663 — Marco de Ciberseguridad',
    lawReference: 'Ley 21.663',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1204357',
    tags: ['ciberseguridad', 'anci', 'csirt'],
    content: `La Ley 21.663 establece el marco regulatorio de ciberseguridad en Chile. Crea la Agencia Nacional de Ciberseguridad (ANCI). Define servicios esenciales con obligaciones reforzadas: bancos, telecom, energía, agua, salud, transporte, infraestructura digital crítica. Obligación de reportar incidentes a ANCI/CSIRT en plazos estrictos (3h notificación inicial, 72h informe completo). Sanciones hasta 40.000 UTM por incumplimiento.`,
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

// Verifica si existe el índice; si no, lo crea (serverless AWS us-east-1)
async function ensureIndex(apiKey) {
  const checkRes = await pineconeFetch(apiKey, `${PINECONE_API}/indexes/${INDEX_NAME}`);

  if (checkRes.ok) {
    const data = await checkRes.json();
    return { host: data.host, created: false };
  }

  if (checkRes.status !== 404) {
    const err = await checkRes.text();
    throw new Error(`Pinecone check failed: ${checkRes.status} ${err}`);
  }

  // Crear índice serverless
  const createRes = await pineconeFetch(apiKey, `${PINECONE_API}/indexes`, {
    method: 'POST',
    body: JSON.stringify({
      name: INDEX_NAME,
      dimension: EMBED_DIM,
      metric: 'cosine',
      spec: {
        serverless: { cloud: 'aws', region: 'us-east-1' },
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Pinecone create index failed: ${createRes.status} ${err}`);
  }

  // Esperar a que el índice esté ready (max 30s)
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const statusRes = await pineconeFetch(apiKey, `${PINECONE_API}/indexes/${INDEX_NAME}`);
    if (statusRes.ok) {
      const data = await statusRes.json();
      if (data.status?.ready) return { host: data.host, created: true };
    }
  }
  throw new Error('Índice Pinecone creado pero no ready en 30s');
}

// Embedding batch con Pinecone Inference (multilingual-e5-large)
async function embedBatch(apiKey, texts, inputType = 'passage') {
  const res = await pineconeFetch(apiKey, `${PINECONE_API}/embed`, {
    method: 'POST',
    body: JSON.stringify({
      model: EMBED_MODEL,
      inputs: texts.map(t => ({ text: t.substring(0, 4000) })),
      parameters: { input_type: inputType, truncate: 'END' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone embed failed: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.data.map(d => d.values);
}

// Upsert vectores en Pinecone
async function upsertVectors(apiKey, host, vectors) {
  const res = await pineconeFetch(apiKey, `https://${host}/vectors/upsert`, {
    method: 'POST',
    body: JSON.stringify({ namespace: NAMESPACE, vectors }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone upsert failed: ${res.status} ${err}`);
  }
  return res.json();
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

    const { force = false } = await req.json().catch(() => ({}));

    // 1. Asegurar que el índice existe
    const { host, created } = await ensureIndex(apiKey);
    console.log(`Índice ${INDEX_NAME} ${created ? 'CREADO' : 'ya existía'}, host: ${host}`);

    // 2. Generar embeddings batch (e5-large soporta hasta 96 inputs por call)
    const texts = CORPUS.map(c => `${c.title}\n${c.lawReference}\n${c.content}`);
    const embeddings = await embedBatch(apiKey, texts, 'passage');

    if (embeddings.length !== CORPUS.length) {
      throw new Error(`Mismatch embeddings: ${embeddings.length} vs ${CORPUS.length}`);
    }

    // 3. Construir vectores con metadata
    const vectors = CORPUS.map((chunk, i) => ({
      id: `${chunk.module}::${chunk.lawReference}::${i}`.replace(/\s+/g, '_'),
      values: embeddings[i],
      metadata: {
        module: chunk.module,
        regulatoryBody: chunk.regulatoryBody,
        title: chunk.title,
        lawReference: chunk.lawReference,
        sourceUrl: chunk.sourceUrl,
        content: chunk.content,
        tags: chunk.tags || [],
      },
    }));

    // 4. Upsert en batches de 100 (límite Pinecone)
    let upserted = 0;
    for (let i = 0; i < vectors.length; i += 100) {
      const batch = vectors.slice(i, i + 100);
      await upsertVectors(apiKey, host, batch);
      upserted += batch.length;
    }

    return Response.json({
      success: true,
      provider: 'pinecone',
      indexName: INDEX_NAME,
      indexHost: host,
      indexCreated: created,
      namespace: NAMESPACE,
      embedModel: EMBED_MODEL,
      upserted,
      total: CORPUS.length,
    });
  } catch (error) {
    console.error('seedKnowledgeBase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});