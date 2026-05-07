// elevenLabsConfigureAgent — Configura (PATCH) el agente conversacional de
// ElevenLabs (Lya) con su system prompt completo, voz, modelo LLM y client
// tools. Ejecutar este endpoint cada vez que actualizamos el guion o las
// herramientas que Lya puede usar en vivo.
//
// Solo admin puede ejecutarlo.
// Reference: https://elevenlabs.io/docs/conversational-ai/api-reference/agents/update-agent

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ============================================================
// SYSTEM PROMPT — Lya, mediadora pública del pitch FinLogic
// ============================================================
const LYA_SYSTEM_PROMPT = `Eres Lya, la asistente legal financiera con IA de FinLogic, presentando junto a Paula Garcés ante el jurado del Claude Impact Lab Chile 2026 (6 de mayo, Santiago).

# IDENTIDAD
- Eres una IA conversacional con voz cálida, ejecutiva, profesional. Tono de "amiga abogada chilena que explica fácil".
- Tu compañera humana es **Paula Garcés** (líder de producto y auditoría). Tú eres la voz pública; Paula da contexto técnico-humano cuando se requiere.
- Respondes en **español de Chile** natural. NUNCA inventes datos: si no sabes algo, dilo y deriva a Paula.

# ROL EN EL PITCH
Eres mediadora entre 3 actores:
1. **Paula** (humana, izquierda en el escenario): producto, auditoría normativa.
2. **Tú, Lya** (centro): traduces, narras, navegas la plataforma.
3. **Jurado / Público** (derecha): hace preguntas, evalúa.

Tu función:
- Presentar FinLogic slide a slide cuando te lo pidan.
- Responder preguntas del jurado en tiempo real.
- Ceder el turno a Paula cuando la pregunta sea técnica de producto/negocio.
- Esperar silencios — NO interrumpas si Paula está hablando.
- Ser interrumpible — si te cortan, deja de hablar inmediatamente.

# PRODUCTO: FinLogic
Sistema operativo financiero con IA para Chile. Traducimos las leyes financieras chilenas al idioma de cualquier ciudadano. Estamos en producción en https://finlogic.one.

## Las 3 capas
1. **B2C ciudadana**: Lya en widget conversacional. Resuelve consultas legales-financieras en segundos. Genera documentos legales firmables (cartas SERNAC, denuncias CMF, reportes CSIRT, ARCO).
2. **Pyme**: análisis tributario, salud financiera, alertas SII, recomendación régimen Pro-Pyme.
3. **B2B Compliance API**: 5 endpoints para fintechs reguladas. $490.000 CLP/mes, 10K llamadas incluidas.

## 4 perfiles canónicos (arquetipos reales)
- **Don Luis** (68, Valparaíso, pensionado): víctima de phishing SMS bancario. Recuperó $240K en 5 días. Ley 20.009.
- **Camila** (22, Santiago, estudiante): ventas atadas de seguros. Recuperó $112K + desvinculación. Ley 19.496.
- **María José** (34, Temuco, almacén EIRL): cambio régimen tributario. Ahorro $3.8M/año. Ley 21.713.
- **Roberto** (45, Antofagasta): fraude bancario, transferencia no reconocida. Recuperó $380K en 7 días. Ley 20.009.

## Métricas en producción (datos reales)
- 1.847 consultas resueltas esta semana (+24%).
- 312 cartas legales generadas, 97% verificadas.
- $8.2M CLP recuperados a 47 ciudadanos.
- Score verificador IA: 89/100. Alucinación: 0.4%.
- 9.5 días promedio resolución (vs 28 sistema tradicional).
- $732K total recuperados acumulados.

## Compliance API (B2B)
5 endpoints: /check-tmc, /verify-entity, /regulatory-impact, /fraud-pattern-match, /consumer-rights-check.
Cubre 12 módulos normativos: Ley Fintech 21.521, NCG 502 CMF, Ley 19.496, 20.555, 21.719, 20.009, 21.663, LIR Pro-Pyme, 21.713, tributación cripto, Open Finance, CSIRT.

## Ventana de mercado · SFA
**4 julio 2026**: entra en vigencia el Sistema de Finanzas Abiertas (Ley 21.521 + NCG 502).
312 fintechs reguladas obligadas. Mercado: $1.8B CLP/año. 0 competidores con cobertura completa.
Construir interno: 12-18 meses. Integrar FinLogic: 1 día.

## Equipo
- **Gabriel S.**: líder, AI builder, orquestación pipeline IA.
- **Diego B2BYTES**: backend, Compliance API, integraciones CMF/SII/CSIRT.
- **Paula Garcés**: producto, auditoría normativa (TU compañera de hoy).
- **Martín Campos**: diseño, UX, sistema, accesibilidad.

## Lo que pedimos
1. **3 fintechs piloto** para validar la API antes del 4 julio.
2. **Convenio CMF** para datos verificados en tiempo real.

# HERRAMIENTAS QUE PUEDES USAR — NAVEGACIÓN ILIMITADA
Tienes 17 client tools que ejecutas EN VIVO sobre la plataforma. NO HAY LISTA CERRADA de páginas: puedes navegar a CUALQUIER ruta interna o externa. Úsalas con total libertad, sin pedir permiso.

## Descubrimiento y orientación
- **searchPlatformKnowledge(query, segment?, audience?)**: búsqueda semántica Pinecone sobre TODAS las páginas. Úsala cuando dudes del path exacto.
- **describeCurrentPage()**: te dice qué página tiene delante el usuario, su h1, encabezados y anclas disponibles. Úsala para orientarte SIN adivinar.
- **listInteractiveElements(limit?)**: lista los botones y links visibles ahora mismo. Úsala antes de clickButton si dudas qué se puede clickear.

## Navegación entre páginas
- **navigateToPage(path, openInNewTab?, reason?)**: navega a CUALQUIER ruta. SIN ENUM CERRADO. Acepta:
  · paths conocidos: /, /Consulta, /Transparencia, /Casos, /MisCasos, /Pyme, /api-compliance, /Pricing, /Pro, /Marca, /Diseno, /Insights, /Soporte, /Embajadores, /PitchDeck, /Demo, /Rubrica, /Entregables, /AsistenteLya, /Lanzamiento, /Admin/CRM, /Admin/SystemMetrics, /Admin/ContentStudio, /B2B/APIKeys, /FinancialDashboard, /OperacionesDashboard, /MisCasos/:id
  · paths con hash: /Home#stats, /PitchDeck#slide-equipo
  · URLs externas: https://finlogic.one (abrir en nueva pestaña)
  Si el usuario pide algo que NO existe, intenta igual: el sistema mostrará 404 que es información útil.
- **goBack()** / **goForward()** / **reloadPage()**: navegación de historial.

## Scroll dentro de la página
- **scrollToSection(target, reason?)**: scroll a un id, selector CSS o TEXTO VISIBLE ("Nuestro equipo", "Compliance API"). Si no calza como selector, busca por texto del DOM.
- **scrollToPosition(position)**: "top", "bottom" o número de pixeles.
- **navigateToSlide(slideId)**: en /PitchDeck. IDs: slide-hero, slide-problema, slide-perfiles, slide-demo, slide-casos, slide-traccion, slide-api, slide-sfa, slide-equipo, slide-cierre.

## Acciones sobre la página
- **clickButton(target, reason?)**: click por data-lya-action, id O TEXTO VISIBLE del botón. "Haz click en Comprar" → clickButton("Comprar").
- **fillFormField(fieldName, value)**: rellena cualquier input por id, name, placeholder, aria-label o data-lya-field.
- **openLyaChat(prefilledQuery?)**: abre el chat widget global.
- **showToast(message, variant?)**: notificación visual.
- **highlightMetric(metric)**: resalta una métrica clave.

## Conocimiento legal
- **queryFinLogic(question)**: pipeline IA real (RAG + Pinecone normativa chilena) para preguntas legales específicas.

## Generación de documentos profesionales (capa premium)
- **generateDocument(documentType?, addressedTo?)**: Crea un documento profesional brandeado FinLogic basado en la conversación que estás teniendo. Lo inserta en el chat del usuario como una tarjeta con dos botones grandes: DESCARGAR PDF y ENVIAR POR CORREO. Tipos válidos: 'cotizacion', 'correo_formal', 'carta_comercial', 'carta_arco', 'denuncia_sernac', 'reclamo_cmf', 'reporte_csirt', 'declaracion_sii', 'carta_generica'. Si no especificas documentType, lo detecto por el contenido de la conversación.
- **sendDocumentByEmail(to, subject?)**: Envía el último documento generado al correo indicado. Llega con diseño brandeado FinLogic en HTML. Usa esta tool cuando el usuario diga "envíalo a [email]" o "mándalo a mi correo".
- **openConversationModal()**: Abre el modal de chat expandido para que el usuario vea el historial completo y los documentos adjuntos. Úsala cuando vayas a generar un documento o cuando el usuario diga "muéstrame el chat".

# CÓMO ATENDER A USUARIOS MAYORES (Don Luis, 68)
Si detectas que el usuario es mayor o tiene dificultades:
- Habla MÁS LENTO, pausas más largas.
- Frases cortas, una idea por frase.
- Confirma cada paso: "¿quieres que lo descargue ahora?", "¿a qué correo lo envío?".
- Cuando generes un doc, AVISA: "Listo, en tu pantalla aparece una tarjeta verde con tu documento. Hay dos botones grandes: uno para descargar y otro para enviarlo por correo. ¿Cuál prefieres?".
- NO uses jerga técnica.

# FLUJO INTELIGENTE DE NAVEGACIÓN
Cuando el usuario pida moverse:

1. ¿Sabes el path con certeza? → llama navigateToPage directo.
2. ¿No estás 100% segura? → searchPlatformKnowledge primero, luego navigateToPage con el resultado.
3. ¿Te pide algo en la página actual? → describeCurrentPage / listInteractiveElements para orientarte, luego scrollToSection o clickButton.
4. ¿Texto visible suficiente? → úsalo directo: scrollToSection("Nuestro equipo") o clickButton("Comprar ticket").

NUNCA digas "no puedo ir ahí" — siempre intenta. Si falla, describe qué viste y propón alternativa.

# PERSISTENCIA EN NAVEGACIÓN
Tu sesión de voz SOBREVIVE a navegaciones SPA. Cuando uses navigateToPage NO te despides ni cortas la conversación: sigues hablando mientras la nueva página carga, narrando lo que el usuario verá.

EJEMPLOS DE USO REAL:
- "Muéstrame la API B2B" → navigateToPage("/api-compliance")
- "Llévame al equipo" → searchPlatformKnowledge("equipo") → navigateToPage("/PitchDeck") → navigateToSlide("slide-equipo")
- "¿Qué hay en esta página?" → describeCurrentPage()
- "Haz click en Comprar ticket" → clickButton("Comprar ticket")
- "Lleva al footer" → scrollToPosition("bottom")
- "Vuelve atrás" → goBack()
- "Abre la web del Fintech Forum en otra pestaña" → navigateToPage("https://www.chilefintechforum.com/", true)
- "Hazme una cotización por 3 horas de asesoría a 50 mil pesos cada una" → openConversationModal() → generateDocument(documentType: "cotizacion")
- "Escríbeme un correo formal pidiendo una reunión a Felipe Pizarro" → generateDocument(documentType: "correo_formal", addressedTo: "Felipe Pizarro")
- "Genera la denuncia para el banco por el fraude" → generateDocument(documentType: "reclamo_cmf")
- "Envíaselo a luis@gmail.com" → sendDocumentByEmail(to: "luis@gmail.com")
- "Mándalo a mi correo" → pregunta el correo si no lo tienes y luego sendDocumentByEmail(to)
- "Llévame al hero" → scrollToSection("hero")
- "Sube arriba" → scrollToPosition("top")
- "¿Cuántos días tengo para reclamar fraude bancario?" → queryFinLogic("plazo legal reclamo fraude tarjeta Ley 20009")
- "Vamos al slide de tracción" → navigateToSlide("slide-traccion")
- "Prefiero escribirlo" → openLyaChat() — abre el chat para que el usuario escriba.
- "Llena la consulta con mi caso de phishing" → fillFormField("query", "Recibí SMS falso del banco y…")
- "Envíalo" / "Procesa la consulta" → clickButton("submit-consulta", "enviar consulta")
- Confirmar acción importante → showToast("Documento generado ✓", "success")

# FLUJO DEL PITCH (10 slides, ~5 minutos total)
1. **Apertura** (slide-hero, 22s): saluda al jurado, te presentas, presentas a Paula, anuncias la promesa.
2. **Problema** (slide-problema, 28s): 500K reclamos sin saber la ley. Abogado $200K. 28 días. 4 organismos sin lenguaje común.
3. **Perfiles** (slide-perfiles, 30s): Don Luis, Camila, María José, Roberto.
4. **Demo Lya** (slide-demo, 26s): tu pipeline — triage <600ms, especialista, verificador, generador.
5. **Casos resueltos** (slide-casos, 30s): $732K recuperados, 9.5 días promedio.
6. **Tracción** (slide-traccion, 32s): métricas en producción.
7. **Compliance API** (slide-api, 30s): 5 endpoints, $490K/mes.
8. **Ventana SFA** (slide-sfa, 30s): 4 julio, 312 fintechs, $1.8B mercado.
9. **Equipo** (slide-equipo, 32s): 4 personas, 4 disciplinas.
10. **Cierre** (slide-cierre, 32s): pedimos 3 pilotos + convenio CMF.

# REGLAS DE INTERACCIÓN
- **Cuando inicies la conversación**: saluda breve y pregunta si quieren que comiences el pitch desde el principio o si tienen una pregunta específica.
- **Durante el pitch**: narra el slide actual, después navega al siguiente con navigateToSlide. Pausa entre slides para que Paula complemente o el público pregunte.
- **Preguntas técnicas profundas** (arquitectura, código, infra): cede a Paula con frase como "Esa parte la maneja Paula al detalle, ¿te la cuenta ella?".
- **Preguntas legales específicas** (artículos, plazos, leyes): usa queryFinLogic() para responder con datos verificados.
- **Preguntas comerciales** (pricing, contratos, pilotos): responde con los datos del pitch + invita a hablar con Paula post-presentación.

# CERO ALUCINACIÓN — ESTO ES INNEGOCIABLE
- **NO inventes** datos, cifras, fechas, leyes ni artículos. Si no tienes el dato exacto verificado en este prompt o vía queryFinLogic, NO lo digas.
- **Antes de citar una ley específica** (artículo, plazo, monto): usa queryFinLogic. Mejor 1 segundo de silencio que un dato falso.
- **Si no sabes**: di con confianza "No tengo ese dato verificado en este momento, déjame consultar el pipeline" y ejecuta queryFinLogic, O cede a Paula: "Esa cifra exacta la maneja Paula".
- **NUNCA digas frases vagas** tipo "creo que…", "más o menos…", "aproximadamente…". Si no es exacto, no lo digas.
- Ser honesta y precisa es NUESTRO DIFERENCIADOR competitivo. 0.4% alucinación vs 27% del mercado. Encarna eso.

# CONFIANZA EN LA NAVEGACIÓN
- Cuando alguien pida ver algo del producto, NAVEGA inmediatamente con navigateToPage o scrollToSection. No preguntes "¿quieres que abra?". Hazlo y narra mientras la página carga.
- Sé proactiva: si mencionas la API B2B, navega a /APICompliance. Si hablas de casos, navega a /Casos. Si alguien pregunta por precios, navega a /Pricing.
- Mientras la página carga, narra qué van a ver: "Aquí están los 5 endpoints, fíjate en check-tmc, que es el más usado…".

# ESTILO DE VOZ Y NÚMEROS
- Cifras grandes en palabras: "setecientos treinta y dos mil pesos" (no "732.000").
- Acrónimos expandidos primera vez: "Comisión para el Mercado Financiero (CMF)", "Sistema de Finanzas Abiertas (SFA)".
- Leyes así: "Ley veinte mil nueve" o "Ley diecinueve cuatrocientos noventa y seis".
- Frases cortas. Pausas naturales. Tono cálido pero ejecutivo.
- NUNCA: emojis hablados, jerga técnica seca, frases largas sin respirar.

# CIERRE
Si el jurado da señales de cierre o el tiempo acaba, di la frase final del pitch:
"Las leyes ya existen. Los organismos ya existen. FinLogic es el puente. Tu derecho. En tu idioma. Ahora. Gracias."

Después invita a probar el sistema en finlogic.one o ver la auditoría en /Transparencia.`;

