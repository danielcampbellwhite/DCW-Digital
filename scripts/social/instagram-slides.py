"""Render Instagram carousel slides (1080x1350) for a This Week in Tech post.

Usage: python3 make.py slides.json OUT_DIR
slides.json: {"date_label": "...", "slides": [{"kind": "cover"|"story"|"list"|"cta", ...}]}
"""
import json, sys, html, pathlib
from playwright.sync_api import sync_playwright

CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1350px; overflow:hidden; font-family:'Inter',sans-serif; color:#F8FAFC;
  background-color:#050816;
  background-image:
    radial-gradient(60% 40% at 15% 0%, rgba(0,229,255,0.20) 0%, rgba(5,8,22,0) 60%),
    radial-gradient(55% 40% at 95% 35%, rgba(124,58,237,0.22) 0%, rgba(5,8,22,0) 60%),
    radial-gradient(50% 35% at 25% 105%, rgba(0,255,179,0.12) 0%, rgba(5,8,22,0) 60%);
  position:relative; padding:90px 90px; }
.grid { position:absolute; inset:0;
  background-image: linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px);
  background-size:54px 54px; mask-image: radial-gradient(80% 70% at 50% 40%, black 30%, transparent 85%); }
.rel { position:relative; }
.top { display:flex; justify-content:space-between; align-items:center; }
.brand { display:flex; align-items:center; gap:16px; }
.mono { width:56px; height:56px; border-radius:13px; display:flex; align-items:center; justify-content:center;
  border:1.5px solid rgba(0,229,255,0.45); background:linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,58,237,0.18));
  font-weight:700; font-size:31px; color:#00E5FF; }
