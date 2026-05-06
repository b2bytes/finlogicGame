# FinLogic — Mandato Abril 2026 · Páginas 421-478 (FINAL)

> Última sección del mandato. Cubre KPIs operacionales, SupportAgent,
> Lya Integration, ValidatorAgent (QA cross-agent) y el **Documento Maestro
> de Implementación v1.0** consolidado por la síntesis ejecutiva.

---

## 1. KPIs Operacionales (cierre OperationsAgent)

| KPI | Baseline | D+30 | D+60 | D+90 | Medición |
|---|---|---|---|---|---|
| Score verificador promedio | 72/100 | 76 | 80 | 85 | `AgentTrace.verification_score` |
| Latencia media pipeline | 49s | 45s | 40s | 35s | `SystemMetrics.avg_latency_ms` |
| Uptime integraciones | — | 99.0% | 99.5% | 99.9% | `monitorIntegrations` 15min |
| Plazos legales alertados a tiempo | — | 80% | 90% | 100% | `LegalDeadline` alertados/vencidos |
| Conversión Free→Pro | — | 1.5% | 2.0% | 2.5% | `UserProfile.plan` |
| Churn API B2B | — | <5% | <3% | <2% | `ApiClient.onboarding_status` |
| Tiempo respuesta alerta crítica | — | <5min | <3min | <2min | `OperationalAlert.created→ack` |
| Actualización normativa | Manual | Semanal auto | Semanal auto | Semanal auto | `syncNormativeKnowledge` |

**Fases:** D1-30 instrumentación · D31-60 optimización (score ≥76, 2 clientes API con reportes auto) · D61-90 escala (score ≥80, conversión ≥2.0%, cero churn por sorpresa).

---

## 2. SupportAgent — Carolina Muñoz Pérez

### Framework SACE
**S**egmentación → **A**ccesibilidad → **C**ontexto Legal → **E**scalamiento.

### Taxonomía por perfil
| Perfil | Canal | Ticket frecuente | SLA |
|---|---|---|---|
| Don Luis (68) | WhatsApp + Voz | "App no funciona", "No entiendo doc" | <5min |
| Camila (22) | Chat in-app | "¿Modo Pro?", "¿Qué es TMC?" | <2min self-service |
| María José (34) | WhatsApp | "¿Cómo reclamo SII?", "¿SERCOTEC?" | <10min |
| Roberto (45) | Telegram | "¿Esto es phishing?" | <3min urgente |
| CTO Fintech B2B | Email + Slack | "Error /check-tmc", "Docs API" | <1h SLA |

### 10 FAQs canónicas
1. **Latencia "¿Está caída?"** — Pipeline 30-60s analizando CMF/SERNAC/SII. Botón "Reintentar" tras 90s.
2. **¿Por qué dominio .one?** — Operamos bajo normativa chilena, "uno" con el ciudadano. Verificable en CMF/SERNAC. Datos protegidos Ley 21.719.
3. **No sé enviar doc generado** — Guardado en /MisCasos. Descargar PDF / "Enviar directo" / WhatsApp guiado.
4. **Precio Pro** — $3.990 CLP/mes, casos ilimitados, alertas plazos, generación PDF, prioridad.
5. **Plazo vencido** — Alertas 7d/3d/1d. Si <24h escríbenos para priorizar.
6. **¿Información correcta?** — Score verificación + /Transparencia. Score actual 72/100. Reporte error → 24h.
7. **Soy fintech** — Compliance API 5 endpoints, $490.000/mes plan base 10K calls. Embed $0.015 USD + $2.5M setup.
8. **Cobro no reconocido** — Describe banco/monto/fecha. Sistema identifica fraude/error/legítimo y genera reclamo.
9. **Adulto mayor** — Modo accesibilidad: texto +120%, lenguaje simple, voz. Botón persona+círculo. Teléfono directo o WhatsApp.
10. **¿Datos seguros?** — No almacenamos credenciales bancarias. Ley 21.719. Eliminación en Configuración→Privacidad.

