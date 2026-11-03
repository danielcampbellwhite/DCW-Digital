"use client";

import * as React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ChevronsDown, Layers, Pause, Play, RotateCcw, RotateCw, Trophy } from "lucide-react";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ── Rules ──────────────────────────────────────────────────────────────── */

const COLS = 10;
const ROWS = 18;
const BEST_KEY = "dcw-stack-overflow-best";

type Pt = [number, number];
interface Shape {
  name: string;
  cells: Pt[];
  hue: number;
  weight: number;
}

/** An original set of "code blocks", from 1 to 5 cells. */
const SHAPES: Shape[] = [
  { name: "dot", cells: [[0, 0]], hue: 186, weight: 1 },
  { name: "pair", cells: [[0, 0], [1, 0]], hue: 162, weight: 2 },
  { name: "bar", cells: [[0, 0], [1, 0], [2, 0]], hue: 205, weight: 3 },
  { name: "corner", cells: [[0, 0], [0, 1], [1, 1]], hue: 262, weight: 3 },
  { name: "hook", cells: [[0, 0], [1, 0], [2, 0], [2, 1]], hue: 38, weight: 3 },
  { name: "bracket", cells: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]], hue: 320, weight: 2 },
  { name: "plus", cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], hue: 140, weight: 1 },
  { name: "line", cells: [[0, 0], [1, 0], [2, 0], [3, 0]], hue: 15, weight: 2 },
];
const BAG = SHAPES.flatMap((s, i) => Array<number>(s.weight).fill(i));
const LEGACY = -1; // garbage cells

const POINTS = [0, 100, 250, 450, 700];

interface Piece {
  shape: number;
  cells: Pt[];
  x: number;
  y: number;
}

interface Game {
  board: number[][]; // -2 empty, -1 legacy, >=0 shape index
  piece: Piece;
  next: number;
  score: number;
  lines: number;
  level: number;
  dropTimer: number;
  legacyTimer: number;
  over: boolean;
  flash: number[]; // rows being cleared
  flashTime: number;
}

type Phase = "idle" | "playing" | "paused" | "over";

const EMPTY = -2;
const emptyBoard = () => Array.from({ length: ROWS }, () => Array<number>(COLS).fill(EMPTY));
const randShape = () => BAG[Math.floor(Math.random() * BAG.length)]!;

function normalise(cells: Pt[]): Pt[] {
  const mx = Math.min(...cells.map((c) => c[0]));
  const my = Math.min(...cells.map((c) => c[1]));
  return cells.map(([x, y]) => [x - mx, y - my]);
}
const rotate = (cells: Pt[]): Pt[] => normalise(cells.map(([x, y]) => [-y, x]));

function spawn(shape: number): Piece {
  const cells = SHAPES[shape]!.cells.map((c) => [...c] as Pt);
  const w = Math.max(...cells.map((c) => c[0])) + 1;
  return { shape, cells, x: Math.floor((COLS - w) / 2), y: 0 };
}

function fits(board: number[][], cells: Pt[], x: number, y: number) {
  return cells.every(([cx, cy]) => {
    const bx = cx + x;
    const by = cy + y;
    return bx >= 0 && bx < COLS && by < ROWS && (by < 0 || board[by]![bx] === EMPTY);
  });
}

const dropInterval = (level: number) => Math.max(90, 750 - (level - 1) * 65);
const legacyInterval = (level: number) => Math.max(12, 28 - level * 1.5);

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Stack Overflow - a falling-blocks puzzle. Fit the code blocks together;
 * a full row compiles and clears. Every so often a row of legacy code rises
 * from the bottom. Let the stack reach the top and it overflows.
 */
