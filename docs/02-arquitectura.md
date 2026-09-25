# Arquitectura

## 1. Visión de conjunto

```mermaid
flowchart TB
    subgraph DEV["Desarrollo · Estructura_inicial"]
        A[".agents/ (fuente de verdad)<br/>roles · skills · rules · templates"]
        CLI["tools/sdd.py<br/>init · feature · clarify · work · check · sync"]
        AD["Adaptadores generados<br/>.claude · .cursor · .github · Antigravity"]
        A --> CLI --> AD
    end

    subgraph LOCAL["Equipo del usuario"]
        RS["RRSS Studio<br/>Next.js en 127.0.0.1"]
    end

    subgraph CLOUD["Producción"]
        V1["Vercel · icgvault.es"]
        V2["Vercel · chafit.es"]
        S1[("Supabase ICG Vault<br/>Postgres · Auth · Storage · Edge Functions")]
        S2[("Supabase Chafit360<br/>Postgres · Auth · PGMQ · Cron · Edge Functions")]
        V1 --> S1
        V2 --> S2
    end

    subgraph STORES["Tiendas"]
        IOS["App Store"]
        AND["Google Play"]
    end

    AD -. "gobierna el desarrollo de" .-> RS
    AD -. "gobierna el desarrollo de" .-> V1
    AD -. "gobierna el desarrollo de" .-> V2
    RS -- "analiza y genera contenido de" --> V1
    RS -- "analiza y genera contenido de" --> V2
    V1 -- "Capacitor" --> IOS & AND
    V2 -- "Capacitor" --> IOS & AND
```

## 2. Estructura_inicial: arquitectura de la plantilla

**Patrón:** fuente única canónica con generación de adaptadores, parecido a un compilador con varios
*backends*.

```mermaid
flowchart LR
    subgraph SRC[".agents/ (canónico)"]
        R["roles/*.md<br/>13"]
        S["skills/*/SKILL.md<br/>15"]
        P["prompt-catalog.json<br/>12"]
        RU["rules/*.md<br/>5"]
        H["hooks.json"]
    end
    SYNC{{"sdd.py sync"}}
    SRC --> SYNC
    SYNC --> CC[".claude/<br/>agents · skills · commands · settings"]
    SYNC --> CU[".cursor/<br/>agents · rules · commands"]
    SYNC --> GH[".github/<br/>agents · prompts · skills · hooks · instructions"]
    SYNC --> AG["Antigravity<br/>.agents/workflows"]
    CI["CI: sdd.py sync --check"] -. "falla si alguien edita un adaptador a mano" .-> SYNC
```

**Decisiones clave:**

- **Topología jerárquica híbrida.** El orquestador es responsable del resultado y los especialistas tienen iniciativa dentro de un *handoff* acotado. La profundidad máxima portable es 2 y los revisores son independientes.
- **Perfiles de capacidad en lugar de modelos concretos.** Los *handoffs* piden `fast`, `balanced`, `deep` o `inherit`, y cada host lo traduce al modelo que tenga disponible.
- **Solo biblioteca estándar de Python.** Sin dependencias, así que no hay riesgo de *supply chain* en la herramienta que controla la seguridad del resto.
- **Arquitectura por ejes.** Clean/hexagonal (dependencias internas), monolito/distribuido (despliegue) y DDD/vertical slices (límites) se combinan en lugar de excluirse. El valor por defecto es el **monolito modular**.

## 3. RRSS Studio: monolito modular local

**ADR-0001**: monolito modular local. **Stack:** Next.js 15 (App Router) + TypeScript + SQLite/Prisma.

```mermaid
flowchart TB
    subgraph UI["UI · React 19 + Tailwind 4"]
        D["Dashboard / Proyecto"]
        PG["PipelineGraph<br/>(React Flow)"]
        CT["ContentTray · PublishModal"]
        MS["MediaStudio · ClipLab"]
        AJ["Ajustes"]
    end
    subgraph API["Route Handlers /api"]
        RUNS["/runs + SSE /stream"]
        PROJ["/projects /dossier /competencia /leads /virales"]
        CON["/connectors/:id/test · /providers"]
        CLIPS["/clips /content /navigation"]
        HEALTH["/health/ready"]
    end
    subgraph CORE["src/core (dominio)"]
        PIPE["pipeline<br/>runs · nodos · estados · reintentos"]
        AI["ai · AiEngine<br/>Claude CLI | Agent SDK"]
        CR["crawler (fetch)"]
        REPO["repo (git + IA)"]
        MED["media · FFmpeg · subtítulos · MIX"]
        NAV["navigation · Playwright"]
        CONN["connectors<br/>fal.ai · HeyGen · ElevenLabs · Gemini · Scrape Creators · GitHub"]
        SEC["secrets · Vault AES-256-GCM"]
    end
    DB[("SQLite · Prisma<br/>11 modelos")]
    FS[("data/<br/>vídeos · capturas · logs")]
    UI --> API --> CORE
    PIPE --> DB
    MED --> FS
    SEC --> FS
```

