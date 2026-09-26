# ChaFit · Resumen saneado de la auditoría integral (23/09/2026)

> **Estado:** auditoría obtenida con el modelo SDD (agentes del sistema coordinados por el `orchestrator`). **Las correcciones todavía no se han aplicado**: el plan está pendiente de aprobación humana.
>
> Informe completo: privado (fuera del repositorio). Este resumen omite deliberadamente cualquier detalle explotable.

## Veredicto

**La app funciona, pero la capa de datos y parte de las Edge Functions necesitan endurecerse antes de considerarla segura para producción.** El código de pantalla está bien protegido (saneado de HTML, Sentry sin datos personales); el riesgo está en permisos de base de datos y en autorización de algunas funciones. Las correcciones más graves son también las más baratas y reversibles (cambios de permisos y políticas que no tocan datos).

## Hallazgos por eje y severidad

| Eje | Crítica | Deseable | Mínima | Total |
|---|:---:|:---:|:---:|:---:|
| Seguridad de aplicación | 4 | 9 | 2 | 15 |
| Base de datos, RLS, Storage y Edge Functions | 5 | 6 | 2 | 13 |
| Calidad de código | 3 | 6 | 0 | 9 |
| UI, usabilidad y accesibilidad | 3 | 11 | 2 | 16 |
| **Total** | **15** | **32** | **6** | **53** |

## Por categoría (sin detalle explotable)

| Categoría | Tipo de hallazgo | Estándar |
|---|---|---|
| Control de acceso en datos | políticas y privilegios demasiado amplios en tablas sensibles | OWASP A01 · API1/API5 |
| Autorización en funciones | funciones de servidor que no verifican de forma sistemática al llamante o la propiedad del recurso | A01 · API5 |
| Coste de IA | cupos y autenticación a endurecer en funciones generativas | LLM10 · API4 |
| Privacidad de salud | consentimiento que debe recaer en el titular de los datos | RGPD · LLM02 |
| Integridad de datos | escrituras que no comprueban errores y pueden perder progreso | — |
| Plataforma | cabeceras de seguridad y CSP, dependencias con avisos, sesión móvil en almacenamiento no cifrado | A02 · A06 |
| Calidad | componentes muy grandes, TypeScript no estricto, `tsc` y `lint` aún no utilizables como gate | — |
| UI y accesibilidad | contraste de marca bajo AA, zoom bloqueado, acciones destructivas sin confirmación, controles sin nombre accesible | WCAG 2.2 |
| Operación | copias de seguridad del plan actual, deriva entre migraciones del repositorio y producción | — |

## Lo que está bien

RLS activado en todas las tablas, saneado de HTML con DOMPurify, secretos fuera del *bundle*, Sentry con `sendDefaultPii: false` y consentimiento, salida de IA de rutinas con esquema estricto y escapado, suscripciones Realtime cerradas correctamente.

## Plan propuesto (borrador pendiente del gate humano)

| Fase | Contenido |
|---|---|
| 0 | Red de seguridad operativa: copias, entorno de pruebas, historial de migraciones |
| Spec 008 | Cierre de escaladas de privilegio y bypass de pago, con estrategia retrocompatible para las apps instaladas |
| Spec 009 | Autorización y control de coste en funciones de IA |
| Spec 010 | Privacidad de datos de salud y consentimiento |
| Spec 011 | Integridad de los datos de entrenamiento |
| Spec 012 | Endurecimiento de plataforma |
| Spec 013 | Accesibilidad y pulido de UI |

## Relación con el trabajo previo

El mismo tipo de problema ya se había detectado y corregido dentro del circuito SDD: en la spec 005 (19/08/2026) el asesor de seguridad encontró que una función de escritura seguía invocable sin sesión por los privilegios por defecto de la plataforma; se corrigió con migración y *rollback* y se validó comprobando el privilegio. La auditoría generaliza esa lección a todo el esquema.
