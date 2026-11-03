"use client";

import * as React from "react";
import { Layers, Play, RotateCcw, Trophy } from "lucide-react";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BEST_KEY = "dcw-stack-overflow-best";
const W = 320; // logical width; the canvas scales to fit
const BH = 24; // block height
const START_W = 190;
const PERFECT = 4; // px tolerance for a perfect drop
const TOKENS = ["const", "await", "return", "if", "else", "map()", "try", "catch", "fn()", "{ }", "import", "async", "let", "=>", "while", "export", "null", "class", "yield", "new"];

interface Block { x: number; w: number; y: number; label: string; hue: number }
interface Chip { x: number; w: number; y: number; vy: number; hue: number; rot: number; vr: number }
interface Game {
  stack: Block[];
  cur: Block;
  dir: number;
  speed: number;
  chips: Chip[];
  camera: number;
  combo: number;
  over: boolean;
  falling: Chip | null;
  flash: number;
}

type Phase = "idle" | "playing" | "over";

function baseHue() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim().split(/\s+/)[0];
  return Number(v) || 186;
}

/**
 * Stack Overflow - a one-tap stacking game. Blocks slide back and forth;
 * tap to drop. Anything hanging over the edge is trimmed off, and if you miss
 * the stack completely... it overflows.
 */
