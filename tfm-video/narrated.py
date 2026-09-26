#!/usr/bin/env python3
"""Montaje de un vídeo narrado: la locución manda y el metraje se cuadra con ella.

Uso:
    python narrated.py proyecto.json            # versión final
    python narrated.py proyecto.json --draft    # codificación rápida para revisar

A diferencia de edit.py (tiempos en la grabación), aquí todos los tiempos son del vídeo final:

- shots:    [inicio, raw_desde, raw_hasta] consecutivos; cada plano dura hasta que empieza el siguiente y
            su velocidad sale de ahí. [inicio, raw] (sin «hasta») congela ese fotograma.
- cards:    cartelas a pantalla completa (intro, section, outro) que entran y salen con fundido.
- callouts, zooms: como en edit.py, pero en tiempo del vídeo final.
- music:    trozos [desde, hasta] de la canción, cortados en compás, que se encadenan tal cual.
- voice + script: la locución y su guion; Whisper da los tiempos y el guion el texto de los subtítulos.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

import edit
from edit import FF, FPS, PHONE_SCREEN, fmt_ts, probe, run, zoom_chain

PX, PY = 1250, 65                  # marco del móvil con leyendas a la izquierda (como edit.py)
SX, SY, SW, SH = PHONE_SCREEN
CARD_FADE = 0.35
# Subtítulos abajo a la izquierda, sin pisar el móvil (unidades ASS de 384×288: x × 5 = píxeles).
SUB_STYLE = edit.SUB_STYLE.replace("MarginL=40,MarginR=40", "MarginL=30,MarginR=144") + ",Alignment=1"
# Grabación de pantalla (layout "screen"): ventana flotante que deja abajo una franja para los subtítulos.
WIN = (160, 36, 1600, 900)
WIN_RADIUS = 22
SUB_STYLE_SCREEN = edit.SUB_STYLE.replace("MarginV=22", "MarginV=7")


# ─────────────────────────────── subtítulos ────────────────────────────────

def norm(w: str) -> str:
    w = unicodedata.normalize("NFD", w.lower())
    return re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in w if unicodedata.category(c) != "Mn"))


def transcribe_words(audio: Path, cache: Path, model: str) -> list[list]:
    if cache.exists():
        return json.loads(cache.read_text(encoding="utf-8"))
    try:
        import truststore                  # usa los certificados del sistema (redes con inspección TLS)
        truststore.inject_into_ssl()
    except ImportError:
        pass
    from faster_whisper import WhisperModel
    segs, _ = WhisperModel(model, device="cpu", compute_type="int8").transcribe(
        str(audio), language="es", word_timestamps=True)
    words = [[w.start, w.end, w.word.strip()] for s in segs for w in s.words]
    cache.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return words


def script_words(text: str) -> list[str]:
    text = re.sub(r"\[[^\]]*\]", " ", text)            # etiquetas de ElevenLabs: [excited], [short pause]…
    text = re.sub(r"\b(\w+) punto es\b", r"\1.es", text)   # «chafit punto es» se lee bien; se escribe chafit.es
    return text.split()


def build_srt(script: list[str], heard: list[list], offset: float, out: Path, max_chars: int = 42) -> None:
    """Pone a cada palabra del guion el tiempo de la palabra que Whisper oyó y agrupa en líneas."""
    a, b = [norm(w) for w in script], [norm(w[2]) for w in heard]
    times: list[tuple[float, float] | None] = [None] * len(script)
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                times[i1 + k] = (heard[j1 + k][0], heard[j1 + k][1])
        elif op == "replace":
            # Whisper oyó otra cosa («Hice Evold» por «ICG Vault»): se reparte su tramo entre las del guion.
            s, e = heard[j1][0], heard[j2 - 1][1]
            step = (e - s) / (i2 - i1)
            for k in range(i2 - i1):
                times[i1 + k] = (s + k * step, s + (k + 1) * step)
    known = [i for i, t in enumerate(times) if t]
    for i, t in enumerate(times):                      # las no reconocidas se interpolan entre vecinas
        if t is None:
            prev = max((k for k in known if k < i), default=None)
            nxt = min((k for k in known if k > i), default=None)
            s = times[prev][1] if prev is not None else 0.0
            e = times[nxt][0] if nxt is not None else s + 0.4
            times[i] = (s, e)
    # Una frase por subtítulo (libass la reparte en dos líneas); si es larga, se parte por la pausa
    # (coma, puntos suspensivos, dos puntos) más centrada, o por la palabra más centrada si no hay.
    sentences, cur = [], []
    for i, w in enumerate(script):
        cur.append(i)
        if re.search(r"[.?!]$", w) and not w.endswith("…"):
            sentences.append(cur)
            cur = []
    if cur:
        sentences.append(cur)
    text = lambda ids: " ".join(script[k] for k in ids)

    def split(ids: list[int]) -> list[list[int]]:
        if len(text(ids)) <= max_chars * 2 or len(ids) < 4:
            return [ids]
        mid = len(text(ids)) / 2
        cands = [j for j in range(1, len(ids) - 1) if re.search(r"[,…:;]$", script[ids[j]])] or range(1, len(ids) - 1)
        j = min(cands, key=lambda j: abs(len(text(ids[:j + 1])) - mid))
        return split(ids[:j + 1]) + split(ids[j + 1:])

    cues = [c for s in sentences for c in split(s)]
    ts = lambda s: f"{int(s // 3600):02d}:{int(s % 3600 // 60):02d}:{int(s % 60):02d},{int(round(s * 1000)) % 1000:03d}"
    rows = []
    for n, c in enumerate(cues):
        s = times[c[0]][0] + offset
        e = max(times[c[-1]][1] + offset + 0.25, s + 0.8)
        if n + 1 < len(cues):
            e = min(e, times[cues[n + 1][0]][0] + offset - 0.04)
        rows.append(f"{n + 1}\n{ts(s)} --> {ts(e)}\n{' '.join(script[k] for k in c)}\n")
    out.write_text("\n".join(rows), encoding="utf-8")


# ─────────────────────────────── vídeo ─────────────────────────────────────

def plan_shots(shots: list[list], total: float) -> list[dict]:
    """Normaliza los planos a fotogramas enteros y calcula su velocidad."""
    fr = lambda t: round(t * FPS) / FPS
    plan = []
    for i, sh in enumerate(shots):
        t0 = fr(sh[0])
        t1 = fr(shots[i + 1][0]) if i + 1 < len(shots) else fr(total)
        dur = t1 - t0
        if len(sh) == 2:
            plan.append({"t0": t0, "dur": dur, "hold": sh[1]})
        else:
            plan.append({"t0": t0, "dur": dur, "a": sh[1], "b": sh[2], "speed": (sh[2] - sh[1]) / dur})
    return plan


def build_track(cfg: dict, base: Path, plan: list[dict], out: Path, enc: list[str]) -> None:
    """Pantalla del móvil (420×910) o ventana (1600×900) ya montada: planos, velocidades, congelados y zooms."""
    top, bottom = cfg.get("phone_crop", [0, 0])
    if cfg.get("layout", "phone") == "screen":
        tw, th = WIN[2], WIN[3]
        fit = f"scale={tw}:{th}:force_original_aspect_ratio=decrease,pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2,setsar=1"
    else:
        tw, th = SW, SH
        fit = (f"crop=iw:ih-{top + bottom}:0:{top},scale={SW}:{SH}:force_original_aspect_ratio=decrease,"
               f"pad={SW}:{SH}:(ow-iw)/2:(oh-ih)/2:color=0x05060a,setsar=1")
    n = len(plan)
    fc = [f"[0:v]fps={FPS},{fit},split={n}" + "".join(f"[s{i}]" for i in range(n))]
    for i, p in enumerate(plan):
        if "hold" in p:
            # Congelado: un fotograma repetido N veces (tpad no rellenaba tras un trim de un solo fotograma).
            n_fr = max(round(p["dur"] * FPS), 1)
            fc.append(f"[s{i}]trim=start={p['hold']}:duration=0.5,select='eq(n\\,0)',"
                      f"loop=loop={n_fr - 1}:size=1:start=0,setpts=N/{FPS}/TB[p{i}]")
        else:
            # Se toma algo de margen de la grabación y se recorta a la duración exacta del plano.
            fc.append(f"[s{i}]trim={p['a']}:{p['b'] + 0.2 * max(p['speed'], 1)},setpts=(PTS-STARTPTS)/{p['speed']:.5f},"
                      f"fps={FPS},trim=duration={p['dur']},setpts=PTS-STARTPTS[p{i}]")
    fc.append("".join(f"[p{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0,setpts=PTS-STARTPTS"
              + zoom_chain(cfg.get("zooms", []), tw, th) + ",format=yuv420p[v]")
    run(["-i", str(base / cfg["raw"]), "-filter_complex", ";".join(fc), "-map", "[v]", "-an", *enc, str(out)])


def build_music(cfg: dict, base: Path, total: float, out: Path) -> None:
    """Encadena los trozos de la canción (cortados en compás) con un microfundido en cada unión."""
    m = cfg["music"]
    parts, xf = m["parts"], m.get("xfade", 0.03)
    ins, fc = [], []
    for i, (a, b) in enumerate(parts):
        ins += ["-i", str(base / m["file"])]
        fc.append(f"[{i}:a]atrim={a}:{b + (xf if i + 1 < len(parts) else 0)},asetpts=PTS-STARTPTS,"
                  f"aresample=48000,aformat=channel_layouts=stereo[m{i}]")
    prev = "m0"
    for i in range(1, len(parts)):
        fc.append(f"[{prev}][m{i}]acrossfade=d={xf}:c1=tri:c2=tri[x{i}]")
        prev = f"x{i}"
    fo = m.get("fade_out", 1.5)
    # "offset": la música entra más tarde (p. ej. tras la pregunta del gancho, que va sin música).
    off = int(m.get("offset", 0.0) * 1000)
    delay = f"afade=t=in:d=0.3,adelay={off}|{off}," if off else ""
    fc.append(f"[{prev}]{delay}apad,atrim=0:{total},afade=t=out:st={max(total - fo, 0)}:d={fo}[a]")
    run([*ins, "-filter_complex", ";".join(fc), "-map", "[a]", "-c:a", "pcm_s16le", str(out)])


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("project")
    ap.add_argument("--draft", action="store_true")
    args = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")

    project = Path(args.project).resolve()
    cfg = json.loads(project.read_text(encoding="utf-8"))
    base = project.parent
    work = base / "work" / project.stem
    gfx = work / "gfx"
    gfx.mkdir(parents=True, exist_ok=True)
    final = base / cfg["final_dir"]
    final.mkdir(parents=True, exist_ok=True)
    enc = (["-c:v", "libx264", "-preset", "veryfast", "-crf", "26"] if args.draft
           else ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-profile:v", "high"]) + ["-pix_fmt", "yuv420p"]
    total = cfg["duration"]

    # 1 · Gráficos
    screen = cfg.get("layout", "phone") == "screen"
    jobs = [{"name": "bg", "kind": "bg"},
            {"name": "bg_win", "kind": "bg", "params": {"win": ",".join(map(str, WIN + (WIN_RADIUS,)))}},
            {"name": "mask_win", "kind": "mask", "transparent": True, "width": WIN[2], "height": WIN[3],
             "params": {"w": WIN[2], "h": WIN[3], "r": WIN_RADIUS}},
            {"name": "phone", "kind": "phone", "transparent": True, "width": 460, "height": 950},
            {"name": "mask_phone", "kind": "mask", "transparent": True, "width": 420, "height": 910},
            {"name": "speed_4", "kind": "speed", "transparent": True, "params": {"title": "⏩ Acelerado"}}]
    for k, c in enumerate(cfg["cards"]):
        jobs.append({"name": f"card_{k}", "kind": c["kind"], "dur": c["dur"],
                     "params": {"title": c["title"], "sub": c.get("sub", ""), "n": c.get("n", "")}})
    for k, co in enumerate(cfg["callouts"]):
        jobs.append({"name": f"callout_{k}", "kind": "callout", "transparent": True,
                     "params": {"title": co["title"], "sub": co.get("sub", ""), "n": co.get("kicker", "")}})
    thumb = cfg.get("thumbnail", cfg["cards"][0])
    jobs.append({"name": "thumb", "kind": "intro", "params": {"title": thumb["title"], "sub": thumb.get("sub", "")}})
    print("· Gráficos")
    edit.render_jobs(jobs, gfx)
    for k, c in enumerate(cfg["cards"]):
        edit.sequence_to_video(gfx / f"card_{k}", work / f"card_{k}.mp4", False, enc)

    # 2 · Pantalla del móvil o ventana
    print("· Planos")
    plan = plan_shots(cfg["shots"], total)
    phone = work / "phone.mp4"
    build_track(cfg, base, plan, phone, enc)

    # 3 · Música y subtítulos
    print("· Música y subtítulos")
    music = work / "music.wav"
    build_music(cfg, base, total, music)
    srt = final / (cfg.get("name", project.stem) + ".srt")
    voice = base / cfg["voice"]
    if cfg.get("script"):
        # "fichero.md#N" = el N-ésimo bloque ```text``` del fichero (así el guion vive en un solo sitio).
        path, _, block = cfg["script"].partition("#")
        text = (base / path).read_text(encoding="utf-8")
        if block:
            text = re.findall(r"```text\n(.*?)```", text, re.S)[int(block)]
        script = script_words(text)
        heard = transcribe_words(voice, work / "voice_words.json", cfg.get("whisper_model", "small"))
        build_srt(script, heard, cfg.get("voice_offset", 0.0), srt)
    else:
        srt = None

    # 4 · Composición final
    print("· Composición")
    if screen:
        ins = ["-loop", "1", "-i", str(gfx / "bg_win.png"), "-i", str(phone), "-loop", "1", "-i", str(gfx / "mask_win.png")]
        fc = [f"[0:v]format=yuv420p,fps={FPS},trim=duration={total}[bg]",
              "[1:v]format=rgba[w0]", "[2:v]format=gray[wm]", "[w0][wm]alphamerge[w]",
              f"[bg][w]overlay={WIN[0]}:{WIN[1]}:shortest=1[v1]"]
        cur, idx = "v1", 3
    else:
        ins = ["-loop", "1", "-i", str(gfx / "bg.png"), "-i", str(phone),
               "-loop", "1", "-i", str(gfx / "mask_phone.png"), "-loop", "1", "-i", str(gfx / "phone.png")]
        fc = [f"[0:v]format=yuv420p,fps={FPS},trim=duration={total}[bg]",
              "[1:v]format=rgba[ph0]", "[2:v]format=gray[pm]", "[ph0][pm]alphamerge[ph]",
              f"[bg][ph]overlay={PX + SX}:{PY + SY}:shortest=1[v0]", f"[v0][3:v]overlay={PX}:{PY}[v1]"]
        cur, idx = "v1", 4
    for k, co in enumerate(cfg["callouts"]):
        ins += ["-loop", "1", "-i", str(gfx / f"callout_{k}.png")]
        d = co["t1"] - co["t0"]
        fc.append(f"[{idx}:v]format=rgba,fps={FPS},trim=duration={d},fade=t=in:d=0.4:alpha=1,"
                  f"fade=t=out:st={max(d - 0.4, 0)}:d=0.4:alpha=1,setpts=PTS-STARTPTS+{co['t0']}/TB[co{k}]")
        fc.append(f"[{cur}][co{k}]overlay=0:0:eof_action=pass[vc{k}]")
        cur, idx = f"vc{k}", idx + 1
    fast = [p for p in plan if p.get("speed", 1) >= 3]
    if fast:
        ins += ["-loop", "1", "-i", str(gfx / "speed_4.png")]
        on = "+".join(f"between(t,{p['t0']},{p['t0'] + p['dur']})" for p in fast)
        fc.append(f"[{cur}][{idx}:v]overlay=0:0:enable='{on}'[vs]")
        cur, idx = "vs", idx + 1
    for k, c in enumerate(cfg["cards"]):
        ins += ["-i", str(work / f"card_{k}.mp4")]
        d = c["dur"]
        fc.append(f"[{idx}:v]format=rgba,fade=t=in:d={CARD_FADE}:alpha=1,fade=t=out:st={d - CARD_FADE}:d={CARD_FADE}:alpha=1,"
                  f"setpts=PTS-STARTPTS+{c['t']}/TB[cd{k}]")
        fc.append(f"[{cur}][cd{k}]overlay=0:0:eof_action=pass[vk{k}]")
        cur, idx = f"vk{k}", idx + 1
    if srt:
        sub = str(srt).replace("\\", "/").replace(":", "\\:").replace("'", "\\'")
        style = SUB_STYLE_SCREEN if screen else SUB_STYLE
        fc.append(f"[{cur}]subtitles='{sub}':force_style='{style}',format=yuv420p[v]")
    else:
        fc.append(f"[{cur}]format=yuv420p[v]")

    # Audio: voz limpia arriba, música que baja sola bajo la voz, un golpe suave en cada cartela.
    vi, mi = idx, idx + 1
    ins += ["-i", str(voice), "-i", str(music)]
    off = int(cfg.get("voice_offset", 0.0) * 1000)
    fc.append(f"[{vi}:a]aresample=48000,aformat=channel_layouts=stereo,highpass=f=70,"
              f"acompressor=threshold=-18dB:ratio=2.5:attack=5:release=150,volume={cfg.get('voice_db', 0)}dB,"
              f"adelay={off}|{off},apad,atrim=0:{total},asplit=2[voice][sc]")
    fc.append(f"[{mi}:a]volume={cfg['music'].get('db', -8)}dB[mus]")
    fc.append("[mus][sc]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=600[duck]")
    mix = ["[voice]", "[duck]"]
    if cfg.get("sfx"):
        ins += ["-i", str(base / cfg["sfx"])]
        cuts = [c["t"] for c in cfg["cards"]]
        fc.append(f"[{mi + 1}:a]aresample=48000,aformat=channel_layouts=stereo,lowpass=f=4000,"
                  f"volume={cfg.get('sfx_db', -14)}dB,asplit={len(cuts)}" + "".join(f"[f{i}]" for i in range(len(cuts))))
        for i, t in enumerate(cuts):
            ms = int(max(t - 0.05, 0) * 1000)
            fc.append(f"[f{i}]adelay={ms}|{ms}[fd{i}]")
            mix.append(f"[fd{i}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0:duration=first,"
              "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]")

    out = final / (cfg.get("name", project.stem) + ".mp4")
    script_file = work / "filter.txt"               # el grafo es largo: va en un fichero
    script_file.write_text(";\n".join(fc), encoding="utf-8")
    run([*ins, "-filter_complex_script", str(script_file), "-map", "[v]", "-map", "[a]", "-t", str(total),
         *enc, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)])

    chapters = "\n".join(f"{fmt_ts(c['t'])} {c['title']}" for c in cfg.get("chapters", []))
    if chapters:
        (final / "chapters.txt").write_text(chapters + "\n", encoding="utf-8")
    run(["-i", str(gfx / "thumb.png"), "-vf", "scale=1280:720", str(final / "thumbnail.jpg")])
    print(f"✓ {out}  ({fmt_ts(probe(out)['duration'])})")


if __name__ == "__main__":
    main()
