"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Coffee, Maximize2, Pause, Play, RotateCcw, Rocket, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Tuning (world units; the canvas is scaled to fit) ─────────────────── */

const BEST_KEY = "dcw-deploy-dash-best";
const GRAVITY = 2500;
const JUMP_V = 800;
const JUMP_CUT = 0.45; // velocity kept when the jump key is released early
const START_SPEED = 340;
const MAX_SPEED = 860;
const ACCEL = 9; // speed gained per second
const PLAYER_X = 64;
const STAND = { w: 30, h: 42 };
const DUCK = { w: 42, h: 24 };
const COFFEE_POINTS = 25;
const RELEASE_EVERY = 1000;

const CODE_LINES = [
  "git push origin main",
  "npm run build",
  "✓ 42 tests passed",
  "deploying to production...",
  "const ship = () => true;",
  "// TODO: fix before Friday",
  "await deploy({ env: 'prod' })",
  "Build completed in 38s",
  "if (bug) squash(bug);",
  "200 OK",
];

/* ── Types ──────────────────────────────────────────────────────────────── */

type ObstacleKind = "bug" | "test" | "popup" | "popupHigh";
interface Obstacle { kind: ObstacleKind; x: number; y: number; w: number; h: number; label?: string }
interface Pickup { x: number; y: number; taken: boolean }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string }
interface Drift { x: number; y: number; text: string; speed: number }

interface Game {
  W: number;
  H: number;
  ground: number;
  y: number; // player top
  vy: number;
  onGround: boolean;
  ducking: boolean;
  jumpHeld: boolean;
  coyote: number;
  buffer: number;
  speed: number;
  distance: number;
  score: number;
  coffee: number;
  nextGap: number;
  sinceSpawn: number;
  obstacles: Obstacle[];
  pickups: Pickup[];
  particles: Particle[];
  drift: Drift[];
  groundOffset: number;
  banner: number;
  bannerText: string;
  releases: number;
  time: number;
  dead: boolean;
}

type Phase = "idle" | "playing" | "paused" | "over";
interface Hud { score: number; coffee: number }
interface Summary { score: number; coffee: number; releases: number; best: number; isBest: boolean }

