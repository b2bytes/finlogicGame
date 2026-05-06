// seedKnowledgeBase — Carga inicial del corpus normativo FinLogic en KnowledgeChunk.
// Genera embeddings con OpenAI text-embedding-3-small y persiste cada chunk.
// Solo admin. Idempotente: salta chunks que ya existen (mismo lawReference + title).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const EMBEDDING_MODEL = 'text-embedding-3-small';

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

async function generateEmbedding(text) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('OPENAI_API_KEY no configurada');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text.substring(0, 8000),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI embeddings failed: ${response.status} ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const { force = false } = await req.json().catch(() => ({}));

    // Obtiene chunks existentes para idempotencia (por lawReference + title)
    const existing = await base44.asServiceRole.entities.KnowledgeChunk.list('-created_date', 500);
    const existingKeys = new Set(existing.map(c => `${c.lawReference}::${c.title}`));

    let inserted = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (const chunk of CORPUS) {
      const key = `${chunk.lawReference}::${chunk.title}`;
      if (existingKeys.has(key) && !force) {
        skipped++;
        continue;
      }

      try {
        const embeddingText = `${chunk.title}\n${chunk.lawReference}\n${chunk.content}`;
        const embedding = await generateEmbedding(embeddingText);

        await base44.asServiceRole.entities.KnowledgeChunk.create({
          ...chunk,
          embedding,
          embeddingModel: EMBEDDING_MODEL,
          tokens: Math.ceil(embeddingText.length / 4),
          active: true,
        });
        inserted++;
      } catch (e) {
        failed++;
        errors.push({ title: chunk.title, error: e.message });
        console.error(`Failed to seed "${chunk.title}":`, e.message);
      }
    }

    return Response.json({
      success: true,
      inserted,
      skipped,
      failed,
      total: CORPUS.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('seedKnowledgeBase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});