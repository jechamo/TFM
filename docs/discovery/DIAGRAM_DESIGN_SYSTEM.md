# Sistema de diseño de los diagramas

Implementado en [`architecture/tools/render.mjs`](../../architecture/tools/render.mjs) (tokens `THEMES`, `TYPES`, `EDGE`). Si cambias un token, cámbialo aquí también.

## Principios

1. **El nombre siempre está escrito.** Los logotipos identifican, no explican: el diagrama se entiende sin conocer ninguna marca.
2. **Color semántico, no decorativo.** El color dice qué *es* cada pieza (cliente, servidor, datos, IA…), nunca de qué empresa es.
3. **Una dirección de lectura.** Personas a la izquierda, cliente, plataforma, datos y terceros hacia la derecha o abajo.
4. **Sin cruces.** Rutas ortogonales con puertos distribuidos; si dos relaciones comparten destino, se agrupan en un bus.
5. **Fronteras de confianza visibles** con zonas rotuladas.
6. **AS-IS.** Solo se dibuja lo que tiene evidencia en `architecture/model/*.json`.

## Tipografía

| Uso | Fuente | Tamaño |
|---|---|---|
| Título de vista | Inter / Segoe UI, 700 | 24 px |
| Nombre de componente | Inter, 650 | 16,5 px (19–20 px en slides) |
| Tipo de componente | Inter, 600, versalitas con 0,7 px de tracking | 10,5 px |
| Tecnología | JetBrains Mono / Cascadia / Consolas | 12,2 px |
| Etiqueta de relación | Inter con halo del color de fondo | 12,2 px |

## Colores (tema claro · oscuro)

| Categoría | Claro | Oscuro | Se aplica a |
|---|---|---|---|
| Persona | `#343A46` | `#C9D1DB` | usuarios, operador, desarrollador |
| Cliente | `#2458D3` | `#6EA2FF` | web, app móvil, plugins nativos, agentes |
| Servidor | `#0F766E` | `#34D0B7` | Next.js, Edge Functions, pasarela, CLI |
| Datos | `#6D3FD6` | `#AE92FF` | Postgres, SQLite, Storage, colas, skills |
| IA | `#C2410C` | `#FF9A5A` | proveedores de inferencia y llamadas de IA |
| Externo | `#4B5768` | `#9FB0C4` | APIs y servicios de terceros |
| Seguridad | `#A15C07` | `#F2B84B` | Auth, Vault, hooks de guarda, credenciales |
| Plataforma | `#334155` | `#A9B6C6` | hosting, tiendas, CI/CD, repositorios |
| Humano | `#BE123C` | `#FF6F8E` | gates de aprobación humana |

Fondo `#FBFAF7` (claro, papel) y `#0D1015` (oscuro, para slides y vídeo).

## Formas

- **Componente**: tarjeta de esquinas 10 px, barra lateral de 3,5 px con el color de su categoría, icono lineal de 24 px arriba a la izquierda, tipo en versalitas, nombre, tecnología en monoespaciada y, si aporta, una lista con viñetas.
- **Nodo alto** (pasarela, base de datos, sistema): misma tarjeta, con la lista de rutas o dominios que contiene.
- **Zona / frontera**: rectángulo de 14 px de radio. Discontinua para confianza del usuario y terceros; continua para plataforma propia gestionada. Rótulo en versalitas arriba (o abajo si una línea lo cruzaría).
- **Iconos**: set lineal propio (persona, navegador, móvil, servidor, función, base de datos, carpeta, cola, candado, terminal, chispa de IA, globo, tarjeta, correo, pin, pulso, flujo, RSS, nube, bolsa, bucle, rama, agente, libro, gancho, documento, check). Marcas oficiales de Simple Icons (CC0) solo en el producto real, a 16 px.

## Relaciones

| Tipo | Trazo | Uso |
|---|---|---|
| Uso por personas | continuo, tinta | persona → sistema |
| Llamada interna | continuo, gris | entre contenedores propios |
| API externa | continuo, pizarra | llamada síncrona a un tercero |
| Inferencia de IA | continuo, naranja, más grueso | cualquier llamada a un modelo |
| Datos | continuo, violeta | lectura/escritura en almacenamiento |
| Autenticación / secretos | continuo, ámbar | identidad, tokens, Vault |
| Asíncrono / evento / webhook | discontinuo 6-4 | cron, colas, webhooks, telemetría |
| Despliegue / distribución | punteado 2-4 | build, hosting, tiendas |
| Proceso local | continuo, gris azulado | subprocesos y plugins |
| Aprobación humana | continuo, carmesí | gates del circuito SDD |

La leyenda se genera sola con los tipos que aparecen en cada vista.

## Nomenclatura

- Títulos: `Producto · vista` ("ChaFit · arquitectura de contenedores").
- Etiqueta de nivel C4 y estado en la esquina: `C4 · nivel 2 · AS-IS`.
- Pie: repositorio y commit de origen + fecha de inspección.
- Relaciones con verbo o protocolo ("supabase-js · JWT", "Webhook de alta").

## Audiencias

| Destino | Vista | Tema | Detalle |
|---|---|---|---|
| README | contexto y visión global | claro | bajo |
| Documentación técnica | contenedores, integraciones, despliegue, secuencias | claro | alto |
| Web del TFM | contenedores e integraciones (+ HTML interactivo de Archify) | claro | medio |
| Slides y vídeo | vistas `slides` y `overview` | oscuro | mínimo, tipografía 19–20 px |
