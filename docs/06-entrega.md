# Checklist de entrega

Fecha límite: **20/07/2026** (según el temario). Tras esa fecha el TFM se sigue corrigiendo,
aunque los plazos pueden variar.

## 1. Campos del formulario

| Campo | Valor |
|---|---|
| Nombre completo | `PENDIENTE` |
| Email de inscripción | `PENDIENTE` |
| URL del repositorio | <https://github.com/jechamo/TFM> |
| URL de despliegue | <https://icgvault.es> · <https://chafit.es> (y las apps en las tiendas, ver README) |
| URL de las slides | `https://jechamo.github.io/TFM/` (tras activar GitHub Pages) |
| URL del vídeo | `PENDIENTE` |
| Usuario y contraseña de prueba | Los de la [sección 6 del README](../README.md#6-usuarios-y-contraseñas-de-prueba) |

## 2. Cuentas de prueba

- [ ] Crear en ICG Vault un usuario `demo` exclusivo para la corrección, con algunos votos y listas para que no aparezca vacío.
- [ ] Crear en Chafit360 un **cliente** y un **entrenador** demo vinculados entre sí, con una rutina generada. **No** reutilizar `client1`: está reservado a la revisión de Google Play.
- [ ] Contraseñas únicas y desechables, que no se usen en ningún otro servicio.
- [ ] Anotarlas en el README (sección 6) y en el formulario.
- [ ] Cuando se publique la nota, desactivarlas o cambiarles la contraseña.

## 3. Repositorios privados

El enunciado permite repositorios privados si se justifica y se da acceso a `mouredev@gmail.com`.

| Repositorio | Acción |
|---|---|
| `jechamo/icgbolt` | Settings → Collaborators → **Add people** → `mouredev@gmail.com` (rol *Read*) |
| `jechamo/chafit360` | Igual que el anterior |
| `jechamo/Estructura_inicial` | **Hacerlo público** (Settings → General → Danger Zone → *Change visibility*). No contiene secretos y es el núcleo del TFM. Si se deja privado, dar acceso como en los anteriores. |

**Justificación** (ya incluida en el README): ICG Vault y Chafit360 son productos comerciales en
producción, con usuarios reales, suscripciones de pago y datos de salud y entrenamiento. Su historial
contiene configuración de entornos productivos, por lo que publicarlos expondría la infraestructura.

## 4. Slides

- [ ] Settings → Pages → Source: **GitHub Actions**.
- [ ] Merge de la rama del TFM a `main`; el workflow *Publicar slides* despliega la carpeta `slides/`.
- [ ] Comprobar `https://jechamo.github.io/TFM/` y copiar la URL al README y al formulario.
- [ ] Alternativa o complemento: subir `slides/TFM-presentacion.pdf` a Drive con «Cualquier persona con el enlace».

## 5. Vídeo

- [ ] Grabar siguiendo el [guion](05-guion-video.md).
- [ ] Subir a YouTube (público u oculto) o a Drive con acceso público.
- [ ] Pegar la URL en el README (tabla de enlaces) y en el formulario.

## 6. Revisión final

- [ ] El README abre sin enlaces rotos (probar en una ventana de incógnito sin sesión de GitHub).
- [ ] No queda ningún `PENDIENTE` en el README.
- [ ] Las webs y las fichas de las tiendas cargan.
- [ ] El repositorio `TFM` es **público**.
