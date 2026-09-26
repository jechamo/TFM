# Metodología de auditoría con el sistema de agentes

## Qué se hizo

El 23/09/2026 se instaló el kit SDD en copias de ChaFit e ICG Vault y se ejecutó una **auditoría integral consultiva** —seguridad, calidad de código y calidad de UI— sin modificar código, esquema, datos ni configuración.

```text
orchestrator (diagnóstico y enrutado, solo lectura)
   ├── database-expert   → base de datos real por MCP de Supabase: solo SELECT sobre metadatos, nunca filas con datos personales
   ├── security-auditor  → OWASP Web 2025 · API 2023 · LLM 2025 · agentic · ASVS 5.0 (referencia L2)
   ├── code-reviewer     → calidad, arquitectura, rendimiento, persistencia
   └── code-reviewer / ux-designer → UI, usabilidad (Nielsen) y accesibilidad (WCAG 2.2 AA)
orchestrator → contrasta lo reportado con el código y la base real antes de aceptarlo → informe + plan por fases
```

Cada especialista trabajó con un modelo de un proveedor distinto y devolvió un `HANDOFF` estructurado. El orquestador **corrigió** conclusiones cuando la evidencia no las sostenía; por ejemplo, en ChaFit descartó una recomendación que habría roto el alta de usuarios en web y en las apps instaladas, y la sustituyó por una estrategia retrocompatible.

## Criterio de hallazgo

Solo entra un hallazgo con **evidencia real** (fichero:línea u objeto de base de datos) y un usuario o atacante real afectado.

| Severidad | Significado |
|---|---|
| Crítica | fuga de datos, bypass de autorización, secreto expuesto, pérdida de datos, coste explotable o flujo principal inutilizable |
| Deseable | endurece la postura, mejora un rendimiento perceptible o una UX claramente peor |
| Mínima | pulido con efecto real |

Cada hallazgo incluye: ID estable, estándar, evidencia, corrección propuesta, **peligrosidad del cambio**, **reversibilidad** (inmediata, con *redeploy*, con datos) y *rollback*.

## Controles no ejecutados, declarados

Pruebas activas de explotación (prohibido escribir en producción), E2E que escriben datos, configuración del panel no expuesta por MCP, auditoría a11y en dispositivo. Se declaran con su riesgo y siguiente paso: **"no ejecutado" es un resultado válido; "pasa" sin ejecutar, no.**

## Del hallazgo a la spec

```text
AUDITORÍA → HALLAZGO (ID, evidencia) → RECOMENDACIÓN (corrección + rollback) → /sdd-specify → TDD (test rojo = demostración del fallo) → VALIDACIÓN
```

El plan de acción de cada informe queda como **BORRADOR pendiente del gate humano** antes de entrar en `/sdd-specify`: la máquina propone, la persona prioriza.

## Qué se publica y qué no

Los informes completos contienen detalles explotables de sistemas con usuarios reales. En este repositorio público solo figuran **recuentos por eje y severidad, categorías OWASP y el método**. No se publican nombres de funciones o políticas vulnerables, identificadores de proyecto ni pasos de explotación.

Resúmenes: [ChaFit](chafit-audit-summary.md) · [ICG Vault](icgvault-audit-summary.md).
