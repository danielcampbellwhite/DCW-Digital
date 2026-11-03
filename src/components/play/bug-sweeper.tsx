"use client";

import * as React from "react";
import { Bug, Flag, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { cn } from "@/lib/utils";

/* ── Setup ──────────────────────────────────────────────────────────────── */

const LEVELS = {
  easy: { label: "Easy", cols: 9, rows: 9, bugs: 10 },
  medium: { label: "Medium", cols: 12, rows: 12, bugs: 24 },
  hard: { label: "Hard", cols: 16, rows: 16, bugs: 40 },
} as const;
type Level = keyof typeof LEVELS;

const BEST_KEY = "dcw-bug-sweeper-best";

interface Cell {
  bug: boolean;
  open: boolean;
  flag: boolean;
  n: number;
}
type Status = "ready" | "playing" | "won" | "lost";

const NUM_COLOURS = [
  "",
  "text-primary",
  "text-accent",
  "text-red-400",
  "text-violet-400",
  "text-amber-400",
  "text-teal-300",
  "text-pink-400",
  "text-slate-300",
];

const blank = (count: number): Cell[] => Array.from({ length: count }, () => ({ bug: false, open: false, flag: false, n: 0 }));

function neighbours(i: number, cols: number, rows: number) {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out: number[] = [];
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx);
    }
  return out;
}