**Patrones y decisiones destacables:**

| Patrón | Dónde | Por qué |
|---|---|---|
| **Strategy / puerto-adaptador** | `AiEngine` (CLI o Agent SDK), conectores y montaje (FFmpeg o cloud) | Proveedores intercambiables sin tocar el dominio. Cada conector expone `test()` para el botón «Probar conexión». |
| **Pipeline con estado persistido** | `core/pipeline` + modelo `Run` | Reintentos, historial y reanudación. El cliente se reconecta por SSE y recupera el estado desde la BD. |
| **Server-Sent Events** | `/api/runs/:id/stream` | Nodos animados en tiempo real con menos complejidad que WebSockets. |
| **Multiproyecto desde el inicio** | Todo cuelga de `Project` (D-14) | Pasar de una a varias apps no exige migración. |
| **Secret Vault** | `core/secrets` | Claves cifradas en reposo, escritura atómica y versionada, y lock de proceso. Nunca en `.env`. |
| **Aprobación humana antes del coste** | REQ-012/013 | Plan de cortes con coste estimado y *preflight* de prompts obligatorio, validados también en el servidor. |
| **Readiness real** | `/api/health/ready` | «Arrancado» significa que la aplicación, SQLite y el Vault responden, no solo que el puerto está ocupado. |

## 4. ICG Vault y Chafit360: SPA + BaaS + contenedor nativo

Los dos productos comparten arquitectura.

```mermaid
flowchart LR
    U1["Navegador"] --> W["SPA React + Vite<br/>(Vercel)"]
    U2["iOS / Android"] --> N["Contenedor Capacitor<br/>(mismo bundle web)"]
    W & N --> AUTH["Supabase Auth<br/>email · Google · Apple"]
    W & N --> REST["Data API (PostgREST)<br/>protegida por RLS"]
    W & N --> EF["Edge Functions (Deno)"]
    EF --> OAI["OpenAI<br/>texto · imagen · voz"]
    EF --> EXT["APIs externas<br/>IGDB · TMDB · HLTB · Stripe…"]
    AUTH & REST & EF --> PG[("Postgres<br/>RLS · RPC · PGMQ · Cron")]
    PG --> ST[("Storage<br/>imágenes · miniaturas")]
```

**Decisiones clave:**

- **Un solo código para web, iOS y Android** con Capacitor. Coste de mantenimiento mínimo para un único desarrollador.
- **La seguridad vive en la base de datos (RLS).** El cliente usa la clave publicable y la autorización real se aplica en Postgres. Las operaciones privilegiadas (IA, pagos, generación de imágenes) van por Edge Functions con `service_role`.
- **Compatibilidad hacia atrás obligatoria.** Las apps publicadas no se actualizan al instante, así que columnas nuevas *nullable*, respuestas HTTP estables y tablas laterales en vez de romper contratos. Ejemplo: variantes con mancuernas en Chafit360, que no caben como una décima columna del HTML de rutinas.
- **Control de versión nativa.** ICG Vault incluye `NativeVersionGate` para exigir una versión mínima cuando un cambio lo hace inevitable.
- **Procesos durables en el servidor.** Chafit360 usa colas PGMQ con workers programados con Cron para las miniaturas, e ICG Vault un piloto automático diario para Zoom Out, así nada depende de que el navegador siga abierto.

### Decisiones registradas (ADR) en Chafit360

| ADR | Decisión |
|---|---|
| ADR-0001 | Documentar la arquitectura heredada (monolito frontend organizado por tipo) antes de cambiarla. |
| ADR-0002 | Migrar hosting a Vercel y añadir Sentry **sin cambiar la autorización** (cero migraciones SQL y RLS comparada por hash). |

## 5. Seguridad transversal

| Riesgo | Mitigación |
|---|---|
| Secretos en el repositorio | Hooks que piden confirmación ante secretos, `scan-secrets.mjs` en RRSS Studio, Vault cifrado y secretos de Supabase fuera del bundle (`VITE_*` solo para valores públicos). |
| Acciones destructivas de agentes | Hooks que bloquean comandos destructivos y la edición de ficheros generados. Confirmación explícita ante BD e infraestructura. |
| Exposición de la app local | RRSS Studio escucha solo en `127.0.0.1`. El E2E bloquea cualquier host que no sea *loopback*. |
| Contraseñas de apps analizadas | Registro cifrado aparte y nunca incluido en prompts, respuestas ni logs (REQ-014). |
| PII en telemetría | Sentry sin PII. Trazas y Replay solo con consentimiento revocable (spec 003). |
| Supply chain | Acciones de GitHub fijadas por SHA, `overrides` de dependencias, `npm audit` como gate y skills externas en cuarentena hasta revisarlas. |