export function StackOverflow() {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameRef = React.useRef<Game | null>(null);
  const phaseRef = React.useRef<Phase>("idle");
  const sizeRef = React.useRef({ cell: 24, dpr: 1 });
  const fontRef = React.useRef("monospace");
  const touch = React.useRef<{ x: number; y: number; t: number; moved: boolean } | null>(null);
  const [phase, setPhaseState] = React.useState<Phase>("idle");
  const [hud, setHud] = React.useState({ score: 0, lines: 0, level: 1, next: 0 });
  const [best, setBest] = React.useState(0);
  const bestRef = React.useRef(0);
  const [isBest, setIsBest] = React.useState(false);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };

  React.useEffect(() => {
    try {
      bestRef.current = Number(window.localStorage.getItem(BEST_KEY)) || 0;
      setBest(bestRef.current);
    } catch {
      /* ignore */
    }
    const v = getComputedStyle(document.body).getPropertyValue("--font-jetbrains-mono").trim();
    if (v) fontRef.current = `${v}, ui-monospace, monospace`;
  }, []);

  const sync = () => {
    const g = gameRef.current;
    if (g) setHud({ score: g.score, lines: g.lines, level: g.level, next: g.next });
  };

  /* Sizing: fit 10 columns to the container, capped for tall screens. */
  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const resize = () => {
      const byWidth = Math.floor(wrap.clientWidth / COLS);
      const byHeight = Math.floor((window.innerHeight * 0.62) / ROWS);
      const cell = Math.max(16, Math.min(30, byWidth, byHeight));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cell * COLS * dpr;
      canvas.height = cell * ROWS * dpr;
      canvas.style.width = `${cell * COLS}px`;
      canvas.style.height = `${cell * ROWS}px`;
      sizeRef.current = { cell, dpr };
      draw();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Mechanics ────────────────────────────────────────────────────────── */

  const lock = (g: Game) => {
    for (const [cx, cy] of g.piece.cells) {
      const by = cy + g.piece.y;
      if (by < 0) {
        gameOver(g);
        return;
      }
      g.board[by]![cx + g.piece.x] = g.piece.shape;
    }
    const full = g.board.map((row, i) => (row.every((c) => c !== EMPTY) ? i : -1)).filter((i) => i >= 0);
    if (full.length) {
      g.flash = full;
      g.flashTime = 0.18;
      g.lines += full.length;
      g.score += (POINTS[Math.min(full.length, 4)] ?? 700) * g.level;
      const lvl = Math.floor(g.lines / 8) + 1;
      if (lvl > g.level) {
        g.level = lvl;
        playSound("release");
      } else playSound(full.length > 1 ? "coin" : "select");
    } else {
      playSound("click");
    }
    g.piece = spawn(g.next);
    g.next = randShape();
    if (!fits(g.board, g.piece.cells, g.piece.x, g.piece.y)) gameOver(g);
    sync();
  };

  const clearFlashed = (g: Game) => {
    const keep = g.board.filter((_, i) => !g.flash.includes(i));
    while (keep.length < ROWS) keep.unshift(Array<number>(COLS).fill(EMPTY));
    g.board = keep;
    g.flash = [];
  };

  const addLegacy = (g: Game) => {
    if (g.board[0]!.some((c) => c !== EMPTY)) return gameOver(g);
    const gap = Math.floor(Math.random() * COLS);
    g.board.shift();
    g.board.push(Array.from({ length: COLS }, (_, i) => (i === gap ? EMPTY : LEGACY)));
    // Nudge the falling piece up if it now overlaps.
    if (!fits(g.board, g.piece.cells, g.piece.x, g.piece.y)) {
      if (fits(g.board, g.piece.cells, g.piece.x, g.piece.y - 1)) g.piece.y -= 1;
      else return gameOver(g);
    }
    playSound("miss");
  };

  function gameOver(g: Game) {
    if (g.over) return;
    g.over = true;
    const nb = g.score > bestRef.current;
    if (nb) {
      bestRef.current = g.score;
      setBest(g.score);
      try {
        window.localStorage.setItem(BEST_KEY, String(g.score));
      } catch {
        /* ignore */
      }
    }
    setIsBest(nb);
    sync();
    playSound("crash");
    window.setTimeout(() => {
      setPhase("over");
      playSound(nb ? "finish" : "gameOver");
    }, 500);
    phaseRef.current = "over";
  }

  const move = (dx: number) => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing" || g.flash.length) return;
    if (fits(g.board, g.piece.cells, g.piece.x + dx, g.piece.y)) {
      g.piece.x += dx;
      playSound("click");
    }
  };

  const spin = () => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing" || g.flash.length) return;
    const r = rotate(g.piece.cells);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (fits(g.board, r, g.piece.x + kick, g.piece.y)) {
        g.piece.cells = r;
        g.piece.x += kick;
        playSound("select");
        return;
      }
    }
  };

  const softDrop = () => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing" || g.flash.length) return;
    if (fits(g.board, g.piece.cells, g.piece.x, g.piece.y + 1)) {
      g.piece.y += 1;
      g.score += 1;
      g.dropTimer = 0;
    } else lock(g);
  };

  const hardDrop = () => {
    const g = gameRef.current;
    if (!g || phaseRef.current !== "playing" || g.flash.length) return;
    let d = 0;
    while (fits(g.board, g.piece.cells, g.piece.x, g.piece.y + 1)) {
      g.piece.y += 1;
      d += 1;
    }
    g.score += d * 2;
    lock(g);
  };

  const step = (dt: number) => {
    const g = gameRef.current;
    if (!g || g.over) return;
    if (g.flash.length) {
      g.flashTime -= dt;
      if (g.flashTime <= 0) clearFlashed(g);
      return;
    }
    g.dropTimer += dt * 1000;
    if (g.dropTimer >= dropInterval(g.level)) {
      g.dropTimer = 0;
      if (fits(g.board, g.piece.cells, g.piece.x, g.piece.y + 1)) g.piece.y += 1;
      else lock(g);
    }
    g.legacyTimer -= dt;
    if (g.legacyTimer <= 0) {
      g.legacyTimer = legacyInterval(g.level);
      addLegacy(g);
    }
  };

  /* ── Drawing ──────────────────────────────────────────────────────────── */

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { cell, dpr } = sizeRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#050816";
    ctx.fillRect(0, 0, cell * COLS, cell * ROWS);

    // Gutter grid.
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell + 0.5, 0);
      ctx.lineTo(x * cell + 0.5, ROWS * cell);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell + 0.5);
      ctx.lineTo(COLS * cell, y * cell + 0.5);
      ctx.stroke();
    }

    const g = gameRef.current;
    if (!g) return;

    const block = (x: number, y: number, kind: number, alpha = 1, ghost = false) => {
      const px = x * cell + 1.5;
      const py = y * cell + 1.5;
      const s = cell - 3;
      ctx.globalAlpha = alpha;
      if (kind === LEGACY) {
        ctx.fillStyle = "rgba(148,163,184,0.22)";
        ctx.strokeStyle = "rgba(148,163,184,0.45)";
      } else {
        const hue = SHAPES[kind]!.hue;
        ctx.fillStyle = ghost ? "transparent" : `hsla(${hue}, 90%, 55%, 0.28)`;
        ctx.strokeStyle = `hsla(${hue}, 95%, 62%, ${ghost ? 0.45 : 1})`;
      }
      ctx.lineWidth = ghost ? 1 : 1.5;
      ctx.beginPath();
      if (typeof ctx.roundRect === "function") ctx.roundRect(px, py, s, s, Math.max(2, cell * 0.15));
      else ctx.rect(px, py, s, s);
      if (!ghost) ctx.fill();
      ctx.stroke();
      if (kind === LEGACY && !ghost) {
        // A little "//" so legacy rows read as old code.
        ctx.fillStyle = "rgba(148,163,184,0.55)";
        ctx.font = `600 ${Math.floor(cell * 0.4)}px ${fontRef.current}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("//", px + s / 2, py + s / 2 + 0.5);
      }
      ctx.globalAlpha = 1;
    };

    g.board.forEach((row, y) => row.forEach((c, x) => c !== EMPTY && block(x, y, c, g.flash.includes(y) ? 0.35 : 1)));

    // Rows being compiled flash white.
    for (const y of g.flash) {
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, g.flashTime / 0.18) * 0.7})`;
      ctx.fillRect(0, y * cell, COLS * cell, cell);
    }

    if (!g.over && !g.flash.length) {
      // Ghost: where the piece will land.
      let gy = g.piece.y;
      while (fits(g.board, g.piece.cells, g.piece.x, gy + 1)) gy++;
      for (const [cx, cy] of g.piece.cells) if (cy + gy >= 0) block(cx + g.piece.x, cy + gy, g.piece.shape, 1, true);
      for (const [cx, cy] of g.piece.cells) if (cy + g.piece.y >= 0) block(cx + g.piece.x, cy + g.piece.y, g.piece.shape);
    }

    // Legacy warning bar along the bottom.
    if (!g.over) {
      const frac = Math.max(0, Math.min(1, g.legacyTimer / legacyInterval(g.level)));
      ctx.fillStyle = frac < 0.2 ? "rgba(248,113,113,0.8)" : "rgba(148,163,184,0.35)";
      ctx.fillRect(0, ROWS * cell - 3, COLS * cell * (1 - frac), 3);
    }
  };

  /* Loop */
  React.useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (phaseRef.current === "playing") step(dt);
      draw();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Pause when the tab is hidden or the window loses focus. */
  React.useEffect(() => {
    const pause = () => phaseRef.current === "playing" && setPhase("paused");
    const onVis = () => document.hidden && pause();
    window.addEventListener("blur", pause);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("blur", pause);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const start = () => {
    unlockAudio();
    const first = randShape();
    gameRef.current = {
      board: emptyBoard(),
      piece: spawn(first),
      next: randShape(),
      score: 0,
      lines: 0,
      level: 1,
      dropTimer: 0,
      legacyTimer: legacyInterval(1),
      over: false,
      flash: [],
      flashTime: 0,
    };
    setIsBest(false);
    sync();
    setPhase("playing");
    playSound("start");
    wrapRef.current?.focus({ preventScroll: true });
  };

  const resume = () => {
    setPhase("playing");
    wrapRef.current?.focus({ preventScroll: true });
  };

  /* Keyboard: only while this game is playing. */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (phaseRef.current === "paused" && (e.key === "p" || e.key === "P" || e.key === "Enter")) {
        e.preventDefault();
        return resume();
      }
      if (phaseRef.current !== "playing") return;
      const keys: Record<string, () => void> = {
        ArrowLeft: () => move(-1),
        ArrowRight: () => move(1),
        ArrowUp: spin,
        x: spin,
        ArrowDown: softDrop,
        " ": hardDrop,
        p: () => setPhase("paused"),
        P: () => setPhase("paused"),
        Escape: () => setPhase("paused"),
      };
      const fn = keys[e.key];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Touch on the board: tap rotates, swipe left/right moves, swipe down drops. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (phaseRef.current !== "playing" || e.pointerType === "mouse") return;
    touch.current = { x: e.clientX, y: e.clientY, t: Date.now(), moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const t = touch.current;
    if (!t) return;
    const { cell } = sizeRef.current;
    const dx = e.clientX - t.x;
    if (Math.abs(dx) >= cell) {
      move(Math.sign(dx));
      t.x = e.clientX;
      t.moved = true;
    }
    if (e.clientY - t.y > cell * 3 && !t.moved) {
      hardDrop();
      touch.current = null;
    }
  };
  const onPointerUp = () => {
    const t = touch.current;
    touch.current = null;
    if (t && !t.moved && Date.now() - t.t < 300) spin();
  };

  const nextShape = SHAPES[hud.next]!;
  const nextW = Math.max(...nextShape.cells.map((c) => c[0])) + 1;
  const nextH = Math.max(...nextShape.cells.map((c) => c[1])) + 1;

  const ctrl = (label: string, Icon: React.ComponentType<{ className?: string }>, fn: () => void) => (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        fn();
      }}
      className="grid h-12 place-items-center rounded-xl border border-border bg-surface/60 text-foreground active:bg-primary/20"
    >
      <Icon className="size-5" />
    </button>
  );

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3 font-mono text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Layers className="size-4 text-primary" /> {hud.score}
        </span>
        <span className="text-muted-foreground">
          lines {hud.lines} · lvl {hud.level}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Best score">
            <Trophy className="size-4 text-accent" /> {best}
          </span>
          {phase === "playing" && (
            <button
              type="button"
              onClick={() => setPhase("paused")}
              aria-label="Pause"
              className="grid size-9 place-items-center rounded-lg border border-border hover:text-foreground"
            >
              <Pause className="size-4" />
            </button>
          )}
          <SoundToggle />
        </span>
      </div>

      <div className="mt-3 flex items-start justify-center gap-3">
        <div
          ref={wrapRef}
          tabIndex={0}
          role="application"
          aria-label="Stack Overflow. Arrow keys move and rotate, space drops, P pauses."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (touch.current = null)}
          className="relative min-w-0 flex-1 touch-none select-none outline-none"
        >
          <canvas ref={canvasRef} className="mx-auto block rounded-xl border border-border" aria-hidden />
          {phase !== "playing" && (
            <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/75 p-4 backdrop-blur-sm">
              <div className="max-w-[15rem] text-center">
                {phase === "idle" && (
                  <>
                    <Layers className="mx-auto size-9 text-primary" />
                    <h3 className="mt-2 font-heading text-xl font-bold">Stack Overflow</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Fit the code blocks together. A full row compiles and clears. Watch
                      out for legacy code rising from below.
                    </p>
                  </>
                )}
                {phase === "paused" && <h3 className="font-heading text-xl font-bold">Paused</h3>}
                {phase === "over" && (
                  <div aria-live="polite">
                    <p className="text-xs uppercase tracking-wider text-red-400">Stack overflow</p>
                    <p className={cn("mt-1 font-heading text-3xl font-bold", isBest && "text-accent")}>{hud.score}</p>
                    <p className="text-xs text-muted-foreground">
                      {hud.lines} lines · {isBest ? "new best!" : `best ${best}`}
                    </p>
                  </div>
                )}
                <Button onClick={phase === "paused" ? resume : start} variant="primary" size="sm" className="mt-4">
                  {phase === "over" ? <RotateCcw className="size-4" /> : <Play className="size-4" />}
                  {phase === "idle" ? "Start" : phase === "paused" ? "Resume" : "Play again"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Next piece */}
        <div className="w-16 shrink-0 text-center">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">next</p>
          <div className="mt-1 grid aspect-square place-items-center rounded-xl border border-border bg-background/50 p-1.5">
            <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${nextW}, 10px)`, gridTemplateRows: `repeat(${nextH}, 10px)` }}>
              {nextShape.cells.map(([x, y], i) => (
                <span
                  key={i}
                  className="rounded-[2px] border"
                  style={{
                    gridColumn: x + 1,
                    gridRow: y + 1,
                    borderColor: `hsl(${nextShape.hue} 95% 62%)`,
                    background: `hsl(${nextShape.hue} 90% 55% / 0.3)`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Touch controls */}
      <div className="mt-3 grid grid-cols-5 gap-2 select-none touch-manipulation sm:hidden">
        {ctrl("Move left", ArrowLeft, () => move(-1))}
        {ctrl("Rotate", RotateCw, spin)}
        {ctrl("Move right", ArrowRight, () => move(1))}
        {ctrl("Move down", ArrowDown, softDrop)}
        {ctrl("Drop", ChevronsDown, hardDrop)}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        <span className="hidden sm:inline">← → move · ↑ rotate · ↓ faster · space drops · P pauses</span>
        <span className="sm:hidden">Tap the board to rotate, swipe to move, swipe down to drop</span>
      </p>
    </div>
  );
}
