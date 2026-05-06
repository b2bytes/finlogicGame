# FinLogic — Mandato Abril 2026 · Páginas 361-420

> Fuente canónica adjunta al proyecto. Cubre 6 agentes del blueprint:
> Pitch + CopywriterAgent, SocialMediaAgent, GrowthMarketing, PromptEngineer,
> AIAgentsArchitect y OperationsAgent (COO Digital).

---

## 1. Pitch Claude Impact Lab (6-7 mayo 2026) — Hallazgo 6

**Estructura 3 min + 2 min Q&A.** Criterios jurado: 25% impacto ciudadano,
25% uso de Claude/agéntico, 20% datos responsables, 15% funciona, 15%
narrativa ciudadana. Bonus agéntico +5.

- **Apertura (0:00-0:20) — Impacto:** *"Hoy, en Chile, hay 500.000 personas
  que presentaron un reclamo en SERNAC sin saber si tenían razón… Eso no es
  ignorancia — es un sistema diseñado para ser incomprensible."*
- **Problema (0:20-0:45) — Narrativa:** Don Luis, 68, Valparaíso. Cobro de
  seguro no pedido. *"Tiene un teléfono. Y ahora tiene FinLogic."*
- **Solución (0:45-1:30) — Claude:** Pipeline Sonnet 4.6 especialista +
  GPT-5 mini triage. Carta ARCO, TMC, denuncia. **49 segundos**. Auditable
  en `/Transparencia`.
- **Tracción (1:30-2:00):** 45 consultas, score 72/100, 2 documentos, 8
  integraciones cero mocks.
- **Visión (2:00-2:30):** Pro $3.990/mes + Compliance API $490.000/mes vs
  multa CMF 5.000 UF (~$190M). Sin filantropía.
- **Cierre (2:30-3:00):** *"Esto no es un chatbot. Es el sistema operativo
  financiero del pueblo de Chile. Y hoy, por primera vez, el pueblo tiene
  acceso."*

---

## 2. CopywriterAgent — Entities y Funciones

### Entities nuevas
- **`CopyVariant`** — A/B testing de copy: `placement` (hero|cta|email|whatsapp|voice|onboarding|error), `segment` (ciudadano|adulto_mayor|emprendedor|b2b|regulador), `funnel_stage` (tofu|mofu|bofu), `framework` (aida|pas|bab|4cs), métricas (impressions, clicks, conversions, ctr, conversion_rate), `is_winner`, `tested_against`.
- **`ContentCalendar`** — `channel` (blog|email|whatsapp|linkedin|instagram), `content_pillar` (educacion_financiera|derechos_ciudadanos|alertas_fraude|normativa_simple|casos_reales), `seo_keywords`, `engagement_score`, `llm_generated`, `human_reviewed`.
- **`AgentPersonality`** — Por perfil (ciudadano|adulto_mayor|emprendedor|b2b): `welcome_message`, `voice_speed` (0.7-1.2), `voice_tone` (calido|profesional|urgente), `language_level`.

### Backend functions
- `runCopyABTest` — selecciona variante activa, registra impresión.
- `analyzeCopyPerformance` (CRON diario 08:00) — si CTR<1.5% en 500 impresiones marca perdedora y activa alternativa.
- `generateSeasonalCopy` (CRON mensual) — usa fechas tributarias chilenas. Ej. abril: *"¿Ya declaraste renta? FinLogic lo calcula en 30 segundos."*
- `generateEmailSequence` (Entity Trigger MisCasos onCreate) — 3 emails: confirmación, recordatorio día 3, alerta vencimiento día 10.

---

## 3. SocialMediaAgent — Estrategia de Redes

