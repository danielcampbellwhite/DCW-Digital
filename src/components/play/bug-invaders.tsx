"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Play, RotateCcw, Heart, Keyboard, Trophy, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Word lists ─────────────────────────────────────────────────────────── */

const WORDS = {
  short: ["let", "var", "if", "for", "null", "git", "css", "api", "bug", "npm", "div", "map", "key", "log", "sql", "php", "ssh", "dom", "json", "node", "true", "void", "loop", "href"],
  medium: ["const", "async", "await", "class", "fetch", "return", "react", "query", "deploy", "commit", "props", "state", "array", "build", "merge", "debug", "cache", "route", "token", "regex", "branch", "string"],
  long: ["useEffect", "undefined", "function", "promise", "typescript", "refactor", "database", "localhost", "middleware", "javascript", "component", "framework", "recursion", "semicolon", "dependency", "pagination", "exception", "interface"],
};

const BOSS_PHRASES = [
  "it works on my machine",
  "merge conflict",
  "works in production",
  "missing semicolon",
  "have you tried turning it off",
  "it was cached",
  "cannot read properties of undefined",
  "just one more fix",
];

const BEST_KEY = "dcw-bug-invaders-best";
const START_LIVES = 3;
const MAX_LIVES = 5;

/* ── Types ──────────────────────────────────────────────────────────────── */

interface Enemy {
  id: number;
  word: string;
  typed: number;
  x: number;
  y: number;
  speed: number;
  boss: boolean;
  r: number;
  dying: number; // seconds left of death animation, 0 = alive
}
interface Bullet { x: number; y: number; targetId: number }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Star { x: number; y: number; s: number }

interface Game {
  w: number;
  h: number;
  enemies: Enemy[];
  bullets: Bullet[];
  particles: Particle[];
  stars: Star[];
  targetId: number | null;
  score: number;
  lives: number;
  wave: number;
  toSpawn: number;
  bossPending: boolean;
  spawnTimer: number;
  banner: number;
  correct: number;
  misses: number;
  kills: number;
  startedAt: number;
  shake: number;
  nextId: number;
}

type Phase = "idle" | "playing" | "paused" | "over";

interface Hud { score: number; wave: number; lives: number; accuracy: number }
interface Summary { score: number; wave: number; wpm: number; accuracy: number; kills: number; best: number; isBest: boolean }

/* ── Helpers ────────────────────────────────────────────────────────────── */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)] as T;

function pickWord(wave: number, taken: Set<string>): string {
  const longChance = Math.min(0.45, 0.05 + wave * 0.06);
  const shortChance = Math.max(0.15, 0.6 - wave * 0.07);
  for (let i = 0; i < 12; i++) {
    const roll = Math.random();
    const pool = roll < shortChance ? WORDS.short : roll < 1 - longChance ? WORDS.medium : WORDS.long;
    const w = pick(pool);
    if (!taken.has(w[0]!.toLowerCase())) return w;
  }
  return pick(WORDS.medium);
}

function newGame(w: number, h: number): Game {
  return {
    w,
    h,
    enemies: [],
    bullets: [],
    particles: [],
    stars: Array.from({ length: 60 }, () => ({ x: Math.random() * w, y: Math.random() * h, s: rand(0.4, 1.6) })),
    targetId: null,
    score: 0,
    lives: START_LIVES,
    wave: 1,
    toSpawn: 0,
    bossPending: false,
    spawnTimer: 0.6,
    banner: 2,
    correct: 0,
    misses: 0,
    kills: 0,
    startedAt: performance.now(),
    shake: 0,
    nextId: 1,
  };
}

