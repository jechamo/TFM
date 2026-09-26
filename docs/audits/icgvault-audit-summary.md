# ICG Vault · Resumen saneado de la auditoría integral (23/09/2026)

> **Estado:** auditoría obtenida con el modelo SDD (agentes del sistema coordinados por el `orchestrator`). **Las correcciones todavía no se han aplicado**: el plan está pendiente de aprobación humana.
>
> Informe completo: privado. Resumen sin detalles explotables.

## Veredicto

**La app funciona, pero necesita endurecer su capa de datos antes de considerarse segura.** Los hallazgos críticos comparten una causa raíz de configuración de permisos y **casi todas sus correcciones son retiradas de permisos** que el frontend no usa: se aplican y se revierten en segundos, sin tocar datos ni publicar una nueva versión en tiendas.

## Hallazgos por ámbito y severidad

| Ámbito | Crítica | Deseable | Mínima | Total |
|---|:---:|:---:|:---:|:---:|
| Seguridad (web, API, base de datos, GenAI) | 9 | 10 | 6 | 25 |
| Calidad de código y rendimiento | 4 | 7 | 5 | 16 |
| UI y accesibilidad | 3 | 2 | 2 | 7 |
| **Total** | **16** | **19** | **13** | **48** |

## Por categoría (sin detalle explotable)

| Categoría | Tipo de hallazgo | Estándar |
|---|---|---|
| Control de acceso en la capa de datos | privilegios y políticas a restringir | A01 · API5 |
| Identidad | comprobaciones adicionales en flujos de cuenta | A01 · A07 |
| Integridad de la lógica de juego | validaciones que deben residir solo en servidor | A01 · API6 |
| Storage | escritura y límites de tamaño/tipo de ficheros | A01 · A02 · API4 |
| GenAI | validación de entradas, límite por usuario y reembolso atómico en generación de imágenes | LLM01 · LLM05 · LLM10 |
| Proxies externos | autenticación, límites y restricción de destinos en funciones que llaman a terceros | API4 · API7 |
| Plataforma | CSP y cabeceras, CORS, sesión en `localStorage`, `search_path` de funciones | A02 · A07 |
| Calidad | **cero tests**, componentes monolíticos, sin *code splitting*, consultas de agregación en el navegador | — |
| UI y accesibilidad | contraste, foco y tamaños táctiles | WCAG 2.2 |
| Operación | sin entorno de pruebas ni ramas de Supabase; historial de migraciones desalineado | — |

## Métricas de producción usadas como evidencia (sin datos personales)

92 tablas con RLS; 5 tareas programadas; 4 buckets públicos; tablas más activas medidas por volumen y lecturas (por ejemplo, 17 402 reseñas). Los asesores de Supabase aportaron conteos de avisos de seguridad y rendimiento que se contrastaron con el código.

## Plan propuesto (borrador pendiente del gate humano)

1. Retirar permisos y políticas de las funciones y buckets críticos (sin despliegue de frontend, *rollback* en segundos).
2. Montar la **red de tests de caracterización** antes de tocar lógica de la app.
3. Endurecer IA generativa, *proxies* y plataforma.
4. Rendimiento y accesibilidad.

Reglas de ejecución: una spec por bloque con impactos declarados, test rojo que demuestre el fallo, *rollback* escrito y probado antes, cambios de base de datos primero en una rama de desarrollo, y los cambios de la app nativa detrás de un *flag* remoto.