export function StackOverflow() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameRef = React.useRef<Game | null>(null);
  const phaseRef = React.useRef<Phase>("idle");
  const viewRef = React.useRef({ w: 320, h: 400, dpr: 1, scale: 1 });
  const hueRef = React.useRef(186);
  const fontRef = React.useRef("monospace");
  const [phase, setPhaseState] = React.useState<Phase>("idle");
  const [score, setScore] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [isBest, setIsBest] = React.useState(false);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  React.useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* ignore */
    }
    hueRef.current = baseHue();
    const v = getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    if (v) fontRef.current = `${v}, ui-monospace, monospace`;
  }, []);

  const newGame = (): Game => {
    const h = viewRef.current.h / viewRef.current.scale;
    const base: Block = { x: (W - START_W) / 2, w: START_W, y: h - BH * 2, label: "main", hue: 0 };
    return {
      stack: [base],
      cur: { x: -START_W, w: START_W, y: base.y - BH, label: TOKENS[0]!, hue: 1 },
      dir: 1,
      speed: 150,
      chips: [],
      camera: 0,
      combo: 0,
      over: false,
      falling: null,
      flash: 0,
    };
  };

  /* Sizing */
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = Math.round(Math.min(460, Math.max(360, w * 0.95)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      viewRef.current = { w, h, dpr, scale: w / W };
      if (!gameRef.current) gameRef.current = newGame();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const colour = (hueStep: number, light = 55, alpha = 1) =>
    `hsla(${(hueRef.current + hueStep * 9) % 360}, 90%, ${light}%, ${alpha})`;

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const g = gameRef.current;
    if (!canvas || !ctx || !g) return;
    const { w, h, dpr, scale } = viewRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "rgba(5,8,22,1)";
    ctx.fillRect(0, 0, w, h);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, g.camera * dpr * scale);

    // Faint grid lines like an editor gutter.
    const Hl = h / scale;
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    const top = -g.camera - BH;
    for (let y = Math.floor(top / BH) * BH; y < top + Hl + BH * 2; y += BH) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(W, y + 0.5);
      ctx.stroke();
    }

    const block = (b: { x: number; w: number; y: number; hue: number }, label?: string) => {
      ctx.fillStyle = colour(b.hue, 50, 0.25);
      ctx.strokeStyle = colour(b.hue, 60);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(b.x, b.y, b.w, BH - 3, 4);
      else ctx.rect(b.x, b.y, b.w, BH - 3);
      ctx.fill();
      ctx.stroke();
      if (label && b.w > 34) {
        ctx.fillStyle = colour(b.hue, 75);
        ctx.font = `600 11px ${fontRef.current}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(label, b.x + b.w / 2, b.y + (BH - 3) / 2 + 0.5);
      }
    };

    for (const b of g.stack) block(b, b.label);
    for (const c of g.chips) {
      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + BH / 2);
      ctx.rotate(c.rot);
      ctx.globalAlpha = 0.8;
      block({ x: -c.w / 2, y: -BH / 2, w: c.w, hue: c.hue });
      ctx.restore();
    }
    if (g.falling) {
      ctx.save();
      ctx.translate(g.falling.x + g.falling.w / 2, g.falling.y + BH / 2);
      ctx.rotate(g.falling.rot);
      block({ x: -g.falling.w / 2, y: -BH / 2, w: g.falling.w, hue: g.falling.hue }, g.cur.label);
      ctx.restore();
    } else if (phaseRef.current === "playing") {
      block(g.cur, g.cur.label);
    }

    // Perfect-drop flash.
    if (g.flash > 0) {
      const last = g.stack[g.stack.length - 1]!;
      ctx.strokeStyle = `rgba(255,255,255,${g.flash})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(last.x - 3, last.y - 3, last.w + 6, BH + 3);
    }
  };

  const step = (dt: number) => {
    const g = gameRef.current;
    if (!g) return;
    if (!g.over && !g.falling) {
      g.cur.x += g.dir * g.speed * dt;
      if (g.cur.x + g.cur.w > W + 30 && g.dir > 0) g.dir = -1;
      if (g.cur.x < -30 && g.dir < 0) g.dir = 1;
    }
    for (const c of g.chips) {
      c.vy += 900 * dt;
      c.y += c.vy * dt;
      c.rot += c.vr * dt;
    }
    g.chips = g.chips.filter((c) => c.y + g.camera < viewRef.current.h / viewRef.current.scale + 60);
    if (g.falling) {
      g.falling.vy += 900 * dt;
      g.falling.y += g.falling.vy * dt;
      g.falling.rot += g.falling.vr * dt;
    }
    g.flash = Math.max(0, g.flash - dt * 2.5);
    // Keep the top of the stack around 40% down the screen.
    const Hl = viewRef.current.h / viewRef.current.scale;
    const target = Math.max(0, Hl * 0.4 - g.cur.y);
    g.camera += (target - g.camera) * Math.min(1, dt * 6);
  };

  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      step(dt);
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    unlockAudio();
    hueRef.current = baseHue();
    gameRef.current = newGame();
    setScore(0);
    setIsBest(false);
    setPhase("playing");
    playSound("start");
    wrapRef.current?.focus({ preventScroll: true });
  };

  const drop = () => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing" || g.over) return;
    const prev = g.stack[g.stack.length - 1]!;
    const c = g.cur;
    const left = Math.max(prev.x, c.x);
    const right = Math.min(prev.x + prev.w, c.x + c.w);
    const overlap = right - left;

    if (overlap <= 0) {
      // Missed completely: the stack overflows.
      g.over = true;
      g.falling = { x: c.x, w: c.w, y: c.y, vy: 0, hue: c.hue, rot: 0, vr: c.x < prev.x ? -2 : 2 };
      playSound("crash");
      const height = g.stack.length - 1;
      const nb = height > best;
      if (nb) {
        setBest(height);
        setIsBest(true);
        try {
          window.localStorage.setItem(BEST_KEY, String(height));
        } catch {
          /* ignore */
        }
      }
      window.setTimeout(() => {
        setPhase("over");
        playSound(nb ? "finish" : "gameOver");
      }, 700);
      return;
    }

    let placed: Block;
    if (Math.abs(c.x - prev.x) <= PERFECT) {
      g.combo += 1;
      const grow = g.combo >= 3 ? Math.min(START_W, prev.w + 8) : prev.w;
      placed = { ...c, x: prev.x - (grow - prev.w) / 2, w: grow };
      g.flash = 1;
      playSound("coin");
    } else {
      g.combo = 0;
      placed = { ...c, x: left, w: overlap };
      // The bit hanging off falls away.
      const cutX = c.x < prev.x ? c.x : right;
      const cutW = c.w - overlap;
      g.chips.push({ x: cutX, w: cutW, y: c.y, vy: 0, hue: c.hue, rot: 0, vr: c.x < prev.x ? -3 : 3 });
      playSound("select");
    }
    g.stack.push(placed);
    const n = g.stack.length - 1;
    setScore(n);
    g.speed = Math.min(420, 150 + n * 9);
    g.dir = n % 2 ? -1 : 1;
    g.cur = {
      x: g.dir > 0 ? -placed.w : W,
      w: placed.w,
      y: placed.y - BH,
      label: TOKENS[n % TOKENS.length]!,
      hue: n + 1,
    };
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (phaseRef.current === "playing") drop();
      else start();
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 font-mono text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Layers className="size-4 text-primary" /> {score}
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Best height">
            <Trophy className="size-4 text-accent" /> {best}
          </span>
          <SoundToggle />
        </span>
      </div>

      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-label="Stack Overflow game. Press space or tap to drop the block."
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          if (phaseRef.current !== "playing") return;
          e.preventDefault();
          drop();
        }}
        className="relative mt-3 touch-manipulation select-none overflow-hidden rounded-2xl border border-border outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <canvas ref={canvasRef} className="block w-full" aria-hidden />
        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-background/70 p-4 backdrop-blur-sm">
            <div className="max-w-xs text-center">
              {phase === "idle" ? (
                <>
                  <Layers className="mx-auto size-10 text-primary" />
                  <h3 className="mt-3 font-heading text-2xl font-bold">Stack Overflow</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tap (or press space) to drop each block onto the stack. Anything
                    hanging over is trimmed off. Land three perfect drops in a row
                    to grow it back.
                  </p>
                </>
              ) : (
                <div aria-live="polite">
                  <p className="text-sm uppercase tracking-wider text-red-400">Stack overflow</p>
                  <p className={cn("mt-1 font-heading text-4xl font-bold", isBest && "text-accent")}>{score}</p>
                  <p className="text-sm text-muted-foreground">{isBest ? "New best height!" : `Best: ${best}`}</p>
                </div>
              )}
              <Button onClick={start} variant="primary" className="mt-5">
                {phase === "idle" ? <Play className="size-4" /> : <RotateCcw className="size-4" />}
                {phase === "idle" ? "Start stacking" : "Try again"}
              </Button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Tap the stack or press space to drop</p>
    </div>
  );
}
