# Evidencia de implementación

Cadenas completas **necesidad → spec → agente/proceso → implementación → validación → resultado**, solo con hechos comprobables en los repositorios.

## 1. ChaFit · Contrato de tablas de entrenamiento (spec 001, 09/08/2026)

| Paso | Hecho | Fuente |
|---|---|---|
| Necesidad | La IA generaba filas de 7 u 8 celdas; la app esperaba 9 y desplazaba descanso, indicador y comentarios. El calentamiento se repetía al reanudar | `spec.md` §1 |
| Spec | 4 requisitos EARS (RF-01…04), métricas de éxito (0 filas ≠ 9 celdas, 100 % de respuestas validadas) y *Won't have*: no migrar aún a modelo relacional | `spec.md` §2–4 |
| Agente / proceso | `implementer` (traza `declared-direct`), Supabase MCP para SQL y despliegue | `evidence.md` |
| Implementación | JSON Schema estricto en los generadores, *serializer* de 9 celdas, migración de reparación con respaldo, columna `warmup_completed_at`, adaptador en el frontal | commit `3965fcd` |
| Validación | RED 4 fallos → GREEN 4/4; RED 317 filas inválidas → GREEN 437/437; 61/256/120 filas conservadas sin discrepancias frente al respaldo; *rollback* limpio; funciones `generate-workout` v22 y `modify-workout` v6 activas | `evidence.md` |
| Resultado | Datos de producción reparados sin pérdida y generación futura protegida por contrato | — |

## 2. ChaFit · Hallazgo de seguridad en *verify* corregido (spec 005, 19/08/2026)

| Paso | Hecho | Fuente |
|---|---|---|
| Necesidad | Renombrar días de rutina (spec 005) añadía una función SQL de escritura | `docs/specs/005-…/spec.md` |
| Hallazgo | El asesor de seguridad detectó que la función seguía invocable sin sesión: revocar a `PUBLIC` no retira los privilegios por defecto que la plataforma concede a cada función nueva | commit `6861ec7` |
| Implementación | Migración de endurecimiento + migración de *rollback* | `20260819111000_harden_rename_workout_plan_day.sql` (+ `.rollback.sql`) |
| Validación | Comprobado con `has_function_privilege`: el rol anónimo ya no puede ejecutarla | `evidence.md` de la spec 005 |
| Resultado | El circuito *verify* encontró y cerró un fallo real antes de que llegara a auditoría | — |

## 3. RRSS Studio · E2E sin red ni créditos (spec 002, 29/08/2026)

| Paso | Hecho | Fuente |
|---|---|---|
| Necesidad | Probar flujos que dependen de 8 proveedores de pago sin gastar créditos ni tocar datos reales | `docs/specs/002-e2e-mock-offline-v1/spec.md` |
| Implementación | perfil `RRSS_E2E_MODE=mock`, entorno aislado `.e2e-runtime/`, *fakes* de proveedores, guarda de salida solo loopback | `src/core/runtime/`, `src/core/testing/` |
| Validación | egreso 20/20, runtime 6/6, **9/9 E2E**, 71 Vitest y 138 contratos; hoy reejecutado: 71 + 138 en verde | `evidence.md`, ejecución del 26/09/2026 |
| Resultado | CI reproducible en Windows 11 sin secretos | `.github/workflows/sdd-gates.yml` |

## 4. Sistema SDD · El sistema se verifica a sí mismo

| Paso | Hecho | Fuente |
|---|---|---|
| Necesidad | Un kit que exige gates no puede eximirse de ellos | spec 012 |
| Implementación | gates propios (spec 014), verificación independiente del host (013), circuito proporcional (015 y 017), SSRF (016); el sitio web publica recuentos que la CI comprueba antes de desplegar | specs 012–017, `pages.yml` |
| Validación | `check-sdd` 17 specs / 114 tareas / 20 agentes / 27 skills; `npm test` 375 comprobaciones en verde (26/09/2026) | ejecución local |
| Resultado | v0.9.1 publicada con tags y changelog | `CHANGELOG.md` |

## 5. ICG Vault · Evolución por agentes con revisión humana

| Paso | Hecho | Fuente |
|---|---|---|
| Proceso | 97 PR, 81 desde ramas `claude/*`, fusionadas por el autor | `git log origin/main` |
| Ejemplo | PR #97 (26/09/2026): corrige un cofre duplicado al subir de nivel y excluye ediciones en Zoom Out; migración y cambio en la función de autopiloto; sube la versión nativa a 72 | commits `2dfbf1e`, `0231ad5` |
| Auditoría | 48 hallazgos con evidencia y plan por fases obtenidos con el modelo SDD; **correcciones pendientes** | resumen saneado |

## 6. Auditorías como resultado del modelo SDD

Las dos auditorías del 23/09/2026 se obtuvieron ejecutando los agentes del sistema (orchestrator, security-auditor, code-reviewer, database-expert, ux-designer) sobre copias con el kit instalado. **Todavía no se han aplicado las correcciones**: los planes están en borrador, pendientes del gate humano, y entrarán por `/sdd-specify`.
