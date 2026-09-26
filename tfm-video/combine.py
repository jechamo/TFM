"""Une el vídeo principal (sistema SDD) con los tres vídeos de producto en una sola pieza.

Genera, para cada variante, el MP4, los capítulos (YouTube y metadatos del contenedor) y un SRT
con los tiempos desplazados. Los vídeos de origen están en media/final (fuera de git).

Uso:
    python tfm-video/combine.py completo   # SDD + RRSS/ChaFit/ICG Vault de ~4 min  → ~16:30
    python tfm-video/combine.py resumen    # SDD + RRSS/ChaFit/ICG Vault de ~1 min  → ~8:08
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FINAL = ROOT / "media" / "final"
VARIANTS = {
    "completo": [("Sistema SDD/TDD con agentes", "sdd/sdd"), ("RRSS Studio · LeadView", "rrss-4min/rrss-4min"),
                 ("ChaFit", "chafit-4min/chafit-4min"), ("ICG Vault", "icg-vault-4min/icg-vault-4min")],
    "resumen": [("Sistema SDD/TDD con agentes", "sdd/sdd"), ("RRSS Studio · LeadView", "rrss-1min/rrss-1min"),
                ("ChaFit", "chafit-1min/chafit-1min"), ("ICG Vault", "icg-vault-1min/icg-vault-1min")],
}


def duration(p: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(json.loads(out)["format"]["duration"])


def ts(sec: float) -> str:
    sec = int(round(sec))
    return f"{sec // 60}:{sec % 60:02d}" if sec < 3600 else f"{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


def srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def parse_srt_time(s: str) -> float:
    h, m, rest = s.split(":")
    sec, ms = rest.split(",")
    return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000


def main(variant: str) -> None:
    parts = VARIANTS[variant]
    out_dir = FINAL / f"tfm-{variant}"
    out_dir.mkdir(parents=True, exist_ok=True)
    offset, chapters, srt_blocks, idx = 0.0, [], [], 1
    for title, stem in parts:
        mp4 = FINAL / f"{stem}.mp4"
        d = duration(mp4)
        chapters.append((offset, title, True))
        ch = mp4.with_name("chapters.txt")
        if ch.exists():
            for line in ch.read_text(encoding="utf8").splitlines():
                m = re.match(r"(\d+):(\d+)\s+(.*)", line.strip())
                if m and (int(m[1]) * 60 + int(m[2])) > 0:
                    chapters.append((offset + int(m[1]) * 60 + int(m[2]), f"{title} · {m[3]}", False))
        srt = mp4.with_suffix(".srt")
        if srt.exists():
            for block in re.split(r"\n\s*\n", srt.read_text(encoding="utf8").strip()):
                lines = block.splitlines()
                if len(lines) >= 3 and "-->" in lines[1]:
                    a, b = [parse_srt_time(x.strip()) for x in lines[1].split("-->")]
                    srt_blocks.append(f"{idx}\n{srt_time(a + offset)} --> {srt_time(b + offset)}\n" + "\n".join(lines[2:]))
                    idx += 1
        offset += d
    # Capítulos para la descripción de YouTube (solo los de primer nivel y los internos).
    (out_dir / "chapters.txt").write_text("\n".join(f"{ts(t)} {name}" for t, name, _ in chapters) + "\n", encoding="utf8")
    (out_dir / f"tfm-{variant}.srt").write_text("\n\n".join(srt_blocks) + "\n", encoding="utf8")
    meta = [";FFMETADATA1", f"title=TFM · Jorge Chamorro · {variant}"]
    tops = [c for c in chapters if c[2]] + [(offset, "", True)]
    for (t0, name, _), (t1, _, _) in zip(tops, tops[1:]):
        meta += ["[CHAPTER]", "TIMEBASE=1/1000", f"START={int(t0 * 1000)}", f"END={int(t1 * 1000)}", f"title={name}"]
    (out_dir / "ffmetadata.txt").write_text("\n".join(meta) + "\n", encoding="utf8")
    inputs = sum((["-i", str(FINAL / f"{stem}.mp4")] for _, stem in parts), [])
    n = len(parts)
    filt = "".join(f"[{i}:v]scale=in_range=auto:out_range=tv,format=yuv420p,setsar=1[v{i}];" for i in range(n))
    filt += "".join(f"[v{i}][{i}:a]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
    cmd = ["ffmpeg", "-y", "-v", "error", *inputs, "-i", str(out_dir / "ffmetadata.txt"), "-filter_complex", filt,
           "-map", "[v]", "-map", "[a]", "-map_metadata", str(n), "-map_chapters", str(n),
           "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
           "-movflags", "+faststart", str(out_dir / f"tfm-{variant}.mp4")]
    subprocess.run(cmd, check=True)
    print(f"tfm-{variant}.mp4 · {ts(offset)} · {len(chapters)} capítulos · {idx - 1} subtítulos")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "completo")
