"use client";

import * as React from "react";
import type { Season } from "@/lib/season";

export function SeasonEffects({ season }: { season: Season }) {
  return season === "winter" ? <Snow /> : <Halloween />;
}

/* ── Winter: gentle snowfall ───────────────────────────────────────────── */

interface Flake { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number }

function Snow() {
  const ref = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let w = 0, h = 0, raf = 0, last = performance.now();
    let flakes: Flake[] = [];
    const make = (top = false): Flake => ({
      x: Math.random() * w,
      y: top ? -10 : Math.random() * h,
      r: 0.8 + Math.random() * 2.4,
      vy: 18 + Math.random() * 40,
      sway: 10 + Math.random() * 25,
      phase: Math.random() * Math.PI * 2,
      a: 0.35 + Math.random() * 0.5,
    });
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.round((w * h) / 16000));
      flakes = Array.from({ length: count }, () => make());
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i]!;
        f.phase += dt * 0.8;
        f.y += f.vy * dt * (0.6 + f.r / 4);
        const x = f.x + Math.sin(f.phase) * f.sway;
        if (f.y > h + 10) flakes[i] = make(true);
        ctx.globalAlpha = f.a;
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = document.hidden ? 0 : requestAnimationFrame(tick);
    };
    const onVis = () => {
      if (!document.hidden && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[90] h-full w-full" />;
}

/* ── Halloween: bats and a low mist ────────────────────────────────────── */

interface BatFlight { id: number; top: number; duration: number; size: number; reverse: boolean; delay: number }

function Halloween() {
  const [bats, setBats] = React.useState<BatFlight[]>([]);

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let id = 0;
    let timer = 0;
    const launch = () => {
      const n = 1 + Math.floor(Math.random() * 3);
      const reverse = Math.random() < 0.5;
      const top = 8 + Math.random() * 55;
      const group = Array.from({ length: n }, (_, i) => ({
        id: ++id,
        top: top + (Math.random() - 0.5) * 10,
        duration: 6 + Math.random() * 4,
        size: 44 + Math.random() * 30,
        reverse,
        delay: i * 0.35,
      }));
      setBats((b) => [...b.slice(-8), ...group]);
      timer = window.setTimeout(launch, 9000 + Math.random() * 7000);
    };
    timer = window.setTimeout(launch, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @keyframes dcw-bat-fly{from{transform:translateX(-12vw)}to{transform:translateX(112vw)}}
        @keyframes dcw-bat-bob{0%,100%{translate:0 0}50%{translate:0 -18px}}
        @keyframes dcw-bat-flap{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.35)}}
        .dcw-bat{position:fixed;left:0;pointer-events:none;z-index:90;animation-name:dcw-bat-fly;animation-timing-function:linear;animation-fill-mode:both}
        .dcw-bat.rev{animation-direction:reverse}
        .dcw-bat > span{display:block;animation:dcw-bat-bob 1.1s ease-in-out infinite}
        .dcw-bat svg{animation:dcw-bat-flap .22s ease-in-out infinite;transform-origin:center 40%;
          filter:drop-shadow(0 0 6px rgba(249,115,22,.55))}
        .dcw-bat.rev svg{scale:-1 1}
      `}</style>
      {/* Pale moon */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-[8vw] top-24 z-[89] size-24 rounded-full sm:size-32"
        style={{
          background: "radial-gradient(circle at 40% 40%, rgba(254,243,199,0.22), rgba(254,215,170,0.08) 55%, rgba(0,0,0,0) 72%)",
          boxShadow: "0 0 80px 20px rgba(251,146,60,0.06)",
        }}
      />
      {/* Low mist */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[89] h-40"
        style={{ background: "linear-gradient(to top, rgba(249,115,22,0.10), rgba(124,58,237,0.06) 45%, rgba(0,0,0,0))" }}
      />
      {bats.map((b) => (
        <div
          key={b.id}
          aria-hidden
          className={`dcw-bat${b.reverse ? " rev" : ""}`}
          style={{ top: `${b.top}vh`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
          onAnimationEnd={() => setBats((all) => all.filter((x) => x.id !== b.id))}
        >
          <span>
            <svg width={b.size} height={b.size * 0.5} viewBox="0 0 100 50" fill="#1c1029" stroke="#fb923c" strokeWidth="1.6" strokeLinejoin="round">
              <path d="M50 18 C52 12 56 10 58 12 L61 5 L63 14 C71 8 85 6 98 14 C90 16 86 22 86 31 C80 26 74 26 70 31 C66 24 60 24 56 31 C54 27 52 26 50 26 C48 26 46 27 44 31 C40 24 34 24 30 31 C26 26 20 26 14 31 C14 22 10 16 2 14 C15 6 29 8 37 14 L39 5 L42 12 C44 10 48 12 50 18 Z" />
              <circle cx="46.5" cy="16" r="1.3" fill="#fb923c" stroke="none" />
              <circle cx="53.5" cy="16" r="1.3" fill="#fb923c" stroke="none" />
            </svg>
          </span>
        </div>
      ))}
    </>
  );
}
