// seedKnowledgeBase — Carga el corpus normativo FinLogic en Pinecone Serverless.
// Crea el índice "finlogic-knowledge" si no existe (modelo multilingual-e5-large,
// dimension 1024, métrica cosine, AWS us-east-1). Solo admin. Idempotente.
// Acepta { force: true } para forzar re-upsert (sobreescribe vectores existentes).

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const PINECONE_API = 'https://api.pinecone.io';
const INDEX_NAME = 'finlogic-knowledge';
const NAMESPACE = 'finlogic-prod';
const EMBED_MODEL = 'multilingual-e5-large';
const EMBED_DIM = 1024;

const CORPUS = [
  // ═══════════════ LEY 20.009 — FRAUDE TARJETAS ═══════════════
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
  {
    module: 'ley_20009_fraude',
    regulatoryBody: 'CSIRT',
    title: 'Ley 20.009 — Procedimiento de reclamo si banco rechaza',
    lawReference: 'Ley 20.009 + reclamo CMF',
    sourceUrl: 'https://www.cmfchile.cl/portal/principal/613/w3-channel.html',
    tags: ['reclamo_cmf', 'fraude_rechazado', 'banco'],
    content: `Si el banco rechaza la restitución alegando culpa grave del usuario, el ciudadano puede: (1) Solicitar por escrito el fundamento del rechazo (banco debe entregarlo en 10 días hábiles); (2) Reclamar ante CMF en cmfchile.cl/atencionusuarios sin costo; (3) Demandar civilmente o iniciar querella penal por estafa (Art. 472 CP); (4) Acudir a SERNAC por infracción a Ley 19.496 si hubo trato lesivo. El banco no puede dejar al usuario sin defensa: la culpa grave debe ser declarada judicialmente, no por el banco unilateralmente.`,
  },
  {
    module: 'ley_20009_fraude',
    regulatoryBody: 'CSIRT',
    title: 'Phishing y suplantación digital — Ruta CSIRT',
    lawReference: 'Ley 20.009 + Ley 21.663',
    sourceUrl: 'https://www.csirt.gob.cl',
    tags: ['phishing', 'suplantacion', 'denuncia_csirt'],
    content: `Si fuiste víctima de phishing (correo, SMS, WhatsApp falso), suplantación de identidad bancaria o malware bancario: (1) Bloquea inmediatamente tarjetas y cambia claves; (2) Denuncia al banco bajo Ley 20.009 dentro de 5 días hábiles; (3) Reporta el caso en csirt.gob.cl con captura del mensaje fraudulento; (4) Si hubo transferencia, presenta denuncia en PDI o Fiscalía por estafa Art. 468/473 CP. La denuncia CSIRT no reemplaza la denuncia al banco — son procesos paralelos. El banco NO puede exigir que primero denuncies al CSIRT como condición.`,
  },

  // ═══════════════ LEY 19.496 — SERNAC ═══════════════
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
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 19.496 Art. 23 — Cobro indebido y devolución',
    lawReference: 'Ley 19.496 Art. 23',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=61438',
    tags: ['cobro_indebido', 'devolucion', 'sernac'],
    content: `Cualquier cobro no autorizado, duplicado, o por servicios no prestados constituye infracción al Art. 23 de la Ley 19.496. El consumidor puede exigir: devolución íntegra del monto cobrado, intereses corrientes desde la fecha del cobro, e indemnización por daños. Plazo para reclamar: 6 meses desde el cobro. Vía: reclamo SERNAC en sernac.cl (la empresa tiene 10 días hábiles para responder), o demanda en Juzgado de Policía Local. Si la empresa no responde en plazo, SERNAC puede iniciar procedimiento sancionatorio.`,
  },
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 19.496 Art. 28 — Publicidad engañosa',
    lawReference: 'Ley 19.496 Art. 28',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=61438',
    tags: ['publicidad_enganosa', 'sernac'],
    content: `Comete infracción quien induzca a error o engaño respecto de: (a) componentes del producto, (b) idoneidad del bien para el uso ofrecido, (c) precio o tarifa, (d) condiciones de servicio postventa, (e) promociones y rebajas (precio de referencia), (f) origen geográfico. La sanción puede llegar a 750 UTM por infracción y obliga a la empresa a rectificar la publicidad. El consumidor puede exigir cumplimiento de la oferta publicitaria como parte del contrato.`,
  },
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'SERNAC',
    title: 'Ley 21.398 Pro Consumidor — Reformas 2021',
    lawReference: 'Ley 21.398 (modifica Ley 19.496)',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1170557',
    tags: ['ley_pro_consumidor', 'sernac', 'multas'],
    content: `La Ley 21.398 (Pro Consumidor) refuerza el SERNAC: amplía las multas hasta 1.500 UTM por infracción grave, crea el procedimiento de cumplimiento forzado, fortalece las acciones colectivas, prohíbe la geo-discriminación de precios, regula el comercio electrónico (envío, devolución, despacho informativo), y establece el deber de profesionalismo del proveedor. SERNAC puede dictar normas de carácter general (NCG) con fuerza obligatoria para sectores específicos.`,
  },

  // ═══════════════ LEY 20.555 — SERNAC FINANCIERO ═══════════════
  {
    module: 'ley_20555',
    regulatoryBody: 'SERNAC',
    title: 'Ley 20.555 — CAE Carga Anual Equivalente obligatoria',
    lawReference: 'Ley 20.555',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1031940',
    tags: ['cae', 'credito', 'transparencia'],
    content: `La Ley 20.555 (SERNAC Financiero) obliga a todo oferente de productos financieros a informar la CAE (Carga Anual Equivalente) de forma destacada y previa a la contratación. La CAE incluye intereses, comisiones, seguros asociados y todo costo del crédito anualizado. El proveedor debe entregar Hoja Resumen estandarizada antes de la firma. La omisión de la CAE permite al consumidor demandar nulidad de cláusulas o ajuste del costo.`,
  },
  {
    module: 'ley_20555',
    regulatoryBody: 'SERNAC',
    title: 'Ley 20.555 — Hoja Resumen y derecho a portabilidad financiera',
    lawReference: 'Ley 20.555 + Ley 21.236 portabilidad',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1148261',
    tags: ['portabilidad', 'hoja_resumen', 'credito'],
    content: `La Ley 21.236 (portabilidad financiera) permite al consumidor cambiar de banco o proveedor de crédito sin pagar comisiones de prepago abusivas. El nuevo proveedor inicia el trámite con autorización del cliente y un Certificado de Liquidación entregado por el banco actual en 5 días hábiles. La portabilidad aplica a créditos hipotecarios, de consumo, comerciales, tarjetas y líneas de crédito. La empresa receptora se hace cargo de todo el papeleo. El cliente solo firma 1 vez.`,
  },
  {
    module: 'ley_20555',
    regulatoryBody: 'SERNAC',
    title: 'TMC Tasa Máxima Convencional — cómo se calcula',
    lawReference: 'Ley 18.010 Art. 6 + Ley 20.715',
    sourceUrl: 'https://www.cmfchile.cl/portal/estadisticas/606/w3-propertyvalue-30030.html',
    tags: ['tmc', 'usura', 'tasa_credito'],
    content: `La Tasa Máxima Convencional (TMC) es el tope legal de tasa de interés para créditos en Chile. La CMF la publica mensualmente segmentada por monto y plazo. Cobrar sobre la TMC constituye delito de usura (Art. 472 CP), con pena de presidio menor en grados mínimo a medio + multa. El consumidor puede demandar nulidad de la cláusula y devolución de lo pagado en exceso con reajustes e intereses. Verificar TMC vigente en cmfchile.cl → Estadísticas → Tasas de Interés.`,
  },

  // ═══════════════ LEY 21.521 — FINTECH ═══════════════
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
    module: 'ley_fintech_21521',
    regulatoryBody: 'CMF',
    title: 'Ley 21.521 — Crowdfunding y financiamiento colectivo',
    lawReference: 'Ley 21.521 Título II',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1192828',
    tags: ['crowdfunding', 'fintech', 'inversion'],
    content: `Las plataformas de crowdfunding (financiamiento colectivo) deben inscribirse en el Registro PSBI de la CMF y cumplir requisitos de capital mínimo, gobierno corporativo, gestión de conflictos de interés, y deber fiduciario hacia inversionistas. Topes anuales: persona natural no calificada hasta UF 250 invertidas anualmente, hasta UF 500 si declara ingresos sobre UF 1.000. Los emisores deben publicar información estandarizada antes de captar fondos.`,
  },
  {
    module: 'open_finance',
    regulatoryBody: 'CMF',
    title: 'Ley 21.521 Open Finance — Portabilidad de datos financieros',
    lawReference: 'Ley 21.521 Título III',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1192828',
    tags: ['open_finance', 'portabilidad', 'datos'],
    content: `Open Finance Chile establece la obligación de instituciones financieras de compartir los datos del cliente con terceros autorizados (TPP), previo consentimiento expreso del cliente. Permite portabilidad de información financiera entre proveedores. La CMF dicta normas técnicas (NCG) sobre estándares de seguridad e interoperabilidad. El cliente puede revocar el consentimiento en cualquier momento sin costo. Los TPP deben estar inscritos en el Registro PSBI.`,
  },
  {
    module: 'ncg_502_cmf',
    regulatoryBody: 'CMF',
    title: 'NCG 502 CMF — Normas de gobierno corporativo Fintech',
    lawReference: 'NCG 502 CMF',
    sourceUrl: 'https://www.cmfchile.cl/portal/principal/613/w3-propertyvalue-18564.html',
    tags: ['ncg_502', 'gobierno_corporativo', 'cmf'],
    content: `La Norma de Carácter General 502 de la CMF detalla obligaciones operativas para entidades inscritas en el Registro PSBI: estructura de gobierno (directorio, gerente general, oficial de cumplimiento), políticas de gestión de riesgos (operacional, ciberseguridad, lavado de activos), reportes regulatorios trimestrales y anuales, capital mínimo según servicio (UF 5.000 a UF 25.000), póliza de responsabilidad civil profesional. Incumplimientos sancionables con multa hasta UF 15.000 o suspensión del registro.`,
  },

  // ═══════════════ LEY 21.713 — REFORMA TRIBUTARIA 2024 ═══════════════
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
    module: 'ley_21713_tributaria',
    regulatoryBody: 'SII',
    title: 'Ley 21.713 — Trazabilidad bancaria y secreto bancario',
    lawReference: 'Ley 21.713 (modifica Art. 62 CT)',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208416',
    tags: ['secreto_bancario', 'trazabilidad', 'sii'],
    content: `La Ley 21.713 modifica el Art. 62 del Código Tributario reforzando la facultad del SII para acceder a información bancaria con autorización judicial expedita. Las instituciones financieras deben reportar al SII transferencias electrónicas sobre 50 UTM mensuales acumuladas por persona, y operaciones inusuales según parámetros definidos por circular. El contribuyente conserva el derecho a oponerse judicialmente al acceso, pero los plazos se acortaron de 60 a 30 días.`,
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
    title: 'Pro-Pyme Transparente — Régimen 14 D N°8',
    lawReference: 'Art. 14 letra D N°8 LIR',
    sourceUrl: 'https://www.sii.cl/destacados/regimen_propyme/',
    tags: ['propyme_transparente', 'regimen_tributario', 'persona_natural'],
    content: `El régimen Pro-Pyme Transparente (Art. 14 D N°8 LIR) aplica a empresas con socios SOLO personas naturales con domicilio en Chile y promedio de ingresos de los últimos 3 ejercicios ≤ 75.000 UF. La empresa NO paga Primera Categoría: la utilidad atribuye directamente a los socios, quienes la incluyen en su renta personal en F22. Ventaja: simplicidad y evita doble tributación. Desventaja: si los socios están en tramos altos del Global Complementario, puede ser más caro que el régimen general 14 D N°3.`,
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
  {
    module: 'lir_propyme',
    regulatoryBody: 'SII',
    title: 'Honorarios — Retención 13.75% año 2026 y operación renta',
    lawReference: 'Art. 84 LIR + Ley 21.133',
    sourceUrl: 'https://www.sii.cl/servicios_online/1041-1043.html',
    tags: ['honorarios', 'retencion', 'segunda_categoria'],
    content: `Los profesionales independientes (Segunda Categoría N°2) emiten boletas de honorarios electrónicas en sii.cl. La retención obligatoria por el pagador (empresa) sube progresivamente: 2024=13%, 2025=13.5%, 2026=13.75%, 2027=14%, llegando a 17% en 2028. Si emite honorarios sin pagador retenedor (persona natural a persona natural), debe pagar PPM mensual (F29) por el mismo porcentaje. En la Operación Renta (F22) se reconoce la retención y se calcula impuesto Global Complementario; suelen generarse devoluciones si los retenidos superan al impuesto final.`,
  },
  {
    module: 'lir_propyme',
    regulatoryBody: 'SII',
    title: 'IVA — Plazos y postergación Pro-Pyme',
    lawReference: 'DL 825 IVA + Art. 14 D LIR',
    sourceUrl: 'https://www.sii.cl/destacados/iva/',
    tags: ['iva', 'f29', 'pyme'],
    content: `El IVA mensual (19%) se declara y paga vía F29 hasta el día 12 del mes siguiente al período (extendible al 20 si se paga vía PEC, vía electrónica o si la empresa es Pro-Pyme). Las empresas Pro-Pyme (14 D N°3) pueden postergar el IVA hasta 2 meses adicionales sin intereses. Los emisores de facturas y boletas electrónicas tienen acceso al Registro de Compras y Ventas en sii.cl, donde se proponen las declaraciones. Atrasos: multa 10% del impuesto adeudado + 1.5% mensual de intereses + reajuste IPC.`,
  },
  {
    module: 'tributacion_cripto',
    regulatoryBody: 'SII',
    title: 'Tributación de criptoactivos — Oficio SII y reforma 2024',
    lawReference: 'Oficio SII N°963/2018 + Ley 21.713',
    sourceUrl: 'https://www.sii.cl',
    tags: ['cripto', 'bitcoin', 'sii'],
    content: `El SII considera las criptomonedas como "activos digitales" tributables. Las ganancias por compra-venta están afectas a Impuesto Global Complementario (persona natural) o Primera Categoría (empresa). Se determinan por diferencia entre valor de venta y costo de adquisición, en pesos chilenos a la fecha de cada operación. El contribuyente debe llevar registro detallado de cada transacción. La Ley 21.713 amplió las facultades del SII para acceder a información de exchanges nacionales y obligó a reportar tenencias sobre montos definidos por circular.`,
  },

  // ═══════════════ LEY 21.719 — DATOS PERSONALES ═══════════════
  {
    module: 'ley_21719_datos',
    regulatoryBody: 'BCN',
    title: 'Ley 21.719 — Derechos ARCOPOL',
    lawReference: 'Ley 21.719 Art. 4°',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208091',
    tags: ['arco', 'datos_personales', 'derechos'],
    content: `La Ley 21.719 (publicada diciembre 2024, vigencia diferida) moderniza la protección de datos personales en Chile. Establece derechos ARCOPOL del titular: Acceso, Rectificación, Cancelación, Oposición, Portabilidad, Bloqueo y Limitación. Se crea la Agencia de Protección de Datos Personales como autoridad de control. Multas hasta 20.000 UTM o 4% facturación anual. Obligación de delegado de protección de datos para tratamientos masivos.`,
  },
  {
    module: 'ley_21719_datos',
    regulatoryBody: 'BCN',
    title: 'Ley 21.719 — Cómo ejercer derechos ARCO',
    lawReference: 'Ley 21.719 Art. 12-18',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208091',
    tags: ['arco', 'solicitud', 'datos'],
    content: `Para ejercer derechos ARCO ante una empresa o entidad pública: (1) Enviar solicitud escrita al delegado de protección de datos (DPO) con copia de cédula. La empresa debe publicar el contacto del DPO. (2) La empresa tiene 20 días hábiles para responder, prorrogables 10 días más justificadamente. (3) Si no responde o rechaza injustificadamente, reclamar ante la Agencia de Protección de Datos Personales (entrada en vigencia escalonada hasta 2026). (4) Procedimiento administrativo sancionatorio + indemnización civil son acumulables.`,
  },
  {
    module: 'ley_21719_datos',
    regulatoryBody: 'BCN',
    title: 'Tratamiento de datos sensibles y consentimiento',
    lawReference: 'Ley 21.719 Art. 8 + 13',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1208091',
    tags: ['datos_sensibles', 'consentimiento', 'arco'],
    content: `Datos sensibles (salud, origen étnico, opinión política, religión, vida sexual, datos biométricos, datos de NNA): requieren consentimiento expreso, libre, informado y específico. NO se admite consentimiento tácito ni "letra chica". El consentimiento es revocable en cualquier momento sin perjuicio para el titular. Las empresas deben implementar medidas de seguridad reforzadas (encriptación, logs de acceso) y notificar brechas de seguridad a la Agencia y a los titulares afectados dentro de 72 horas.`,
  },

  // ═══════════════ LEY 21.663 — CIBERSEGURIDAD ═══════════════
  {
    module: 'ley_21663_ciberseguridad',
    regulatoryBody: 'CSIRT',
    title: 'Ley 21.663 — Marco de Ciberseguridad',
    lawReference: 'Ley 21.663',
    sourceUrl: 'https://www.bcn.cl/leychile/navegar?idNorma=1204357',
    tags: ['ciberseguridad', 'anci', 'csirt'],
    content: `La Ley 21.663 establece el marco regulatorio de ciberseguridad en Chile. Crea la Agencia Nacional de Ciberseguridad (ANCI). Define servicios esenciales con obligaciones reforzadas: bancos, telecom, energía, agua, salud, transporte, infraestructura digital crítica. Obligación de reportar incidentes a ANCI/CSIRT en plazos estrictos (3h notificación inicial, 72h informe completo). Sanciones hasta 40.000 UTM por incumplimiento.`,
  },
  {
    module: 'ley_21663_ciberseguridad',
    regulatoryBody: 'CSIRT',
    title: 'Reporte de incidentes ANCI — Plazos y procedimiento',
    lawReference: 'Ley 21.663 Art. 9°',
    sourceUrl: 'https://www.csirt.gob.cl',
    tags: ['incidente', 'anci', 'reporte'],
    content: `Las entidades calificadas como Operadores de Importancia Vital (OIV) y Operadores de Servicios Esenciales (OSE) deben reportar a ANCI/CSIRT: (1) Notificación inicial dentro de 3 horas desde la detección del incidente con impacto significativo; (2) Informe intermedio a las 72 horas con análisis de causas, alcance, medidas tomadas; (3) Informe final dentro de 15 días con plan de remediación. La omisión o reporte tardío es infracción gravísima sancionable hasta 40.000 UTM. La empresa debe mantener registro auditable de incidentes mínimo 5 años.`,
  },

  // ═══════════════ FOGAPE — GARANTÍA ESTATAL PYME ═══════════════
  {
    module: 'lir_propyme',
    regulatoryBody: 'FOGAPE',
    title: 'FOGAPE — Cómo postular a garantía estatal',
    lawReference: 'Ley 20.318 + DFL 3 reglamento',
    sourceUrl: 'https://www.fogape.cl',
    tags: ['fogape', 'garantia', 'pyme'],
    content: `FOGAPE (Fondo de Garantía para Pequeños y Medianos Empresarios) NO entrega créditos directos: garantiza al banco hasta el 80% del crédito otorgado a la pyme. Requisitos: ser persona natural o jurídica con ventas anuales hasta UF 100.000 (mype) o UF 600.000 (pyme), inicio de actividades en SII, sin protestos vigentes ni morosidad bancaria. Postulación: directamente con banco adscrito (Estado, BCI, Santander, Itaú, Scotiabank, Falabella, Security, Internacional, Consorcio, BancoEstado Microempresas, etc.). El banco evalúa, FOGAPE garantiza si cumple. Línea Apoyo y Reactivación: para refinanciamiento.`,
  },

  // ═══════════════ SERCOTEC — SUBSIDIOS PYME ═══════════════
  {
    module: 'lir_propyme',
    regulatoryBody: 'SERCOTEC',
    title: 'SERCOTEC — Capital Semilla y Capital Abeja',
    lawReference: 'Ley 18.910 SERCOTEC',
    sourceUrl: 'https://www.sercotec.cl',
    tags: ['sercotec', 'capital_semilla', 'subsidio'],
    content: `SERCOTEC entrega subsidios concursables NO reembolsables a microempresas y emprendedores: (1) Capital Semilla Emprende (hasta $3.5M para nuevos negocios, exige plan de negocios y RUT empresa); (2) Capital Abeja (mismo monto, exclusivo para mujeres emprendedoras); (3) Crece (hasta $6M para microempresas con ventas demostrables); (4) Almacenes de Chile (modernización); (5) Digitaliza tu Almacén; (6) Programas regionales. Postulación: registro en sercotec.cl con ClaveÚnica + iniciar actividades en SII. Convocatorias entre marzo-noviembre. Selección por puntaje según rúbrica publicada.`,
  },

  // ═══════════════ INDICADORES ECONÓMICOS ═══════════════
  {
    module: 'ley_19496_sernac',
    regulatoryBody: 'BCN',
    title: 'UF UTM IPC — Cómo se calculan y consultan',
    lawReference: 'DL 1.123 + Ley 18.840',
    sourceUrl: 'https://www.sii.cl/valores_y_fechas/uf/uf2026.htm',
    tags: ['uf', 'utm', 'ipc', 'indicadores'],
    content: `La UF (Unidad de Fomento) se reajusta diariamente entre el día 10 y el 9 del mes siguiente, según la variación del IPC publicada por el INE. Calculada y publicada por el Banco Central. La UTM (Unidad Tributaria Mensual) se reajusta una vez al mes con la variación del IPC del mes anterior, publicada por el SII. La UTA (Unidad Tributaria Anual) es 12 UTM. El IPC es publicado por el INE el día 8 de cada mes. Consultas oficiales: bcentral.cl, sii.cl/valores_y_fechas, ine.cl. APIs de consulta: mindicador.cl (no oficial pero confiable, usa fuentes oficiales).`,
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

  // Esperar a que esté ready (max 30s)
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

// Embedding batch en chunks de 96 (límite Pinecone Inference)
async function embedBatchAll(apiKey, texts, inputType = 'passage') {
  const BATCH_SIZE = 96;
  const allEmbeddings = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await pineconeFetch(apiKey, `${PINECONE_API}/embed`, {
      method: 'POST',
      body: JSON.stringify({
        model: EMBED_MODEL,
        inputs: batch.map(t => ({ text: t.substring(0, 4000) })),
        parameters: { input_type: inputType, truncate: 'END' },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Pinecone embed batch ${i} failed: ${res.status} ${err}`);
    }
    const data = await res.json();
    for (const d of data.data) allEmbeddings.push(d.values);
  }
  return allEmbeddings;
}

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

// Borra TODO el namespace (idempotente: si está vacío no falla)
async function deleteAllVectors(apiKey, host) {
  const res = await pineconeFetch(apiKey, `https://${host}/vectors/delete`, {
    method: 'POST',
    body: JSON.stringify({ namespace: NAMESPACE, deleteAll: true }),
  });
  // 200 ok, 404 si namespace vacío — ambos son aceptables
  if (!res.ok && res.status !== 404) {
    const err = await res.text();
    console.warn(`Pinecone deleteAll warning: ${res.status} ${err}`);
  }
  return true;
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
    const { force = false } = await req.json().catch(() => ({}));

    // 1. Asegurar que el índice existe
    const { host, created } = await ensureIndex(apiKey);
    console.log(`Índice ${INDEX_NAME} ${created ? 'CREADO' : 'ya existía'}, host: ${host}`);

    // 1.5. Si force=true, limpiar namespace para garantizar idempotencia
    // (evita vectores huérfanos cuando cambian IDs entre versiones del corpus)
    let purged = false;
    if (force && !created) {
      await deleteAllVectors(apiKey, host);
      // Pequeña espera para que Pinecone propague la eliminación
      await new Promise(r => setTimeout(r, 1500));
      purged = true;
      console.log('Namespace purgado antes de re-seed');
    }

    // 2. Generar embeddings batch (auto-chunked en 96)
    const texts = CORPUS.map(c => `${c.title}\n${c.lawReference}\n${c.content}`);
    const embeddings = await embedBatchAll(apiKey, texts, 'passage');

    if (embeddings.length !== CORPUS.length) {
      throw new Error(`Mismatch embeddings: ${embeddings.length} vs ${CORPUS.length}`);
    }

    // 3. Construir vectores con metadata (IDs ASCII-only)
    const vectors = CORPUS.map((chunk, i) => ({
      id: `${chunk.module}_${i}`.replace(/[^\x00-\x7F]/g, '').replace(/\s+/g, '_'),
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

    // 5. Distribución por módulo (para diagnóstico)
    const distributionByModule = {};
    const distributionByOrg = {};
    for (const c of CORPUS) {
      distributionByModule[c.module] = (distributionByModule[c.module] || 0) + 1;
      distributionByOrg[c.regulatoryBody] = (distributionByOrg[c.regulatoryBody] || 0) + 1;
    }

    return Response.json({
      success: true,
      provider: 'pinecone',
      indexName: INDEX_NAME,
      indexHost: host,
      indexCreated: created,
      namespace: NAMESPACE,
      embedModel: EMBED_MODEL,
      dimension: EMBED_DIM,
      upserted,
      total: CORPUS.length,
      distributionByModule,
      distributionByOrg,
      latencyMs: Date.now() - startTime,
    });
  } catch (error) {
    console.error('seedKnowledgeBase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});