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

function CrtOverlay() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[95]">
      <style>{`
        .dcw-crt{position:absolute;inset:0;
          background:
            repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.22) 3px),
            radial-gradient(ellipse at center,rgba(0,0,0,0) 62%,rgba(0,0,0,.55) 100%);
          animation:dcw-crt-flicker .15s infinite}
        @keyframes dcw-crt-flicker{0%,100%{opacity:1}50%{opacity:.94}}
        @media (prefers-reduced-motion: reduce){.dcw-crt{animation:none}}
      `}</style>
      <div className="dcw-crt" />
    </div>
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
