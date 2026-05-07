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
Tienes 4 client tools que ejecutas EN VIVO en la plataforma:
- **navigateToSlide(slideId)**: hace scroll al slide del pitch. IDs válidos: slide-hero, slide-problema, slide-perfiles, slide-demo, slide-casos, slide-traccion, slide-api, slide-sfa, slide-equipo, slide-cierre.
- **openPage(path)**: abre otra página de FinLogic. Paths: /, /Consulta, /Transparencia, /Casos, /Pyme, /APICompliance, /Pricing, /Marca, /Insights.
- **highlightMetric(metric)**: resalta una métrica específica. Valores: casos, score, recuperado, latencia, alucinacion.
- **queryFinLogic(question)**: consulta el pipeline IA real (RAG + Pinecone) para responder con normativa chilena vigente. ÚSALA cuando el jurado pregunte algo legal específico.

USA estas herramientas SIEMPRE que ayuden a la presentación. Por ejemplo:
- "Vamos al slide del problema" → navigateToSlide("slide-problema")
- "Te muestro la página de transparencia" → openPage("/Transparencia")
- "Pregunta sobre Ley 20.009" → queryFinLogic("...")

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
- **Durante el pitch**: narra el slide actual, después navega al siguiente con navigateToSlide. Pausa entre slides para que Paula complemente o el jurado pregunte.
- **Preguntas técnicas profundas** (arquitectura, código, infra): cede a Paula con frase como "Esa parte la maneja Paula al detalle, ¿te la cuenta ella?".
- **Preguntas legales específicas** (artículos, plazos, leyes): usa queryFinLogic() para responder con datos verificados.
- **Preguntas comerciales** (pricing, contratos, pilotos): responde con los datos del pitch + invita a hablar con Paula post-presentación.
- **Si no sabes algo**: di "No tengo ese dato verificado, prefiero no inventar. Paula, ¿lo sabes tú?". Ser honesta es nuestro diferenciador.

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
const CLIENT_TOOLS = [
  {
    name: 'navigateToSlide',
    description:
      'Hace scroll suave al slide del pitch deck que pidas. Úsala cada vez que avanzas en la presentación o cuando el jurado pregunta sobre un tema específico cubierto en un slide.',
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
    name: 'openPage',
    description:
      'Abre otra página de la plataforma FinLogic en una pestaña nueva para mostrar funcionalidad real. Úsala cuando el jurado quiera ver una capa específica del producto.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          enum: [
            '/',
            '/Consulta',
            '/Transparencia',
            '/Casos',
            '/Pyme',
            '/APICompliance',
            '/Pricing',
            '/Marca',
            '/Insights',
            '/MisCasos',
          ],
          description: 'Ruta de la página a abrir',
        },
        reason: {
          type: 'string',
          description: 'Razón breve por la que abres esa página (para mostrar al usuario)',
        },
      },
      required: ['path'],
    },
  },
  {
    name: 'highlightMetric',
    description:
      'Resalta visualmente una métrica clave del pitch durante 4 segundos. Úsala cuando enfatices un dato importante.',
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
      'Consulta el pipeline IA real de FinLogic (RAG sobre normativa chilena, Pinecone, Claude Sonnet) para responder preguntas legales específicas con datos verificados. Úsala cuando el jurado pregunte sobre una ley, artículo, plazo o procedimiento normativo.',
    parameters: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'Pregunta legal/financiera del jurado en lenguaje natural',
        },
      },
      required: ['question'],
    },
  },
];

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

    // Configuración: solo modificamos lo que necesitamos (prompt + tools + first_message + keywords).
    // Mantenemos el LLM (gemini-3-flash-preview) y voz (eleven_v3_conversational) ya configurados.
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
            tools: CLIENT_TOOLS.map((t) => ({
              type: 'client',
              name: t.name,
              description: t.description,
              parameters: {
                type: 'object',
                description: t.description,
                properties: t.parameters.properties,
                required: t.parameters.required || [],
              },
              expects_response: t.name === 'queryFinLogic',
              response_timeout_secs: t.name === 'queryFinLogic' ? 12 : 4,
            })),
          },
        },
        asr: {
          quality: 'high',
          provider: 'scribe_realtime',
          user_input_audio_format: 'pcm_16000',
          keywords: [
            'FinLogic',
            'Lya',
            'Paula Garcés',
            'CMF',
            'SERNAC',
            'SII',
            'CSIRT',
            'SFA',
            'Don Luis',
            'Camila',
            'María José',
            'Roberto',
            'Pro-Pyme',
            'TMC',
          ],
        },
        conversation: {
          max_duration_seconds: 1800, // 30 min máx
          text_only: false,
        },
      },
    };

    const url = `https://api.elevenlabs.io/v1/convai/agents/${encodeURIComponent(agentId)}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentConfig),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('ElevenLabs PATCH agent error:', res.status, errText);
      return Response.json(
        {
          error: `ElevenLabs error ${res.status}`,
          details: errText.substring(0, 800),
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    return Response.json({
      success: true,
      agentId,
      systemPromptChars: LYA_SYSTEM_PROMPT.length,
      toolsCount: CLIENT_TOOLS.length,
      voiceId,
      llm: 'claude-sonnet-4',
      message: 'Lya configurada como mediadora pública del pitch FinLogic.',
      agent: {
        name: data?.name,
        agent_id: data?.agent_id,
      },
    });
  } catch (error) {
    console.error('elevenLabsConfigureAgent error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});