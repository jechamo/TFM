# ChaFit · Inventario funcional

> Inspección de código: 26/09/2026 · Repositorio privado [`jechamo/chafit360`](https://github.com/jechamo/chafit360) · commit `d18493d` (release 35, 11/09/2026) · producción: [chafit.es](https://chafit.es), App Store y Google Play.
> Autor del producto y del TFM: Jorge Chamorro.

## Cómo se ha construido este inventario

Se ha recorrido el código real, no la portada ni el README: rutas de `src/App.tsx` (24 declaraciones), las 25 páginas de `src/pages`, los 77 componentes de `src/components`, los 22 hooks, las pestañas de cada panel por rol, las 28 Edge Functions de `supabase/functions` y las 52 migraciones. Cada fila apunta al fichero donde vive la funcionalidad.

**Criterio de recuento.** Una *funcionalidad* es una capacidad que un actor puede usar, con una entrada y un resultado reconocibles y al menos un punto de entrada en el código. No se cuentan botones, variantes visuales ni dependencias. Un *módulo* es un área funcional del producto tal como la organiza su navegación por rol.

**Resultado: 13 módulos · 62 funcionalidades.**

**Estados.**

| Estado | Significado en este inventario |
|---|---|
| `PRODUCCIÓN` | En `main` de la versión publicada y visible en el recorrido que el autor grabó sobre la app en producción (vídeo `chafit-4min`, minuto indicado) o en la web pública |
| `ACTIVA` | En `main` y accesible desde la navegación o el panel de su rol; no aparece en el vídeo |
| `PARCIAL` | Implementada con piezas incompletas que se indican |
| `EXPERIMENTAL` | Herramienta interna o de apoyo, no pensada para el usuario final |
| `PENDIENTE DE VERIFICAR` | Existe en código, pero su funcionamiento real depende de un entorno que no se ha podido comprobar (dispositivo físico, cobro real) |

Actores: **C** cliente/atleta · **E** entrenador · **G** propietario de gimnasio · **S** superusuario · **V** visitante.
Móvil: la SPA se empaqueta con Capacitor 8 para iOS y Android (`com.chafit.app`); "Web+nativa" significa código compartido.

## Inventario

| ID · Módulo | Funcionalidad | Descripción | Actor | Frontend | Backend | Datos | IA | Integraciones | Mobile | Evidencia | Estado |
|---|---|---|---|---|---|---|---|---|---|---|---|
| CF-01 · Acceso y cuenta | Landing y precios públicos | Presenta el sistema 360 y las cuatro tarifas (cliente, entrenador, gimnasio, gimnasio + 3 entrenadores) | V | `Index`, `Pricing`, `PricingModal` | — | — | — | — | Web+nativa | `src/pages/Index.tsx`, `src/pages/Pricing.tsx`; captura pública `chafit-pricing` | PRODUCCIÓN |
| CF-02 · Acceso y cuenta | Registro por rol | Alta como cliente, entrenador o propietario; gimnasio "virtual" para freelances; códigos de registro | V | `Auth` | Supabase Auth + Data API + RPC de códigos | `profiles`, `user_roles`, `clients`, `trainers`, `gyms` | — | Supabase; webhook n8n de alta | Web+nativa | `src/hooks/useAuth.tsx` (registro), `:264` (webhook) | PRODUCCIÓN |
| CF-03 · Acceso y cuenta | Inicio de sesión y recuperación | Login, cierre de sesión, restablecer contraseña con redirecciones permitidas | Todos | `Auth`, `ResetPassword` | Supabase Auth | sesión | — | Supabase | Web+nativa | `src/lib/authRedirect.ts` (+ test) | PRODUCCIÓN |
| CF-04 · Acceso y cuenta | Acceso biométrico | Guarda credenciales en el almacén nativo y desbloquea con huella/cara | C/E/G | `Auth` | plugin nativo | almacén del SO | — | Capgo NativeBiometric | Solo nativa | `src/pages/Auth.tsx` | PENDIENTE DE VERIFICAR (dispositivo) |
| CF-05 · Acceso y cuenta | Términos y consentimiento de IA | Aceptación de términos y consentimiento explícito antes de enviar datos a IA; aviso de uso de IA | Todos | `TermsAndConditions`, `AIDataConsentDialog`, `AIDisclosureBanner` | Data API | `terms_acceptance`, `ai_data_consent` | Condición previa | Supabase | Web+nativa | `src/hooks/useAIConsent.tsx`, `useTermsVerification.tsx` | PRODUCCIÓN |
| CF-06 · Acceso y cuenta | Perfil deportivo | Edad, medidas, objetivos, lesiones y restricciones que alimentan las generaciones | C/E | `EditProfileDialog`, `WorkoutProfileOverrideFields` | Data API | `clients` | Contexto de prompts | Supabase | Web+nativa | `src/components/EditProfileDialog.tsx`, `src/utils/clientProfileFields.ts` | PRODUCCIÓN |
| CF-07 · Acceso y cuenta | Baja de cuenta | Elimina la cuenta y sus relaciones desde servidor | Todos | ajustes de perfil | `delete-account` | Auth + tablas de dominio | — | Supabase, Stripe | Web+nativa | `supabase/functions/delete-account/` | ACTIVA |
| CF-08 · Gimnasios | Panel del centro | Resumen de entrenadores, alumnos, rutinas completadas y calorías; notificaciones de altas | G | `GymDashboard` (pestaña *overview*), `GymNotifications` | Data API + Realtime | `gyms`, `trainers`, `clients`, `workout_sessions` | — | Supabase | Web+nativa | `src/pages/GymDashboard.tsx`; vídeo 3:12 | PRODUCCIÓN |
| CF-09 · Gimnasios | Equipo y alumnos | Rendimiento por entrenador, lista de alumnos, liberar entrenador o cliente | G | `GymDashboard` (*trainers*, *clients*) | RPC `gym_release_trainer`, `gym_release_client` | relaciones gimnasio-personas | — | Supabase | Web+nativa | `src/pages/GymDashboard.tsx`; vídeo 3:18 | PRODUCCIÓN |
| CF-10 · Gimnasios | Códigos de acceso y de suscripción | Genera códigos para dar de alta entrenadores/alumnos y reparte cupos de suscripción | G | `GymAccessCodes`, `GymSubscriptionCodes` | Data API + `sync-gym-codes` | `trainer_registration_codes`, `client_registration_codes` | — | Supabase, Stripe | Web+nativa | `src/components/GymSubscriptionCodes.tsx`; vídeo 3:24 | PRODUCCIÓN |
| CF-11 · Gimnasios | Perfil y ubicación del centro | Ficha pública del gimnasio con ubicación en mapa y geocodificación | G | `GymProfileEditor`, `GymLocationPicker` | Data API | `gyms` | — | Mapbox (mapa + geocoding v5) | Web+nativa | `src/components/maps/GymLocationPicker.tsx:129` | ACTIVA |
| CF-12 · Entrenadores | Cartera de clientes | Lista de clientes con objetivos, lesiones, historial y planes; asignar rutinas, dietas y retos | E | `TrainerDashboard` (*clients*), `ClientDetail` (*workouts*, *nutrition*, *challenges*) | Data API, RPC `release_client` | `clients`, `workout_plans`, `nutrition_plans` | Genera para el cliente | Supabase | Web+nativa | `src/pages/ClientDetail.tsx`; vídeo 2:42 | PRODUCCIÓN |
| CF-13 · Entrenadores | Perfil profesional y zona | Nombre, ficha, radio de trabajo sobre mapa para aparecer en búsquedas | E | `TrainerProfileEditor`, `TrainerZoneSelector`, `EditTrainerNameDialog` | Data API | `trainers` | — | Mapbox | Web+nativa | `src/components/maps/TrainerZoneSelector.tsx:168`; vídeo 2:54 | PRODUCCIÓN |
| CF-14 · Entrenadores | Código de entrenador y cambio de centro | Código propio para vincular clientes; canjear código de gimnasio; cambiar de centro | E | `TrainerCodeCard`, `TrainerAccessCodeRedemption`, `TrainerGymChangeDialog` | RPC | `trainers`, códigos | — | Supabase | Web+nativa | `src/components/TrainerCodeCard.tsx` | ACTIVA |
| CF-15 · Entrenadores | Búsqueda de entrenador o gimnasio | Mapa con radio, filtros por tipo (freelance, entrenador de gimnasio, gimnasio) y valoración | C | `SearchPage`, `ClientSearch`, `SearchMap` | RPC `search_trainers`, `search_gyms` | `trainers`, `gyms` | — | Mapbox | Web+nativa | `src/pages/ClientSearch.tsx`, `src/components/maps/SearchMap.tsx`; vídeo 2:30 | PRODUCCIÓN |
| CF-16 · Entrenadores | Vincular y desvincular entrenador | El cliente se une a un entrenador por código o se desvincula | C | `LinkTrainerCard`, `UnlinkTrainerCard`, `GymChangeDialog` | RPC `link_client_to_trainer`, `release_client` | `clients` | — | Supabase | Web+nativa | `src/components/LinkTrainerCard.tsx` | ACTIVA |
| CF-17 · Rutinas con IA | Generar rutina (5 modalidades) | Gimnasio, calistenia, HIIT, circuito y CrossFit a partir del perfil y objetivos | C/E | `AIRoutineInputPanel`, `WorkoutGenerationLoader` | `generate-workout`, `generate-calistenia`, `generate-hiit`, `generate-circuit`, `generate-crossfit` | `workout_generation_jobs`, `workout_plans` (`plan_json` + HTML) | OpenAI chat, JSON Schema estricto | OpenAI | Web+nativa | `supabase/functions/_shared/workout-generation.ts`; spec 001 y 005; vídeo 2:00 | PRODUCCIÓN |
| CF-18 · Rutinas con IA | Encargo por voz, foto o tabla | Dictar el encargo, adjuntar foto de una tabla o un Excel/CSV (máx. 3 adjuntos) | C/E | `AIRoutineInputPanel`, `VoiceRecorder` | `transcribe-audio` + generadores | adjuntos del job | Whisper + visión | OpenAI | Web+nativa | `src/utils/aiRoutineAttachments.ts` (+ test); spec 005 | PRODUCCIÓN |
| CF-19 · Rutinas con IA | Modificar rutina con IA | Pedir cambios en lenguaje natural, previsualizar y guardar | C/E | `WorkoutModifyDialog` | `modify-workout` | `workout_plans` | OpenAI chat | OpenAI | Web+nativa | `supabase/functions/modify-workout/` | ACTIVA |
| CF-20 · Rutinas con IA | Importar rutina desde hoja de cálculo | Previsualiza la primera hoja de un Excel y la convierte en plan | C/E | `WorkoutImporter` | Data API | `workout_plans` | — | SheetJS (local) | Web+nativa | `src/components/WorkoutImporter.tsx`, `src/utils/spreadsheetToText.ts` (+ test) | ACTIVA |
| CF-21 · Rutinas con IA | Tabla de rutina y días | Ver, activar, borrar, filtrar por día y renombrar días; objetivo semanal | C/E | `WorkoutTable`, `RenameWorkoutDayDialog` | RPC de renombrado, `update_client_weekly_goal` | `workout_plans`, `clients` | — | Supabase | Web+nativa | `src/components/WorkoutTable.tsx`; spec 005 | PRODUCCIÓN |
| CF-22 · Rutinas con IA | Exportar y compartir rutina | Descarga en Excel o comparte el fichero desde el móvil | C/E | `useExcelDownload` | local | fichero derivado | — | Capacitor Filesystem/Share | Adaptación nativa | `src/hooks/useExcelDownload.tsx`; vídeo 1:18 | PRODUCCIÓN |
| CF-23 · Rutinas con IA | Cambiar un ejercicio | Alternativas sugeridas por IA conservando series y descanso | C | `ExerciseSwapDialog` | `suggest-exercise-swap` | `workout_plans` | OpenAI chat | OpenAI | Web+nativa | `supabase/functions/_shared/exercise-swap.ts` (+ test); spec 006 | PRODUCCIÓN |
| CF-24 · Rutinas con IA | Variante con mancuernas y notas | Alternativa por ejercicio cuando la máquina está ocupada y notas personales | C | `ExerciseAlternativePanel`, `ExerciseNotePanel` | Data API | `workout_plan_alternatives`, `client_exercise_notes`, `client_exercise_variant_preferences` | Alternativa generada con el plan | Supabase | Web+nativa | `src/hooks/useExerciseExtras.ts`; spec 004 | PRODUCCIÓN |
| CF-25 · Ejecución | Calentamiento guiado | Zona de calentamiento con cuenta atrás, una sola vez por sesión | C | `WorkoutExecution` | Data API | `workout_sessions.warmup_completed_at` | — | Supabase | Web+nativa | spec 001 (RF-03); vídeo 0:36 | PRODUCCIÓN |
| CF-26 · Ejecución | Sesión ejercicio a ejercicio | Foto, series, repeticiones, peso anterior, superseries y descanso cronometrado | C | `WorkoutExecution`, `WorkoutExecutionPage` | Data API | `workout_sessions`, `exercise_logs` | — | Supabase | Web+nativa | `src/utils/exerciseBlocks.ts`, `exerciseCompletion.ts` (+ tests); vídeo 0:42 | PRODUCCIÓN |
| CF-27 · Ejecución | Navegación libre por la sesión | Deslizar entre ejercicios, saltar, posponer y reanudar sin perder el progreso | C | `ExerciseDeckPager` | estado + persistencia | sesión | — | Supabase | Gestos táctiles | `src/utils/executionFlow.ts` (+ test); spec 007 | PRODUCCIÓN |
| CF-28 · Ejecución | Marcar ejercicio para cambiar | Deja marcado un ejercicio para revisarlo con el entrenador | C | `useExerciseChangeMarks` | Data API | `workout_plan_exercise_change_marks` | — | Supabase | Web+nativa | `src/utils/exerciseChangeMarkKey.ts` (+ test); spec 007 | ACTIVA |
| CF-29 · Ejecución | Modos HIIT, circuito y CrossFit | Temporizadores y flujos propios de cada modalidad | C | `HiitExecutionPage`, `CircuitExecutionPage`, `CrossfitExecutionPage` | Data API | sesiones | — | Supabase | Web+nativa | `src/hooks/useHiitMode.ts`, `useCircuitMode.ts`, `useCrossfitMode.ts` | ACTIVA |
| CF-30 · Ejecución | Aviso de fin de descanso | Notificación local cuando termina el descanso | C | `WorkoutExecution` | plugin | — | — | Capacitor LocalNotifications | Solo nativa | `src/components/WorkoutExecution.tsx` | PENDIENTE DE VERIFICAR (dispositivo) |
| CF-31 · Ejecución | Resumen y valoración de sesión | Duración, calorías y valoración del entrenador al terminar; historial de sesiones | C | `WorkoutSummary`, `SessionManager`, `TrainerRating` | Data API, `backfill-challenges` | `workout_sessions`, `trainer_ratings` | — | Supabase | Web+nativa | `src/components/WorkoutSummary.tsx`; vídeo 0:24 | PRODUCCIÓN |
| CF-32 · Catálogo de ejercicios | Ficha explicada de cada ejercicio | Guía paso a paso, técnica, consejos y enlace a vídeos | C/E | `ExerciseDetail`, `ExerciseDetailModal` | `get-exercise-details` | `exercises`, `exercise_mappings` | OpenAI completa la ficha | OpenAI | Web+nativa | `supabase/functions/get-exercise-details/`; vídeo 1:24 | PRODUCCIÓN |
| CF-33 · Catálogo de ejercicios | Ilustración generada del ejercicio | Imagen del ejercicio creada con IA cuando no existe | Sistema/S | `ExerciseImagePanel`, `ExerciseImageGeneratingOverlay` | `generate-exercise-image`, `regenerate-exercise-image` | `exercises`, bucket `exercise-images` | OpenAI Images | OpenAI, Storage | Web+nativa | `supabase/functions/_shared/exercise-image-prompt.ts` | PRODUCCIÓN |
| CF-34 · Catálogo de ejercicios | "Tu máquina": foto real → ilustración | El usuario fotografía la máquina de su gimnasio y la IA la usa en la ficha | C/E | `ExerciseMachinePhotoDialog` | `generate-exercise-image-from-photo` | overrides por usuario/gimnasio | OpenAI `images/edits` | OpenAI, Storage | Cámara | `supabase/functions/_shared/machine-photo-prompt.ts` (+ test); spec 005; vídeo 1:36 | PRODUCCIÓN |
| CF-35 · Catálogo de ejercicios | Tags y reutilización de imágenes | Clasifica el ejercicio y reutiliza imágenes equivalentes para no regenerar | Sistema | `ExerciseTagChips` | `_shared/exercise-tags.ts` | `exercises.tag_*` | Evita llamadas repetidas | Supabase | Web+nativa | `src/utils/exerciseTags.ts` (+ tests); spec 005 | ACTIVA |
| CF-36 · Catálogo de ejercicios | Miniaturas en segundo plano | Cola durable que convierte cada imagen a miniatura WebP con reintentos | Sistema | resolutor de miniaturas | `thumbnail-worker`, `thumbnail-maintenance`, `generate-thumbnail` | `exercise_thumbnail_tasks/runs`, cola `pgmq` | — | pg_cron, ImageMagick WASM | Web+nativa | `supabase/functions/_shared/thumbnail-image.ts`; spec 002 | ACTIVA |
| CF-37 · Catálogo de ejercicios | Valorar la ilustración | El usuario puntúa si la imagen representa bien el ejercicio | C | `ExerciseImageRating`, `ExerciseRatingsModal` | Data API | `exercise_image_ratings` | Retroalimentación | Supabase | Web+nativa | `src/components/ExerciseImageRating.tsx`; vídeo 1:36 | PRODUCCIÓN |
| CF-38 · Nutrición | Generar dieta con IA | Plan por días con calorías y macros, indicando nº de comidas | C/E | pestaña *nutrition* | `generate-nutrition` | `nutrition_generation_jobs`, `nutrition_plans` | OpenAI chat | OpenAI | Web+nativa | `src/pages/ClientDashboard.tsx` (`functions.invoke`); vídeo 2:06 | PRODUCCIÓN |
| CF-39 · Nutrición | Consultar y gestionar dietas | Vista por día, objetivo calórico, editar o borrar planes | C/E | `NutritionTable`, `NutritionDayView`, `NutritionSummary` | Data API | `nutrition_plans` | — | Supabase | Web+nativa | `src/components/nutrition/NutritionDayView.tsx`; vídeo 1:42 | PRODUCCIÓN |
| CF-40 · Nutrición | Foto al plato | Identifica ingredientes y estima calorías y macros desde una foto o texto | C | `MealPhotoAnalyzer` | `analyze-meal-photo` | `meal_calorie_logs` | OpenAI visión | OpenAI | Cámara | `supabase/functions/analyze-meal-photo/`; vídeo 1:48 | PRODUCCIÓN |
| CF-41 · Nutrición | Diario calórico y comidas guardadas | Totales del día, plantillas de comidas reutilizables | C | `DailyCalorieTracker`, `SavedMealsList` | Data API | `meal_calorie_logs`, `saved_meals` | — | Supabase | Web+nativa | `src/components/DailyCalorieTracker.tsx` | ACTIVA |
| CF-42 · Progreso | Peso y evolución por ejercicio | Registro de peso y gráficas de cargas por ejercicio | C | `Progress` | Data API | `progress_tracking`, `exercise_logs` | — | Recharts (local) | Web+nativa | `src/pages/Progress.tsx`; vídeo 1:00 | PRODUCCIÓN |
| CF-43 · Progreso | Antes y después con IA | Compara dos fotos y analiza la transformación | C | `ProgressAnalysis` | `analyze-progress` | cupo de análisis | OpenAI visión | OpenAI | Cámara | `src/pages/ProgressAnalysis.tsx`; vídeo 1:06 | PRODUCCIÓN |
| CF-44 · Progreso | Actividad de salud del móvil | Pide permisos y muestra actividad diaria de HealthKit / Health Connect | C | `WearableStatsDialog`, `HealthConnectGuideDialog` | `healthService` | datos del dispositivo | — | cordova-plugin-health | Solo nativa | `src/services/healthService.ts` | PARCIAL: adaptadores Garmin/Samsung/Health Connect de `src/services/wearables` son esqueletos |
| CF-45 · Comunidad y motivación | Retos y logros | Rachas, volumen, intensidad; verificación automática al terminar sesiones | C | `ChallengesPanel`, `ChallengeVerification` | `backfill-challenges` + Realtime | `challenges`, `client_challenges` | — | Supabase | Web+nativa | `src/components/ChallengeVerification.tsx`; vídeo 2:12 | PRODUCCIÓN |
| CF-46 · Comunidad y motivación | Rankings multi-gimnasio | Clasificación en tu gimnasio, entre gimnasios y entre amigos | C/E | `RankingTableMultiGym`, `Rankings` | RPC de ranking | sesiones agregadas | — | Supabase | Web+nativa | `src/pages/Rankings.tsx`; vídeo 2:18 | PRODUCCIÓN |
| CF-47 · Comunidad y motivación | Amistades | Solicitudes y lista de amigos | C | `FriendshipManager` (*friends*) | Data API | `client_friendships` | — | Supabase | Web+nativa | `src/components/FriendshipManager.tsx` | ACTIVA |
| CF-48 · Comunidad y motivación | Valorar al entrenador | Estrellas por sesión y ranking de valoraciones de entrenadores | C/E | `TrainerRating`, `RatingRankings`, `MyTrainerScore`, `TrainerRankingTable` | RPC de valoración | `trainer_ratings` | — | Supabase | Web+nativa | `src/components/TrainerRating.tsx`; vídeo 0:30 | PRODUCCIÓN |
| CF-49 · Mensajería y asistente | Chat entrenador–cliente | Mensajes directos con contador de no leídos en tiempo real | C/E | `Messages` | Data API + Realtime | `messages` | — | Supabase Realtime | Web+nativa | `src/pages/Messages.tsx`, `src/hooks/useUnreadMessages.tsx` | ACTIVA |
| CF-50 · Mensajería y asistente | Asistente de entrenamiento | Chat con IA con contexto de la rutina, adjuntos y voz; cupo diario | Todos | `Chat`, `ChatInterface`, `WorkoutChatModal` | `chat-assistant` | `chat_conversations`, `chat_messages`, `chat_daily_usage` | OpenAI Assistants API | OpenAI | Web+nativa | `supabase/functions/chat-assistant/`; vídeo 2:25 | PRODUCCIÓN |
| CF-51 · Mensajería y asistente | Contacto y soporte | Formulario de contacto por email y bandeja de consultas dentro de la app | Todos/S | `ContactForm`, `ContactMessagesInbox`, `ContactMessageDialog` | `send-contact-email` + Data API | `contact_messages` | — | Resend | Web+nativa | `supabase/functions/send-contact-email/` | ACTIVA |
| CF-52 · Suscripciones y pagos | Contratar un plan | Checkout de Stripe según rol y tarifa | Todos | `Pricing`, `PricingModal`, `PaymentSuccess` | `create-checkout` | `user_subscriptions` | — | Stripe | Web+nativa (redirección) | `supabase/functions/create-checkout/` | PENDIENTE DE VERIFICAR (cobro real) |
| CF-53 · Suscripciones y pagos | Estado de suscripción y muro de pago | Comprueba la suscripción y bloquea funciones premium | Todos | `SubscriptionGuard`, `SubscriptionWall`, `SubscriptionStatusCard` | `check-subscription` | `user_subscriptions` | — | Stripe | Web+nativa | `src/hooks/useSubscriptionCheck.tsx` | PRODUCCIÓN |
| CF-54 · Suscripciones y pagos | Portal de cliente y códigos de acceso | Gestionar la suscripción en Stripe; canjear códigos que añaden días | Todos | `SubscriptionStatusCard` | `customer-portal`, RPC `use_access_code` | `access_codes` | — | Stripe, Supabase | Web+nativa | `supabase/functions/customer-portal/`; códigos: vídeo 3:00 | PRODUCCIÓN |
| CF-55 · Administración | Resumen y límites de generación | Visión global y cupos de IA por tipo de generación | S | `SuperuserDashboard` (*overview*, *limits*), `GenerationLimitsManager` | Data API, RPC `get_generation_limits` | `superuser_settings`, `*_generation_usage` | Gobierno del consumo | Supabase | Web+nativa | `src/pages/SuperuserDashboard.tsx` | ACTIVA |
| CF-56 · Administración | Configuración de modelos de IA | Elegir modelo de texto/visión y modelo/calidad de imagen por función | S | `AIModelConfigManager` (*ai-models*) | `_shared/openai-models.ts` | `ai_model_config` | Selección de modelo | OpenAI | Web+nativa | `supabase/functions/_shared/openai-models.ts:8`, `:16` | ACTIVA |
| CF-57 · Administración | Simulador de costes | Escenarios de uso, coste estimado de IA y márgenes | S | `CostSimulator` (*costs*) | Data API | parámetros | Estimación de coste | — | Web+nativa | `src/components/CostSimulator.tsx` | ACTIVA |
| CF-58 · Administración | Retos, códigos y Stripe | Crear retos, códigos de acceso y ajustes de precios de Stripe | S | `ChallengeManager`, `AccessCodeManager`, `StripeSettingsManager` | Data API | `challenges`, `access_codes`, `superuser_settings` | — | Stripe | Web+nativa | pestañas *challenges*, *codes*, *stripe* | ACTIVA |
| CF-59 · Administración | Ilustraciones y miniaturas | Subir, borrar y regenerar imágenes; lanzar y reintentar el pipeline de miniaturas | S | `StorageManager`, `ImageRegenerateDialog`, `ThumbnailPipelineManager` | Storage, `regenerate-exercise-image`, `thumbnail-maintenance` | bucket `exercise-images` | OpenAI Images | OpenAI | Web+nativa | `src/components/ThumbnailPipelineManager.tsx` | ACTIVA |
| CF-60 · Administración | Datos demo y migración | Sembrar datos de demostración; exportar/migrar datos | S | `DemoDataManager` (*demo*), `MigrationManager` (*migration*) | `seed-demo-data`, `migrate-database` | todas | — | Supabase | Web+nativa | pestañas *demo*, *migration* | EXPERIMENTAL (herramientas internas; ver auditoría) |
| CF-61 · Plataforma | PWA instalable y tutorial | Instalación como PWA y recorrido guiado por cada panel | Todos | `PWAInstallPrompt`, `AppTutorial` | service worker (Vite PWA) | caché | — | Navegador; react-joyride | Web | `vite.config.ts`, `src/hooks/usePWA.tsx`; tutorial: vídeo 3:06 | PRODUCCIÓN |
| CF-62 · Plataforma | Observabilidad con consentimiento | Errores saneados siempre; rendimiento y Replay enmascarado solo si el usuario acepta | Todos | `TelemetryConsent`, `SentryErrorBoundary` | SDK Sentry | eventos saneados | — | Sentry (web + Capacitor) | Web+nativa | `src/sentry.ts`, `src/observability/sanitize.ts` (+ tests); spec 003; banner visible en chafit.es | PRODUCCIÓN |

## Resumen por módulo

| Módulo | Funcionalidades | En producción (vídeo/web) | Invocan un modelo de IA |
|---|---:|---:|---:|
| Acceso y cuenta | 7 | 5 | 0 |
| Gimnasios | 4 | 3 | 0 |
| Entrenadores | 5 | 3 | 0 |
| Rutinas con IA | 8 | 6 | 4 |
| Ejecución | 7 | 4 | 0 |
| Catálogo de ejercicios | 6 | 4 | 3 |
| Nutrición | 4 | 3 | 2 |
| Progreso | 3 | 2 | 1 |
| Comunidad y motivación | 4 | 3 | 0 |
| Mensajería y asistente | 3 | 1 | 1 |
| Suscripciones y pagos | 3 | 2 | 0 |
| Administración | 6 | 0 | 1 |
| Plataforma | 2 | 2 | 0 |
| **Total** | **62** | **38** | **12** |

"Invocan un modelo de IA" cuenta las funcionalidades que llaman a OpenAI en su ejecución (texto, visión, imagen, voz o Assistants). No incluye configuración de modelos ni reutilización de resultados.

## Fuera del recuento

- `src/services/wearables/` contiene adaptadores Garmin, Samsung Health y Health Connect con métodos vacíos: se documentan como parte de CF-44 (`PARCIAL`), no como integraciones.
- YouTube solo aparece como enlace de búsqueda de técnica; no es una API integrada.
- Las pantallas de la versión nativa comparten código con la web: no se cuentan dos veces.

Relacionado: [inventario de arquitectura](CHAFIT_ARCHITECTURE_INVENTORY.md) · [integraciones](CHAFIT_INTEGRATIONS.md) · [mapa funcional](../case-studies/chafit-functional-map.md) · [caso de estudio](../case-studies/chafit.md).