### Mapa escalamiento
| Tipo | N1 Self | N2 SupportAgent | N3 Especialista |
|---|---|---|---|
| Latencia | FAQ + estado | Diagnóstico | TechnicalAgent |
| Doc no generado | Reintentar | Verificar `GeneratedDocument` | FullStackDev |
| Plazo legal | Alerta auto | Priorización | Asesor legal |
| Error API | Docs técnicos | Log review | TechnicalAgent + SLA |
| Desconfianza | FAQ credibilidad | Llamada confianza | GensB2B |
| Accesibilidad | Modo accesibilidad | Soporte voz | DesignAgent |
| Fraude urgente | Guía inmediata | Caso prioritario | CMF/CSIRT |

### Entities nuevas
- **`SupportTicket`** — userProfile (ciudadano|emprendedor|adulto_mayor|b2b_fintech), channel (whatsapp|telegram|chat_inapp|email|voz), category (latencia|documento|plazo_legal|compliance_api|credibilidad|accesibilidad|fraude_urgente|billing|otro), priority, status, linkedCaseId, linkedLegalDeadlineId, deadlineDaysRemaining, escalationLevel (1-3), satisfactionScore (1-5), autoResolved.
- **`FAQInteraction`** — faqId, questionText, userProfileType, wasHelpful, escalatedAfterFAQ, viewCount, deflectionSuccess.
- **`SupportSLA`** — planType (free|pro|compliance_api|embed), firstResponseMinutes, resolutionHours, uptimeGuaranteePercent, dedicatedChannel.

### Backend functions (5)
1. `triageTicket` — InvokeLLM clasifica + detecta deadline <72h → eleva a "critico".
2. `autoResolveFAQ` — match FAQInteraction score>0.85, retorna respuesta adaptada al perfil.
3. `escalateTicket` — escalationLevel++, B2B email con logs, deadline crítico WhatsApp equipo.
4. `generateSupportReport` — CRON 6AM, agrega tickets/categoría/perfil + InvokeLLM resumen.
5. `detectSupportAnomaly` — CRON 30min, spike "latencia">5/30min activa banner; spike "fraude_urgente" alerta inmediata.

### Pages
- `/Soporte` — 3 zonas: búsqueda inteligente / FAQs por perfil con tabs / canales contacto con SLA.
- `/MisSoporte` — dashboard tickets propios, banner rojo si deadline <72h.
- `/SoporteAdmin` — tabla por prioridad, gráfico volumen/hora, acciones rápidas.

### Superagente: `FinLogicSupportBot`
Memoria persistente con detección perfil. WhatsApp principal ciudadano. Telegram técnico/equipo. Voz ElevenLabs Don Luis. Tools: triageTicket/autoResolveFAQ/escalateTicket + read MisCasos/LegalDeadline. KFs: 10 FAQs + 12 módulos + Compliance API guide. CRON diario LegalDeadline <48h.

### KPIs
| KPI | D+30 | D+60 | D+90 |
|---|---|---|---|
| Auto-resolución FAQ | 40% | 55% | 65% |
| 1ª respuesta | <5min/<60min B2B | <3/<30 | <2/<15 |
| Escalación | <30% | <20% | <15% |
| CSAT | >3.5 | >4.0 | >4.3 |
| Plazo crítico resuelto | 100% | 100% | 100% |

---

## 3. Lya Integration — AI Orchestrator

### Diagnóstico: Pinecone fuera, Knowledge Files dentro
**3 riesgos eliminados:** operacional (no más DevOps de índices) · escalabilidad (KFs lineales) · coherencia (un único organismo).
**3 oportunidades nuevas:** WhatsApp ciudadano primario · voz Whisper+ElevenLabs en mismo agente · auto-evolución del corpus vía Entity Trigger AgentTrace score>85.