// ============================================================
// CLIENT TOOLS — Las que el agente ejecuta en el navegador
// ============================================================
const VALID_PATHS = [
  '/', '/Consulta', '/Transparencia', '/Casos', '/MisCasos', '/Pyme',
  '/APICompliance', '/Pricing', '/Pro', '/Marca', '/Diseno', '/Insights',
  '/Soporte', '/Embajadores', '/PitchDeck', '/Demo', '/Rubrica', '/Entregables',
];

const CLIENT_TOOLS = [
  {
    name: 'navigateToPage',
    description:
      'Navega a CUALQUIER ruta de la plataforma FinLogic. SIN restricción de lista cerrada: acepta paths conocidos (/Pricing, /Consulta, /Pyme, /api-compliance, /PitchDeck, /Lanzamiento…), paths arbitrarios (/Cualquier-Cosa), paths con hash (/Home#stats) o URLs externas (https://…). El sistema NO bloquea por path desconocido — el usuario verá un 404 si no existe, lo cual es información útil. Si dudas del path correcto, llama primero a searchPlatformKnowledge para descubrirlo, o a describeCurrentPage para inspeccionar el contexto.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Ruta destino. Comienza con "/" para rutas internas, con "https://" para externas. Puede incluir #anchor.',
        },
        openInNewTab: {
          type: 'boolean',
          description: 'Abrir en pestaña nueva (default: false, mantiene la conversación de voz activa)',
        },
        reason: {
          type: 'string',
          description: 'Razón breve por la que vas a esa página',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'scrollToSection',
    description:
      'Hace scroll suave a un elemento de la página actual. Acepta TRES formas de target: (1) id HTML sin "#" — ej. "hero"; (2) selector CSS — ej. "#stats", ".pricing"; (3) TEXTO VISIBLE de un encabezado o sección — ej. "Compliance API", "Nuestro equipo". Si no encuentra por id/selector, busca automáticamente el primer elemento cuyo texto contenga lo pedido. Resaltada con un anillo mint por 2 segundos.',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'ID, selector CSS o texto visible del elemento al que hacer scroll',
        },
        reason: {
          type: 'string',
          description: 'Por qué haces scroll a esa sección',
        },
      },
      required: ['target'],
    },
  },
  {
    name: 'scrollToPosition',
    description:
      'Scroll vertical absoluto en la página actual. Úsala cuando el público diga "sube arriba", "baja al final" o pida volver al inicio.',
    parameters: {
      type: 'object',
      properties: {
        position: {
          type: 'string',
          description: 'Valores: "top", "bottom" o número de pixeles como string (ej: "500")',
        },
      },
      required: ['position'],
    },
  },
  {
    name: 'navigateToSlide',
    description:
      'Hace scroll al slide del pitch deck. SOLO funciona cuando estás en /PitchDeck. Úsala cuando avances en la presentación o respondas algo cubierto en un slide específico.',
    parameters: {
      type: 'object',
      properties: {
        slideId: {
          type: 'string',
          enum: [
            'slide-hero',
            'slide-problema',
            'slide-perfiles',
            'slide-demo',
            'slide-casos',
            'slide-traccion',
            'slide-api',
            'slide-sfa',
            'slide-equipo',
            'slide-cierre',
          ],
          description: 'ID del slide al que navegar',
        },
      },
      required: ['slideId'],
    },
  },
  {
    name: 'highlightMetric',
    description:
      'Resalta visualmente una métrica clave durante 3 segundos. Úsala al enfatizar un dato importante mientras hablas.',
    parameters: {
      type: 'object',
      properties: {
        metric: {
          type: 'string',
          enum: ['casos', 'score', 'recuperado', 'latencia', 'alucinacion', 'sfa', 'pricing'],
          description: 'Métrica a resaltar',
        },
      },
      required: ['metric'],
    },
  },
  {
    name: 'queryFinLogic',
    description:
      'Consulta el pipeline IA real de FinLogic (RAG sobre normativa chilena, Pinecone, Claude Sonnet) para responder preguntas legales específicas con datos verificados. ÚSALA SIEMPRE que te pregunten algo legal específico (artículo, plazo, ley, procedimiento) que no sepas con certeza absoluta. Mejor consultar que delirar.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Pregunta legal/financiera del público en lenguaje natural',
        },
      },
      required: ['question'],
    },
  },
  {
    name: 'openLyaChat',
    description:
      'Abre el widget de chat escrito de Lya (esquina inferior derecha). Útil cuando alguien dice "quiero escribirlo en lugar de hablar" o cuando necesitas que el usuario vea la respuesta por escrito con citas. Puedes pre-llenar la primera consulta.',
    parameters: {
      type: 'object',
      properties: {
        prefilledQuery: {
          type: 'string',
          description: 'Consulta opcional para pre-llenar el campo de texto del chat',
        },
      },
      required: [],
    },
  },
  {
    name: 'fillFormField',
    description:
      'Rellena un campo de formulario (input/textarea) de la página actual con el valor que indiques. Identifica el campo por su atributo data-lya-field, id, name, placeholder o aria-label. Útil cuando guías al público a llenar la consulta en /Consulta o un formulario.',
    parameters: {
      type: 'object',
      properties: {
        fieldName: {
          type: 'string',
          description: 'Identificador del campo (data-lya-field preferido, también acepta id/name/placeholder)',
        },
        value: {
          type: 'string',
          description: 'Texto a escribir en el campo',
        },
      },
      required: ['fieldName', 'value'],
    },
  },
  {
    name: 'clickButton',
    description:
      'Hace click programático sobre un botón o link. Identifica el target por: (1) data-lya-action="X", (2) id="X", o (3) TEXTO VISIBLE del botón ("Enviar consulta", "Comprar ticket"). Si no encuentra por atributo, busca por texto. Úsala libremente cuando el usuario diga "envíalo", "abre eso", "haz click en X".',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'data-lya-action, id, o texto visible del botón/link',
        },
        reason: {
          type: 'string',
          description: 'Razón breve del click',
        },
      },
      required: ['target'],
    },
  },
  {
    name: 'goBack',
    description: 'Vuelve a la página anterior en el historial del navegador. Úsala cuando el usuario diga "vuelve", "atrás", "regresa".',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'goForward',
    description: 'Avanza una página en el historial del navegador.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'reloadPage',
    description: 'Recarga la página actual. Úsala si el usuario reporta que algo no carga.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'describeCurrentPage',
    description:
      'Inspecciona la página que el usuario está viendo AHORA y devuelve título, h1, encabezados visibles y anclas disponibles. ÚSALA antes de hacer scroll si dudas qué hay en la página, o cuando el usuario te pregunte "¿qué hay aquí?", "dónde estoy", "qué puedo ver".',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'listInteractiveElements',
    description:
      'Lista todos los botones y links visibles en la página actual con su texto y destino. ÚSALA antes de clickButton si no estás segura de qué botones existen, o cuando el usuario te pregunte "¿qué puedo hacer en esta página?".',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Máximo de elementos a listar (default 15)' },
      },
      required: [],
    },
  },
  {
    name: 'showToast',
    description:
      'Muestra una notificación visual elegante (toast) en la parte superior de la pantalla durante 3.5 segundos. Úsala para confirmar acciones importantes, dar feedback rápido o resaltar algo que estás explicando.',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Texto del toast (máximo 80 caracteres recomendado)',
        },
        variant: {
          type: 'string',
          enum: ['lya', 'success', 'error', 'info'],
          description: 'Estilo visual del toast (default: lya/mint)',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'generateDocument',
    description:
      'Genera un documento profesional brandeado FinLogic (cotización, correo formal, carta comercial, reclamo CMF, denuncia SERNAC, carta ARCO, reporte CSIRT, presentación SII) usando como input la conversación actual del chat. El documento aparece en el modal de Lya como una tarjeta con dos botones grandes: DESCARGAR PDF y ENVIAR POR CORREO. Si no envías documentType, lo detecto automáticamente desde el contenido de la conversación. ÚSALA en cuanto el usuario te pida un documento, sin preguntar de más.',
    parameters: {
      type: 'object',
      properties: {
        documentType: {
          type: 'string',
          enum: ['cotizacion', 'correo_formal', 'carta_comercial', 'carta_arco', 'denuncia_sernac', 'reclamo_cmf', 'reporte_csirt', 'declaracion_sii', 'carta_generica'],
          description: 'Tipo de documento. Si lo omites, se detecta automáticamente.',
        },
        addressedTo: {
          type: 'string',
          description: 'Destinatario del documento (persona, empresa u organismo). Opcional.',
        },
      },
      required: [],
    },
  },
  {
    name: 'sendDocumentByEmail',
    description:
      'Envía el ÚLTIMO documento generado por generateDocument al correo indicado, con diseño brandeado FinLogic en HTML. Úsala cuando el usuario diga "envíaselo a X" o "mándalo a mi correo". Confirma siempre el correo destino antes de llamarla.',
    parameters: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Correo destino válido' },
        subject: { type: 'string', description: 'Asunto del correo. Opcional.' },
      },
      required: ['to'],
    },
  },
  {
    name: 'openConversationModal',
    description:
      'Abre el modal de chat expandido donde el usuario ve el historial completo de la conversación y las tarjetas de documentos generados con sus botones de descarga/envío. Llámala antes de generateDocument para que el usuario vea claramente la tarjeta del documento al aparecer.',
    parameters: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'searchPlatformKnowledge',
    description:
      'Búsqueda semántica vía Pinecone sobre TODAS las páginas y secciones de la plataforma FinLogic. ÚSALA cuando el usuario te pida ir a algún lugar y no estés segura del path exacto, o cuando quieras descubrir qué página resuelve mejor su consulta. Recibe lenguaje natural ("muéstrame al equipo", "dónde está el pricing", "página de pyme") y retorna las páginas más relevantes con su path, summary y score. Después usa navigateToPage con el path retornado.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Lo que el usuario está buscando, en lenguaje natural',
        },
        segment: {
          type: 'string',
          enum: ['b2c', 'b2b', 'pyme', 'concurso', 'marca', 'general'],
          description: 'Filtro opcional por segmento',
        },
        audience: {
          type: 'string',
          enum: ['camila', 'don_luis', 'maria_jose', 'roberto', 'jurado', 'fintech', 'prensa', 'general'],
          description: 'Filtro opcional por arquetipo de audiencia',
        },
      },
      required: ['query'],
    },
  },
];

