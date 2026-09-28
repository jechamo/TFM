"""Prepara los metadatos de los vídeos para la web y las slides.

Lee media/final (fuera de git) y escribe, dentro de site/ (versionado):
  - site/data/videos.json     catálogo con duración, capítulos y ficheros
  - site/videos/<id>.vtt      subtítulos WebVTT
  - site/assets/img/thumbs/<id>.webp  miniaturas
Los MP4 no se versionan: se publican como assets de un GitHub Release y la CI los copia a Pages.
Uso: python tools/prepare-videos.py [--release media-vN]
     (sin --release conserva el release que ya figura en videos.json)
"""
import argparse
import json
import re
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
FINAL = ROOT / "media" / "final"
SITE = ROOT / "site"
VIDEOS = [
    ("tfm-completo", "tfm-completo/tfm-completo", "TFM completo", "Sistema SDD + RRSS Studio + ChaFit + ICG Vault", "sdd/thumbnail.jpg"),
    ("tfm-resumen", "tfm-resumen/tfm-resumen", "TFM resumido", "Sistema SDD + los tres productos en un minuto cada uno", "sdd/thumbnail.jpg"),
    ("sdd", "sdd/sdd", "Sistema SDD/TDD con agentes", "Vídeo principal: instalación, circuito, gates, agentes y skills", "sdd/thumbnail.jpg"),
    ("rrss-4min", "rrss-4min/rrss-4min", "RRSS Studio · LeadView", "Recorrido completo", "rrss-4min/thumbnail.jpg"),
    ("chafit-4min", "chafit-4min/chafit-4min", "ChaFit", "Recorrido completo", "chafit-4min/thumbnail.jpg"),
    ("icg-vault-4min", "icg-vault-4min/icg-vault-4min", "ICG Vault", "Recorrido completo", "icg-vault-4min/thumbnail.jpg"),
    ("rrss-1min", "rrss-1min/rrss-1min", "RRSS Studio en 1 minuto", "Resumen", "rrss-1min/thumbnail.jpg"),
    ("chafit-1min", "chafit-1min/chafit-1min", "ChaFit en 1 minuto", "Resumen", "chafit-1min/thumbnail.jpg"),
    ("icg-vault-1min", "icg-vault-1min/icg-vault-1min", "ICG Vault en 1 minuto", "Resumen", "icg-vault-1min/thumbnail.jpg"),
]


def duration(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return round(float(json.loads(out)["format"]["duration"]), 1)


def srt_to_vtt(srt: str) -> str:
    body = re.sub(r"(\d{2}:\d{2}:\d{2}),(\d{3})", r"\1.\2", srt.strip())
    body = re.sub(r"^\d+\s*\n(?=\d{2}:\d{2})", "", body, flags=re.M)
    return "WEBVTT\n\n" + body + "\n"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--release", help="tag del GitHub Release con los MP4 (p. ej. media-v2)")
    args = ap.parse_args()
    current = SITE / "data" / "videos.json"
    release = args.release or (json.loads(current.read_text(encoding="utf8"))["release"] if current.exists() else "media-v1")
    with_intro = (FINAL / "intro" / "intro.mp4").exists()
    (SITE / "data").mkdir(parents=True, exist_ok=True)
    (SITE / "videos").mkdir(parents=True, exist_ok=True)
    (SITE / "assets" / "img" / "thumbs").mkdir(parents=True, exist_ok=True)
    catalog = []
    for vid, stem, title, subtitle, thumb in VIDEOS:
        mp4 = FINAL / f"{stem}.mp4"
        if not mp4.exists():
            print("falta", mp4)
            continue
        chapters = []
        ch = mp4.parent / "chapters.txt"
        if ch.exists():
            for line in ch.read_text(encoding="utf8").splitlines():
                m = re.match(r"(?:(\d+):)?(\d+):(\d+)\s+(.*)", line.strip())
                if m:
                    h = int(m[1] or 0)
                    chapters.append({"t": h * 3600 + int(m[2]) * 60 + int(m[3]), "title": m[4]})
        srt = mp4.with_suffix(".srt")
        has_vtt = srt.exists()
        if has_vtt:
            (SITE / "videos" / f"{vid}.vtt").write_text(srt_to_vtt(srt.read_text(encoding="utf8")), encoding="utf8")
        th = FINAL / thumb
        if with_intro and vid.startswith("tfm-") and (FINAL / "intro" / "thumbnail.jpg").exists():
            th = FINAL / "intro" / "thumbnail.jpg"      # portada «Del máster a producción» de la intro
        if th.exists():
            Image.open(th).convert("RGB").resize((640, 360)).save(SITE / "assets" / "img" / "thumbs" / f"{vid}.webp", "WEBP", quality=80)
        if with_intro and vid.startswith("tfm-"):
            subtitle = "Intro de los cuatro repositorios + " + subtitle[0].lower() + subtitle[1:]
        catalog.append({"id": vid, "title": title, "subtitle": subtitle, "file": f"{vid}.mp4", "bytes": mp4.stat().st_size,
                        "duration": duration(mp4), "vtt": f"videos/{vid}.vtt" if has_vtt else None,
                        "thumb": f"assets/img/thumbs/{vid}.webp", "chapters": chapters, "voice": "narración sintética"})
    (SITE / "data" / "videos.json").write_text(json.dumps({"release": release, "repo": "jechamo/TFM", "videos": catalog},
                                                          ensure_ascii=False, indent=1), encoding="utf8")
    print(f"{len(catalog)} vídeos catalogados · release {release}" + (" · con intro" if with_intro else ""))


if __name__ == "__main__":
    main()