### Datos canónicos del cliente
- **Línea editorial:** *"Resuelve + educa + previene en una sola respuesta."*
- **North Star:** usuarios que resuelven ≥1 duda con acción concreta en primera sesión. 0% → 70% D+30 → 85% D+90.
- **Canal prioritario:** WhatsApp con botón "Compartir respuesta".
- **Gap crítico:** sin prueba social documentada (área de mejora #1).
- **Diferenciador competitivo (vs Destacame, Fintual, ABIF, CMF Educa):** *"Otros te dan datos, nosotros te damos comprensión."*

### Framework PESO + Flywheel
OWNED → EARNED → SHARED (WhatsApp viral) → PAID (solo cuando orgánico valida >3% acción).

### Segmentación de plataformas
| Plataforma | Audiencia | Objetivo | Frecuencia |
|---|---|---|---|
| TikTok | Camila (22) | Awareness viral | 5x/sem |
| Instagram | María José (34) | Conversión Free→Pro | 4x/sem |
| LinkedIn | CTOs B2B | Compliance API | 3x/sem |
| YouTube | Don Luis + búsquedas | SEO+GEO | 1x/sem |
| X/Twitter | Periodistas | PR alertas CMF | Diario |
| Facebook | Adultos mayores | Alcance Don Luis | 3x/sem |
| Threads | Early adopters | Feedback | 3x/sem |

### 4 Content Pillars (40/30/20/10)
1. **Tu Derecho de Hoy (40%)** — pregunta+respuesta+normativa real+CTA.
2. **Casos Reales (30%)** — cierra gap de prueba social. Storytelling 3 actos.
3. **Alerta Financiera (20%)** — reactivo a CMF/SERNAC en <2h.
4. **Detrás del Sistema (10%)** — transparencia, contrarresta dominio .one.

### Entities
- Extender `MisCasos` con `shared_social: boolean`, `share_count: integer`.
- Extender `AgentTrace` con `social_channel: string`.
- **Nuevas:** `ContentCalendar`, `SocialMetric`, `SocialCase`, `SocialAlert`.

### Backend functions nuevas
`generateSocialContent`, `syncSocialMetrics` (CRON 08:00), `detectSocialAlert` (CRON cada 2h), `analyzeSocialPerformance` (CRON lunes 09:00), `generateShareableCard` (Entity Trigger MisCasos `shared_social=true`).

### Pages
- `/ContentStudio` — calendario editorial con IA.
- `/SocialDashboard` — métricas en tiempo real.
- `/CasosResueltos` — galería pública con botón "Compartir en WhatsApp".

### Superagente: `SuperagenteFinLogicSocial`
Claude Sonnet 4.6, voz ElevenLabs es-CL, canales whatsapp+telegram, cron sync_metrics_daily, detect_cmf_alerts (cada 2h), weekly_performance_analysis (lunes 09:00). Tools: entity CRUD (ContentCalendar, SocialMetric, SocialAlert, SocialCase) + browserbase (cmf.cl/alertas, sernac.cl/noticias) + generate_image.

---

## 4. GrowthMarketing — Funnels y Loops

### Modelo: Flywheel de 3 Velocidades (no embudo lineal)
1. **Adquisición Institucional** — SERNAC 500K reclamos/año, GEO, SEO normativo. CAC ~$0.
2. **Activación Viral** — botón "Compartir respuesta", `/casos`. Cada usuario activado genera 2-3 referidos.
3. **Monetización en Cascada** — Free → Pro $3.990 → Compliance API $490.000 → Insights $12-24M/año.

### Framework AARRR adaptado
Adquisición → Activación → Retención → **Referido (antes que revenue)** → Revenue.

### 10 Recomendaciones
1. **SEO Normativo alta intención** — páginas accionables tipo *"cómo reclamar cobro indebido banco Chile"*.
2. **GEO prioritario** — Entity `GEOContent` formato Q&A para ChatGPT/Perplexity.
3. **Activación SERNAC** — landing dedicada *"¿Recibiste un cobro que no reconoces? Cuéntanos qué pasó — en 60 segundos."*
4. **Zero-Login First** — primera victoria <60s sin registro. Captura de email DESPUÉS del valor.
5. **Momento Pro** — 3 triggers: segundo caso activo / plazo <5 días / documento generado. Precio $3.990 aparece SOLO aquí.
6. **Alertas CMF como retención** — Entity `RetentionTrigger`.
7. **Historial como activo** — *"Llevas 3 casos resueltos y $180.000 recuperados."*
8. **Viralidad WhatsApp** — preview con consejo+normativa+UTM.
9. **Casos públicos `/casos`** — cierra gap prueba social.
10. **B2B funnel ROI** — TOFU multas reales → MOFU calculadora ROI → BOFU prueba 30 días.

### Entities nuevas
- **`Lead`** — email, phone, segment, source (sernac|whatsapp_share|geo|paid_social|organic_seo|referral), utm_*, first_query, first_victory_at, cases_count, pro_trigger_shown_at, converted_to_pro, referral_code, referred_by, lifecycle_stage.
- **`EmailSequence`** — sequence_type (activation|nurturing_free|pro_conversion|b2b_compliance|retention|winback), step, sent_at, opened_at, clicked_at, converted_at.
- **`RetentionTrigger`** — trigger_type (cmf_alert|deadline_approaching|inactivity_7d|inactivity_30d|new_regulation|case_update), channel, message_sent, returned_to_app.
- **`CampaignMetric`** — campaign_name, channel, impressions, clicks, leads_generated, activations, pro_conversions, cac, roas, ltv_cohort.
- **`GEOContent`** — question, answer, normativa_cited[], target_engine (chatgpt|perplexity|gemini|claude), impressions_estimated, clicks_from_ai.
- **`ReferralEvent`** — referrer_id, referred_email, share_channel, case_type_shared, referred_activated, referred_converted, reward_issued.

### Backend functions nuevas (8)
`scoreLeadAndAssignSequence`, `sendActivationSequence` (CRON 30min), `detectProConversionMoment` (Entity Trigger MisCasos 2do caso), `sendDeadlineRetentionAlert` (CRON 09:00), `trackReferralConversion`, `generateB2BNurturingEmail` (CRON lunes 08:00), `aggregateCampaignMetrics` (CRON medianoche), `generateWeeklyGrowthReport` (CRON viernes 17:00).

### Pages
- `/activar` — landing principal A/B Don Luis vs María José.
- `/casos` — prueba social pública.
- `/pro` — comparativa Free vs Pro $3.990 + calculadora valor + Stripe.
- `/api-compliance` — hero ROI multa $190M vs $490.000/mes + demo `/check-tmc`.
- `/dashboard-growth` — KPIs internos.

### Superagente: `GrowthAgent`
Memoria persistente, CRON diario análisis CampaignMetric, WhatsApp, connectors Slack+HubSpot+Google Sheets, Browserbase competencia (Tenpo, Mach, Mercado Pago Chile).

### KPIs por fase
| KPI | Baseline | D+30 | D+60 | D+90 |
|---|---|---|---|---|
| North Star (1ª victoria) | 0% | 70% | 80% | 85% |
| CAC orgánico | $0 | $0 | $0 | $0 |
| CAC paid social | — | $8.000 | $6.000 | $4.500 |
| Tasa activación | — | 35% | 45% | 55% |
| Conversión Free→Pro | 0% | 1.5% | 2% | 2.5% |

---

## 5. PromptEngineer — Pipeline Prompt Architecture (PPA)

### Score actual: 72/100 → objetivo 92/100
4 capas: Triage → Especialización → Verificación → Meta-aprendizaje.

### Prompt 1 — Triage (GPT-5 mini, ~600ms, ~1000 tokens, $0.0002)
Categorías: FRAUDE_DIGITAL, COBRO_INDEBIDO, DERECHOS_ARCO, CONTRATO_ABUSIVO, NORMATIVA_CONSULTA, INDICADORES_ECONOMICOS, COMPLIANCE_API, FUERA_DE_SCOPE.
Tools: CHECK_USURY, CHECK_CMF_ALERTS, CMF_BANK_INFO, GENERATE_DOCUMENT, SEND_EMAIL.
**Guardrail crítico:** ambigüedad fraude/cobro → elegir FRAUDE_DIGITAL (más protecciones).

### Prompt 2 — Especialista (Claude Sonnet 4.6, ~3500ms, ~5500 tokens, $0.055)
Chain-of-Thought 6 pasos: Diagnóstico → Derecho aplicable → Estado actual herramientas → Acción concreta (max 3) → Documento → Plazo legal.
**Guardrails:**
1. NUNCA citar artículo no presente en contexto inyectado.
2. NUNCA decir "podría ser ilegal" — afirmar SÍ/NO según TMC.
3. NUNCA recomendar institución específica.
4. NUNCA minimizar problema.
5. Si sin certeza: *"requiere verificación adicional con [organismo]"*.

**Modo voz:** max 800 chars, cero markdown, frases <20 palabras, vocabulario hablado.
**Modo texto:** negritas para derechos, listas numeradas, secciones ⚖️ Tu derecho / 📋 Acción / ⏰ Plazo, max 600 palabras.

### Prompt 3 — Verificador (GPT-5 mini, ~2800 tokens, $0.0006)
Rúbrica 100 pts: Precisión normativa 30 + Accionabilidad 25 + Seguridad 25 + Claridad 20.
Guardrails automáticos → score máx 40 si: cita artículo no contextual, recomienda institución, minimiza fraude, supera 800 chars en voz.

### System Prompt Superagente — 12 puntos Mandato
1. IDENTIDAD (50 palabras max)
2. ALMA (valores, límites éticos, escalación)
3. USUARIO (4 perfiles + detección)
4. MEMORIA (persistente vs olvido)
5. ENTIDADES (operaciones permitidas/prohibidas — nunca DELETE MisCasos/GeneratedDocument, nunca UPDATE AgentTrace)
6. REGLAS OPERACIONALES (flujo + actuar sin preguntar en fraude/usura/plazo<48h)
7. CONECTORES (Google Calendar, Gmail, WhatsApp, Telegram)
8. CANALES (formato por canal)
9-12. (Voz, escalación humana, auto-mejora, compliance Ley 21.719)

---

## 6. AIAgentsArchitect — Arquitectura Multi-Agente

**Diseño:** 1 Superagente orquestador + 5 especializados + 2 CRON autónomos.
Principios: especialización por dominio, mínimo privilegio, trazabilidad obligatoria (AgentTrace en cada respuesta).

### 5 Hallazgos
1. **AgentTrace = diferenciador competitivo subestimado** — `/Transparencia` pública.
2. **FraudeAgent = más urgente para concurso** — Línea 02 Ciberseguridad Ciudadana, Ley 20.009.
3. **OnboardingAgent crítico para Don Luis** — detecta literacidad en 2 preguntas, activa modo voz si audio.
4. **ComplianceAPIAgent = motor B2B** — autenticación API key, JSON only, sin canal WhatsApp.
5. **CRON LegalDeadline = bonus agéntico +5** — acción autónoma con guardrails.

### 5 Recomendaciones
| # | Recomendación | Impacto rúbrica |
|---|---|---|
| 1 | TriageAgent primer nodo, <800ms, 12 módulos | Funciona 15% |
| 2 | CRON diario LegalDeadline + WhatsApp | Bonus +5 |
| 3 | AgentTrace obligatorio con verifierScore | Datos responsables 20% |
| 4 | Modo voz Whisper + TTS para Don Luis | Impacto ciudadano 25% |
| 5 | FraudeAgent carta CSIRT <30s | Pensamiento agéntico 25% |

### Superagente: `SuperagenteFinLogic` (nombre interno: Lex)
- **Identity:** Lex — Sistema Operativo Financiero Ciudadano. Empático, directo, nunca condescendiente.
- **Soul:** Justicia accesible / transparencia radical / acción ejecutable / privacidad por diseño Ley 21.719 / inclusión Don Luis = CTO.
- **Memory:** short_term (20 conversaciones), facts (Entity AgentMemory persistente, RUT hasheado SHA-256), sessions (resumen diario CRON 23:59).
- **Entities:** UserProfile, MisCasos, LegalDeadline, GeneratedDocument, AgentTrace (CREATE only), SystemFeedback, SystemMetrics, AgentMemory, KnowledgeChunk.
- **Rules:** nunca inventar normativa, AgentTrace antes de responder, terminar con acción concreta, audio→TTS<1000 chars, fraude→FraudeAgent inmediato sin confirmar, RUT hasheado, score<60→escalar a humano, deadline<48h→alerta proactiva.
- **Connectors:** Gmail (send_only), WhatsApp (send_receive), Google Calendar (create_events recordatorios deadline -3 días).
- **Tasks CRON:**
  - `0 9 * * *` checkLegalDeadlines (vencimiento <48h → WhatsApp)
  - `0 0 * * *` aggregateSystemMetrics (consolida día)
  - `0 0 * * 0` autoOptimizeAgent (semanal, human_in_loop email gabriel@finlogic.one)
  - `0 23 * * *` pruneMemory (Ley 21.719 derecho al olvido)

### Agentes especializados
- **TriageAgent** — clasificador 12 módulos <800ms, JSON output, no responde a usuario.
- **FraudeAgent** — Ley 20.009 + Ley 21.663 CSIRT, denuncia PDF <30s, alerta WhatsApp.
- **OnboardingAgent** — detecta nivel digital, ajusta vocabulario.
- **ComplianceAPIAgent** — separado, API key, rate limit, JSON.
- (Quinto agente especializado por definir según dominio adicional.)

---

## 7. OperationsAgent — COO Digital

### Diagnóstico Lean Six Sigma
Score 72/100 ≈ Sigma Level 2.5. Latencia 49s = abandono para Don Luis. Objetivo: ratio automatización >85%.

### Flywheel operacional 3 motores
1. Volumen ciudadano Free (datos AgentTrace).
2. Conversión Pro + retención (CRON nurturing).
3. Compliance API B2B (SLA, reportes uso).

### Mapa As-Is → To-Be
| Proceso | As-Is | To-Be | Tipo |
|---|---|---|---|
| Monitoreo integraciones | Manual | CRON 15min → Slack | CRON |
| Plazos legales | Estático | CRON diario → email+WhatsApp | CRON |
| Feedback consultas | Manual | Entity Trigger → InvokeLLM | Entity Trigger |
| Reporte uso API B2B | No existe | CRON diario → email | CRON |
| Anomalías score | No existe | CRON horario, alerta <65 | CRON |
| Renovación normativa | Ad-hoc | CRON semanal ingestKnowledge | CRON |
| Nurturing Free→Pro | No existe | Entity Trigger 3 casos resolved | Entity Trigger |
| Onboarding API | Manual | Entity Trigger → bienvenida | Entity Trigger |

### 8 Recomendaciones
1. COO Digital 24/7 — monitorea SystemMetrics horario, score<65 alerta, integración caída 2h escala.
2. Pipeline LegalDeadline automatizado — 7d email, 3d email+WhatsApp, 1d WhatsApp+generación auto.
3. Feedback loop score — Entity Trigger AgentTrace<70 → InvokeLLM clasifica → SystemFeedback. Objetivo 72→85 en 90 días.
4. SLA Monitor Compliance API — P95 latencia, alerta >2s, reportes diarios (clientes con reportes proactivos = -40% churn).
5. Renovación normativa CRON semanal — scrapeImpactLabWiki + ingestKnowledge.
6. Nurturing Free→Pro — 3 casos resolved → email "Has protegido $X" + CTA Pro.
7. Onboarding API — Entity Trigger ApiClient.create → email + ApiUsageLog + alertas 80%/100% + check-in 30d Google Calendar.
8. Dashboard `/OperacionesDashboard` — score 24h, latencia, 8 integraciones verde/amarillo/rojo, plazos críticos, consumo API.

### Entities nuevas
- **`ApiUsageLog`** — client_id, endpoint (check-tmc|verify-entity|regulatory-impact|fraud-pattern-match|consumer-rights-check), latency_ms, status_code, tokens_used, monthly_count, plan_limit (default 10000).
- **`ApiClient`** — company_name, plan (base|pro|enterprise), monthly_calls_limit, current_month_calls, api_key_hash, onboarding_status, alert_threshold_80/100, contract_start, renewal_date.
- **`OperationalAlert`** — alert_type (sla_breach|score_degradation|integration_failure|deadline_approaching|api_limit|normative_change), severity (low|medium|high|critical), affected_entity/_id, status (open|acknowledged|resolved).

### Backend functions nuevas (12, presupuesto 14+12=26/50)
| # | Función | Trigger |
|---|---|---|
| 15 | monitorIntegrations | CRON 15min |
| 16 | checkLegalDeadlines | CRON 8AM |
| 17 | analyzeAgentFeedback | Entity Trigger AgentTrace |
| 18 | aggregateWeeklyFeedback | CRON lunes 9AM |
| 19 | monitorApiUsage | CRON horario |
| 20 | generateApiUsageReport | CRON 7AM |
| 21 | checkApiLimits | Entity Trigger ApiUsageLog |
| 22 | onboardApiClient | Entity Trigger ApiClient.create |
| 23 | nurturingFreeToProTrigger | Entity Trigger MisCasos.update |
| 24 | syncNormativeKnowledge | CRON miércoles 6AM |
| 25 | generateOperationalReport | CRON 6AM |
| 26 | detectScoreAnomaly | CRON horario |

### Pages operacionales
- `/OperacionesDashboard` (admin) — 4 cuadrantes: integraciones, KPIs pipeline, plazos críticos, consumo API B2B.
- `/AlertasOperacionales` (admin) — feed OperationalAlert con filtros severidad/tipo.
- `/ReportesAPI` (admin + ApiClient) — consumo mensual por endpoint, exportación Google Sheets.

### Superagente operacional: `FinLogic COO Digital`
Memoria persistente. CRON: monitorIntegrations c/15min, checkLegalDeadlines diario 8AM Chile, detectScoreAnomaly horario, generateOperationalReport diario 6AM. Channels WhatsApp+Telegram. Connectors Slack+Google Calendar+Gmail. Escalación: critical→WhatsApp inmediato, score<65→WhatsApp+ClickUp, integración 2h caída→humano, API 100%→email+WhatsApp comercial.

---

## Referencias canónicas (transversales)

- **Tagline:** *"Esto no es un chatbot. Es el sistema operativo financiero del pueblo de Chile."*
- **Dominio:** finlogic.one
- **Arquetipo:** Héroe + Sabio
- **Perfiles canónicos:** Camila (22, Santiago), Don Luis (68, Valparaíso), María José (34, Temuco), Roberto (45, Antofagasta)
- **Pricing:** Pro $3.990 CLP/mes · Compliance API $490.000 CLP/mes (10K calls, +$0.008 USD adicional) · Embed $0.015 USD/consulta + $2.5M setup · Insights $12-24M CLP/año
- **Multa CMF referencia:** 5.000 UF (~$190M CLP)
- **Margen B2B:** ~85%
- **12 módulos normativos:** Ley Fintech 21.521, NCG 502 CMF, Ley 19.496 SERNAC, Ley 20.555, Ley 21.719 datos, Ley 20.009 fraude, Ley 21.663 ciber, LIR Pro-Pyme, Ley 21.713 tributaria, tributación cripto, Open Finance, CSIRT
- **14 funciones Deno existentes:** askFinLogic, checkFraudAlerts, checkUsury, cmfBankInfo, generateActionDocument, generateEvolutionInsights, getEconomicIndicators, ingestKnowledge, pinecone (Bootstrap/IndexAll/AutoSync/Search/UpsertOne), scrapeImpactLabWiki, sendActionEmail
- **Telemetría live:** 45 consultas, score 72/100, latencia 49s, 2 docs generados, 8 integraciones cero mocks