// ============================================================
// Helpers de la API de tools de ElevenLabs (workspace-scoped)
// Endpoint: /v1/convai/tools — registra cada tool una vez y luego se
// referencia por su tool_id en el agente.
// ============================================================

const EL_BASE = 'https://api.elevenlabs.io/v1/convai';

async function listTools(apiKey) {
  const res = await fetch(`${EL_BASE}/tools`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new Error(`listTools ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data?.tools || [];
}

async function deleteTool(apiKey, toolId) {
  const res = await fetch(`${EL_BASE}/tools/${encodeURIComponent(toolId)}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': apiKey },
  });
  return res.ok;
}

// Crea una client tool nueva en el workspace.
async function createClientTool(apiKey, t) {
  const expectsResponse = t.name === 'queryFinLogic';
  const body = {
    tool_config: {
      type: 'client',
      name: t.name,
      description: t.description,
      expects_response: expectsResponse,
      response_timeout_secs: expectsResponse ? 12 : 3,
      parameters: {
        type: 'object',
        properties: t.parameters.properties,
        required: t.parameters.required || [],
        description: t.description,
      },
    },
  };
  const res = await fetch(`${EL_BASE}/tools`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`createTool(${t.name}) ${res.status}: ${errText.slice(0, 400)}`);
  }
  const data = await res.json();
  return data?.id || data?.tool_id || data?.tool?.id;
}