### Framework: 4 capas
1. **Estructuración Corpus** → 14 Knowledge Files (12 normativos + 2 operacionales).
2. **Orquestación Recuperación** → InvokeLLM con KFs en contexto (RAG sin vector DB).
3. **Acción Ejecutiva** → tool_configs sobre Entities canónicas.
4. **Auto-evolución** → Entity Trigger + CRON sobre SystemFeedback.

### Knowledge Files (14)
**Normativos (12):**
```
KF-01_ley-fintech-21521.md       Ley 21.521, Open Finance, SFA, TPP
KF-02_ncg502-cmf.md              NCG 502, NCG 514, circulares CMF
KF-03_ley-19496-sernac.md        Ley Consumidor, derechos, plazos
KF-04_ley-20555-sernac.md        Sernac Financiero, CAE, TIR, TER
KF-05_ley-21719-datos.md         Datos personales, carta ARCO
KF-06_ley-20009-fraude.md        Fraude tarjetas, responsabilidad banco
KF-07_ley-21663-ciberseguridad   CSIRT, incidentes, denuncia
KF-08_lir-propyme.md             Tributación Pyme, regímenes, beneficios
KF-09_ley-21713-tributaria.md    Reforma tributaria, obligaciones
KF-10_tributacion-cripto.md      Activos digitales, declaración SII
KF-11_open-finance.md            Consentimiento, revocación, portabilidad
KF-12_csirt-alertas.md           Alertas activas, patrones fraude
```
**Operacionales (2):**
```
KF-OP-01_perfiles-usuario.md     Camila / Don Luis / María José / Roberto + lenguaje + ejemplos
KF-OP-02_organismos-contacto.md  CMF / SERNAC / SII canales y plazos
```

### Superagente Lya (Claude Sonnet 4.6)
System prompt: *"Eres Lya, el asistente de FinLogic… Adaptas lenguaje al perfil… NUNCA das respuestas genéricas. SIEMPRE terminas con una acción concreta que el ciudadano puede tomar HOY."*

Channels WhatsApp+Telegram. Capabilities Whisper STT, TTS, Browserbase. Tool_configs: crear_caso (MisCasos.create), calcular_plazo_legal (LegalDeadline.create), generar_documento (GeneratedDocument.create), registrar_traza (AgentTrace.create), capturar_feedback (SystemFeedback.create), consultar_perfil (UserProfile.read).

CRON: `analizar_feedback_diario` (06:00, gaps→KFs), `verificar_alertas_cmf` (cada 30min), `calcular_metricas_sistema` (cada 4h).

### Backend functions Lya (6)
1. `lyaKnowledgeQuery` — recuperación semántica sobre KFs, retorna {response, sources, confidence, suggestedAction}.
2. `lyaWhatsAppHandler` — webhook entrante, formateo sin markdown.
3. `lyaVoiceProcessor` — Whisper → query → ElevenLabs.
4. `lyaFeedbackAnalyzer` — CRON 06:00, detecta gaps SystemFeedback 24h.
5. `lyaComplianceAPIEndpoint` — endpoint externo B2B, valida apiKey, JSON estructurado.
6. `lyaKnowledgeFileSync` — actualiza KnowledgeChunk basado en gaps.

### Entities nuevas
- **`LyaSession`** — sessionId, channel (web|whatsapp|telegram|voice), userProfileDetected, messagesCount, casesCreated, documentsGenerated, avgResponseScore, knowledgeFilesUsed[].
- **`KnowledgeFileVersion`** — fileName, version, lastUpdated, updateReason, gapsTriggeringUpdate, approvedBy, isActive.

### Pages
- `/AsistenteLya` — chat con skeleton loaders (49s pipeline), botón micrófono Whisper, panel lateral casos/deadlines, dark mode, WCAG 2.1 AA, typewriter effect.
- `/ConfiguracionLya` (admin) — gestión 14 KFs, métricas por archivo, reporte gaps.

