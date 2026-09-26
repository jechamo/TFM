# Decisión de herramientas de diagramación

> Fecha: 26/09/2026 · Autor: Jorge Chamorro · Estado: **aplicada**. Evaluación hecha en el entorno real de trabajo (Windows 11, Node 24, Python 3, ffmpeg, Chromium de Playwright; **sin** Java, Docker, Graphviz, D2 ni PlantUML instalados).

## Qué se necesitaba

1. **Rigor**: cada nodo y cada relación con evidencia en el código (fichero o línea).
2. **Un solo modelo** del que salgan todas las vistas, para README, documentación, web, slides y vídeo.
3. **Calidad visual de documentación de arquitectura**, no de diagrama genérico: tipografía, color semántico, fronteras de confianza, rutas sin cruces.
4. **Regenerable** con un comando y versionable en Git.
5. **Español** en todo el contenido.

## Alternativas evaluadas

| Herramienta | Qué aporta | Límite en este entorno | Veredicto |
|---|---|---|---|
| **Structurizr (DSL + CLI/Lite)** | Modelo C4 como código; varias vistas desde un modelo | Su *parser* y *render* requieren JVM o Docker, no disponibles; el render automático no controla la composición fina | **Formato de intercambio**: se genera `workspace.dsl` desde el modelo; validable con Docker |
| **Archify** | IR tipado → HTML interactivo (pan/zoom, búsqueda, trazado), validación geométrica, marcas oficiales (Simple Icons), `deliver` con recibo | Visor en inglés (sin *locale* español); tipografía monoespaciada pequeña para slides; ancla las conexiones en el punto medio de cada lado | **Vistas interactivas**: 12 vistas entregadas y validadas (4 de contenedores, 8 secuencias) |
| **IcePanel** | C4 colaborativo con buena navegación | SaaS con cuenta; el modelo no vive en el repositorio | Descartado para esta entrega |
| **D2** | Lenguaje declarativo, buen render | Binario no instalado; el motor de *layout* de mejor calidad (TALA) es propietario | Alternativa válida, no necesaria |
| **PlantUML / C4-PlantUML** | Notación C4 estándar y secuencias | Requiere Java + Graphviz; estética difícil de controlar | Descartado |
| **Mermaid** | Integrado en GitHub | Poco control de composición; es justo el "diagrama genérico" a evitar | Solo para esquemas secundarios en Markdown (no se usa en las vistas principales) |
| **draw.io** | Retoque manual preciso | Diverge del modelo en cuanto se edita a mano | Descartado como fuente de verdad |
| **Renderizador propio (SVG)** | Control total del sistema visual, español, temas claro/oscuro, rutas ortogonales sin cruces, zonas de confianza | Hay que escribirlo y mantenerlo (≈ 600 líneas, sin dependencias) | **Vistas de presentación** (README, docs, web, slides, vídeo) |

## Decisión

```text
architecture/model/*.json          ← fuente de verdad (C4 + evidencias + vistas)
        │
        ├── tools/render.mjs        → SVG claro/oscuro (56 vistas) + geometría compartida
        ├── tools/export-png.cjs    → PNG 2× para vídeo y documentos que no admiten SVG
        ├── tools/export-archify.mjs→ especificaciones Archify → HTML interactivo validado
        └── tools/export-model.mjs  → tablas de inventario inyectadas en docs/ + workspace.dsl (Structurizr)
```

**Combinación elegida:** modelo C4 propio como código + renderizador SVG para presentación + Archify para exploración interactiva + DSL de Structurizr como formato interoperable. Se mantiene la preferencia inicial (C4 + Structurizr + Archify) pero se ajusta a lo que el entorno permite comprobar: Structurizr no se puede ejecutar aquí sin JVM, así que su DSL se **genera** pero no se declara validado; Archify sí se ejecuta y **valida** cada vista.

## Por qué no solo Archify

Archify resuelve muy bien la exploración técnica, pero para slides y vídeo hace falta tipografía grande, rótulos en español en la propia interfaz y control de la composición (zonas de confianza, buses de conexión). Un renderizador propio, alimentado por el **mismo modelo**, garantiza coherencia entre todas las salidas. El exportador comparte la geometría (lados de cada relación) con Archify y aplica el bucle de corrección que recomienda su documentación hasta pasar la validación.

## Resultado verificable

| Salida | Ruta | Cantidad | Verificación |
|---|---|---:|---|
| SVG (claro y oscuro) | `architecture/exported/svg/` | 56 | Revisión visual de todas las vistas en PNG 2× |
| PNG 2× | `architecture/exported/png/` | 56 | `node architecture/tools/export-png.cjs` |
| HTML interactivo (Archify) | `architecture/exported/html/` | 12 | `archify deliver --quality standard` → recibo `architecture/archify/RECEIPT.json` |
| Structurizr DSL | `architecture/structurizr/workspace.dsl` | 4 sistemas | **No validado localmente** (sin JVM); comando de validación en la cabecera del fichero |
| Tablas de inventario | `docs/discovery/*_ARCHITECTURE_INVENTORY.md`, `*_INTEGRATIONS.md` | 12 tablas | Generadas e inyectadas entre marcadores |

Fuentes consultadas para la evaluación: documentación de Archify (repositorio `tt-a1i/archify`, commit `9e35d2b`, instalado en `.cache/archify` sin modificar la configuración global), DSL de Structurizr, documentación de IcePanel, D2, C4-PlantUML y Mermaid.
