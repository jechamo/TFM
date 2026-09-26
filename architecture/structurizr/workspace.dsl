/*
 * Workspace generado desde architecture/model/*.json por architecture/tools/export-model.mjs.
 * No editar a mano. Validación: docker run --rm -v "$PWD":/usr/local/structurizr structurizr/cli validate -workspace architecture/structurizr/workspace.dsl
 */
workspace "TFM · Jorge Chamorro" "Sistema SDD/TDD con agentes y tres productos: RRSS Studio, ChaFit e ICG Vault" {
  !identifiers hierarchical
  model {

    // ── ChaFit (jechamo/chafit360@d18493d)
    chafit_users = person "Clientes, entrenadores y gimnasios" "Usan la app según su rol: entrenar, planificar, gestionar clientes o el centro"
    chafit_admin = person "Superusuario" "Gobierna modelos de IA, cupos, costes, retos, códigos y catálogo"
    chafit_openai = softwareSystem "OpenAI API" "Texto, visión, imagen, edición de imagen, transcripción y asistente conversacional" { tags "Externo" }
    chafit_stripe = softwareSystem "Stripe" "Checkout, portal de cliente y estado de suscripciones" { tags "Externo" }
    chafit_resend = softwareSystem "Resend" "Envío del formulario de contacto por email" { tags "Externo" }
    chafit_mapbox = softwareSystem "Mapbox" "Mapas y geocodificación para gimnasios, zonas de entrenador y búsqueda" { tags "Externo" }
    chafit_sentry = softwareSystem "Sentry" "Captura de errores saneados y diagnóstico opcional con consentimiento" { tags "Externo" }
    chafit_n8n = softwareSystem "n8n (Elestio)" "Automatización externa que recibe las nuevas altas" { tags "Externo" }
    chafit_vercel = softwareSystem "Vercel" "Hosting estático del bundle web y CDN" { tags "Externo" }
    chafit_stores = softwareSystem "App Store y Google Play" "Distribución de las apps nativas" { tags "Externo" }
    chafit_github = softwareSystem "GitHub · chafit360" "Código fuente y pull requests" { tags "Externo" }
    chafit_author = softwareSystem "Autor + agentes SDD" "Desarrollo con agentes; despliegue de migraciones y funciones por Supabase MCP; builds nativos" { tags "Externo" }
    chafit = softwareSystem "ChaFit" "Plataforma de fitness para clientes, entrenadores y gimnasios con IA generativa. SPA React empaquetada para web/PWA, iOS y Android, sobre Supabase (BaaS) con 28 Edge Functions." {
      spa = container "Cliente web y móvil" "Interfaz única para web, PWA e iOS/Android; rutas por rol, ejecución de entrenamientos y llamadas a Supabase" "React 18 · Vite · TypeScript · shadcn/ui · PWA · Capacitor 8"
      native = container "APIs del dispositivo" "Acceso a salud, biometría, notificaciones locales y ficheros desde la app nativa" "HealthKit / Health Connect · biometría · notificaciones · archivos"
      gw = container "Endpoint del proyecto" "Punto de entrada HTTPS/WebSocket del proyecto Supabase; enruta a Auth, datos, Storage y funciones" "HTTPS + WebSocket · supabase-js · JWT"
      auth = container "Supabase Auth" "Registro, inicio de sesión, recuperación y emisión de JWT" "email + contraseña · JWT · 4 roles"
      dataapi = container "API de datos" "Consultas y RPC sobre Postgres bajo RLS; suscripciones en tiempo real" "PostgREST · RPC · Realtime"
      storage = container "Storage" "Imágenes de ejercicios y miniaturas WebP" "bucket exercise-images · miniaturas WebP"
      edge = container "Edge Functions" "Lógica de servidor con secretos: generación con IA, pagos, email, miniaturas y administración" "Deno · TypeScript · IA, pagos, email, miniaturas"
      db = container "PostgreSQL 17" "Datos de dominio, políticas RLS, funciones SQL, colas y tareas programadas" "47 tablas · RLS · 52 migraciones · pg_cron · pgmq · pg_net · Vault"
    }
    chafit_users -> chafit.spa "Entrena, planifica y gestiona" "HTTPS / app nativa"
    chafit_admin -> chafit.spa "Configura IA, límites y costes" "HTTPS"
    chafit.spa -> chafit.native "Plugins Capacitor" "puente nativo Capacitor"
    chafit.spa -> chafit.gw "Consultas, RPC, funciones y suscripciones" "HTTPS + WebSocket (supabase-js)"
    chafit.gw -> chafit.auth "/auth/v1" "HTTPS"
    chafit.gw -> chafit.dataapi "/rest/v1 · /realtime/v1" "HTTPS · WebSocket"
    chafit.gw -> chafit.storage "/storage/v1" "HTTPS"
    chafit.gw -> chafit.edge "/functions/v1" "HTTPS"
    chafit.auth -> chafit.db "esquema auth" "SQL interno"
    chafit.dataapi -> chafit.db "SQL bajo RLS" "SQL"
    chafit.edge -> chafit.db "SQL (JWT o service role)" "supabase-js en servidor"
    chafit.db -> chafit.edge "pg_cron + pg_net invocan el worker" "HTTP POST desde Postgres"
    chafit.edge -> chafit.storage "Sube imágenes y miniaturas" "Storage API"
    chafit.edge -> chafit_openai "Rutinas, dietas, visión, imágenes, voz y asistente" "HTTPS REST"
    chafit.edge -> chafit_stripe "Checkout, portal y estado" "SDK stripe@14 sobre HTTPS"
    chafit.edge -> chafit_resend "Email de contacto" "HTTPS REST"
    chafit.spa -> chafit_mapbox "Mapas y geocodificación" "HTTPS · Mapbox GL"
    chafit.spa -> chafit_sentry "Errores saneados" "SDK Sentry"
    chafit.spa -> chafit_n8n "Webhook de alta" "HTTPS POST"
    chafit_vercel -> chafit.spa "Sirve el bundle web (CDN)" ""
    chafit_stores -> chafit.native "Distribuye la app nativa" ""

    // ── ICG Vault (jechamo/icgbolt@610d99d)
    icgvault_users = person "Votantes y jugadores" "Votan, gestionan su biblioteca, progresan en el RPG, juegan y participan en la comunidad"
    icgvault_admin = person "Administración" "Opera catálogo RPG, juegos, contenido editorial, configuración remota y soporte"
    icgvault_cdn = softwareSystem "Imágenes y tráileres" "Portadas de TMDB y tráileres de YouTube servidos directamente a la app" { tags "Externo" }
    icgvault_idp = softwareSystem "Google · Apple" "Identidad federada para inicio de sesión" { tags "Externo" }
    icgvault_tmdb = softwareSystem "TMDB" "Catálogo de películas y series" { tags "Externo" }
    icgvault_igdb = softwareSystem "IGDB" "Catálogo de videojuegos" { tags "Externo" }
    icgvault_hltb = softwareSystem "HowLongToBeat" "Duración estimada de videojuegos" { tags "Externo" }
    icgvault_metacritic = softwareSystem "Metacritic" "Referencias de crítica" { tags "Externo" }
    icgvault_rss = softwareSystem "Medios y podcasts" "Noticias de 11 medios y episodios de podcast" { tags "Externo" }
    icgvault_openai = softwareSystem "OpenAI API" "Imágenes de avatar, guardián, objetos y mascotas; borradores de quiz y encuestas" { tags "Externo" }
    icgvault_vercel = softwareSystem "Vercel" "Hosting estático del bundle web y CDN" { tags "Externo" }
    icgvault_stores = softwareSystem "App Store y Google Play" "Distribución de las apps nativas" { tags "Externo" }
    icgvault_github = softwareSystem "GitHub · icgbolt" "Código fuente y pull requests (la mayoría de agentes)" { tags "Externo" }
    icgvault_author = softwareSystem "Autor + agentes de IA" "Evolución por pull requests con agentes; builds nativos" { tags "Externo" }
    icgvault = softwareSystem "ICG Vault" "Red social gamificada para votar películas, series y videojuegos, con progresión RPG, juegos diarios y competitivos. SPA React para web/PWA, iOS y Android sobre Supabase con 35 Edge Functions." {
      spa = container "Cliente web y móvil" "Interfaz única para web, PWA e iOS/Android; catálogo, voto, perfil, juegos y comunidad" "React 18 · Vite · TypeScript · Tailwind · framer-motion · PWA · Capacitor 8"
      native = container "APIs del dispositivo" "Inicio de sesión nativo, compartir imágenes, descargas y detección de capturas" "Sign-In Google/Apple · compartir · archivos · detector de capturas"
      gw = container "Endpoint del proyecto" "Punto de entrada HTTPS/WebSocket del proyecto Supabase" "HTTPS + WebSocket · supabase-js · JWT"
      auth = container "Supabase Auth" "Cuentas con email, Google y Apple; sesiones JWT" "email · Google · Apple (ID token)"
      dataapi = container "API de datos" "Consultas, 175 funciones RPC (voto, economía, juegos) y tiempo real" "PostgREST · 175 funciones RPC · Realtime"
      storage = container "Storage" "Avatares, portadas, guardianes y arte de tiers" "avatars · covers · guardians · Tiers"
      edge = container "Edge Functions" "Proxies de catálogo, generación con IA, partidas PvP y Duelo, quiz, noticias y mantenimiento" "Deno · catálogo, IA, juegos, editorial"
      db = container "PostgreSQL 17" "Datos de dominio, reglas de economía y juegos en SQL, RLS y tareas programadas" "88 tablas (tipos) · RLS · 136 migraciones · pg_cron · pg_net"
    }
    icgvault_users -> icgvault.spa "Vota, colecciona y juega" "HTTPS / app nativa"
    icgvault_admin -> icgvault.spa "Opera el producto" "HTTPS"
    icgvault.spa -> icgvault.native "Plugins Capacitor" "puente nativo"
    icgvault.spa -> icgvault_idp "OAuth web · ID token nativo" "OAuth 2.0 / OIDC"
    icgvault.spa -> icgvault_cdn "Portadas y tráileres" "HTTPS (img / iframe)"
    icgvault.spa -> icgvault.gw "supabase-js HTTPS + WS · JWT" "HTTPS + WebSocket"
    icgvault.gw -> icgvault.auth "HTTPS" "HTTPS"
    icgvault.gw -> icgvault.dataapi "HTTPS · WebSocket" "HTTPS · WebSocket"
    icgvault.gw -> icgvault.storage "HTTPS" "HTTPS"
    icgvault.gw -> icgvault.edge "HTTPS" "HTTPS"
    icgvault.auth -> icgvault.db "esquema auth" "SQL interno"
    icgvault.dataapi -> icgvault.db "SQL · RPC · RLS" "SQL"
    icgvault.edge -> icgvault.db "SQL" "supabase-js en servidor"
    icgvault.db -> icgvault.edge "pg_cron + pg_net" "HTTP POST programado"
    icgvault.edge -> icgvault.storage "Sube avatares, guardianes y arte" "Storage API"
    icgvault.edge -> icgvault_tmdb "HTTPS REST (proxy)" "HTTPS REST (proxy)"
    icgvault.edge -> icgvault_igdb "OAuth client credentials + REST" "OAuth client credentials + REST"
    icgvault.edge -> icgvault_hltb "HTTPS (endpoints web)" "HTTPS (endpoints web)"
    icgvault.edge -> icgvault_metacritic "HTTPS (HTML)" "HTTPS (HTML)"
    icgvault.edge -> icgvault_rss "RSS / HTML" "RSS / HTML"
    icgvault.edge -> icgvault_openai "Avatares, guardianes, arte, quiz y encuestas" "HTTPS REST"

    // ── RRSS Studio (LeadView) (jechamo/rrss-automation-app@f6510e0)
    rrss_op = person "Operador" "Crea proyectos, revisa análisis, aprueba gastos y publica"
    rrss_anthropic = softwareSystem "Anthropic · Claude" "Modelos Claude detrás de la CLI; búsqueda web para leads y virales" { tags "Externo" }
    rrss_gemini = softwareSystem "Google Gemini" "Comprensión de vídeo para virales y laboratorio de clips" { tags "Externo" }
    rrss_fal = softwareSystem "fal.ai" "Generación de cortes de vídeo con modelos del catálogo" { tags "Externo" }
    rrss_heygen = softwareSystem "HeyGen" "Vídeo de presentador con avatar y voz" { tags "Externo" }
    rrss_eleven = softwareSystem "ElevenLabs" "Locución a partir de texto" { tags "Externo" }
    rrss_scrape = softwareSystem "Scrape Creators" "Búsqueda estructurada de virales y métricas de autores" { tags "Externo" }
    rrss_github = softwareSystem "GitHub" "Clonado de repositorios para analizar código" { tags "Externo" }
    rrss_target = softwareSystem "App web objetivo" "La web que se analiza, recorre y graba" { tags "Externo" }
    rrss_social = softwareSystem "YouTube · TikTok · Instagram" "Fuente de vídeos de referencia y destino de la publicación asistida" { tags "Externo" }
    rrss_ghactions = softwareSystem "GitHub Actions" "Gates SDD, instalación limpia y E2E simulado en Windows 11" { tags "Externo" }
    rrss_author = softwareSystem "Autor + agentes SDD" "Desarrollo guiado por requisitos con agentes y el kit SDD" { tags "Externo" }
    rrss = softwareSystem "RRSS Studio (LeadView)" "Aplicación web local (Next.js en 127.0.0.1) que analiza una app web y produce inteligencia de producto y contenido de vídeo para redes. Monolito modular en un único proceso Node, SQLite y herramientas locales; IA por Claude Code CLI y proveedores multimedia." {
      browser = container "Interfaz web" "Panel, proyectos, grafo de pipeline, editores, estudio, laboratorio de clips y ajustes" "React 19 · App Router · Tailwind 4 · React Flow · Zustand · React Query"
      server = container "Servidor Next.js" "Route Handlers y todo el dominio en un proceso: pipelines, IA, medios, clips, Vault y conectores" "Next.js 15 · 52 route.ts · REST + SSE · monolito modular"
      db = container "SQLite" "Proyectos, runs, dossier, competencia, leads, virales, piezas, medios, MIX y estado de conectores" "Prisma 6 · 11 modelos"
      vault = container "Vault cifrado" "Claves de proveedores y credenciales de la app objetivo cifradas en reposo" "AES-256-GCM · clave local · lock"
      files = container "Almacén de medios" "Vídeos, audios, logos, composiciones MIX y trabajos del laboratorio de clips" "data/ · vídeos, logos, MIX, jobs de clips"
      claudecli = container "Claude Code CLI" "Ejecuta las tareas de texto de IA con la sesión local de Claude Code" "claude -p · JSON · --allowedTools"
      playwright = container "Playwright + Chromium" "Login, verificación de rutas y grabación automática de la app objetivo" "login, rutas y grabación"
      ffmpeg = container "FFmpeg · ffprobe" "Montaje, recortes, subtítulos, MIX y validación de medios" "montaje, subtítulos, MIX"
      ytdlp = container "yt-dlp" "Descarga de vídeo y subtítulos públicos" "vídeo y subtítulos públicos"
      whisper = container "whisper.cpp" "Transcripción local sin coste de API" "transcripción local (small)"
      installer = container "Instalador guiado" "Diagnóstico, preparación con consentimiento, build y arranque verificado" "preparar.bat · check → prepare → start"
    }
    rrss_op -> rrss.browser "Analiza y produce" "navegador local"
    rrss.browser -> rrss.server "REST + SSE 127.0.0.1" "HTTP loopback · Server-Sent Events"
    rrss.server -> rrss.db "Prisma" "SQLite (fichero)"
    rrss.server -> rrss.vault "descifra claves" "fichero cifrado"
    rrss.server -> rrss.files "artefactos" "sistema de ficheros"
    rrss.server -> rrss.claudecli "spawn" "subproceso (stdin/stdout JSON)"
    rrss.server -> rrss.playwright "Playwright API" "Playwright API"
    rrss.server -> rrss.ffmpeg "subproceso" "subproceso"
    rrss.server -> rrss.ytdlp "subproceso" "subproceso"
    rrss.server -> rrss.whisper "subproceso" "subproceso"
    rrss.claudecli -> rrss_anthropic "HTTPS · sesión del operador" "HTTPS (gestionado por la CLI)"
    rrss.ytdlp -> rrss_social "descarga" "HTTPS (yt-dlp)"
    rrss.server -> rrss_gemini "HTTPS REST" "HTTPS REST"
    rrss.server -> rrss_fal "HTTPS · cola + polling" "HTTPS · cola + polling"
    rrss.server -> rrss_heygen "HTTPS REST v3 + polling" "HTTPS REST v3 + polling"
    rrss.server -> rrss_eleven "HTTPS REST" "HTTPS REST"
    rrss.server -> rrss_scrape "HTTPS REST" "HTTPS REST"
    rrss.server -> rrss_github "git clone --depth 1 · REST" "git clone --depth 1 · REST"
    rrss.server -> rrss_target "HTTP fetch (crawl) · Playwright" "HTTP fetch (crawl) · Playwright"

    // ── Sistema SDD/TDD con agentes (jechamo/Estructura_inicial_claude@d4a16d3)
    sdd_dev = person "Desarrollador" "Pide trabajo, revisa y aprueba los seis gates"
    sdd_host = softwareSystem "Entorno de agentes" "Ejecuta los agentes y los hooks; aporta el modelo de lenguaje" { tags "Externo" }
    sdd_llm = softwareSystem "Modelos de lenguaje" "Inferencia que usa el host" { tags "Externo" }
    sdd_githooks = softwareSystem "Git hooks y CI" "Ejecutan los gates antes de commit/push y en CI" { tags "Externo" }
    sdd_gh = softwareSystem "GitHub" "Repositorio público, CI y sitio en Pages" { tags "Externo" }
    sdd = softwareSystem "Sistema SDD/TDD con agentes" "Kit instalable que gobierna el desarrollo con agentes de IA: especificación antes que código, TDD, verificación fuera del modelo, trazabilidad y seis gates humanos. Portable entre seis entornos de agentes." {
      router = container "Router operativo" "Contrato operativo vinculante y recorte de contexto por fase" "AGENTS.md · OPERATING-MODEL.md · context --phase"
      agents = container "20 agentes" "Roles con territorio, permisos y sucesor natural" ".claude/agents canónicos + adaptadores por host"
      skills = container "27 skills" "Procedimientos por fase y dominio con puertas de entrada y checks" ".agents/skills · estándar Agent Skills"
      cli = container "CLI determinista" "Estado, scaffolds, trazas, checks y validación sin decidir requisitos ni veredictos" "sdd-project.mjs · check-sdd.mjs · scan-secrets · skills-sync"
      hooks = container "Hooks del host" "Inyectan contexto, sugieren fase, bloquean escrituras y comandos peligrosos, registran subagentes" "session-context · sdd-router · guard-write · guard-bash · subagent-log"
      config = container "Contratos .sdd/" "Territorios, checks del proyecto, frontera del circuito y contrato documental" "territories · checks · circuit · docs · installed"
      artefacts = container "Expediente durable" "Specs, decisiones, ADR, bitácora y registros de ejecución append-only" "docs/specs/NNN · ADR · bitácora · execution-log.jsonl"
      installer = container "Instalador" "Instala, comprueba y actualiza el kit sin sobrescribir el trabajo del proyecto" "init · check · update · greenfield / brownfield / auto"
      mcp = container "Servidores MCP" "Herramientas externas bajo política explícita" "context7 · playwright · supabase · figma"
    }
    sdd_dev -> sdd_host "Pide y aprueba" "chat · comandos /skill"
    sdd_host -> sdd_llm "inferencia" "API del proveedor del host"
    sdd_host -> sdd.router "lee el contrato" ""
    sdd_host -> sdd.agents "delega (≤ 2 saltos)" ""
    sdd_host -> sdd.hooks "eventos del ciclo de vida" ""
    sdd.agents -> sdd.skills "sigue" ""
    sdd.skills -> sdd.cli "ejecuta" ""
    sdd_githooks -> sdd.cli "run --fast / --slow" ""
    sdd.cli -> sdd.artefacts "scaffold · trazas · evidencia" ""
    sdd.hooks -> sdd.config "territorios" ""
    sdd.hooks -> sdd.artefacts "execution-log.jsonl (append-only)" ""
    sdd.cli -> sdd.config "checks · circuito" ""
  }
  views {
    systemContext chafit "chafit-contexto" { include * autolayout lr }
    container chafit "chafit-contenedores" { include * autolayout lr }
    systemContext icgvault "icgvault-contexto" { include * autolayout lr }
    container icgvault "icgvault-contenedores" { include * autolayout lr }
    systemContext rrss "rrss-contexto" { include * autolayout lr }
    container rrss "rrss-contenedores" { include * autolayout lr }
    systemContext sdd "sdd-contexto" { include * autolayout lr }
    container sdd "sdd-contenedores" { include * autolayout lr }
    styles {
      element "Person" { shape Person background #343A46 color #ffffff }
      element "Container" { background #0F766E color #ffffff }
      element "Externo" { background #4B5768 color #ffffff }
    }
  }
}
