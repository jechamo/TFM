# 7 · Flujo de trabajo

## Entrada por situación

| Situación | Entrada | Ejemplo real |
|---|---|---|
| Proyecto nuevo | `/sdd-intake` → `/sdd-init` | RRSS Studio: requisitos, diseño y arquitectura aprobados el 13/07/2026 antes del primer código |
| Repositorio existente | `/onboard` | ChaFit: `CURRENT-STATE.md` y ADR de arquitectura heredada |
| Nueva funcionalidad | `/sdd-specify` … `/sdd-ship` | ChaFit spec 006: el cliente cambia un ejercicio |
| Cambio de bajo riesgo | `/sdd-light` (lo decide la ruta) | erratas y textos |
| Auditoría | `/security-scan`, `/sdd-verify` | ChaFit e ICG Vault, 23/09/2026 |
| Incidente | `/respond-incident` | contener antes de especificar |

## Una funcionalidad de principio a fin

![Una funcionalidad por el circuito](../architecture/exported/svg/sdd-seq-feature.svg)

1. La persona pide la funcionalidad; el hook `sdd-router` sugiere la fase.
2. `spec-analyst` escribe `spec.md` (EARS + Gherkin) y aclara ambigüedades. **Gate 3.**
3. `planner` produce plan, modelo de datos, contratos y tareas. **Gate 5.**
4. `implementer` ejecuta cada tarea en TDD; los hooks vigilan territorio y comandos y registran la ejecución.
5. `code-reviewer` y `security-auditor` verifican en solo lectura; un GO exige informe sin CRÍTICO/ALTO.
6. `release-manager` prepara PR, CHANGELOG y reversión. **Gate 6.** La CI repite los gates y audita la traza.

## Cómo se ha trabajado en cada producto

```text
RRSS Studio   requisitos v1 ─► diseño v1 ─► arquitectura v1 ─► REQ-001 … REQ-018 (commits por requisito)
              └─► kit SDD 0.7.0 (21/08) ─► 0.9.1 (24/08) ─► spec 001 instalación ─► spec 002 E2E sin red

ChaFit        producto Lovable en producción ─► /onboard ─► specs 001…007 (09/08 → 08/09)
              └─► cada spec: RED/GREEN, migración con respaldo y rollback, despliegue por Supabase MCP

ICG Vault     producto Lovable en producción ─► 81 PR desde ramas de agentes (claude/*)
              └─► kit instalado en una copia ─► auditoría integral multiagente (23/09) ─► plan por fases
```

## El papel de la persona

La máquina propone y la persona decide en seis puntos. Además, en los productos reales la persona:

- aprueba cada migración sobre producción (ChaFit usa MCP con respaldo y *rollback* probado antes);
- revisa y fusiona las PR de los agentes (ICG Vault);
- confirma gastos de IA antes de generarlos (plan y coste previos en RRSS Studio);
- decide qué hallazgos de auditoría se corrigen y en qué orden.
