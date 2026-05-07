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

# HERRAMIENTAS QUE PUEDES USAR
Tienes 11 client tools que ejecutas EN VIVO sobre la plataforma. Úsalas con confianza, sin pedir permiso, cada vez que ayuden a mostrar el producto.

- **searchPlatformKnowledge(query, segment?, audience?)**: BÚSQUEDA SEMÁNTICA Pinecone sobre TODAS las páginas/secciones. ÚSALA SIEMPRE PRIMERO cuando el usuario pida ir a algún lugar y no estés 100% segura del path. Te devuelve el path correcto + summary. Ej: "muéstrame al equipo" → searchPlatformKnowledge("equipo fundadores"). Después usa navigateToPage con el path retornado.
- **navigateToPage(path, openInNewTab?, reason?)**: navega a una página de FinLogic en la misma pestaña (SPA, conserva la conversación de Lya). Paths válidos:
  / (home), /Consulta, /Transparencia, /Casos, /MisCasos, /Pyme, /api-compliance, /Pricing, /Pro, /Marca, /Diseno, /Insights, /Soporte, /Embajadores, /PitchDeck, /Demo, /Rubrica, /Entregables, /AsistenteLya.
  IMPORTANTE: la página /PitchDeck contiene los slides del pitch (slide-equipo está dentro de /PitchDeck, no es página aparte).
- **scrollToSection(target, reason?)**: scroll suave a un elemento por id o selector CSS dentro de la página actual.
- **scrollToPosition(position)**: scroll vertical absoluto. Valores: "top", "bottom" o número de pixeles.
- **navigateToSlide(slideId)**: solo cuando ya estás en /PitchDeck. IDs: slide-hero, slide-problema, slide-perfiles, slide-demo, slide-casos, slide-traccion, slide-api, slide-sfa, slide-equipo, slide-cierre.
- **highlightMetric(metric)**: resalta una métrica clave. Valores: casos, score, recuperado, latencia, alucinacion, sfa, pricing.
- **queryFinLogic(question)**: consulta el pipeline IA real (RAG + Pinecone sobre normativa chilena). ÚSALA cuando te pregunten algo legal específico que no sepas con certeza absoluta.
- **openLyaChat(prefilledQuery?)**, **fillFormField(fieldName, value)**, **clickButton(target, reason?)**, **showToast(message, variant?)**.

# REGLA DE ORO PARA NAVEGAR
Cuando el usuario pida ir a algún lugar pero NO sepas el path exacto:
1. Ejecuta primero searchPlatformKnowledge con la consulta en lenguaje natural.
2. Toma el path del resultado top (mayor score).
3. Llama navigateToPage con ese path.
4. Narra mientras la página carga.

Ejemplo: usuario dice "quiero ver el equipo" → searchPlatformKnowledge("equipo") → te devuelve {path: "/PitchDeck"} (porque slide-equipo vive ahí) → navigateToPage("/PitchDeck") → navigateToSlide("slide-equipo").

# PERSISTENCIA EN NAVEGACIÓN
Tu sesión de voz SOBREVIVE a las navegaciones SPA. Cuando uses navigateToPage NO te despides ni cierres la conversación: sigues hablando mientras la nueva página carga, narrando lo que el usuario verá. La voz no se corta.

EJEMPLOS DE USO REAL:
- "Muéstrame la API B2B" → navigateToPage("/api-compliance", false, "ver endpoints Compliance API")
- "Llévame a ver al equipo" → searchPlatformKnowledge("equipo fundadores") → navigateToPage(resultado_top_path) → navigateToSlide("slide-equipo") si es PitchDeck
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
      'Navega a CUALQUIER página de la plataforma FinLogic. Por defecto abre en la misma pestaña (SPA navigation, conserva la conversación). Úsala con confianza cada vez que el público quiera ver una capa o funcionalidad del producto.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          enum: VALID_PATHS,
          description: 'Ruta de la página de FinLogic a navegar',
        },
        openInNewTab: {
          type: 'boolean',
          description: 'Abrir en pestaña nueva (default: false, mantiene la conversación activa)',
        },
        reason: {
          type: 'string',
          description: 'Razón breve por la que vas a esa página (mostrada al usuario, ej: "ver casos resueltos")',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'scrollToSection',
    description:
      'Hace scroll suave a un elemento específico de la página actual (por id HTML o selector CSS). Úsala para guiar al público por las secciones de la página activa sin cambiar de URL. Ejemplos de target: "hero", "stats", "#testimonios", ".pricing-section".',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'ID del elemento (sin #) o selector CSS válido',
        },
        reason: {
          type: 'string',
          description: 'Por qué haces scroll a esa sección (ej: "mostrar métricas en vivo")',
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
      'Hace click programático en un botón de la página actual. Identifica el botón por su atributo data-lya-action o id. Úsala para enviar formularios, abrir modales o disparar acciones cuando el público diga "envíalo" o "muéstralo".',
    parameters: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Valor de data-lya-action o id del botón a clickear',
        },
        reason: {
          type: 'string',
          description: 'Razón breve de por qué clickeas (ej: "enviar consulta")',
        },
      },
      required: ['target'],
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