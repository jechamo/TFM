# Limitaciones

## Del sistema SDD/TDD

- No funciona "solo": necesita un host capaz y personas que aprueben los gates.
- Delegación y hooks no son idénticos en todos los entornos; sin eventos de subagente, la traza degrada a `declared-direct`.
- La CLI confina rutas declaradas, pero no es un *sandbox* del sistema operativo.
- La cobertura usa un trinquete (hoy 48,3 %) en vez de un umbral fijo del 80 %.

## De los productos

| Producto | Limitación |
|---|---|
| RRSS Studio | Agent SDK sin implementar (el vídeo lo menciona); bus de progreso en memoria; producto mono-usuario y local; dependencia de proveedores de pago |
| ChaFit | Correcciones de auditoría pendientes; adaptadores de *wearables* incompletos; `tsc` y `lint` aún no válidos como gate; componentes muy grandes |
| ICG Vault | Sin tests automatizados; correcciones de auditoría pendientes; migraciones desalineadas con producción; componentes monolíticos |

## De esta entrega

- La relación SDD de ICG Vault es de evolución por agentes y auditoría, no de specs.
- Los vídeos usan narración sintética.
- Las métricas son de superficie y de verificación; no hay mediciones de productividad ni de negocio.
- Los identificadores de modelos de IA son los del código; no se ha consumido cuota para verificar su disponibilidad.