### KPIs
| KPI | Baseline | D+30 | D+60 | D+90 |
|---|---|---|---|---|
| Score verificador | 72/100 | ≥72 | ≥78 | ≥85 |
| Latencia primer token | 49s | <15s | <10s | <8s |
| Consultas/día | ~2 | 50 | 200 | 500 |
| Adopción WhatsApp | 0% | 20% | 40% | 50% |
| Docs/semana | ~0.3 | 10 | 30 | 80 |
| Gaps normativos | — | <5/sem | <3/sem | <1/sem |
| NPS | — | >40 | >55 | >70 |

---

## 4. ValidatorAgent — QA Cross-Agent (Mg. Fernanda Leiva Cortés)

### Veredictos por área

**✅ Precios — APROBADO.** Pro $3.990, Compliance API $490K, Embed $0.015 USD, Insights $12-24M, multa CMF 5K UF, margen B2B 85% — consistentes en todos los agentes.

**✅ Identidad de marca — APROBADO.** finlogic.one, tagline, arquetipo Héroe+Sabio, FinLogic como nombre.

### ❌ Violaciones de plataforma (CRÍTICAS)
1. **Pinecone activo en lya-integration** — debe aclararse pre-migración.
2. **Next.js + Prisma + Postgres + Redis** en stack autenticación SFA — prohibidos en base44.
3. **Firebase notificaciones** — usar WhatsApp/Telegram/SendEmail.
4. **Supabase storage + magic link** — usar UploadFile/UploadPrivateFile.
5. **pgvector** — reemplazar por Knowledge Files.

### Mandatos blueprint
| Mandato | Estado |
|---|---|
| jsonc:superagente 12 puntos | ✅ |
| jsonc:ai-agents tool_configs | ✅ |
| jsonc:entities canónico | ✅ (18 entidades) |
| Catálogo Backend Functions input/output | ⚠️ PARCIAL |
| Stripe 3 modos | ❌ NO DETECTADO (no hay webhook handler con verificación firma) |
| CRON definidos | ✅ |
| Edge cases ≥5 con expected outcome | ⚠️ PARCIAL |

### GAPs CRÍTICOS de Entities
1. **`Subscription`** ausente — bloqueante modelo Free/Pro/Compliance API.
2. **`ComplianceAPIKey`** ausente — bloqueante autenticación B2B.

### Backend functions: estado
14 existentes + ~12 propuestas = ~26/50. Dentro de límite.
**Duplicación detectada:** `processStripeWebhook`/`processWebhookStripe`, `generateEvolutionInsights`/`generateComplianceReport`. Recomendación: naming `[dominio][Acción][Objeto]` (ej. `stripeProcessWebhook`).

### Otros gaps
- ⚠️ Telegram canal no confirmado para FinLogic.
- ⚠️ TTS sin sanitización (markdown + >1000 chars).
- ⚠️ `/Admin/SystemMetrics` page no definida.
- ⚠️ Empty state `/MisCasos` ausente.
- ⚠️ Especificaciones Don Luis (≥18px, contraste 7:1, táctil 48x48).
- ⚠️ Estados de error pipeline 49s.

### Entities y functions de cierre (ValidatorAgent)
- **Entity `Subscription`** — userId, plan (free|pro|compliance_api), stripeSubscriptionId, stripeCustomerId, status (active|past_due|canceled|trialing), currentPeriodStart/End, cancelAtPeriodEnd.
- **Entity `ComplianceAPIKey`** — organizationName, apiKey, plan (base|enterprise), monthlyCallLimit (10000), callsUsedThisMonth, status (active|suspended|revoked), lastResetDate, contactEmail.
- **Function `stripeProcessWebhook`** — verificación firma, maneja `customer.subscription.{created,updated,deleted}`, `invoice.payment_failed`. Firma inválida→401, evento desconocido→200.
- **Function `sanitizeTTSResponse`** — strip markdown, truncar 900 chars, dividir chunks por puntuación.
- **Function `trackComplianceAPIUsage`** — apiKey inválida→401, límite alcanzado→429 con Retry-After.

