# Arquitectura como código

Todo diagrama, tabla de inventario y DSL de este TFM sale de **un único modelo por sistema**:

| Modelo | Sistema | Vistas |
|---|---|---|
| [`model/sdd.json`](model/sdd.json) | Sistema SDD/TDD con agentes | contexto · componentes · circuito · agentes · secuencia |
| [`model/rrss.json`](model/rrss.json) | RRSS Studio (LeadView) | contexto · contenedores · integraciones · despliegue · 2 secuencias · slides |
| [`model/chafit.json`](model/chafit.json) | ChaFit | contexto · contenedores · integraciones · despliegue · 2 secuencias · slides |
| [`model/icgvault.json`](model/icgvault.json) | ICG Vault | contexto · contenedores · integraciones · despliegue · 3 secuencias · slides |
| [`model/tfm.json`](model/tfm.json) | Visión global | del máster a producción |

Cada elemento lleva `type`, `tech`, `resp` (responsabilidad) y `evidence` (ficheros y líneas del repositorio de origen). Cada relación lleva `protocol`, `auth`, `data` y `evidence`. Las vistas solo colocan elementos y relaciones ya definidos.

## Regenerar

```bash
node architecture/tools/render.mjs            # 56 SVG (claro/oscuro) + geometría compartida
node architecture/tools/export-png.cjs        # PNG 2× (Chromium de Playwright)
node architecture/tools/export-model.mjs      # tablas de docs/discovery + structurizr/workspace.dsl
node architecture/tools/export-archify.mjs    # HTML interactivo validado (requiere Archify en .cache)
node tools/crop-diagrams.cjs                  # vistas de slides recortadas al contenido → site/slides/img
node tools/build-site.mjs                     # copia los diagramas a site/diagrams y ensambla _site/
node tools/export-slides-pdf.cjs              # PDF de las slides con enlaces absolutos (tras build-site)
```

Archify no se versiona. Para instalarlo en la misma revisión usada:

```bash
git clone https://github.com/tt-a1i/archify.git .cache/archify && git -C .cache/archify checkout 9e35d2b
```

```bash
npm ci --prefix .cache/archify/archify --ignore-scripts
```

## Estructura

```text
architecture/
├── model/                 fuente de verdad (JSON) + generated/ (tablas Markdown)
├── tools/                 render.mjs · export-png.cjs · export-model.mjs · export-archify.mjs · brand-marks.json
├── structurizr/           workspace.dsl (generado; validable con la CLI de Structurizr)
├── archify/               especificaciones Archify generadas + RECEIPT.json
└── exported/
    ├── svg/               vistas para README, docs, web y slides
    ├── png/               rasterizados 2×
    ├── html/              visores interactivos de Archify
    └── geometry/          rutas calculadas compartidas con Archify
```

Decisión razonada: [`docs/discovery/DIAGRAM_TOOLING_DECISION.md`](../docs/discovery/DIAGRAM_TOOLING_DECISION.md) · Sistema visual: [`docs/discovery/DIAGRAM_DESIGN_SYSTEM.md`](../docs/discovery/DIAGRAM_DESIGN_SYSTEM.md).

Las marcas de producto proceden de Simple Icons 16.28.0 (CC0) a través del catálogo de Archify; son marcas registradas de sus titulares y se usan solo para identificar el servicio.
