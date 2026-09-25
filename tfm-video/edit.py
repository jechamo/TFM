#!/usr/bin/env python3
"""Montaje reproducible del vídeo del TFM.

Uso:
    python edit.py project.json            # montaje completo (pasadas 1 y 2)
    python edit.py project.json --draft    # codificación rápida, para revisar el estilo
    python edit.py project.json --only-finish   # rehace solo la pasada 2 (audio, subtítulos)

Pasada 1 (assemble): cada clip se enmarca (ventana flotante, móvil o lado a lado), se le aplican
zooms, se recortan los silencios y se aceleran las esperas; cada sección arranca con su cartela
animada y su rótulo inferior, y las secciones se unen con fundidos.

Pasada 2 (finish): limpieza de voz, música con ducking bajo la voz, efectos en las transiciones,
subtítulos quemados (SRT propio o transcrito con faster-whisper), loudnorm a -14 LUFS, capítulos
para YouTube y miniatura.

Requisitos: Python 3.10+, imageio-ffmpeg (o ffmpeg en PATH), Node + Playwright para los gráficos.
Opcional: faster-whisper para transcribir.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FPS = 30
W, H = 1920, 1080

# Geometría de los encuadres (en 1920×1080).
WINDOW = {"screen": (120, 68, 1680, 945), "side": (90, 208, 1180, 664)}
WIN_RADIUS = 22
PHONE = {"side": (1370, 65), "phone": (730, 65)}   # esquina del marco de 460×950
PHONE_SCREEN = (20, 20, 420, 910)                    # hueco de pantalla dentro del marco

# Estilo ASS (escala de referencia 384×288): ~40 px de alto en 1080p, caja semitransparente.
SUB_STYLE = ("FontName=DejaVu Sans,Bold=1,FontSize=11,PrimaryColour=&H00F3EBE8,"
             "BackColour=&H99120C0A,BorderStyle=4,Outline=1,Shadow=0,MarginV=22,MarginL=40,MarginR=40")

# Nombres propios que Whisper suele escribir mal.
GLOSSARY = {
    r"\bchafit ?360\b": "Chafit360", r"\bchafit\b": "Chafit", r"\bi ?c ?g ?vault\b": "ICG Vault",
    r"\bsupa ?base\b": "Supabase", r"\bcapacitor\b": "Capacitor", r"\bver ?cel\b": "Vercel",
    r"\brrss studio\b": "RRSS Studio", r"\bplaywright\b": "Playwright", r"\bclaude code\b": "Claude Code",
}


# ─────────────────────────────── utilidades ────────────────────────────────

def ffmpeg_exe() -> str:
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        exe = shutil.which("ffmpeg")
        if not exe:
            sys.exit("No encuentro ffmpeg: instala imageio-ffmpeg o añade ffmpeg al PATH.")
        return exe


FF = ffmpeg_exe()


def run(args: list[str], quiet: bool = True) -> subprocess.CompletedProcess:
    cmd = [FF, "-hide_banner", "-y"] + (["-loglevel", "error"] if quiet else []) + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"ffmpeg falló:\n{' '.join(cmd)}\n{res.stderr[-3000:]}")
    return res


def probe(path: Path) -> dict:
    """Duración y si hay audio, leyendo la salida de ffmpeg -i (no hace falta ffprobe)."""
    res = subprocess.run([FF, "-hide_banner", "-i", str(path)], capture_output=True, text=True)
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", res.stderr)
    dur = int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else 0.0
    return {"duration": dur, "audio": " Audio:" in res.stderr}


def silences(path: Path, start: float, end: float, noise_db: float, min_len: float) -> list[tuple[float, float]]:
    res = subprocess.run(
        [FF, "-hide_banner", "-ss", f"{start}", "-to", f"{end}", "-i", str(path), "-vn",
         "-af", f"silencedetect=noise={noise_db}dB:d={min_len}", "-f", "null", "-"],
        capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", res.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", res.stderr)]
    out = []
    for i, s in enumerate(starts):
        e = ends[i] if i < len(ends) else end - start
        out.append((start + s, start + e))
    return out


def smooth(t0: float, t1: float, ramp: float = 0.6) -> str:
    """Expresión ffmpeg 0→1→0 con subida y bajada suavizadas (smoothstep) entre t0 y t1."""
    up = f"clip((t-{t0})/{ramp},0,1)"
    down = f"clip(({t1}-t)/{ramp},0,1)"
    s = f"min({up},{down})"
    return f"({s})*({s})*(3-2*({s}))"


def fmt_ts(sec: float) -> str:
    sec = int(round(sec))
    return f"{sec // 60}:{sec % 60:02d}" if sec < 3600 else f"{sec // 3600}:{sec % 3600 // 60:02d}:{sec % 60:02d}"


# ─────────────────────────────── gráficos ──────────────────────────────────

def render_graphics(cfg: dict, gfx: Path) -> None:
    jobs = [
        {"name": "bg", "kind": "bg"},
        {"name": "bg_screen", "kind": "bg", "params": {"win": ",".join(map(str, WINDOW["screen"] + (WIN_RADIUS,)))}},
        {"name": "bg_side", "kind": "bg", "params": {"win": ",".join(map(str, WINDOW["side"] + (WIN_RADIUS,)))}},
        {"name": "mask_screen", "kind": "mask", "transparent": True, "width": WINDOW["screen"][2], "height": WINDOW["screen"][3],
         "params": {"w": WINDOW["screen"][2], "h": WINDOW["screen"][3], "r": WIN_RADIUS}},
        {"name": "mask_side", "kind": "mask", "transparent": True, "width": WINDOW["side"][2], "height": WINDOW["side"][3],
         "params": {"w": WINDOW["side"][2], "h": WINDOW["side"][3], "r": WIN_RADIUS}},
        {"name": "phone", "kind": "phone", "transparent": True, "width": 460, "height": 950},
        {"name": "mask_phone", "kind": "mask", "transparent": True, "width": 420, "height": 910},
        {"name": "thumb", "kind": "intro", "params": {"title": cfg["intro"]["title"], "sub": cfg["intro"].get("sub", "")}},
    ]
    intro = cfg["intro"]
    jobs.append({"name": "card_intro", "kind": "intro", "dur": intro.get("dur", 4.5),
                 "params": {"title": intro["title"], "sub": intro.get("sub", "")}})
    for i, sec in enumerate(cfg["sections"], 1):
        jobs.append({"name": f"card_s{i:02d}", "kind": "section", "dur": sec.get("card_dur", 2.8),
                     "params": {"title": sec["title"], "sub": sec.get("sub", ""), "n": f"{i:02d}"}})
        if sec.get("lower"):
            lw = sec["lower"]
            jobs.append({"name": f"lower_s{i:02d}", "kind": "lower", "transparent": True, "dur": lw.get("dur", 5),
                         "params": {"title": lw["title"], "url": lw.get("url", "")}})
    for i, sec in enumerate(cfg["sections"], 1):
        for j, clip in enumerate(sec["clips"]):
            for k, co in enumerate(clip.get("callouts", [])):
                jobs.append({"name": f"callout_s{i:02d}_c{j}_{k}", "kind": "callout", "transparent": True,
                             "params": {"title": co["title"], "sub": co.get("sub", ""), "n": co.get("kicker", "")}})
    speeds = sorted({sp[2] for sec in cfg["sections"] for c in sec["clips"] for sp in c.get("speedups", [])})
    for s in speeds:
        jobs.append({"name": f"speed_{s:g}", "kind": "speed", "transparent": True, "params": {"title": f"⏩ ×{s:g}"}})
    outro = cfg.get("outro", {})
    jobs.append({"name": "card_outro", "kind": "outro", "dur": outro.get("dur", 5),
                 "params": {"title": outro.get("title", "¡Gracias!"), "sub": outro.get("sub", "")}})

    # Caché: solo se vuelve a renderizar lo que no existe o cuyos parámetros han cambiado.
    todo = []
    for j in jobs:
        j["params"] = {k: str(v) for k, v in j.get("params", {}).items()}   # van en la query string
        sig = gfx / f"{j['name']}.sig.json"
        target = gfx / (j["name"] if j.get("dur") else f"{j['name']}.png")
        signature = json.dumps(j, sort_keys=True, ensure_ascii=False)
        if not target.exists() or not sig.exists() or sig.read_text(encoding="utf-8") != signature:
            if target.is_dir():
                shutil.rmtree(target)
            todo.append(j)
            sig.write_text(signature, encoding="utf-8")
    if not todo:
        return
    jobs_file = gfx / "jobs.json"
    jobs_file.write_text(json.dumps(todo, ensure_ascii=False))
    res = subprocess.run(["node", str(HERE / "render.cjs"), str(jobs_file), str(gfx)], capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit("Falló el renderizado de gráficos:\n" + res.stderr[-2000:])


def sequence_to_video(frames: Path, out: Path, alpha: bool, enc: list[str]) -> None:
    if alpha:
        run(["-framerate", str(FPS), "-i", str(frames / "f%05d.png"), "-c:v", "qtrle", str(out)])
    else:
        run(["-framerate", str(FPS), "-i", str(frames / "f%05d.png"),
             "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-shortest",
             "-vf", "format=yuv420p", *enc, "-c:a", "aac", "-b:a", "192k", str(out)])


# ─────────────────────────────── pasada 1 ──────────────────────────────────

def plan_pieces(clip: dict, src: Path, start: float, end: float) -> list[tuple[float, float, float]]:
    """Tramos (inicio, fin, velocidad) del clip tras quitar silencios y aplicar acelerados."""
    keep = [(start, end)]
    if clip.get("trim_silence", True) and probe(src)["audio"]:
        pad = clip.get("silence_pad", 0.18)
        cuts = silences(src, start, end, clip.get("silence_db", -35), clip.get("silence_min", 0.7))
        keep, cur = [], start
        for s, e in cuts:
            if s + pad > cur:
                keep.append((cur, min(s + pad, end)))
            cur = max(cur, e - pad)
        if cur < end:
            keep.append((cur, end))
    # Los tramos acelerados se conservan enteros aunque sean silenciosos (son esperas visibles).
    speedups = sorted(clip.get("speedups", []))
    for a, b, _ in speedups:
        cut = []
        for s, e in keep:
            if e <= a or s >= b:
                cut.append((s, e))
            else:
                if s < a:
                    cut.append((s, a))
                if e > b:
                    cut.append((b, e))
        keep = cut + [(a, b)]
    keep.sort()
    pieces = []
    for s, e in keep:
        sp = next((x[2] for x in speedups if x[0] == s and x[1] == e), 1.0)
        if e - s >= 0.25:
            pieces.append((s, e, sp))
    return pieces


def build_clip(clip: dict, raw: Path, gfx: Path, out: Path, enc: list[str]) -> None:
    src = raw / clip["file"]
    info = probe(src)
    start, end = clip.get("in", 0.0), clip.get("out") or info["duration"]
    layout = clip.get("layout", "screen")
    pieces = plan_pieces(clip, src, start, end)

    inputs = ["-i", str(src)]
    idx = {"src": 0}

    def add(name: str, path: Path, loop: bool = True, pre: list[str] | None = None) -> None:
        idx[name] = len(idx)
        inputs.extend((["-loop", "1"] if loop else []) + (pre or []) + ["-i", str(path)])

    fc = []
    bg_name = {"screen": "bg_screen", "side": "bg_side"}.get(layout, "bg")
    add("bg", gfx / f"{bg_name}.png")
    fc.append(f"[{idx['bg']}:v]format=yuv420p,fps={FPS}[bg]")

    if layout in ("screen", "side", "full"):
        x, y, w, h = WINDOW.get(layout, (0, 0, W, H))
        chain = (f"[0:v]fps={FPS},scale={w}:{h}:force_original_aspect_ratio=decrease,"
                 f"crop='min(iw,{w})':'min(ih,{h})',pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=0x0a0c12,setsar=1")
        for z in clip.get("zooms", []):
            # Zoom suave hacia (cx, cy), en coordenadas 0-1 de la grabación.
            e = smooth(z["t0"], z["t1"], z.get("ramp", 0.6))
            f = z.get("factor", 1.8)
            chain += (f",scale=w='{w}*(1+{f - 1}*{e})':h='{h}*(1+{f - 1}*{e})':eval=frame,"
                      f"crop={w}:{h}:x='clip({z['cx']}*in_w-{w}/2,0,in_w-{w})':y='clip({z['cy']}*in_h-{h}/2,0,in_h-{h})'")
        if layout == "full":
            fc.append(chain + "[win]")
            fc.append("[bg][win]overlay=0:0:shortest=1[v0]")
        else:
            add("mask", gfx / f"mask_{layout}.png")
            fc.append(chain + ",format=rgba[win0]")
            fc.append(f"[{idx['mask']}:v]format=gray[m]")
            fc.append("[win0][m]alphamerge[win]")
            fc.append(f"[bg][win]overlay={x}:{y}:shortest=1[v0]")
    else:
        fc.append("[bg]null[v0]")

    if layout in ("side", "phone"):
        phone_src = raw / clip["phone"] if layout == "side" else src
        if layout == "side":
            add("ph", phone_src, loop=False, pre=["-itsoffset", str(clip.get("phone_offset", 0.0))])
            ph_in = f"{idx['ph']}:v"
        else:
            ph_in = "0:v"
        add("frame", gfx / "phone.png")
        add("pmask", gfx / "mask_phone.png")
        px, py = PHONE[layout]
        if layout == "phone" and clip.get("callouts"):
            px = 1250   # con leyendas, el móvil se desplaza a la derecha y el texto ocupa la izquierda
        sx, sy, sw, sh = PHONE_SCREEN
        fc.append(f"[{ph_in}]fps={FPS},scale={sw}:{sh}:force_original_aspect_ratio=increase,crop={sw}:{sh},setsar=1,format=rgba[ph0]")
        fc.append(f"[{idx['pmask']}:v]format=gray[pm]")
        fc.append("[ph0][pm]alphamerge[ph]")
        # Lado a lado: manda la grabación de pantalla. Solo móvil: manda el vídeo del móvil.
        end_rule = "eof_action=pass" if layout == "side" else "shortest=1"
        fc.append(f"[v0][ph]overlay={px + sx}:{py + sy}:{end_rule}[v1]")
        fc.append(f"[v1][{idx['frame']}:v]overlay={px}:{py}:shortest=1[vl]")
    else:
        fc.append("[v0]null[vl]")

    # Leyendas en pantalla (para vídeos sin voz): aparecen y se van con fundido, en tiempo de la grabación.
    cur = "vl"
    for k, co in enumerate(clip.get("callouts", [])):
        name = f"co{k}"
        add(name, gfx / f"{clip['_tag']}_{k}.png")
        t0, t1 = co["t0"], co["t1"]
        fc.append(f"[{idx[name]}:v]format=rgba,fps={FPS},trim=duration={t1 - t0},fade=t=in:d=0.4:alpha=1,"
                  f"fade=t=out:st={max(t1 - t0 - 0.4, 0)}:d=0.4:alpha=1,setpts=PTS-STARTPTS+{t0}/TB[cof{k}]")
        fc.append(f"[{cur}][cof{k}]overlay=0:0:eof_action=pass[vc{k}]")
        cur = f"vc{k}"

    # Recorte en tramos + acelerados (la etiqueta ⏩ solo en los acelerados).
    n = len(pieces)
    has_audio = info["audio"]
    fc.append(f"[{cur}]split={n}" + "".join(f"[vs{i}]" for i in range(n)))
    if has_audio:
        fc.append(f"[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit={n}" + "".join(f"[as{i}]" for i in range(n)))
    for i, (s, e, sp) in enumerate(pieces):
        v = f"[vs{i}]trim={s}:{e},setpts=(PTS-STARTPTS)/{sp}"
        if sp != 1:
            name = f"sp{i}"
            add(name, gfx / f"speed_{sp:g}.png")
            fc.append(v + f"[vt{i}]")
            fc.append(f"[vt{i}][{idx[name]}:v]overlay=0:0:shortest=1[vp{i}]")
        else:
            fc.append(v + f"[vp{i}]")
        if has_audio:
            a = f"[as{i}]atrim={s}:{e},asetpts=PTS-STARTPTS"
            if sp != 1:
                a += f",atempo={sp},volume=0"   # la voz acelerada se silencia: la música cubre la espera
            fc.append(a + f"[ap{i}]")
        else:
            fc.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{(e - s) / sp}[ap{i}]")
    fc.append("".join(f"[vp{i}][ap{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[vo][ao]")

    run([*inputs, "-filter_complex", ";".join(fc), "-map", "[vo]", "-map", "[ao]",
         "-r", str(FPS), *enc, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", str(out)])


def concat_files(files: list[Path], out: Path, enc: list[str]) -> None:
    ins, fc = [], []
    for i, f in enumerate(files):
        ins += ["-i", str(f)]
        fc.append(f"[{i}:v]setsar=1,fps={FPS},format=yuv420p[v{i}];[{i}:a]aresample=48000[a{i}]")
    fc.append("".join(f"[v{i}][a{i}]" for i in range(len(files))) + f"concat=n={len(files)}:v=1:a=1[v][a]")
    run([*ins, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]", *enc, "-c:a", "aac", "-b:a", "192k", str(out)])


def overlay_lower(section: Path, lower: Path, at: float, out: Path, enc: list[str]) -> None:
    run(["-i", str(section), "-itsoffset", str(at), "-i", str(lower),
         "-filter_complex", "[0:v][1:v]overlay=0:0:eof_action=pass[v]",
         "-map", "[v]", "-map", "0:a", *enc, "-c:a", "copy", str(out)])


def xfade_all(parts: list[Path], out: Path, td: float, enc: list[str]) -> list[float]:
    """Une las partes con fundidos; devuelve el instante de inicio de cada parte en el resultado."""
    durs = [probe(p)["duration"] for p in parts]
    ins = sum((["-i", str(p)] for p in parts), [])
    fc, starts, acc = [], [0.0], durs[0]
    for i in range(len(parts)):
        fc.append(f"[{i}:v]settb=AVTB,fps={FPS},setsar=1,format=yuv420p[n{i}];[{i}:a]aresample=48000[m{i}]")
    vprev, aprev = "n0", "m0"
    kinds = ["fade", "smoothleft", "fade", "circleopen"]   # variedad discreta
    for i in range(1, len(parts)):
        off = acc - td
        starts.append(off)
        kind = kinds[i % len(kinds)]
        fc.append(f"[{vprev}][n{i}]xfade=transition={kind}:duration={td}:offset={off:.3f}[vx{i}]")
        fc.append(f"[{aprev}][m{i}]acrossfade=d={td}[ax{i}]")
        vprev, aprev = f"vx{i}", f"ax{i}"
        acc = off + durs[i]
    run([*ins, "-filter_complex", ";".join(fc), "-map", f"[{vprev}]", "-map", f"[{aprev}]",
         *enc, "-c:a", "aac", "-b:a", "192k", str(out)])
    return starts


def assemble(cfg: dict, base: Path, work: Path, enc: list[str]) -> dict:
    raw = base / cfg.get("raw_dir", "raw")
    gfx = work / "gfx"
    gfx.mkdir(parents=True, exist_ok=True)
    render_graphics(cfg, gfx)

    card = lambda name: work / f"{name}.mp4"
    sequence_to_video(gfx / "card_intro", card("card_intro"), False, enc)
    sequence_to_video(gfx / "card_outro", card("card_outro"), False, enc)

    parts, chapters = [card("card_intro")], [cfg["intro"].get("chapter", "Introducción")]
    for i, sec in enumerate(cfg["sections"], 1):
        tag = f"s{i:02d}"
        print(f"· Sección {i}: {sec['title']}")
        sequence_to_video(gfx / f"card_{tag}", card(f"card_{tag}"), False, enc)
        clips = []
        for j, clip in enumerate(sec["clips"]):
            clip["_tag"] = f"callout_{tag}_c{j}"
            out = work / f"{tag}_c{j}.mp4"
            build_clip(clip, raw, gfx, out, enc)
            clips.append(out)
        body = work / f"{tag}_body.mp4"
        concat_files(clips, body, enc)
        if sec.get("lower"):
            lw = work / f"lower_{tag}.mov"
            sequence_to_video(gfx / f"lower_{tag}", lw, True, enc)
            lowered = work / f"{tag}_body_l.mp4"
            overlay_lower(body, lw, sec["lower"].get("at", 1.0), lowered, enc)
            body = lowered
        sec_out = work / f"{tag}.mp4"
        concat_files([card(f"card_{tag}"), body], sec_out, enc)
        parts.append(sec_out)
        chapters.append(sec.get("chapter", sec["title"].replace("*", "")))
    parts.append(card("card_outro"))
    chapters.append(cfg.get("outro", {}).get("chapter", "Cierre"))

    td = cfg.get("transition", 0.6)
    starts = xfade_all(parts, work / "assembled.mp4", td, enc)
    meta = {"chapters": [{"t": round(s, 2), "title": c} for s, c in zip(starts, chapters)],
            "transitions": [round(s, 2) for s in starts[1:]]}
    meta["chapters"][0]["t"] = 0.0
    (work / "assembled.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    return meta


# ─────────────────────────────── pasada 2 ──────────────────────────────────

def transcribe(audio_src: Path, srt: Path, model_name: str) -> bool:
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("  (faster-whisper no instalado: sin subtítulos automáticos)")
        return False
    try:
        model = WhisperModel(model_name, device="cpu", compute_type="int8")
    except Exception as e:  # modelo no descargable (red) → se sigue sin subtítulos
        print(f"  (no se pudo cargar el modelo Whisper '{model_name}': {e.__class__.__name__})")
        return False
    segs, _ = model.transcribe(str(audio_src), language="es", word_timestamps=True, vad_filter=True)
    lines, cur = [], []
    for seg in segs:
        for wd in seg.words:
            cur.append(wd)
            text = "".join(x.word for x in cur).strip()
            if len(text) > 42 or wd.word.strip().endswith((".", "?", "!")):
                lines.append(cur)
                cur = []
    if cur:
        lines.append(cur)
    ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(s * 1000 % 1000):03d}"
    out = []
    for k, ln in enumerate(lines, 1):
        text = "".join(x.word for x in ln).strip()
        for pat, rep in GLOSSARY.items():
            text = re.sub(pat, rep, text, flags=re.I)
        out.append(f"{k}\n{ts(ln[0].start)} --> {ts(ln[-1].end)}\n{text}\n")
    srt.write_text("\n".join(out), encoding="utf-8")
    return True


def finish(cfg: dict, base: Path, work: Path, final: Path, enc: list[str]) -> None:
    meta = json.loads((work / "assembled.json").read_text())
    src = work / "assembled.mp4"
    dur = probe(src)["duration"]
    final.mkdir(parents=True, exist_ok=True)

    srt = final / "tfm-video.srt"
    if cfg.get("subtitles"):
        shutil.copy(base / cfg["subtitles"], srt)
    elif cfg.get("transcribe", True):
        print("· Transcribiendo con Whisper…")
        if not transcribe(src, srt, cfg.get("whisper_model", "small")):
            srt = None
    else:
        srt = None

    ins = ["-i", str(src)]
    fc = ["[0:a]highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=120,"
          "aresample=48000,asplit=2[voice][sc]"]
    mix = ["[voice]"]
    if cfg.get("music"):
        ins += ["-stream_loop", "-1", "-i", str(base / cfg["music"])]
        vol = cfg.get("music_db", -24)
        fc.append(f"[1:a]aresample=48000,aformat=channel_layouts=stereo,volume={vol}dB,atrim=0:{dur},"
                  f"afade=t=in:d=1.5,afade=t=out:st={max(dur - 3, 0)}:d=3[mus]")
        fc.append("[mus][sc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[duck]")
        mix.append("[duck]")
    else:
        fc.append("[sc]anullsink")
    if cfg.get("sfx_transition"):
        k = 2 if cfg.get("music") else 1
        ins += ["-i", str(base / cfg["sfx_transition"])]
        ts = meta["transitions"]
        fc.append(f"[{k}:a]aresample=48000,aformat=channel_layouts=stereo,volume={cfg.get('sfx_db', -12)}dB,asplit={len(ts)}"
                  + "".join(f"[fx{i}]" for i in range(len(ts))))
        for i, t in enumerate(ts):
            ms = int(max(t - 0.15, 0) * 1000)
            fc.append(f"[fx{i}]adelay={ms}|{ms}[fxd{i}]")
            mix.append(f"[fxd{i}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,"
              "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")

    vf = "[0:v]null"
    if srt:
        sub = str(srt).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
        vf = f"[0:v]subtitles='{sub}':force_style='{SUB_STYLE}'"
    fc.append(vf + ",format=yuv420p[v]")

    out = final / "tfm-video.mp4"
    run([*ins, "-filter_complex", ";".join(fc), "-map", "[v]", "-map", "[a]",
         *enc, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)])

    chapters = "\n".join(f"{fmt_ts(c['t'])} {c['title']}" for c in meta["chapters"])
    (final / "chapters.txt").write_text(chapters + "\n", encoding="utf-8")
    run(["-i", str(work / "gfx" / "thumb.png"), "-vf", "scale=1280:720", str(final / "thumbnail.jpg")])
    print(f"✓ {out}  ({fmt_ts(probe(out)['duration'])})")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--draft", action="store_true", help="codificación rápida para revisar")
    ap.add_argument("--only-finish", action="store_true", help="rehace solo audio, subtítulos y exportación")
    ap.add_argument("--work", default=None, help="carpeta de trabajo (por defecto, work/ junto al proyecto)")
    args = ap.parse_args()

    project = Path(args.project).resolve()
    cfg = json.loads(project.read_text(encoding="utf-8"))
    base = project.parent
    work = Path(args.work).resolve() if args.work else base / "work"
    work.mkdir(parents=True, exist_ok=True)
    enc = (["-c:v", "libx264", "-preset", "veryfast", "-crf", "26"] if args.draft
           else ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high"])
    enc += ["-pix_fmt", "yuv420p"]

    if not args.only_finish:
        assemble(cfg, base, work, enc)
    finish(cfg, base, work, base / cfg.get("final_dir", "final"), enc)


if __name__ == "__main__":
    main()