### Pages cierre
- `/Admin/SystemMetrics` — dashboard auto-evolución (score promedio target>80, latencia <30s post-opt, distribución organismo).
- `/B2B/APIKeys` — gestión keys, progress bar uso/límite, generar/revocar.

### Connectors recomendados
| Connector | Uso | Prioridad |
|---|---|---|
| Gmail | Envío docs ciudadano | Alta |
| Google Sheets | Métricas CMF/concurso | Media |
| Slack | Alertas score<60 / latencia>60s | Media |
| HubSpot | CRM B2B Compliance API | Alta |
| WhatsApp | Canal principal ciudadano | Alta |

---

## 5. Documento Maestro de Implementación v1.0

### 5.1 Contexto del negocio
**Equipo fundador:** Gabriel (AI Builder + arquitectura), Paula (Comercial + Producto, Contadora Auditora U. de Chile), Diego (Vibecoder + frontend), Marco (UX + diseño). Los 3 perfiles del concurso + diseño.

**Estado producto:** finlogic.one en producción sobre base44.com. 18 entidades implementadas, flujo ciudadano completo, `/Transparencia` con AgentTrace operativa. **Llega al Impact Lab a demostrar tracción, no a prometer construcción.**

### 5.2 Problema en 3 dimensiones
- **Ciudadana:** chileno bancarizado 25-45a, $600K-$2.5M, 2-4 productos, no entiende CAE/TIR/TER, fatiga apps bancarias.
- **Pyme:** +1.8M microempresarios, desorden financiero, multas evitables, contadores saturados.
- **Sistémica:** Ley 21.521 + NCG 502/514 + Ley 21.398 + Ley 21.719 en PDFs densos. **SFA vigente 4-jul-2026** = ventana PSBI única.

### 5.3 Visión 5 capas
1. **Ciudadana** — chat lenguaje natural → respuesta accionable + docs + plazos.
2. **Pyme** — dashboard salud financiera + integración SII + alertas tributarias.
3. **Agéntica** — 7 AI Agents especializados orquestados por Superagente **Lya**.
4. **B2B** — Compliance API 5 endpoints para fintechs reguladas.
5. **Transparencia** — `/Transparencia` AgentTrace público auditable.

### 5.4 Modelo año 1 (~$400M CLP)
- FinLogic Embed fintechs ~$48M
- Compliance API ~$70M
- FinLogic Insights ~$45M
- FinLogic Pro B2C (5K usuarios) ~$240M
- **Break-even mes 14-18.**

### 5.5 KPIs maestros
| KPI | Baseline | D+30 | D+90 |
|---|---|---|---|
| Acción concreta primera sesión | 0% | 70% | 85% |
| Time-to-value | — | <60s | <45s |
| Casos con plazo legal | 0 | 500 | 2.000 |
| Documentos generados | 0 | 1.000 | 5.000 |
| Fintechs Compliance API | 0 | 2 | 8 |
| NPS ciudadano | — | >60 | >75 |

### 5.6 Stack base44 final
```
FRONTEND: React + Vite + Tailwind + shadcn/ui · query params · paleta "Concilio" · accesibilidad +120%/voz
BACKEND: 38 Backend Functions (uso 38/50) · HTTP + CRON + Entity Trigger + Connector
DATOS: 18 Entities JSON Schema · CRUD vía SDK · roles citizen|pyme|admin|b2b_client
IA: InvokeLLM + 7 AI Agents JSONC + Superagente Lya · GenerateImage para infografías
INTEGRACIONES: SendEmail · WhatsApp · Stripe · Google Sheets · UploadFile + ExtractDataFromUploadedFile · Automations
STORAGE: Private (docs legales) · Public (infografías + normativa cacheada) · Whisper STT
```

### 5.7 Optimizaciones
- **Prompt Caching** sobre system prompt regulatorio (Ley 21.521 + NCG 502 + 514 + Ley 21.398 + Ley 21.719) → ahorro hasta 90% tokens.
- **Normativa cacheada** en Public Storage como markdown estructurado (ExtractDataFromUploadedFile sobre PDFs CMF/SERNAC/SII).
- **Entity Triggers** asíncronos para generación de documentos.

