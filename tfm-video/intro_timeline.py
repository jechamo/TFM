#!/usr/bin/env python3
"""Saca de la locución de la intro los instantes en que se nombra cada repositorio.

Uso:
    python intro_timeline.py projects/intro.json            # escribe media/Originales/video/intro.timeline.json

Transcribe la voz con la misma función que narrated.py (faster-whisper, con caché) y busca las palabras que
disparan cada paso de la slide 2 en modo grabación:

    1 · sistema (el primero)   2 · RRSS Studio   3 · ChaFit   4 · ICG Vault   5 · pie (github.com/jechamo/TFM)

Los tiempos ya incluyen el voice_offset del proyecto, así que la grabación queda sincronizada 1:1 con el montaje.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from narrated import norm, transcribe_words

LEAD = 0.25          # la tarjeta empieza a aparecer un poco antes de oír su nombre
TAIL = 1.4           # segundos de slide completa tras la última palabra


def main() -> None:
    project = Path(sys.argv[1] if len(sys.argv) > 1 else "projects/intro.json").resolve()
    cfg = json.loads(project.read_text(encoding="utf-8"))
    base = project.parent
    voice = (base / cfg["voice"]).resolve()
    work = base / "work" / project.stem          # misma caché de Whisper que narrated.py
    work.mkdir(parents=True, exist_ok=True)
    words = transcribe_words(voice, work / "voice_words.json", cfg.get("whisper_model", "small"))
    off = cfg.get("voice_offset", 0.0)
    heard = [(s + off, e + off, norm(w)) for s, e, w in words]

    def first(keys: tuple[str, ...], after: float = 0.0) -> float:
        for s, _, w in heard:
            if s >= after and any(w.startswith(k) for k in keys):
                return s
        raise SystemExit(f"No se oye ninguna de {keys} después de {after:.1f} s: revisa la toma o el texto")

    t_sys = first(("sistema",))
    t_rrss = first(("rrss", "erre", "redes"), t_sys)
    t_chafit = first(("chafit", "chaf"), t_rrss)
    t_icg = first(("icg", "vault", "ice", "icege"), t_chafit)
    end = heard[-1][1]
    steps = [[round(t_sys - LEAD, 2), 1], [round(t_rrss - LEAD, 2), 2], [round(t_chafit - LEAD, 2), 3],
             [round(t_icg - LEAD, 2), 4], [round(max(end - 2.5, t_icg + 2.0), 2), 5]]
    timeline = {"duration": round(end + TAIL, 2), "steps": steps}
    out = (base / cfg["raw"]).resolve().with_suffix(".timeline.json")
    out.write_text(json.dumps(timeline, indent=2), encoding="utf-8")
    print(f"{out}\n{json.dumps(timeline)}")


if __name__ == "__main__":
    main()
