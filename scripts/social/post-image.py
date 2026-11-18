"""Render a single branded social post image (1080x1350, works for Facebook and Instagram).

Usage: python3 scripts/social/post-image.py post.json OUT.png

post.json fields:
  tag       short eyebrow label, e.g. "Black Friday prep"            (required)
  title     headline, under about 60 characters                      (required)
  stat      optional big number, e.g. "53%"
  stat_note optional line under the stat, under about 90 characters
  intro     optional 1-2 sentence lead-in, under about 160 characters
  items     optional list of up to 4 short points (under about 70 characters each)
  cta       footer button text, e.g. "Free website health check"     (required)
  source    optional small source credit, e.g. "Source: Google"
"""
import json, sys, html, pathlib
from playwright.sync_api import sync_playwright

e = html.escape
COLOURS = ["#00E5FF", "#00FFB3", "#8B5CF6", "#A78BFA"]

CSS = """
* { margin:0; padding:0; box-sizing:border-box; }
body { width:1080px; height:1350px; overflow:hidden; font-family:'Inter',sans-serif; color:#F8FAFC;
  background-color:#050816;
  background-image:
    radial-gradient(60% 40% at 15% 0%, rgba(0,229,255,0.20) 0%, rgba(5,8,22,0) 60%),
    radial-gradient(55% 40% at 95% 35%, rgba(124,58,237,0.22) 0%, rgba(5,8,22,0) 60%),
    radial-gradient(50% 35% at 25% 105%, rgba(0,255,179,0.12) 0%, rgba(5,8,22,0) 60%);
  position:relative; padding:90px; }
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
.tag { font-size:22px; color:#00FFB3; font-weight:700; letter-spacing:1.2px; text-transform:uppercase;
  padding:10px 18px; border-radius:999px; border:1px solid rgba(0,255,179,0.35); background:rgba(0,255,179,0.07); }
h1 { font-family:'Inter Display','Inter',sans-serif; margin-top:90px; font-size:78px; line-height:1.04; font-weight:700; letter-spacing:-1.6px; }
.grad { background:linear-gradient(90deg,#00E5FF 0%,#00FFB3 55%,#a78bfa 100%); -webkit-background-clip:text; background-clip:text; color:transparent; }
.stat { margin-top:46px; display:flex; align-items:baseline; gap:26px; }
.stat .n { font-size:150px; font-weight:800; line-height:0.9; letter-spacing:-4px; }
.stat .t { font-size:31px; color:#CBD5E1; line-height:1.35; max-width:560px; }
.intro { margin-top:40px; font-size:33px; line-height:1.45; color:#CBD5E1; }
ul { list-style:none; margin-top:46px; display:flex; flex-direction:column; gap:18px; }
li { display:flex; gap:22px; align-items:flex-start; padding:22px 26px; border-radius:20px;
  background:rgba(15,23,42,0.55); border:1px solid rgba(148,163,184,0.16); font-size:30px; line-height:1.35; }
.dot { flex:0 0 36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center;
  font-size:20px; font-weight:800; color:#050816; margin-top:1px; }
.foot { position:absolute; left:90px; right:90px; bottom:74px; display:flex; justify-content:space-between; align-items:center; }
.src { font-size:21px; color:#64748B; max-width:430px; }
.pill { padding:18px 30px; border-radius:999px; border:1.5px solid rgba(0,229,255,0.5); background:rgba(0,229,255,0.1);
  font-size:28px; font-weight:700; color:#E2F8FF; white-space:nowrap; }
"""


def build(p):
    title = e(p["title"])
    stat = ""
    if p.get("stat"):
        stat = f'<div class="stat"><div class="n grad">{e(p["stat"])}</div><div class="t">{e(p.get("stat_note", ""))}</div></div>'
    intro = f'<div class="intro">{e(p["intro"])}</div>' if p.get("intro") else ""
    items = ""
    if p.get("items"):
        items = "<ul>" + "".join(
            f'<li><span class="dot" style="background:{COLOURS[i % 4]}">{i+1}</span><span>{e(t)}</span></li>'
            for i, t in enumerate(p["items"][:4])) + "</ul>"
    src = e(p.get("source", "")) or "dcw-digital.co.uk"
    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="grid"></div><div class="rel">
<div class="top"><div class="brand"><div class="mono">D</div><div class="name">DCW Digital</div></div><div class="tag">{e(p["tag"])}</div></div>
<h1>{title}</h1>{stat}{intro}{items}</div>
<div class="foot"><span class="src">{src}</span><span class="pill">{e(p["cta"])} →</span></div>
</body></html>"""


def render(spec_path, out_path):
    p = json.load(open(spec_path))
    out = pathlib.Path(out_path); out.parent.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
        pg.set_content(build(p)); pg.wait_for_timeout(150)
        # Flag overflow so the caller can shorten text.
        over = pg.evaluate("""() => { const f=document.querySelector('.foot').getBoundingClientRect().top;
            const r=document.querySelector('.rel').getBoundingClientRect().bottom; return r > f - 20; }""")
        pg.screenshot(path=str(out)); b.close()
    print(out, "OVERFLOW: shorten the text" if over else "ok")


if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2])
