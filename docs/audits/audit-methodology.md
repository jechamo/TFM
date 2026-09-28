# Auditorías de ChaFit e ICG Vault con el sistema SDD

> **Estado:** auditorías completas obtenidas con el sistema SDD/TDD y sus agentes. **Las correcciones están pendientes de aplicar**: el plan por fases espera el gate humano y cada corrección entrará como spec con TDD y *rollback*.
>
> **Informes completos** (acceso restringido, ver [por qué](#acceso-a-los-informes-completos)): [ChaFit](https://github.com/jechamo/chafit360/blob/auditoria-2026-09-23/docs/audits/2026-09-23-auditoria-integral.md) · [ICG Vault](https://github.com/jechamo/icgbolt/blob/auditoria-2026-09-23/docs/audits/2026-09-23-auditoria-integral.md). Resúmenes públicos: [ChaFit](chafit-audit-summary.md) · [ICG Vault](icgvault-audit-summary.md).

## Qué se hizo

El 23/09/2026 se instaló el kit SDD ([`Estructura_inicial_claude`](https://github.com/jechamo/Estructura_inicial_claude) v0.9.1) en copias de ChaFit e ICG Vault. Después se pidió al `orchestrator` una **auditoría integral de extremo a extremo**, en modo consultivo, sin modificar código, esquema, datos ni configuración:

| Capa | Qué se revisó | Estándar o referencia |
|---|---|---|
| Frontend web y móvil (React, Vite, Capacitor) | arquitectura, calidad y buenas prácticas, estado, errores, rendimiento percibido | revisión de código, patrones del kit |
| Edge Functions (Deno) | autenticación, autorización por recurso, validación de entradas, coste de IA, proxies a terceros | OWASP API Security Top 10 2023 |
| Base de datos de **producción** | RLS, políticas, funciones `SECURITY DEFINER`, *grants*, Storage, `pg_cron`, índices y tamaño | consultas de solo lectura por MCP de Supabase |
| Seguridad de aplicación | control de acceso, identidad, secretos, cabeceras, CSP, dependencias, sesión móvil | OWASP Top 10 2025 · ASVS 5.0 (referencia L2) |
| IA generativa | validación de entrada y salida, cupos, reembolsos, datos enviados al proveedor | OWASP Top 10 for LLM Applications 2025 |
| UI, usabilidad y accesibilidad | contraste, zoom, nombres accesibles, confirmaciones, ergonomía móvil | WCAG 2.2 AA · heurísticas de Nielsen |
| Operación | copias de seguridad, deriva entre migraciones del repo y producción, entornos de prueba | — |

## Quién lo hizo: agentes y skills del sistema

El `orchestrator` diagnosticó y repartió el trabajo. Los especialistas trabajaron **en solo lectura** y devolvieron un `HANDOFF` estructurado. Los hooks del sistema dejaron la traza en `.sdd/agent-audit.jsonl` de cada copia: la ejecución está **observada**, no declarada.

| Agente | ChaFit (modelo) | ICG Vault (modelo) | Skill asignada o herramienta | Papel |
|---|---|---|---|---|
| `orchestrator` | ✓ | ✓ (lectura directa y contraste) | `/sdd-verify`, `security-scan` | diagnóstico, enrutado, contraste de cada conclusión con código y base real, informe y plan |
| `database-expert` | ✓ Opus 5.5 | — (consultas MCP del orquestador) | `bbdd`, MCP Supabase de solo lectura | estado real de producción: políticas, funciones, *grants*, Storage |
| `security-auditor` | ✓ GPT Sol | ✓ Opus 5.5 | `security-scan` (OWASP Top 10, ASVS, Agentic) | migraciones, Edge Functions, GenAI y web |
| `code-reviewer` | ✓ GPT Sol (código) y Gemini 3.8 Flash (UI) | ✓ Opus 5.5 | revisión de código | calidad, arquitectura, rendimiento, UI y accesibilidad en ChaFit |
| `ux-designer` | — | ✓ Gemini 3.8 Flash | `/sdd-verify` | UI, accesibilidad y ergonomía móvil |
| `performance-optimizer` | — | ✓ (su resultado no se incorporó al informe) | — | rendimiento de frontend |
| `research-analyst`, `explore` | ✓ (24/09, ampliación) | — | — | búsqueda de evidencia para ampliar hallazgos de datos |

Especialistas con **modelos de tres proveedores** (Anthropic, OpenAI y Google): un modelo no se revisa a sí mismo. Los modelos constan en la tabla de fuentes de cada informe; los agentes, en la traza de los hooks.

```text
orchestrator (diagnóstico y enrutado, solo lectura)
   ├── database-expert   → base real por MCP de Supabase: solo SELECT sobre metadatos, nunca filas con datos personales
   ├── security-auditor  → skill security-scan: OWASP Web 2025 · API 2023 · LLM 2025 · agentic · ASVS 5.0
   ├── code-reviewer     → calidad, arquitectura, rendimiento
   └── ux-designer / code-reviewer → UI, usabilidad (Nielsen) y accesibilidad (WCAG 2.2 AA)
orchestrator → contrasta lo reportado con el código y la base real antes de aceptarlo → informe + plan por fases
```

El orquestador **corrigió** conclusiones cuando la evidencia no las sostenía. En ChaFit descartó una recomendación que habría roto el alta de usuarios en la web y en las apps instaladas, y la sustituyó por una estrategia retrocompatible. En ICG Vault dejó fuera los resultados de un subagente que había trabajado sobre migraciones y no sobre la base real.

## Resultados

| | ChaFit | ICG Vault |
|---|---|---|
| Hallazgos | **53** (15 críticos · 32 deseables · 6 mínimos) | **48** (16 críticos · 19 deseables · 13 mínimos) |
| Ejes | seguridad de aplicación · datos, RLS, Storage y Edge Functions · calidad de código · UI y accesibilidad | seguridad (web, API, datos, GenAI) · calidad y rendimiento · UI y accesibilidad |
| Causa raíz principal | políticas y privilegios demasiado amplios en tablas sensibles; funciones sin autorización sistemática | configuración de permisos en la capa de datos |
| Lo que está bien | RLS activado, HTML saneado, secretos fuera del *bundle*, Sentry sin datos personales, IA con esquema estricto | la mayoría de las funciones expuestas se protegen por dentro; casi todas las críticas se corrigen con retiradas de permisos reversibles |
| Plan | 6 specs por fases, con *rollback* escrito antes de cada cambio | bloques de ejecución ordenados, con SQL de aplicar y de volver atrás |
| **Estado** | **pendiente de aplicar** | **pendiente de aplicar** |

## Por qué están pendientes

Las correcciones críticas son baratas y reversibles (retiradas de permisos y políticas que no tocan datos). Aun así, el propio método exige cuatro cosas antes de aplicarlas:

1. El gate humano sobre el plan.
2. Una spec por bloque con TDD, donde el test en rojo demuestra el fallo.
3. Una rama de desarrollo de Supabase antes de producción.
4. Alinear el historial de migraciones del repositorio con producción, un riesgo del proceso que detectó la propia auditoría.

Aplicarlas deprisa, sin esos pasos, contradiría el sistema que el TFM defiende.

## Criterio de hallazgo

Solo entra un hallazgo con **evidencia real** (fichero:línea u objeto de base de datos) y un usuario o atacante real afectado.

| Severidad | Significado |
|---|---|
| Crítica | fuga de datos, bypass de autorización, secreto expuesto, pérdida de datos, coste explotable o flujo principal inutilizable |
| Deseable | endurece la postura, mejora un rendimiento perceptible o una UX claramente peor |
| Mínima | pulido con efecto real |

Cada hallazgo incluye: ID estable, estándar, evidencia, corrección propuesta, **peligrosidad del cambio**, **reversibilidad** (inmediata, con *redeploy* o con datos) y *rollback*.

## Controles no ejecutados, declarados

Pruebas activas de explotación (prohibido escribir en producción), E2E que escriben datos, configuración del panel no expuesta por MCP y auditoría de accesibilidad en dispositivo. Se declaran con su riesgo y su siguiente paso: **«no ejecutado» es un resultado válido; «pasa» sin ejecutar, no.**

## Del hallazgo a la spec

```text
AUDITORÍA → HALLAZGO (ID, evidencia) → RECOMENDACIÓN (corrección + rollback) → gate humano → /sdd-specify → TDD (test rojo = demostración del fallo) → VALIDACIÓN
```

## Acceso a los informes completos

Los informes completos están en los repositorios de cada producto, rama `auditoria-2026-09-23`, en `docs/audits/2026-09-23-auditoria-integral.md`:

- [ChaFit](https://github.com/jechamo/chafit360/blob/auditoria-2026-09-23/docs/audits/2026-09-23-auditoria-integral.md)
- [ICG Vault](https://github.com/jechamo/icgbolt/blob/auditoria-2026-09-23/docs/audits/2026-09-23-auditoria-integral.md)

Esos repositorios son **privados**, por dos motivos:

1. Los informes **describen vulnerabilidades explotables** de aplicaciones en producción con usuarios reales: funciones, políticas y pasos concretos, mientras las correcciones siguen pendientes.
2. El historial de git incluye ficheros `.env` con **claves de entorno** de los proyectos.

**Se ha dado acceso de lectura al tribunal.** En este repositorio público solo figuran recuentos por eje y severidad, categorías OWASP y el método; nunca nombres de funciones o políticas vulnerables, identificadores de proyecto ni pasos de explotación.