/** Place bugs anywhere except the first-clicked cell and its neighbours. */
function plant(level: Level, safe: number): Cell[] {
  const { cols, rows, bugs } = LEVELS[level];
  const cells = blank(cols * rows);
  const banned = new Set([safe, ...neighbours(safe, cols, rows)]);
  const spots = cells.map((_, i) => i).filter((i) => !banned.has(i));
  for (let k = 0; k < bugs; k++) {
    const j = k + Math.floor(Math.random() * (spots.length - k));
    [spots[k], spots[j]] = [spots[j]!, spots[k]!];
    cells[spots[k]!]!.bug = true;
  }
  cells.forEach((c, i) => {
    c.n = neighbours(i, cols, rows).filter((j) => cells[j]!.bug).length;
  });
  return cells;
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Bug Sweeper - clear the codebase without opening a file that hides a bug.
 * Numbers show how many bugs are in the 8 cells around them.
 */
export function BugSweeper() {
  const [level, setLevel] = React.useState<Level>("easy");
  const [cells, setCells] = React.useState<Cell[]>(() => blank(81));
  const [status, setStatus] = React.useState<Status>("ready");
  const [startedAt, setStartedAt] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [flagMode, setFlagMode] = React.useState(false);
  const [boom, setBoom] = React.useState<number | null>(null);
  const [best, setBest] = React.useState<Partial<Record<Level, number>>>({});
  const [touch, setTouch] = React.useState(false);
  const cellRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const press = React.useRef<{ timer: number; i: number; fired: boolean } | null>(null);

  const { cols, rows, bugs } = LEVELS[level];

  React.useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    try {
      setBest(JSON.parse(window.localStorage.getItem(BEST_KEY) ?? "{}"));
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (status !== "playing") return;
    const iv = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(iv);
  }, [status, startedAt]);

  const reset = (lv: Level = level) => {
    const L = LEVELS[lv];
    setLevel(lv);
    setCells(blank(L.cols * L.rows));
    setStatus("ready");
    setElapsed(0);
    setBoom(null);
  };

  const finish = (next: Cell[], won: boolean, hit?: number, started = startedAt) => {
    if (won) {
      next.forEach((c) => c.bug && (c.flag = true));
      const secs = Math.max(1, Math.round((Date.now() - started) / 1000));
      setElapsed(secs);
      setBest((b) => {
        const prev = b[level];
        if (prev !== undefined && prev <= secs) return b;
        const nb = { ...b, [level]: secs };
        try {
          window.localStorage.setItem(BEST_KEY, JSON.stringify(nb));
        } catch {
          /* ignore */
        }
        return nb;
      });
      playSound("finish");
      setStatus("won");
    } else {
      setBoom(hit ?? null);
      playSound("crash");
      setStatus("lost");
    }
  };

  const openCell = (i: number) => {
    if (status === "won" || status === "lost") return;
    let board = cells;
    let started = startedAt;
    if (status === "ready") {
      unlockAudio();
      board = plant(level, i);
      started = Date.now();
      setStartedAt(started);
      setStatus("playing");
    }
    const c = board[i]!;
    if (c.flag) return;
    const next = board.map((x) => ({ ...x }));

    // Chord: a revealed number with exactly that many flags around it.
    if (c.open) {
      const around = neighbours(i, cols, rows);
      const flags = around.filter((j) => next[j]!.flag).length;
      if (!c.n || flags !== c.n) return;
      for (const j of around) {
        if (!next[j]!.flag && !next[j]!.open) {
          if (next[j]!.bug) {
            next.forEach((x) => x.bug && (x.open = true));
            setCells(next);
            return finish(next, false, j);
          }
          flood(next, j);
        }
      }
      playSound("select");
    } else if (c.bug) {
      next.forEach((x) => x.bug && (x.open = true));
      setCells(next);
      return finish(next, false, i);
    } else {
      flood(next, i);
      playSound(c.n === 0 ? "select" : "click");
    }

    setCells(next);
    if (next.every((x) => x.bug || x.open)) finish(next, true, undefined, started);
  };

  const flood = (board: Cell[], start: number) => {
    const stack = [start];
    while (stack.length) {
      const i = stack.pop()!;
      const c = board[i]!;
      if (c.open || c.flag) continue;
      c.open = true;
      if (c.n === 0) for (const j of neighbours(i, cols, rows)) if (!board[j]!.open) stack.push(j);
    }
  };

  const toggleFlag = (i: number) => {
    if (status !== "playing") return;
    const c = cells[i]!;
    if (c.open) return;
    const next = cells.map((x) => ({ ...x }));
    next[i]!.flag = !c.flag;
    setCells(next);
    playSound("select");
    if ("vibrate" in navigator) navigator.vibrate?.(10);
  };

  const act = (i: number) => (flagMode && !cells[i]!.open ? toggleFlag(i) : openCell(i));

  /* Long-press to flag on touch screens. */
  const onPointerDown = (i: number) => (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    press.current = {
      i,
      fired: false,
      timer: window.setTimeout(() => {
        if (press.current) press.current.fired = true;
        toggleFlag(i);
      }, 380),
    };
  };
  const cancelPress = () => {
    if (press.current) window.clearTimeout(press.current.timer);
  };
  const onClick = (i: number) => () => {
    if (press.current?.fired && press.current.i === i) {
      press.current = null;
      return;
    }
    press.current = null;
    act(i);
  };

  const onKeyDown = (i: number) => (e: React.KeyboardEvent) => {
    const x = i % cols;
    const y = Math.floor(i / cols);
    let target: number | null = null;
    if (e.key === "ArrowRight" && x < cols - 1) target = i + 1;
    if (e.key === "ArrowLeft" && x > 0) target = i - 1;
    if (e.key === "ArrowDown" && y < rows - 1) target = i + cols;
    if (e.key === "ArrowUp" && y > 0) target = i - cols;
    if (target !== null) {
      e.preventDefault();
      cellRefs.current[target]?.focus();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFlag(i);
    }
  };

  const flagsUsed = cells.filter((c) => c.flag).length;
  const done = status === "won" || status === "lost";

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-4 sm:p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5" role="radiogroup" aria-label="Difficulty">
          {(Object.keys(LEVELS) as Level[]).map((lv) => (
            <button
              key={lv}
              type="button"
              role="radio"
              aria-checked={level === lv}
              onClick={() => reset(lv)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm transition-colors",
                level === lv ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {LEVELS[lv].label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="inline-flex items-center gap-1 text-red-400" aria-label={`${bugs - flagsUsed} bugs left`}>
            <Bug className="size-4" /> {bugs - flagsUsed}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Timer className="size-4" /> {elapsed}s
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground" title="Best time">
            <Trophy className="size-4 text-accent" /> {best[level] ? `${best[level]}s` : "-"}
          </span>
          <SoundToggle />
        </div>
      </div>

      {/* Board */}
      <div className="mt-4 overflow-x-auto pb-1">
        <div
          className="mx-auto grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            width: `min(100%, ${cols * 38}px)`,
            minWidth: `${cols * 24}px`,
          }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {cells.map((c, i) => {
            const shown = c.open;
            const wrongFlag = status === "lost" && c.flag && !c.bug;
            const label = shown
              ? c.bug
                ? "bug"
                : c.n
                  ? `${c.n} bugs nearby`
                  : "clear"
              : c.flag
                ? "flagged"
                : "hidden";
            return (
              <button
                key={i}
                ref={(el) => {
                  cellRefs.current[i] = el;
                }}
                type="button"
                aria-label={`Row ${Math.floor(i / cols) + 1}, column ${(i % cols) + 1}: ${label}`}
                onClick={onClick(i)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(i);
                }}
                onPointerDown={onPointerDown(i)}
                onPointerUp={cancelPress}
                onPointerLeave={cancelPress}
                onPointerCancel={cancelPress}
                onKeyDown={onKeyDown(i)}
                className={cn(
                  "grid aspect-square touch-manipulation select-none place-items-center rounded-[5px] font-mono text-sm font-bold leading-none transition-colors sm:text-base",
                  shown
                    ? c.bug
                      ? boom === i
                        ? "border border-red-500/60 bg-red-500/45"
                        : "border border-red-500/25 bg-red-500/15"
                      : // Cleared: flat, dark and sunken.
                        "border border-foreground/[0.06] bg-black/45 shadow-[inset_0_2px_4px_rgb(0_0_0/0.55)]"
                    : // Untapped: raised like a key, lighter on top, with a highlight and drop shadow.
                      cn(
                        "border border-foreground/25 bg-gradient-to-b from-foreground/[0.16] to-foreground/[0.06]",
                        "shadow-[inset_0_1px_0_hsl(var(--foreground)/0.22),0_2px_0_rgb(0_0_0/0.55)]",
                        !done && "hover:border-primary/70 hover:from-primary/30 hover:to-primary/10 active:translate-y-px active:shadow-none"
                      )
                )}
              >
                {shown ? (
                  c.bug ? (
                    <Bug className="size-[60%] text-red-400" />
                  ) : c.n ? (
                    <span className={NUM_COLOURS[c.n]}>{c.n}</span>
                  ) : null
                ) : wrongFlag ? (
                  <X className="size-[60%] text-red-400" />
                ) : c.flag ? (
                  <Flag className="size-[55%] text-amber-400" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" aria-live="polite">
          {status === "won" ? (
            <span className="font-medium text-accent">
              Codebase clean in {elapsed}s{best[level] === elapsed ? " - new best!" : "."}
            </span>
          ) : status === "lost" ? (
            <span className="font-medium text-red-400">You opened a bug. Production is down.</span>
          ) : (
            <span className="text-muted-foreground">
              {touch ? "Tap to open, long-press to flag." : "Click to open, right-click to flag."} Numbers count nearby bugs.
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFlagMode((v) => !v)}
            aria-pressed={flagMode}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
              flagMode ? "border-amber-400 bg-amber-400/15 text-amber-300" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Flag className="size-4" /> Flag mode {flagMode ? "on" : "off"}
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary/50"
          >
            <RotateCcw className="size-4" /> New game
          </button>
        </div>
      </div>
    </div>
  );
}