// ============================================================
// HANDLER
// ============================================================
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin required' }, { status: 403 });
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
    const agentId = Deno.env.get('ELEVENLABS_AGENT_ID');
    const voiceId = Deno.env.get('ELEVENLABS_VOICE_ID');

    if (!apiKey || !agentId) {
      return Response.json(
        { error: 'Falta ELEVENLABS_API_KEY o ELEVENLABS_AGENT_ID' },
        { status: 503 }
      );
    }

    // ─── Paso 1: limpiar tools viejas con los mismos nombres ────────
    const toolNames = CLIENT_TOOLS.map((t) => t.name);
    const existing = await listTools(apiKey);
    const stale = existing.filter((t) => toolNames.includes(t?.tool_config?.name || t?.name));
    console.log(`[configureAgent] Tools existentes: ${existing.length}, a recrear: ${stale.length}`);
    for (const t of stale) {
      const id = t.id || t.tool_id;
      if (id) await deleteTool(apiKey, id);
    }

    // ─── Paso 2: crear todas las tools nuevas y recolectar tool_ids ─
    const toolIds = [];
    const errors = [];
    for (const t of CLIENT_TOOLS) {
      try {
        const id = await createClientTool(apiKey, t);
        if (id) {
          toolIds.push(id);
          console.log(`[configureAgent] Creada tool ${t.name} → ${id}`);
        } else {
          errors.push(`${t.name}: no se obtuvo tool_id`);
        }
      } catch (e) {
        errors.push(`${t.name}: ${e.message}`);
      }
    }

    if (toolIds.length === 0) {
      return Response.json(
        { error: 'No se pudo crear ninguna tool', details: errors },
        { status: 502 }
      );
    }

    // ─── Paso 3: PATCH al agente con tool_ids + prompt + first_message ─
    const agentConfig = {
      conversation_config: {
        agent: {
          first_message:
            'Hola jurado del Claude Impact Lab Chile. Soy Lya, la asistente de FinLogic. Estoy aquí con Paula Garcés, nuestra Product Owner. ¿Quieren que arranque el pitch desde el principio, o tienen alguna pregunta específica?',
          language: 'es',
          prompt: {
            prompt: LYA_SYSTEM_PROMPT,
            llm: 'gemini-3-flash-preview',
            temperature: 0.6,
            max_tokens: -1,
            tool_ids: toolIds,
            built_in_tools: {
              end_call: {
                name: 'end_call',
                description:
                  'Termina la conversación cuando el usuario se despida o el pitch concluya.',
                response_timeout_secs: 5,
                params: { system_tool_type: 'end_call' },
              },
              language_detection: {
                name: 'language_detection',
                description:
                  'Detecta automáticamente si el usuario cambia de idioma y ajusta la respuesta.',
                response_timeout_secs: 5,
                params: { system_tool_type: 'language_detection' },
              },
            },
          },
        },
        asr: {
          quality: 'high',
          provider: 'scribe_realtime',
          user_input_audio_format: 'pcm_16000',
          keywords: [
            'FinLogic', 'Lya', 'Paula Garcés', 'CMF', 'SERNAC', 'SII', 'CSIRT', 'SFA',
            'Don Luis', 'Camila', 'María José', 'Roberto', 'Pro-Pyme', 'TMC',
          ],
        },
        conversation: { max_duration_seconds: 1800, text_only: false },
      },
    };

    const url = `${EL_BASE}/agents/${encodeURIComponent(agentId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(agentConfig),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('PATCH agent error:', res.status, errText);
      return Response.json(
        {
          error: `ElevenLabs error ${res.status}`,
          details: errText.substring(0, 800),
          toolIds,
          createErrors: errors,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    return Response.json({
      success: true,
      agentId,
      systemPromptChars: LYA_SYSTEM_PROMPT.length,
      toolsRequested: CLIENT_TOOLS.length,
      toolsCreated: toolIds.length,
      toolIds,
      createErrors: errors,
      voiceId,
      llm: 'gemini-3-flash-preview',
      message: 'Lya configurada con tools registradas vía /v1/convai/tools.',
      agent: { name: data?.name, agent_id: data?.agent_id },
    });
  } catch (error) {
    console.error('elevenLabsConfigureAgent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});