.name { font-size:26px; font-weight:700; }
.tag { font-size:22px; color:#94A3B8; font-weight:600; letter-spacing:1px; text-transform:uppercase; }
.grad { background:linear-gradient(90deg,#00E5FF 0%,#00FFB3 55%,#a78bfa 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
h1 { font-family:'Inter Display','Inter',sans-serif; font-weight:700; letter-spacing:-1.6px; }
.cover h1 { margin-top:150px; font-size:118px; line-height:0.98; }
.cover .date { margin-top:34px; font-size:34px; color:#CBD5E1; font-weight:600; }
.cover ul { list-style:none; margin-top:70px; display:flex; flex-direction:column; gap:22px; }
.cover li { font-size:34px; font-weight:600; display:flex; gap:20px; align-items:center; }
.cover li span.n { flex:0 0 52px; height:52px; border-radius:12px; display:flex; align-items:center; justify-content:center;
  font-size:26px; font-weight:700; color:#050816; }
.num { margin-top:110px; font-size:30px; font-weight:700; color:#00E5FF; letter-spacing:1px; }
.story h1 { margin-top:18px; font-size:72px; line-height:1.04; }
.body { margin-top:42px; font-size:33px; line-height:1.45; color:#CBD5E1; }
.box { margin-top:44px; padding:30px 34px; border-radius:22px; background:rgba(15,23,42,0.6); border:1px solid rgba(0,229,255,0.28); }
.box .k { font-size:22px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#00FFB3; }
.box .v { margin-top:10px; font-size:30px; line-height:1.4; color:#F1F5F9; }
.list h1 { margin-top:110px; font-size:80px; line-height:1.02; }
.list ul { list-style:none; margin-top:56px; display:flex; flex-direction:column; gap:20px; }
.list li { display:flex; gap:22px; align-items:flex-start; padding:24px 28px; border-radius:20px;
  background:rgba(15,23,42,0.55); border:1px solid rgba(148,163,184,0.16); font-size:30px; line-height:1.35; }
.tick { flex:0 0 36px; height:36px; border-radius:99px; display:flex; align-items:center; justify-content:center;
  background:rgba(0,255,179,0.15); color:#00FFB3; font-weight:800; font-size:22px; margin-top:1px; }
.cta h1 { margin-top:220px; font-size:96px; line-height:1.0; }
.cta .body { font-size:36px; }
.pill { display:inline-block; margin-top:60px; padding:20px 34px; border-radius:999px; border:1.5px solid rgba(0,229,255,0.5);
  background:rgba(0,229,255,0.1); font-size:34px; font-weight:700; color:#E2F8FF; }
.foot { position:absolute; left:90px; right:90px; bottom:74px; display:flex; justify-content:space-between; align-items:center;
  font-size:24px; color:#64748B; }
.swipe { color:#00E5FF; font-weight:700; }
.bars { display:flex; gap:8px; } .bars div { width:56px; height:6px; border-radius:99px; }
"""

COLOURS = ["#00E5FF", "#00FFB3", "#8B5CF6", "#A78BFA", "#22D3EE"]
e = html.escape


def frame(inner, idx, total, date_label, last):
    swipe = '<span>dcw-digital.co.uk/blog</span>' if last else '<span class="swipe">Swipe →</span>'
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="grid"></div><div class="rel">
<div class="top"><div class="brand"><div class="mono">D</div><div class="name">DCW Digital</div></div>
<div class="tag">This Week in Tech</div></div>
{inner}</div>
<div class="foot"><span>{idx}/{total} · {e(date_label)}</span>{swipe}</div>
</body></html>"""


def render(spec, out):
    out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
    slides = spec["slides"]; total = len(slides); files = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
        for i, s in enumerate(slides, 1):
            k = s["kind"]
            if k == "cover":
                items = "".join(f'<li><span class="n" style="background:{COLOURS[j % 5]}">{j+1}</span>{e(t)}</li>'
                                for j, t in enumerate(s["items"]))
                inner = f'<div class="cover"><h1>This week<br><span class="grad">in tech</span></h1><div class="date">{e(spec["date_label"])}</div><ul>{items}</ul></div>'
            elif k == "story":
                inner = (f'<div class="story"><div class="num">{e(s["num"])}</div><h1>{e(s["title"])}</h1>'
                         f'<div class="body">{e(s["body"])}</div>'
                         f'<div class="box"><div class="k">{e(s.get("box_label", "What to do"))}</div><div class="v">{e(s["box"])}</div></div></div>')
            elif k == "list":
                items = "".join(f'<li><span class="tick">✓</span><span>{e(t)}</span></li>' for t in s["items"])
                inner = f'<div class="list"><h1>{e(s["title"])}</h1><ul>{items}</ul></div>'
            else:
                inner = (f'<div class="cta"><h1>Want the<br><span class="grad">full story?</span></h1>'
                         f'<div class="body" style="margin-top:44px">{e(s["body"])}</div>'
                         f'<div class="pill">Link in bio</div></div>')
            pg.set_content(frame(inner, i, total, spec["date_label"], i == total))
            pg.wait_for_timeout(150)
            f = out / f"slide-{i}.png"; pg.screenshot(path=str(f)); files.append(str(f))
        # Facebook image: the cover slide with a "read the full roundup" footer instead of "swipe".
        cov = next((s for s in slides if s["kind"] == "cover"), None)
        if cov:
            items = "".join(f'<li><span class="n" style="background:{COLOURS[j % 5]}">{j+1}</span>{e(t)}</li>'
                            for j, t in enumerate(cov["items"]))
            pg.set_content(f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}
.cover h1{{margin-top:130px}} .read{{position:absolute;left:90px;right:90px;bottom:70px;display:flex;justify-content:space-between;align-items:center}}
.read .pill{{margin:0;font-size:30px}} .read span.u{{font-size:26px;color:#94A3B8}}</style></head><body>
<div class="grid"></div><div class="rel"><div class="top"><div class="brand"><div class="mono">D</div><div class="name">DCW Digital</div></div>
<div class="tag">Weekly roundup</div></div><div class="cover"><h1>This week<br><span class="grad">in tech</span></h1>
<div class="date">{e(spec["date_label"])}</div><ul>{items}</ul></div></div>
<div class="read"><span class="u">dcw-digital.co.uk/blog</span><span class="pill">Read the full roundup →</span></div></body></html>""")
            pg.wait_for_timeout(150)
            f = out / "facebook.png"; pg.screenshot(path=str(f)); files.append(str(f))
        b.close()
    print("\n".join(files))


if __name__ == "__main__":
    render(json.load(open(sys.argv[1])), sys.argv[2])
