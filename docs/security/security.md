# Seguridad

## En el sistema SDD (ingeniería)

| Control | Implementación |
|---|---|
| Nunca leer ni escribir secretos | `guard-write.mjs` deniega `.env`, claves y credenciales; `settings.json` deniega su lectura |
| Comandos peligrosos | `guard-bash.mjs`: destructivos sin retorno → `deny`; push, commit, IaC, publicación → `ask` |
| Escaneo de secretos | `scan-secrets.mjs` en gates lentos y CI |
| Seguridad en cada spec | campo obligatorio `Impacto de seguridad`; si es `sensible`, cada control enlaza decisión, tarea, test y evidencia |
| Auditor independiente | `security-auditor` de solo lectura; un GO exige informe sin CRÍTICO/ALTO ni controles sin ejecutar |
| Estándares | OWASP Top 10:2025, ASVS 5.0.0, OWASP Top 10 for LLM / Agentic; contrato portable de JWT, sesiones y CSRF |
| SSRF y peticiones salientes | spec 016: cobertura portable |
| MCP | desactivado por defecto; `--with-mcp` explícito; Supabase MCP en modo `--read-only` en la plantilla |
| Skills de terceros | tratadas como dependencias ejecutables, con manifiesto y política (`skills-sync --check`) |

## En los productos

| | RRSS Studio | ChaFit | ICG Vault |
|---|---|---|---|
| Superficie | loopback, sin cuentas | Internet, 4 roles | Internet, 3 roles + pilotos |
| Secretos | Vault AES-256-GCM local | Edge Functions + Vault de Postgres | Edge Functions |
| Autorización | — | JWT + RLS + checks en funciones | JWT + RLS + checks en RPC y funciones |
| Datos sensibles | credenciales de terceros | datos de salud, pagos | cuentas y actividad social |
| Privacidad | — | consentimiento de IA y de telemetría; Sentry sin PII | — |
| Auditoría | — | 53 hallazgos (15 críticos), **correcciones pendientes** | 48 hallazgos (16 críticos), **correcciones pendientes** |

## Revisión de esta entrega antes de publicar

| Comprobación | Resultado |
|---|---|
| Escaneo de secretos del repositorio TFM (`.env`, claves, tokens, contraseñas) | ver [`TFM_DELIVERY_STATUS.md`](../../TFM_DELIVERY_STATUS.md) |
| Auditorías completas | fuera del repositorio; solo resúmenes saneados |
| Identificadores de proyectos Supabase, webhooks, IDs de Assistant | no publicados |
| Capturas | fotogramas del autor y páginas públicas; se descartó un fotograma con una notificación personal visible |
| Credenciales demo | publicadas en la slide 2 y en el README por decisión del autor (28/09/2026); cuentas sin rol de administrador y contraseña que se cambia tras la defensa |

## Repositorios privados y auditorías

- **`jechamo/chafit360` y `jechamo/icgbolt` son privados.** Su historial contiene ficheros `.env` con claves de entorno. La revisión del 26/09/2026 solo encontró variables de cliente (`VITE_*`), pero se tratan como sensibles. Además, cada repositorio incluye su **auditoría completa** (rama `auditoria-2026-09-23`), que describe vulnerabilidades explotables todavía sin corregir.
- **Acceso:** lectura para el tribunal. Nada de ese contenido se copia a este repositorio público, que solo publica recuentos, categorías OWASP y el método ([metodología](../audits/audit-methodology.md)).

## Credenciales demo: criterio

Las cuentas demo de ChaFit e ICG Vault acceden a productos con **usuarios reales**. La recomendación técnica era no publicarlas mientras siguieran abiertos hallazgos críticos de control de acceso, porque facilitan a cualquiera el primer paso. **Decisión del autor (28/09/2026): se publican** en la slide 2 y en el README para que el tribunal pueda probar las apps sin pasos extra, con tres condiciones:

1. Las cuentas demo no tienen rol de administrador.
2. Las correcciones de permisos de la fase 1 de las auditorías (baratas y reversibles) se aplican en cuanto se aprueben.
3. La contraseña de ambas cuentas se cambia después de la defensa. Retirar la slide no «despublica» las credenciales: si se revierte, hay que cambiar las contraseñas igualmente.

En el vídeo no aparecen: la intro se graba en modo `?rec`, que oculta las credenciales.