function startWave(g: Game) {
  g.toSpawn = 4 + g.wave * 3;
  g.bossPending = g.wave % 3 === 0;
  g.spawnTimer = 1.2;
  g.banner = 2;
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Bug Invaders - a typing shooter. Bugs labelled with programming words fly
 * at your ship; type a word to lock on and shoot it down. Every third wave
 * brings a boss with a developer phrase to type.
 */
export function BugInvaders() {
  const reduce = useReducedMotion();
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const gameRef = React.useRef<Game | null>(null);
  const phaseRef = React.useRef<Phase>("idle");
  const fontRef = React.useRef("monospace");
  const sizeRef = React.useRef({ w: 800, h: 560, dpr: 1 });

  const [phase, setPhaseState] = React.useState<Phase>("idle");
  const [hud, setHud] = React.useState<Hud>({ score: 0, wave: 1, lives: START_LIVES, accuracy: 100 });
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [best, setBest] = React.useState(0);
  const bestRef = React.useRef(0);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  React.useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(BEST_KEY)) || 0;
      bestRef.current = stored;
      setBest(stored);
    } catch {
      /* ignore */
    }
    const v = getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    if (v) fontRef.current = `${v}, ui-monospace, monospace`;
  }, []);

  /* Canvas sizing (crisp on high-DPI screens). */
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const w = wrap.clientWidth;
      const h = Math.round(Math.min(560, Math.max(380, w * 0.7)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      sizeRef.current = { w, h, dpr };
      const g = gameRef.current;
      if (g) {
        const sx = w / g.w;
        g.enemies.forEach((e) => (e.x *= sx));
        g.w = w;
        g.h = h;
      }
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Explosions ───────────────────────────────────────────────────────── */
  const burst = (g: Game, x: number, y: number, color: string, n: number) => {
    const count = reduce ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(40, 220);
      g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.4, 0.9), color });
    }
  };

  /* ── Typing ───────────────────────────────────────────────────────────── */
  const typeChar = (raw: string) => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing") return;
    const c = raw.toLowerCase();
    let target = g.enemies.find((e) => e.id === g.targetId && !e.dying);
    if (!target) {
      const candidates = g.enemies
        .filter((e) => !e.dying && e.word[e.typed]?.toLowerCase() === c)
        .sort((a, b) => b.y - a.y);
      target = candidates[0];
      if (!target) {
        g.misses++;
        return;
      }
      g.targetId = target.id;
    }
    if (target.word[target.typed]?.toLowerCase() !== c) {
      g.misses++;
      return;
    }
    target.typed++;
    g.correct++;
    target.y -= target.boss ? 1 : 3; // a little knockback
    const sx = g.w / 2;
    const sy = g.h - 34;
    g.bullets.push({ x: sx, y: sy, targetId: target.id });
    if (target.typed >= target.word.length) {
      target.dying = 0.15;
      g.targetId = null;
      g.kills++;
      const letters = target.word.replace(/\s/g, "").length;
      g.score += letters * 10 * (target.boss ? 3 : 1) + g.wave * 5;
      if (target.boss) g.lives = Math.min(MAX_LIVES, g.lives + 1);
    }
  };

  /* ── Game loop ────────────────────────────────────────────────────────── */
  const step = (dt: number) => {
    const g = gameRef.current;
    if (!g) return;
    const sx = g.w / 2;
    const sy = g.h - 34;
    const scale = g.h / 560;

    // Stars drift.
    if (!reduce) for (const s of g.stars) {
      s.y += s.s * 12 * dt;
      if (s.y > g.h) { s.y = 0; s.x = Math.random() * g.w; }
    }

    // Spawning.
    g.banner = Math.max(0, g.banner - dt);
    g.spawnTimer -= dt;
    if (g.spawnTimer <= 0 && g.banner < 1.2) {
      const alive = g.enemies.filter((e) => !e.dying);
      const taken = new Set(alive.map((e) => e.word[e.typed]?.toLowerCase() ?? ""));
      if (g.toSpawn > 0) {
        const word = pickWord(g.wave, taken);
        g.enemies.push({
          id: g.nextId++, word, typed: 0, boss: false, r: 14, dying: 0,
          x: rand(40, g.w - 40), y: -20,
          speed: (24 + g.wave * 4 + rand(0, 12)) * scale,
        });
        g.toSpawn--;
        g.spawnTimer = Math.max(0.55, 2.1 - g.wave * 0.15) * rand(0.8, 1.2);
      } else if (g.bossPending && alive.length <= 2) {
        g.enemies.push({
          id: g.nextId++, word: pick(BOSS_PHRASES), typed: 0, boss: true, r: 26, dying: 0,
          x: g.w / 2, y: -40,
          speed: (12 + g.wave * 1.2) * scale,
        });
        g.bossPending = false;
      }
    }

    // Enemies move towards the ship.
    for (const e of g.enemies) {
      if (e.dying) {
        e.dying -= dt;
        if (e.dying <= 0) {
          burst(g, e.x, e.y, e.boss ? "#a78bfa" : "#f87171", e.boss ? 60 : 24);
          e.dying = -1;
        }
        continue;
      }
      const dx = sx - e.x;
      const dy = sy - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.x += (dx / d) * e.speed * dt;
      e.y += (dy / d) * e.speed * dt;
      if (d < e.r + 18) {
        g.lives--;
        g.shake = reduce ? 0 : 0.35;
        burst(g, e.x, e.y, "#fb923c", 30);
        e.dying = -1;
        if (g.targetId === e.id) g.targetId = null;
      }
    }
    g.enemies = g.enemies.filter((e) => e.dying !== -1);

    // Bullets.
    for (const b of g.bullets) {
      const t = g.enemies.find((e) => e.id === b.targetId);
      if (!t) { b.targetId = -1; continue; }
      const dx = t.x - b.x;
      const dy = t.y - b.y;
      const d = Math.hypot(dx, dy);
      const v = 1400 * dt;
      if (d <= v) {
        burst(g, t.x, t.y + t.r * 0.3, "#00e5ff", 4);
        b.targetId = -1;
      } else {
        b.x += (dx / d) * v;
        b.y += (dy / d) * v;
      }
    }
    g.bullets = g.bullets.filter((b) => b.targetId !== -1);

    // Particles.
    for (const p of g.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= dt;
    }
    g.particles = g.particles.filter((p) => p.life > 0);
    g.shake = Math.max(0, g.shake - dt);

    // Wave cleared.
    if (g.toSpawn === 0 && !g.bossPending && g.enemies.length === 0) {
      g.wave++;
      startWave(g);
    }

    // Game over.
    if (g.lives <= 0) endGame();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr } = sizeRef.current;
    const g = gameRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = "#070b17";
    ctx.fillRect(0, 0, w, h);

    if (g && g.shake > 0) ctx.translate(rand(-4, 4) * g.shake * 3, rand(-4, 4) * g.shake * 3);

    // Grid.
    ctx.strokeStyle = "rgba(255,255,255,0.035)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 44) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); ctx.stroke(); }
    for (let y = 0; y < h; y += 44) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }

    if (!g) return;

    // Stars.
    for (const s of g.stars) {
      ctx.fillStyle = `rgba(148,163,184,${0.25 + s.s * 0.25})`;
      ctx.fillRect(s.x, s.y, s.s, s.s);
    }

    const sx = w / 2;
    const sy = h - 34;
    const target = g.enemies.find((e) => e.id === g.targetId);

    // Bullets.
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    for (const b of g.bullets) {
      const t = g.enemies.find((e) => e.id === b.targetId);
      if (!t) continue;
      const dx = t.x - b.x;
      const dy = t.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - (dx / d) * 14, b.y - (dy / d) * 14);
      ctx.stroke();
    }

    // Enemies.
    for (const e of g.enemies) {
      const angle = Math.atan2(sy - e.y, sx - e.x) - Math.PI / 2;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(angle);
      const body = e.boss ? "#a78bfa" : "#f87171";
      ctx.strokeStyle = body;
      ctx.lineWidth = e.boss ? 3 : 2;
      // legs
      for (const side of [-1, 1]) {
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(side * e.r * 0.5, i * e.r * 0.45);
          ctx.lineTo(side * e.r * 1.15, i * e.r * 0.45 + i * e.r * 0.25);
          ctx.stroke();
        }
      }
      // antennae
      ctx.beginPath();
      ctx.moveTo(-e.r * 0.25, e.r * 0.9); ctx.lineTo(-e.r * 0.55, e.r * 1.45);
      ctx.moveTo(e.r * 0.25, e.r * 0.9); ctx.lineTo(e.r * 0.55, e.r * 1.45);
      ctx.stroke();
      // body + head
      ctx.fillStyle = e.boss ? "rgba(124,58,237,0.35)" : "rgba(244,63,94,0.25)";
      ctx.beginPath(); ctx.ellipse(0, -e.r * 0.15, e.r * 0.62, e.r * 0.85, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, e.r * 0.78, e.r * 0.32, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -e.r * 0.95); ctx.lineTo(0, e.r * 0.6); ctx.stroke();
      ctx.restore();

      // Word label.
      const size = e.boss ? 16 : 14;
      ctx.font = `600 ${size}px ${fontRef.current}`;
      ctx.textBaseline = "middle";
      const done = e.word.slice(0, e.typed);
      const rest = e.word.slice(e.typed);
      const doneW = ctx.measureText(done).width;
      const totalW = ctx.measureText(e.word).width;
      const lx = Math.min(Math.max(e.x - totalW / 2, 6), w - totalW - 6);
      const ly = e.y - e.r - 20;
      const isTarget = target?.id === e.id;
      ctx.fillStyle = "rgba(5,8,22,0.85)";
      ctx.strokeStyle = isTarget ? "#00e5ff" : "rgba(255,255,255,0.14)";
      ctx.lineWidth = isTarget ? 1.5 : 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(lx - 7, ly - size * 0.75, totalW + 14, size * 1.5, 6);
      else ctx.rect(lx - 7, ly - size * 0.75, totalW + 14, size * 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(0,255,179,0.55)";
      ctx.fillText(done, lx, ly);
      ctx.fillStyle = isTarget ? "#ffffff" : "#e2e8f0";
      ctx.fillText(rest, lx + doneW, ly);
    }

    // Particles.
    for (const p of g.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    // Ship (turns to face the current target).
    const shipAngle = target ? Math.atan2(target.y - sy, target.x - sx) + Math.PI / 2 : 0;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(shipAngle);
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "rgba(0,229,255,0.18)";
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20); ctx.lineTo(15, 14); ctx.lineTo(0, 7); ctx.lineTo(-15, 14); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.shadowBlur = 0;

    // Wave banner.
    if (g.banner > 0) {
      const boss = g.wave % 3 === 0;
      ctx.globalAlpha = Math.min(1, g.banner);
      ctx.textAlign = "center";
      ctx.font = `700 30px ${fontRef.current}`;
      ctx.fillStyle = boss ? "#a78bfa" : "#00e5ff";
      ctx.fillText(`WAVE ${g.wave}`, w / 2, h * 0.38);
      if (boss) {
        ctx.font = `600 14px ${fontRef.current}`;
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText("Boss incoming", w / 2, h * 0.38 + 30);
      }
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
  };

  /* Loop driver. */
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudTimer = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "playing") {
        step(dt);
        hudTimer += dt;
        if (hudTimer > 0.1 && gameRef.current) {
          hudTimer = 0;
          const g = gameRef.current;
          const total = g.correct + g.misses;
          setHud({ score: g.score, wave: g.wave, lives: g.lives, accuracy: total ? Math.round((g.correct / total) * 100) : 100 });
        }
      }
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  /* Pause when the tab is hidden. */
  React.useEffect(() => {
    const onVis = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const focusInput = () => inputRef.current?.focus({ preventScroll: true });

  const start = () => {
    const { w, h } = sizeRef.current;
    const g = newGame(w, h);
    startWave(g);
    gameRef.current = g;
    setSummary(null);
    setHud({ score: 0, wave: 1, lives: START_LIVES, accuracy: 100 });
    setPhase("playing");
    focusInput();
  };

  const resume = () => {
    setPhase("playing");
    focusInput();
  };

  function endGame() {
    const g = gameRef.current;
    if (!g || phaseRef.current === "over") return;
    const minutes = Math.max((performance.now() - g.startedAt) / 60000, 1 / 60);
    const total = g.correct + g.misses;
    const prevBest = bestRef.current;
    const isBest = g.score > prevBest;
    const newBest = Math.max(prevBest, g.score);
    bestRef.current = newBest;
    try {
      window.localStorage.setItem(BEST_KEY, String(newBest));
    } catch {
      /* ignore */
    }
    setBest(newBest);
    setHud({ score: g.score, wave: g.wave, lives: 0, accuracy: total ? Math.round((g.correct / total) * 100) : 100 });
    setSummary({
      score: g.score,
      wave: g.wave,
      wpm: Math.round(g.correct / 5 / minutes),
      accuracy: total ? Math.round((g.correct / total) * 100) : 100,
      kills: g.kills,
      best: newBest,
      isBest,
    });
    setPhase("over");
    inputRef.current?.blur();
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    for (const ch of v) typeChar(ch);
    e.target.value = "";
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && phaseRef.current === "playing") {
      e.preventDefault();
      setPhase("paused");
    }
  };

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-4 sm:p-6">
      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 font-mono text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Trophy className="size-4 text-accent" /> {hud.score}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Waves className="size-4 text-primary" /> Wave {hud.wave}
        </span>
        <span className="inline-flex items-center gap-1" aria-label={`${hud.lives} lives left`}>
          {Array.from({ length: Math.max(hud.lives, 0) }).map((_, i) => (
            <Heart key={i} className="size-4 fill-red-400 text-red-400" />
          ))}
        </span>
        <span className="text-muted-foreground">{hud.accuracy}% acc</span>
      </div>

      {/* Stage */}
      <div
        ref={wrapRef}
        className="relative mt-3 overflow-hidden rounded-2xl border border-border"
        onClick={() => phaseRef.current === "playing" && focusInput()}
      >
        <canvas
          ref={canvasRef}
          className="block w-full"
          role="img"
          aria-label="Bug Invaders game. Type the word above each bug to shoot it before it reaches your ship."
        />
        <input
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Type the words here"
          onChange={onInput}
          onKeyDown={onKeyDown}
          onBlur={() => {
            if (phaseRef.current === "playing") setPhase("paused");
          }}
          className="pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0"
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center bg-background/75 p-4 backdrop-blur-sm">
            <div className="max-w-sm text-center">
              {phase === "idle" && (
                <>
                  <Keyboard className="mx-auto size-10 text-primary" />
                  <h3 className="mt-3 font-heading text-2xl font-bold">Bug Invaders</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bugs are heading for your ship. Type the word on each one to
                    shoot it down. Every third wave brings a boss.
                  </p>
                  <Button onClick={start} variant="primary" className="mt-5">
                    <Play className="size-4" /> Start typing
                  </Button>
                  {best > 0 && <p className="mt-3 font-mono text-xs text-muted-foreground">Best: {best}</p>}
                </>
              )}
              {phase === "paused" && (
                <>
                  <h3 className="font-heading text-2xl font-bold">Paused</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Your bugs will wait. Probably.</p>
                  <Button onClick={resume} variant="primary" className="mt-5">
                    <Play className="size-4" /> Resume
                  </Button>
                </>
              )}
              {phase === "over" && summary && (
                <div aria-live="polite">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Game over</p>
                  <p className={cn("mt-1 font-heading text-4xl font-bold", summary.isBest && "text-accent")}>
                    {summary.score}
                  </p>
                  {summary.isBest && <p className="text-sm font-medium text-accent">New best score!</p>}
                  <dl className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-sm">
                    {[
                      ["Wave", summary.wave],
                      ["Bugs shot", summary.kills],
                      ["Speed", `${summary.wpm} wpm`],
                      ["Accuracy", `${summary.accuracy}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-border bg-surface/60 px-3 py-2">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-mono font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <Button onClick={start} variant="primary" className="mt-5">
                    <RotateCcw className="size-4" /> Play again
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Just start typing · Esc to pause · on mobile, tap the game to bring up the keyboard
      </p>
    </div>
  );
}
