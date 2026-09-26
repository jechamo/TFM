# Estado de la entrega del TFM

> Revisado el 26/09/2026. «Completado» significa hecho y comprobado en local; «pendiente» indica qué falta y quién debe hacerlo.

## Estado final

```text
README:          COMPLETADO
Documentación:   COMPLETADO   (docs/: visión, método, arquitectura, casos, auditorías, evidencias, seguridad, entrega)
Arquitectura:    COMPLETADO   (modelo C4 como código en architecture/model, 5 modelos)
Diagramas:       COMPLETADO   (56 SVG + PNG, 12 Archify interactivos, workspace Structurizr generado)
Código:          COMPLETADO   (sin cambios en los productos; tests re-ejecutados el 26/09/2026)
Deploy:          PENDIENTE    → publicar la web del TFM en GitHub Pages (ver acción 1)
Slides:          COMPLETADO   (21 diapositivas HTML + PDF con 32 enlaces activos); URL pública tras la acción 1
Vídeo:           COMPLETADO   (montado: 16:30 y 8:08); URL pública tras la acción 1
Credenciales:    PENDIENTE    → probar las cuentas demo (acción 3) y darlas solo en el formulario privado
Capturas:        COMPLETADO   (fotogramas reales y capturas públicas); opcionales en SCREENSHOTS_REQUIRED.md
```

## URLs de entrega

```text
Repositorio:  https://github.com/jechamo/TFM
Deploy:       https://jechamo.github.io/TFM/
Slides:       https://jechamo.github.io/TFM/slides/   (PDF: /slides/TFM-Jorge-Chamorro.pdf)
Vídeo:        https://jechamo.github.io/TFM/video.html?v=tfm-completo

ChaFit:
URL:              https://chafit.es  (iOS y Android en las tiendas)
Usuario DEMO:     en el formulario privado
Contraseña DEMO:  en el formulario privado

ICG Vault:
URL:              https://icgvault.es  (iOS y Android en las tiendas)
Usuario DEMO:     en el formulario privado
Contraseña DEMO:  en el formulario privado
```

Estas URLs **no funcionan todavía**: hoy `https://jechamo.github.io/TFM/` sigue sirviendo las slides antiguas hasta que se publique (acción 1).

## ACCIONES REQUERIDAS DEL AUTOR

### 1 · Publicar web, slides y vídeos (imprescindible)

| | |
|---|---|
| Qué | subir los cambios a GitHub y publicar los 9 MP4 como GitHub Release `media-v1` |
| Por qué | el tribunal tiene que poder abrir la web, las slides y el vídeo desde un enlace |
| Dónde | repositorio `jechamo/TFM`, rama `claude/wonderful-mayer-8d0vkf` (la que publica Pages) |
| Cómo | autorizar a Claude a hacer commit, push y crear el release; o hacerlo a mano con `gh release create media-v1 --repo jechamo/TFM --title "Vídeos del TFM"` subiendo los nueve MP4 del catálogo (`media/final/<id>/<id>.mp4` de `site/data/videos.json`; no `media/final/icg-vault/tfm-video.mp4`, que es un montaje anterior) y después push |
| Resultado esperado | el workflow de Pages construye `_site/`, descarga los vídeos del release y publica en `https://jechamo.github.io/TFM/` |
| Comprobación | abrir la web, las slides y `video.html?v=tfm-completo` en una ventana privada: estilos, diagramas y reproducción |

`tfm-completo.mp4` pesa 117 MB y GitHub no admite ficheros de más de 100 MB en git, por eso los vídeos van en el release y no en el repositorio.

### 2 · Acceso a los repositorios privados

| | |
|---|---|
| Qué | `jechamo/chafit360` y `jechamo/icgbolt` son privados |
| Por qué | el tribunal no podrá ver el código de ChaFit ni de ICG Vault |
| Cómo | invitar al tribunal como colaborador de solo lectura, o indicar en el formulario que el acceso se da bajo petición. **No hacerlos públicos** hasta aplicar las correcciones críticas de las auditorías |

### 3 · Probar las cuentas demo

| | |
|---|---|
| Qué | iniciar sesión con la cuenta demo de ChaFit y la de ICG Vault en web y en móvil |
| Por qué | Claude no puede iniciar sesión en sitios en producción; hay que confirmar que funcionan, que **no tienen rol de administrador** y si ICG Vault pide el nombre de usuario o el email |
| Resultado esperado | ambas entran y muestran contenido de demostración |
| Después de la defensa | cambiar la contraseña de ambas cuentas |

### 4 · Narración sintética (recomendado)

Los vídeos usan narración sintética. Confirmar con el tutor que es aceptable o grabar el [bloque técnico opcional](VIDEO_SCRIPT.md#bloque-técnico-opcional-acción-requerida-del-autor-opcional) con voz propia, que además cubre arquitectura, auditorías y máster.

### 5 · Mención al Agent SDK en el vídeo de RRSS (opcional)

En 7:47 la locución dice «Claude Code o el Agent SDK»; en el código el Agent SDK es un marcador sin implementar. Está declarado como PARCIAL. Opcional: volver a narrar esa frase.

### 6 · Rellenar el formulario

Valores en [`docs/delivery/submission-checklist.md`](docs/delivery/submission-checklist.md) y, con las credenciales, en `docs/delivery/author-private.md` (local, fuera de git).

## Verificado en esta revisión

| Comprobación | Resultado |
|---|---|
| Sistema SDD: `node scripts/check-sdd.mjs` y `npm test` | 375 comprobaciones en verde |
| RRSS Studio: Vitest y contratos | 71 + 138 en verde |
| ChaFit: contratos Node y Deno | 109 + 100 en verde |
| Árboles de trabajo de los productos | sin cambios tras la inspección |
| Web del TFM en local (escritorio y 390 px) | sin desbordamiento horizontal; diagramas y catálogo de vídeos cargan también abriendo el HTML como fichero |
| Slides: 21 diapositivas a 1920×1080 | sin elementos fuera del lienzo; PDF de 21 páginas con 32 enlaces absolutos |
| Auditorías publicadas | solo resúmenes saneados; informes completos fuera del repositorio |
