# Escena «hecho con mi propia app» (RRSS Studio)

Un momento de 30-45 s dentro del bloque de RRSS Studio en el que **tu propia aplicación trabaja
sobre el vídeo del TFM**. Es la mejor demostración posible de que RRSS Studio es un producto real.

## Qué grabar (en tu PC con Windows)

1. Arranca RRSS Studio (`preparar.bat` o `node scripts/install-local.mjs start`) y comprueba en
   **Ajustes → Herramientas del sistema** que FFmpeg, ffprobe y Whisper local están en verde.
2. Abre **Laboratorio de clips** (`http://localhost:3000/clips`).
3. Sube el **montaje final del TFM** (`final/tfm-video.mp4`; MP4, menos de 500 MB).
4. Elige **Usar mi JSON** y **Directo** (sin Gemini ni créditos) y pega un JSON con 2 o 3 momentos
   (ver abajo). Si tienes Gemini configurado, **Descubrir con IA** queda aún mejor.
5. Lanza el procesado y **graba la pantalla** mientras los nodos avanzan (acelera la espera ×6 en el montaje).
6. Enseña los clips 9:16 subtitulados resultantes y reproduce uno.
7. Cierra con la frase: *«Los clips para redes de este TFM los ha hecho la propia RRSS Studio.»*

## JSON de ejemplo

Ajusta `inicio` y `fin` (en segundos) a los momentos reales del montaje; `chapters.txt` te ayuda a
localizarlos. Rellena `subtitulos_sincronizados` con las líneas de `tfm-video.srt` de ese tramo.

```json
{
  "top_10_virales": [
    {
      "ranking": 1,
      "inicio": 95.0,
      "fin": 118.0,
      "hook": "La IA escribe código gratis. Gobernarlo es lo caro.",
      "transcripcion_completa": "…",
      "justificacion": "Frase fuerte y universal para desarrolladores.",
      "subtitulos_sincronizados": [
        { "start_time": 95.0, "end_time": 98.2, "texto": "La IA ha abaratado escribir código." },
        { "start_time": 98.2, "end_time": 101.5, "texto": "Lo caro ahora es entenderlo y gobernarlo." }
      ]
    }
  ],
  "top_10_polemicos": [
    {
      "ranking": 1,
      "inicio": 612.0,
      "fin": 634.0,
      "hook": "Que un agente diga que ha terminado no demuestra nada.",
      "transcripcion_completa": "…",
      "justificacion": "Opinión discutible sobre los agentes de IA.",
      "subtitulos_sincronizados": [
        { "start_time": 612.0, "end_time": 615.5, "texto": "Que un agente diga que ha terminado no demuestra nada." }
      ]
    }
  ]
}
```

## En el montaje

Añade esa grabación como un clip más de la sección de RRSS Studio en `project.json`, con un acelerado
sobre la espera del procesado:

```json
{ "file": "04-rrss-clips.mp4", "layout": "screen", "speedups": [[14.0, 70.0, 6]] }
```