/* ── Helpers ────────────────────────────────────────────────────────────── */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)] as T;
const POPUP_LABELS = ["404", "500", "NaN", "null", "CORS", "undefined"];

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function newGame(W: number, H: number): Game {
  const ground = H - 34;
  return {
    W,
    H,
    ground,
    y: ground - STAND.h,
    vy: 0,
    onGround: true,
    ducking: false,
    jumpHeld: false,
    coyote: 0,
    buffer: 0,
    speed: START_SPEED,
    distance: 0,
    score: 0,
    coffee: 0,
    nextGap: 520,
    sinceSpawn: 0,
    obstacles: [],
    pickups: [],
    particles: [],
    // Background code sits in its own lanes so lines never overlap.
    drift: Array.from({ length: Math.max(2, Math.min(7, Math.floor((ground - 100) / 26))) }, (_, i) => ({
      x: rand(-100, W),
      y: 22 + i * 26,
      text: pick(CODE_LINES),
      speed: 0.08 + (i % 3) * 0.05,
    })),
    groundOffset: 0,
    banner: 0,
    bannerText: "",
    releases: 0,
    time: 0,
    dead: false,
  };
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Deploy Dash - an endless runner. You're a deploy bot racing a release to
 * production: jump the bugs and failing tests, duck under the error pop-ups,
 * and grab coffee for bonus points. It speeds up the further you get.
 */
export function DeployDash() {
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameRef = React.useRef<Game | null>(null);
  const phaseRef = React.useRef<Phase>("idle");
  const fullRef = React.useRef(false);
  const fontRef = React.useRef("monospace");
  const viewRef = React.useRef({ w: 800, h: 300, dpr: 1, scale: 1 });
  const bestRef = React.useRef(0);
  const touchStartY = React.useRef<number | null>(null);
  const overAtRef = React.useRef(0);

  const [phase, setPhaseState] = React.useState<Phase>("idle");
  const [hud, setHud] = React.useState<Hud>({ score: 0, coffee: 0 });
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [best, setBest] = React.useState(0);
  const [full, setFull] = React.useState(false);
  const [touch, setTouch] = React.useState(false);
  const [portrait, setPortrait] = React.useState(false);

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
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const v = getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    if (v) fontRef.current = `${v}, ui-monospace, monospace`;
  }, []);

  /* ── Sizing: fit a ~560x220 world, extra space becomes sky ─────────────── */
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const w = wrap.clientWidth;
      const stageH = fullRef.current ? Math.max(200, wrap.clientHeight) : Math.round(Math.min(340, Math.max(240, w * 0.42)));
      // On a tall portrait screen, play in a centred band rather than a
      // thin strip under a lot of empty sky.
      const isPortrait = fullRef.current && stageH > w * 0.9;
      const h = isPortrait ? Math.round(w * 0.85) : stageH;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = `${h}px`;
      canvas.style.position = isPortrait ? "absolute" : "";
      canvas.style.top = isPortrait ? `${Math.round((stageH - h) / 2)}px` : "";
      const scale = isPortrait ? Math.min(h / 220, w / 440) : Math.min(h / 240, w / 680);
      viewRef.current = { w, h, dpr, scale };
      setPortrait(isPortrait);
      const g = gameRef.current;
      if (!g) {
        gameRef.current = newGame(w / scale, h / scale);
      } else {
        const W = w / scale;
        const H = h / scale;
        const dy = H - 34 - g.ground;
        g.W = W;
        g.H = H;
        g.ground += dy;
        g.y += dy;
        g.obstacles.forEach((o) => (o.y += dy));
        g.pickups.forEach((p) => (p.y += dy));
        g.drift.forEach((d) => (d.y += dy));
      }
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const burst = (g: Game, x: number, y: number, color: string, n: number) => {
    const count = reduce ? Math.ceil(n / 3) : n;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2);
      const s = rand(60, 260);
      g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: rand(0.35, 0.8), color });
    }
  };

  /* ── Input ────────────────────────────────────────────────────────────── */
  const pressJump = () => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing") return;
    g.jumpHeld = true;
    g.buffer = 0.12; // remember the press briefly so early taps still count
  };
  const releaseJump = () => {
    const g = gameRef.current;
    if (!g) return;
    g.jumpHeld = false;
    if (g.vy < 0) g.vy *= JUMP_CUT;
  };
  const setDuck = (on: boolean) => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing") return;
    if (on && !g.onGround) g.vy = Math.max(g.vy, 600); // fast-fall
    g.ducking = on;
  };

  /* ── Simulation ───────────────────────────────────────────────────────── */
  const spawn = (g: Game) => {
    const s = g.score;
    const roll = Math.random();
    const x = g.W + 30;
    let obs: Obstacle[] = [];
    if (s > 250 && roll < 0.22) {
      obs = [{ kind: "popup", x, y: g.ground - 58, w: 58, h: 26, label: pick(POPUP_LABELS) }];
    } else if (s > 500 && roll < 0.32) {
      obs = [{ kind: "popupHigh", x, y: g.ground - 104, w: 58, h: 26, label: pick(POPUP_LABELS) }];
    } else if (roll < 0.62) {
      const n = s > 400 && Math.random() < 0.35 ? 2 : 1;
      obs = Array.from({ length: n }, (_, i) => ({ kind: "bug" as const, x: x + i * 38, y: g.ground - 24, w: 34, h: 24 }));
    } else {
      const h = s > 300 ? pick([38, 46, 54]) : pick([38, 46]);
      const n = s > 600 && Math.random() < 0.3 ? 2 : 1;
      obs = Array.from({ length: n }, (_, i) => ({ kind: "test" as const, x: x + i * 28, y: g.ground - h, w: 26, h }));
    }
    g.obstacles.push(...obs);

    // Sometimes a coffee, low or high, a little after the obstacle.
    if (Math.random() < 0.35) {
      const high = Math.random() < 0.5;
      g.pickups.push({ x: x + rand(160, 260), y: high ? g.ground - 108 : g.ground - 26, taken: false });
    }

    const air = (2 * JUMP_V) / GRAVITY; // seconds in the air on a full jump
    const minGap = g.speed * air * 0.95 + 80;
    const maxGap = minGap + g.speed * rand(0.4, 1.3) + 120;
    g.nextGap = rand(minGap, maxGap);
    g.sinceSpawn = 0;
  };

  const step = (dt: number) => {
    const g = gameRef.current;
    if (!g || g.dead) return;
    g.time += dt;
    g.speed = Math.min(MAX_SPEED, g.speed + ACCEL * dt);
    const dx = g.speed * dt;
    g.distance += dx;
    g.groundOffset = (g.groundOffset + dx) % 40;
    const prevScore = g.score;
    g.score += dx * 0.1;

    // Release banners.
    const releasesNow = Math.floor(g.score / RELEASE_EVERY);
    if (releasesNow > Math.floor(prevScore / RELEASE_EVERY)) {
      g.releases = releasesNow;
      g.banner = 2;
      g.bannerText = `v${releasesNow + 1}.0 shipped`;
    }
    g.banner = Math.max(0, g.banner - dt);

    // Player physics.
    const size = g.ducking && g.onGround ? DUCK : STAND;
    g.buffer = Math.max(0, g.buffer - dt);
    g.coyote = g.onGround ? 0.08 : Math.max(0, g.coyote - dt);
    if (g.buffer > 0 && g.coyote > 0) {
      g.vy = -JUMP_V;
      g.onGround = false;
      g.coyote = 0;
      g.buffer = 0;
      g.ducking = false;
    }
    g.vy += GRAVITY * dt;
    g.y += g.vy * dt;
    const floor = g.ground - size.h;
    if (g.y >= floor) {
      if (!g.onGround && g.vy > 300) burst(g, PLAYER_X + size.w / 2, g.ground, "rgba(148,163,184,0.8)", 5);
      g.y = floor;
      g.vy = 0;
      g.onGround = true;
    } else {
      g.onGround = false;
    }

    // World scroll.
    for (const o of g.obstacles) o.x -= dx;
    for (const p of g.pickups) p.x -= dx;
    for (const d of g.drift) {
      d.x -= dx * d.speed;
      if (d.x < -260) {
        d.x = g.W + rand(0, 200);
        d.text = pick(CODE_LINES);
      }
    }
    g.obstacles = g.obstacles.filter((o) => o.x + o.w > -20);
    g.pickups = g.pickups.filter((p) => p.x > -30 && !p.taken);

    g.sinceSpawn += dx;
    if (g.sinceSpawn >= g.nextGap) spawn(g);

    // Collisions (slightly forgiving hitboxes).
    const cur = g.ducking && g.onGround ? DUCK : STAND;
    const px = PLAYER_X + 5;
    const py = g.y + 4;
    const pw = cur.w - 10;
    const ph = cur.h - 6;
    for (const o of g.obstacles) {
      const inset = o.kind === "bug" ? 4 : 3;
      if (px < o.x + o.w - inset && px + pw > o.x + inset && py < o.y + o.h - inset && py + ph > o.y + inset) {
        g.dead = true;
        burst(g, PLAYER_X + cur.w / 2, g.y + cur.h / 2, "#00e5ff", 30);
        burst(g, o.x + o.w / 2, o.y + o.h / 2, "#f87171", 20);
        endGame();
        return;
      }
    }
    for (const p of g.pickups) {
      if (!p.taken && Math.abs(px + pw / 2 - p.x) < 22 && Math.abs(py + ph / 2 - p.y) < 28) {
        p.taken = true;
        g.coffee++;
        g.score += COFFEE_POINTS;
        burst(g, p.x, p.y, "#fbbf24", 12);
      }
    }
  };

  const stepParticles = (dt: number) => {
    const g = gameRef.current;
    if (!g) return;
    for (const p of g.particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 600 * dt;
      p.life -= dt;
    }
    g.particles = g.particles.filter((p) => p.life > 0);
  };

  /* ── Drawing ──────────────────────────────────────────────────────────── */
  const drawBot = (ctx: CanvasRenderingContext2D, g: Game) => {
    const ducking = g.ducking && g.onGround;
    const s = ducking ? DUCK : STAND;
    const x = PLAYER_X;
    const y = g.y;
    const run = g.onGround && !g.dead ? Math.sin(g.time * 22) : 0;
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#00e5ff";
    ctx.fillStyle = "rgba(0,229,255,0.16)";
    ctx.shadowColor = "#00e5ff";
    ctx.shadowBlur = 12;

    if (!ducking) {
      // antenna
      ctx.beginPath();
      ctx.moveTo(x + 15, y + 2);
      ctx.lineTo(x + 15, y - 6);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 15, y - 8, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#00ffb3";
      ctx.fill();
      ctx.fillStyle = "rgba(0,229,255,0.16)";
    }
    const bodyH = ducking ? 16 : 28;
    rrect(ctx, x, y + 2, s.w, bodyH, 7);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // visor + eyes
    ctx.fillStyle = "#050816";
    rrect(ctx, x + 5, y + (ducking ? 5 : 8), s.w - 10, ducking ? 8 : 10, 3);
    ctx.fill();
    const blink = Math.sin(g.time * 3) > 0.97;
    ctx.fillStyle = g.dead ? "#f87171" : "#00e5ff";
    if (g.dead) {
      ctx.font = `700 9px ${fontRef.current}`;
      ctx.textBaseline = "middle";
      ctx.fillText("x  x", x + 7, y + (ducking ? 9 : 13));
    } else if (!blink) {
      const ey = y + (ducking ? 7.5 : 11);
      ctx.fillRect(x + s.w - 17, ey, 4, 4);
      ctx.fillRect(x + s.w - 10, ey, 4, 4);
    }

    // legs
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2.5;
    const legTop = y + 2 + bodyH;
    const legLen = s.h - bodyH - 2;
    ctx.beginPath();
    ctx.moveTo(x + 9, legTop);
    ctx.lineTo(x + 9 + run * 4, legTop + legLen);
    ctx.moveTo(x + s.w - 9, legTop);
    ctx.lineTo(x + s.w - 9 - run * 4, legTop + legLen);
    ctx.stroke();
    ctx.restore();
  };

  const drawBug = (ctx: CanvasRenderingContext2D, o: Obstacle, t: number) => {
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2 + 2;
    const wig = Math.sin(t * 18 + o.x) * 2;
    ctx.strokeStyle = "#f87171";
    ctx.fillStyle = "rgba(244,63,94,0.25)";
    ctx.lineWidth = 2;
    for (const side of [-1, 1]) {
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * 6, cy + side * 5);
        ctx.lineTo(cx + i * 8 + wig * side, cy + side * 12);
        ctx.stroke();
      }
    }
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 13, cy - 1, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 5);
    ctx.lineTo(cx - 21, cy - 11);
    ctx.moveTo(cx - 13, cy - 6);
    ctx.lineTo(cx - 15, cy - 13);
    ctx.stroke();
  };

  const drawTest = (ctx: CanvasRenderingContext2D, o: Obstacle) => {
    ctx.fillStyle = "rgba(239,68,68,0.18)";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    rrect(ctx, o.x, o.y, o.w, o.h, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    const m = 7;
    ctx.moveTo(o.x + m, o.y + m);
    ctx.lineTo(o.x + o.w - m, o.y + m + (o.w - 2 * m));
    ctx.moveTo(o.x + o.w - m, o.y + m);
    ctx.lineTo(o.x + m, o.y + m + (o.w - 2 * m));
    ctx.stroke();
    ctx.fillStyle = "rgba(248,113,113,0.6)";
    for (let yy = o.y + o.w; yy < o.y + o.h - 6; yy += 7) ctx.fillRect(o.x + 6, yy, o.w - 12, 2);
  };

  const drawPopup = (ctx: CanvasRenderingContext2D, o: Obstacle, t: number) => {
    const bob = Math.sin(t * 4 + o.x * 0.01) * 2;
    const y = o.y + bob;
    ctx.fillStyle = "rgba(124,58,237,0.22)";
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    rrect(ctx, o.x, y, o.w, o.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#a78bfa";
    ctx.fillRect(o.x, y, o.w, 6);
    ctx.fillStyle = "#050816";
    ctx.fillRect(o.x + o.w - 9, y + 1.5, 3, 3);
    ctx.fillStyle = "#ede9fe";
    ctx.font = `700 11px ${fontRef.current}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.label ?? "error", o.x + o.w / 2, y + 16);
    ctx.textAlign = "left";
  };

  const drawCoffee = (ctx: CanvasRenderingContext2D, p: Pickup, t: number) => {
    const y = p.y + Math.sin(t * 5 + p.x * 0.02) * 3;
    ctx.strokeStyle = "#fbbf24";
    ctx.fillStyle = "rgba(251,191,36,0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, y - 6);
    ctx.lineTo(p.x + 8, y - 6);
    ctx.lineTo(p.x + 6, y + 9);
    ctx.lineTo(p.x - 6, y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(p.x + 9, y + 1, 4, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.moveTo(p.x - 3, y - 10);
    ctx.quadraticCurveTo(p.x - 6, y - 14, p.x - 3, y - 18);
    ctx.moveTo(p.x + 3, y - 10);
    ctx.quadraticCurveTo(p.x, y - 14, p.x + 3, y - 18);
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { w, h, dpr, scale } = viewRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#070b17";
    ctx.fillRect(0, 0, w, h);

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    const W = w / scale;
    const g = gameRef.current;
    if (!g) return;
    const t = g.time;

    // Faint grid.
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    const off = (g.distance * 0.25) % 40;
    for (let x = -off; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, g.ground);
      ctx.stroke();
    }

    // Drifting code in the background.
    ctx.font = `500 12px ${fontRef.current}`;
    ctx.textBaseline = "middle";
    for (const d of g.drift) {
      ctx.fillStyle = "rgba(148,163,184,0.16)";
      ctx.fillText(d.text, d.x, d.y);
    }

    // Ground.
    ctx.strokeStyle = "rgba(0,229,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, g.ground + 0.5);
    ctx.lineTo(W, g.ground + 0.5);
    ctx.stroke();
    ctx.fillStyle = "rgba(148,163,184,0.25)";
    for (let x = -g.groundOffset; x < W; x += 40) {
      ctx.fillRect(x, g.ground + 9, 14, 2);
      ctx.fillRect(x + 22, g.ground + 18, 6, 2);
    }

    // Pickups, obstacles, player.
    for (const p of g.pickups) if (!p.taken) drawCoffee(ctx, p, t);
    for (const o of g.obstacles) {
      if (o.kind === "bug") drawBug(ctx, o, t);
      else if (o.kind === "test") drawTest(ctx, o);
      else drawPopup(ctx, o, t);
    }
    drawBot(ctx, g);

    // Particles.
    for (const p of g.particles) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.6));
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3);
    }
    ctx.globalAlpha = 1;

    // Score (drawn in-canvas so it's visible in the inline view too).
    ctx.textAlign = "right";
    ctx.font = `600 14px ${fontRef.current}`;
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(String(Math.floor(g.score)).padStart(5, "0"), W - 14, 20);
    if (bestRef.current > 0) {
      ctx.fillStyle = "rgba(148,163,184,0.7)";
      ctx.fillText(`HI ${String(bestRef.current).padStart(5, "0")}`, W - 84, 20);
    }
    ctx.textAlign = "left";

    // Release banner.
    if (g.banner > 0) {
      ctx.globalAlpha = Math.min(1, g.banner);
      ctx.textAlign = "center";
      ctx.font = `700 20px ${fontRef.current}`;
      ctx.fillStyle = "#00ffb3";
      ctx.fillText(g.bannerText, W / 2, Math.max(40, g.ground - 150));
      ctx.textAlign = "left";
      ctx.globalAlpha = 1;
    }
  };

  /* ── Loop ─────────────────────────────────────────────────────────────── */
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudTimer = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "playing") {
        step(dt);
        hudTimer += dt;
        if (hudTimer > 0.15 && gameRef.current) {
          hudTimer = 0;
          setHud({ score: Math.floor(gameRef.current.score), coffee: gameRef.current.coffee });
        }
      }
      stepParticles(dt);
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  /* ── Full screen ──────────────────────────────────────────────────────── */
  const enterFull = () => {
    fullRef.current = true;
    setFull(true);
    const el = rootRef.current;
    if (el && !document.fullscreenElement && typeof el.requestFullscreen === "function") {
      el.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
    }
  };

  const exitFull = () => {
    fullRef.current = false;
    setFull(false);
    setPortrait(false);
    if (phaseRef.current === "playing") setPhase("paused");
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  React.useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [full]);

  React.useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement && phaseRef.current === "playing") setPhase("paused");
    };
    const onHide = () => {
      if (document.hidden && phaseRef.current === "playing") setPhase("paused");
    };
    const onBlur = () => {
      if (phaseRef.current === "playing") setPhase("paused");
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const start = () => {
    enterFull();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        (document.activeElement as HTMLElement | null)?.blur?.();
        const { w, h, scale } = viewRef.current;
        gameRef.current = newGame(w / scale, h / scale);
        setSummary(null);
        setHud({ score: 0, coffee: 0 });
        setPhase("playing");
      })
    );
  };

  const resume = () => {
    if (!fullRef.current) enterFull();
    (document.activeElement as HTMLElement | null)?.blur?.();
    const g = gameRef.current;
    if (g) {
      g.jumpHeld = false;
      g.ducking = false;
    }
    setPhase("playing");
  };

  function endGame() {
    const g = gameRef.current;
    if (!g || phaseRef.current === "over") return;
    const score = Math.floor(g.score);
    const isBest = score > bestRef.current;
    const newBest = Math.max(bestRef.current, score);
    bestRef.current = newBest;
    try {
      window.localStorage.setItem(BEST_KEY, String(newBest));
    } catch {
      /* ignore */
    }
    setBest(newBest);
    setHud({ score, coffee: g.coffee });
    setSummary({ score, coffee: g.coffee, releases: g.releases, best: newBest, isBest });
    // Short beat so the crash is visible before the overlay.
    overAtRef.current = performance.now();
    phaseRef.current = "over";
    window.setTimeout(() => setPhaseState("over"), 450);
  }

  /* Keyboard. */
  React.useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key;
      const jump = k === " " || k === "ArrowUp" || k === "w" || k === "W";
      const duck = k === "ArrowDown" || k === "s" || k === "S";
      if (phaseRef.current === "playing") {
        if (k === "Escape" || k === "p" || k === "P") {
          e.preventDefault();
          setPhase("paused");
        } else if (jump) {
          e.preventDefault();
          if (!e.repeat) pressJump();
        } else if (duck) {
          e.preventDefault();
          setDuck(true);
        }
      } else if (fullRef.current && (k === "Enter" || jump)) {
        e.preventDefault();
        if (phaseRef.current === "paused") resume();
        else if (phaseRef.current === "over" && performance.now() - overAtRef.current > 600) start();
      } else if (fullRef.current && k === "Escape") {
        exitFull();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === " " || k === "ArrowUp" || k === "w" || k === "W") releaseJump();
      if (k === "ArrowDown" || k === "s" || k === "S") setDuck(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Touch on the stage: tap to jump, swipe down to duck. */
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (phaseRef.current !== "playing") return;
    touchStartY.current = e.clientY;
    pressJump();
  };
  const onStagePointerMove = (e: React.PointerEvent) => {
    if (touchStartY.current !== null && e.clientY - touchStartY.current > 30) {
      releaseJump();
      setDuck(true);
    }
  };
  const onStagePointerUp = () => {
    touchStartY.current = null;
    releaseJump();
    setDuck(false);
  };

  const holdBtn = (down: () => void, up: () => void) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      down();
    },
    onPointerUp: up,
    onPointerLeave: up,
    onPointerCancel: up,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  return (
    <div
      ref={rootRef}
      className={cn(
        full
          ? "fixed inset-0 z-[110] flex h-[100dvh] flex-col bg-[#070b17] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
          : "mx-auto max-w-3xl rounded-3xl border border-border bg-card p-4 sm:p-6"
      )}
    >
      {/* HUD */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 font-mono text-sm",
          full ? "border-b border-white/10 px-3 py-2 sm:px-5" : "px-1"
        )}
      >
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Trophy className="size-4 text-accent" /> {hud.score}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Coffee className="size-4 text-amber-400" /> {hud.coffee}
        </span>
        {!full && <span className="text-muted-foreground">Best {best}</span>}
        {full && (
          <span className="flex items-center gap-1">
            {phase === "playing" && (
              <button
                type="button"
                onClick={() => setPhase("paused")}
                aria-label="Pause"
                className="grid size-9 place-items-center rounded-lg border border-white/10 text-muted-foreground"
              >
                <Pause className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={exitFull}
              aria-label="Exit game"
              className="grid size-9 place-items-center rounded-lg border border-white/10 text-muted-foreground"
            >
              <X className="size-4" />
            </button>
          </span>
        )}
      </div>

      {/* Stage */}
      <div
        ref={wrapRef}
        className={cn(
          "relative touch-none select-none overflow-hidden",
          full ? "min-h-0 flex-1" : "mt-3 rounded-2xl border border-border"
        )}
        onPointerDown={onStagePointerDown}
        onPointerMove={onStagePointerMove}
        onPointerUp={onStagePointerUp}
        onPointerCancel={onStagePointerUp}
      >
        <canvas
          ref={canvasRef}
          className="block w-full"
          role="img"
          aria-label="Deploy Dash game. Jump over bugs and failing tests, duck under error pop-ups."
        />

        {full && portrait && phase === "playing" && (
          <p className="pointer-events-none absolute inset-x-0 top-3 text-center font-mono text-xs text-muted-foreground">
            Tip: turn your phone sideways for a bigger view
          </p>
        )}

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-background/75 p-4 backdrop-blur-sm">
            <div className="max-w-sm text-center">
              {phase === "idle" && (
                <>
                  <Rocket className="mx-auto size-10 text-primary" />
                  <h3 className="mt-3 font-heading text-2xl font-bold">Deploy Dash</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Get the release to production. Jump the bugs and failing
                    tests, duck under the error pop-ups and grab the coffee. It
                    gets faster the further you go.
                  </p>
                  <Button onClick={start} variant="primary" className="mt-5">
                    <Maximize2 className="size-4" /> Play full screen
                  </Button>
                  {best > 0 && <p className="mt-3 font-mono text-xs text-muted-foreground">Best: {best}</p>}
                </>
              )}
              {phase === "paused" && (
                <>
                  <h3 className="font-heading text-2xl font-bold">Paused</h3>
                  <p className="mt-2 text-sm text-muted-foreground">The pipeline will wait.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button onClick={resume} variant="primary">
                      <Play className="size-4" /> Resume
                    </Button>
                    {full && (
                      <Button onClick={exitFull} variant="outline">
                        Exit
                      </Button>
                    )}
                  </div>
                </>
              )}
              {phase === "over" && summary && (
                <div aria-live="polite">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Build failed</p>
                  <p className={cn("mt-1 font-heading text-4xl font-bold", summary.isBest && "text-accent")}>
                    {summary.score}
                  </p>
                  {summary.isBest && <p className="text-sm font-medium text-accent">New best score!</p>}
                  <dl className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2 text-sm">
                    {[
                      ["Best", summary.best],
                      ["Coffee", summary.coffee],
                      ["Releases", summary.releases],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-border bg-surface/60 px-3 py-2">
                        <dt className="text-xs text-muted-foreground">{k}</dt>
                        <dd className="font-mono font-semibold">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Button onClick={start} variant="primary">
                      <RotateCcw className="size-4" /> Try again
                    </Button>
                    {full && (
                      <Button onClick={exitFull} variant="outline">
                        Exit
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Touch controls */}
      {full && touch && (
        <div className="grid select-none grid-cols-2 gap-2 border-t border-white/10 bg-[#0b1122] p-2 touch-manipulation">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Duck"
            className="flex h-16 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] font-mono text-sm uppercase tracking-widest text-muted-foreground active:border-secondary active:bg-secondary/30"
            {...holdBtn(() => setDuck(true), () => setDuck(false))}
          >
            <ArrowDown className="size-5" /> Duck
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Jump"
            className="flex h-16 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/10 font-mono text-sm uppercase tracking-widest text-primary active:bg-primary active:text-primary-foreground"
            {...holdBtn(pressJump, releaseJump)}
          >
            <ArrowUp className="size-5" /> Jump
          </button>
        </div>
      )}

      {!full && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Opens full screen · Space or ↑ to jump, ↓ to duck · on phones, tap to jump or use the buttons
        </p>
      )}
    </div>
  );
}