### 5.8 Catálogo Entities (18 propuestas)
Núcleo: `UserProfile`, `Case`, `LegalDeadline`, `GeneratedDocument`, `AgentTrace`, `ConsultationHistory`, `PymeProfile`, `TaxAlert`, `ComplianceAPIClient`, `ComplianceAPILog`. 
Adicionales: `RegulatoryKnowledgeBase` (normativa cacheada), `FraudAlert` (cruzada CMF/PhishTank), `UserSubscription` (Stripe), `InsightReport` (B2B agregado), `NotificationLog`, `SFAConsent` (consentimiento bancario), `ARCORequest` (derechos ARCO).

#### Schemas críticos resumidos
- **`UserProfile`** — profileType (citizen|student|retiree|entrepreneur|pyme), ageRange, region, accessibilityMode, voiceEnabled, whatsappEnabled, whatsappNumber (+56 [0-9]{9}), subscriptionTier, stripeCustomerId, monthlyConsultationCount, totalCasesCreated, totalDocumentsGenerated, preferredLanguageLevel (simple|standard|technical).
- **`Case`** — userId, title, description, regulatoryBody (CMF|SERNAC|SII|CSIRT|IPS|SERCOTEC|MULTIPLE), caseType (cobro_indebido|fraude_financiero|clausula_abusiva|multa_tributaria|reclamo_sernac|denuncia_cmf|consulta_sii|proteccion_datos|otro), status (active|document_generated|submitted|resolved|expired|cancelled), urgencyLevel, amountInvolved, agentReasoningSummary, normativeReferences[], recommendedActions[], agentTraceId.
- **`LegalDeadline`** — caseId, userId, deadlineType (reclamo_cmf|reclamo_sernac|respuesta_banco|apelacion_sii|prescripcion_accion|vencimiento_consentimiento_sfa), deadlineDate, daysRemaining, legalBasis, alertSent5Days/2Days/SameDay, status.
- **`GeneratedDocument`** — caseId, userId, documentType (carta_reclamo_cmf|carta_reclamo_sernac|solicitud_arco|denuncia_fraude|carta_certificada_banco|formulario_sii|contrato_analisis), title, contentMarkdown, storageUrl (Private), version, generatedByAgent, isPremium, downloadCount.
- **`AgentTrace`** — caseId, agentName (Lya|AgenteCMF|AgenteSERNAC|AgenteSII|AgenteAntifraude|AgenteDocumentos|AgenteEducativo|AgenteCompliance), inputQuery (anonimizado), reasoningSteps[{step, thought, toolUsed, toolInput, toolOutput}], normativeSourcesConsulted[], confidenceScore (0-1), isPublic (default true), processingTimeMs, tokensUsed.
- **`ConsultationHistory`** — sessionId, userMessage, agentResponse, agentName, caseCreated, documentGenerated, regulatoryBodyIdentified, userSatisfactionRating (1-5), inputChannel (web|whatsapp|voice|telegram).
- **`PymeProfile`** — businessName, rut (^[0-9]{7,8}-[0-9Kk]$), businessType (persona_natural|eirl|spa|ltda|sa|cooperativa), economicActivity, monthlyRevenue, taxRegime (regimen_general|pro_pyme|pro_pyme_transparente|renta_presunta), vatObligations, nextTaxDeadline, financialHealthScore (0-100), financialHealthLabel (crítico|en_riesgo|estable|saludable|excelente).
- **`TaxAlert`** — alertType (vencimiento_iva|vencimiento_ppm|declaracion_renta|multa_detectada|beneficio_disponible|cambio_normativo), amountAtRisk, deadline, priority, actionRequired, siiFormReference (ej. "Formulario 29").
- **`ComplianceAPIClient`** — companyName, rut, contactEmail, apiKey (SHA-256 hash), plan (base|professional|enterprise = 10K/50K/ilimitado), monthlyCallLimit, currentMonthCalls, stripeSubscriptionId, enabledEndpoints[], isActive.
- **`ComplianceAPILog`** — clientId, endpoint, requestPayload (anonimizado), responsePayload, complianceScore (0-100), riskFlags[], normativeReferences[], processingTimeMs, tokensUsed, httpStatusCode.

