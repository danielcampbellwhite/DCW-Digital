"use client";

import * as React from "react";
import { Bug } from "lucide-react";
import { playSound } from "@/lib/sfx";

/** CRT overlay, bug cursor and party confetti for root sessions. */
export function RootEffects({ crt, bugCursor, party }: { crt: boolean; bugCursor: boolean; party: boolean }) {
  return (
    <>
      {crt && <CrtOverlay />}
      {bugCursor && <BugCursor />}
      {party && <Confetti />}
    </>
  );
}

/** Grainy static: one noise tile, jittered around to look alive. */
function noiseTile(size = 160) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = Math.random() * 70;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL("image/png");
}

/** Dust, hairs, scratches and smudges on the glass. Drawn once. */
function dustLayer(w = 1400, h = 900) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const r = (a: number, b: number) => a + Math.random() * (b - a);
  // Greasy smudges.
  for (let i = 0; i < 7; i++) {
    const x = r(0, w), y = r(0, h), rad = r(80, 260);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,255,255,${r(0.025, 0.06)})`);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  // Specks of dust.
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = `rgba(${Math.random() < 0.7 ? "255,255,255" : "0,0,0"},${r(0.08, 0.45)})`;
    ctx.beginPath();
    ctx.arc(r(0, w), r(0, h), r(0.3, 1.6), 0, Math.PI * 2);
    ctx.fill();
  }
  // Hairs.
  ctx.lineCap = "round";
  for (let i = 0; i < 6; i++) {
    const x = r(0, w), y = r(0, h);
    ctx.strokeStyle = `rgba(255,255,255,${r(0.12, 0.3)})`;
    ctx.lineWidth = r(0.5, 1.1);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + r(-60, 60), y + r(-60, 60), x + r(-90, 90), y + r(-90, 90), x + r(-120, 120), y + r(-120, 120));
    ctx.stroke();
  }
  // Fine scratches.
  for (let i = 0; i < 10; i++) {
    const x = r(0, w), y = r(0, h), len = r(40, 220), ang = r(-0.4, 0.4) + (Math.random() < 0.5 ? 0 : Math.PI / 2);
    ctx.strokeStyle = `rgba(255,255,255,${r(0.05, 0.14)})`;
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
  return c.toDataURL("image/png");
}

function CrtOverlay() {
  const [tex, setTex] = React.useState<{ noise: string; dust: string } | null>(null);
  React.useEffect(() => setTex({ noise: noiseTile(), dust: dustLayer() }), []);

  // Each layer is its own fixed element (not wrapped) so its blend mode mixes
  // with the page underneath rather than with an isolated group.
  return (
    <>
      <style>{`
        .dcw-crt{position:fixed;inset:0;pointer-events:none;z-index:95}
        /* Phosphor mask: the fine RGB stripes of a real tube. */
        .dcw-crt.crt-mask{mix-blend-mode:multiply;opacity:.38;
          background:repeating-linear-gradient(90deg,rgb(255,110,110) 0 1px,rgb(110,255,110) 1px 2px,rgb(120,150,255) 2px 3px)}
        /* Deep scanlines that slowly crawl. */
        .dcw-crt.crt-lines{top:-3px;
          background:repeating-linear-gradient(to bottom,rgba(0,0,0,.38) 0 1px,rgba(0,0,0,0) 1px 3px);
          animation:dcw-crawl 1.2s linear infinite}
        @keyframes dcw-crawl{to{transform:translateY(3px)}}
        /* Static. */
        .dcw-crt.crt-noise{inset:-20%;opacity:.12;mix-blend-mode:screen;background-size:160px;
          animation:dcw-noise .45s steps(1) infinite}
        @keyframes dcw-noise{0%{transform:translate(0,0)}20%{transform:translate(-7%,4%)}40%{transform:translate(5%,-6%)}
          60%{transform:translate(-3%,8%)}80%{transform:translate(8%,2%)}100%{transform:translate(-5%,-4%)}}
        /* Dust and smudges on the glass. */
        .dcw-crt.crt-dust{background-size:cover;background-position:center;mix-blend-mode:screen;opacity:.75}
        /* The rolling bar. */
        .dcw-crt.crt-bar{bottom:auto;height:22vh;top:-25vh;mix-blend-mode:screen;
          background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,.06) 50%,rgba(255,255,255,0));
          animation:dcw-roll 7s linear infinite}
        @keyframes dcw-roll{to{transform:translateY(130vh)}}
        /* Curved glass: dark bowed edges and a vignette (gradients, not big
           blurred shadows, which make browsers render the layer blurry). */
        .dcw-crt.crt-glass{
          background:
            radial-gradient(ellipse at 50% 48%,rgba(0,0,0,0) 52%,rgba(0,0,0,.6) 100%),
            linear-gradient(to right,rgba(0,0,0,.55),rgba(0,0,0,0) 7%,rgba(0,0,0,0) 93%,rgba(0,0,0,.55)),
            linear-gradient(to bottom,rgba(0,0,0,.55),rgba(0,0,0,0) 9%,rgba(0,0,0,0) 91%,rgba(0,0,0,.55))}
        /* Rounded tube corners and a thin bezel edge. */
        .dcw-crt.crt-corners{box-shadow:inset 0 0 0 2px #000;
          background:
            radial-gradient(circle at 100% 100%,rgba(0,0,0,0) 27px,#000 28px) top left/30px 30px no-repeat,
            radial-gradient(circle at 0 100%,rgba(0,0,0,0) 27px,#000 28px) top right/30px 30px no-repeat,
            radial-gradient(circle at 100% 0,rgba(0,0,0,0) 27px,#000 28px) bottom left/30px 30px no-repeat,
            radial-gradient(circle at 0 0,rgba(0,0,0,0) 27px,#000 28px) bottom right/30px 30px no-repeat}
        .dcw-crt.crt-glare{mix-blend-mode:screen;
          background:radial-gradient(ellipse 60% 35% at 30% 12%,rgba(255,255,255,.06),rgba(255,255,255,0) 70%)}
        /* Unsteady tube: an irregular dip in brightness. */
        .dcw-crt.crt-flicker{background:#000;opacity:0;animation:dcw-flicker 3.2s infinite}
        @keyframes dcw-flicker{0%,100%{opacity:0}7%{opacity:.14}8%{opacity:0}31%{opacity:.06}32%{opacity:0}
          55%{opacity:.11}56%{opacity:.03}57%{opacity:0}83%{opacity:.08}84%{opacity:0}}
        @media (prefers-reduced-motion: reduce){.dcw-crt.crt-lines,.dcw-crt.crt-noise,.dcw-crt.crt-flicker{animation:none}.dcw-crt.crt-bar{display:none}}
      `}</style>
      <div aria-hidden className="dcw-crt crt-mask" />
      <div aria-hidden className="dcw-crt crt-lines" />
      {tex && <div aria-hidden className="dcw-crt crt-noise" style={{ backgroundImage: `url(${tex.noise})` }} />}
      {tex && <div aria-hidden className="dcw-crt crt-dust" style={{ backgroundImage: `url(${tex.dust})` }} />}
      <div aria-hidden className="dcw-crt crt-bar" />
      <div aria-hidden className="dcw-crt crt-glare" />
      <div aria-hidden className="dcw-crt crt-flicker" />
      <div aria-hidden className="dcw-crt crt-glass" />
      <div aria-hidden className="dcw-crt crt-corners" />
    </>
  );
}

function BugCursor() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [squashed, setSquashed] = React.useState(false);

  React.useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let x = -100, y = -100, tx = -100, ty = -100, angle = 0, raf = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const down = () => {
      playSound("splat");
      setSquashed(true);
      window.setTimeout(() => setSquashed(false), 220);
    };
    const tick = () => {
      const dx = tx - x, dy = ty - y;
      x += reduce ? dx : dx * 0.25;
      y += reduce ? dy : dy * 0.25;
      if (Math.hypot(dx, dy) > 1) angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      if (ref.current) ref.current.style.transform = `translate(${x + 14}px, ${y + 14}px) rotate(${angle}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[97] -ml-3 -mt-3 transition-[color,scale] duration-150"
      style={{ scale: squashed ? "1.4 0.5" : "1" }}
    >
      <Bug className={squashed ? "size-6 text-red-500" : "size-6 text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.6)]"} />
    </div>
  );
}

interface Bit { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number; spin: number; r: number }

function Confetti() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const colors = ["#00e5ff", "#00ffb3", "#7c3aed", "#fbbf24", "#f87171", "#f8fafc"];
    let bits: Bit[] = [];
    let raf = 0;
    let last = performance.now();
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const b of bits) {
        b.vy += 900 * dt;
        b.vx *= 0.99;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.r += b.spin * dt;
        b.life -= dt;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, b.life * 2));
        ctx.translate(b.x, b.y);
        ctx.rotate(b.r);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.size / 2, -b.size / 4, b.size, b.size / 2);
        ctx.restore();
      }
      bits = bits.filter((b) => b.life > 0 && b.y < window.innerHeight + 20);
      raf = bits.length ? requestAnimationFrame(tick) : 0;
    };
    const burst = (e: PointerEvent) => {
      for (let i = 0; i < 18; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2;
        const s = 250 + Math.random() * 350;
        bits.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(a) * s, vy: Math.sin(a) * s,
          life: 1 + Math.random() * 0.6,
          color: colors[Math.floor(Math.random() * colors.length)]!,
          size: 6 + Math.random() * 6,
          spin: (Math.random() - 0.5) * 12,
          r: Math.random() * Math.PI,
        });
      }
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointerdown", burst);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", burst);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[96] h-full w-full" />;
}