### 5.9 Backend Function principal: `processConsultation`
HTTP POST `/api/consultation/process`. Flujo:
1. Cargar `UserProfile` (languageLevel, accessibilityMode).
2. Cargar normativa cacheada Public Storage.
3. InvokeLLM Claude Sonnet con system prompt Lya + tools (identify_regulatory_body, calculate_legal_deadline, check_fraud_patterns, generate_document_recommendation).
4. Parsear respuesta estructurada (HECHO + TRADUCCIÓN + ACCIÓN).
5. Crear `Case` si requiere seguimiento + `LegalDeadline` asociado.
6. Registrar `ConsultationHistory` y `AgentTrace` (anonimizado, isPublic=true).
7. Return JSON con success + caseId + parsedResponse.

### 5.10 Flujos canónicos
- **Consulta ciudadana:** `ChatInterface` → `processConsultation` → Lya → bloques HECHO+TRADUCCIÓN+ACCIÓN → `Case` + `LegalDeadline` → opcional `generateLegalDocument` (PDF Private Storage) → `AgentTrace` público.
- **Alerta proactiva:** CRON `dailyDeadlineCheck` 08:00 Chile → `checkLegalDeadlines` (daysRemaining≤5) → InvokeLLM mensaje personalizado → SendEmail con doc adjunto + WhatsApp.
- **Compliance API B2B:** POST autenticado → `validateFinancialProduct` → InvokeLLM con contexto cacheado → JSON {compliance_score, risk_flags[], normative_references[], recommended_actions[]} → `ComplianceAPILog`.

### 5.11 Roles y permisos
| Rol | Entities | Funciones |
|---|---|---|
| `citizen` | Case, LegalDeadline, GeneratedDocument, UserProfile (propios) | processConsultation, generateDocument, viewMyTrace |
| `pyme` | + PymeProfile, TaxAlert, FinancialHealth | + analyzeTaxSituation, generateTaxDocument |
| `b2b_client` | ComplianceAPILog, APIUsage | validateProduct, getRegulatorAlerts, analyzeComplaint |
| `admin` | Todas | Todas |

Documentos legales en **Private Storage** (acceso exclusivo propietario). AgentTrace en `/Transparencia` **público pero anonimizado** (sin nombre/RUT).

---

## Referencias canónicas finales (consolidadas)

- **Tagline:** *"Esto no es un chatbot. Es el sistema operativo financiero del pueblo de Chile."*
- **Dominio:** finlogic.one
- **Equipo:** Gabriel · Paula · Diego · Marco
- **Perfiles:** Camila (22 Stgo) · Don Luis (68 Vlpo) · María José (34 Tco) · Roberto (45 Antof.)
- **Pricing:** Pro $3.990/mes · Compliance API $490.000/mes (10K calls + $0.008 USD/extra) · Embed $0.015 USD + $2.5M setup · Insights $12-24M CLP/año
- **Multa CMF ref:** 5.000 UF (~$190M CLP) · Margen B2B ~85%
- **Modelo año 1:** ~$400M CLP · break-even mes 14-18
- **12 módulos normativos:** 21.521 · NCG 502 · 19.496 · 20.555 · 21.719 · 20.009 · 21.663 · LIR Pro-Pyme · 21.713 · cripto · Open Finance · CSIRT
- **SFA vigencia:** 4-jul-2026
- **Telemetría live:** 45 consultas · score 72/100 · latencia 49s · 2 docs · 8 integraciones cero mocks
- **Roles base44:** citizen · pyme · admin · b2b_client
- **18 Entities · 38/50 Backend Functions · 7 AI Agents + Superagente Lya**