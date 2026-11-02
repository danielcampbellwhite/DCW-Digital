"use client";

import * as React from "react";
import { Bug, Sparkles, Play, RotateCcw, Trophy, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";

type Kind = "bug" | "feature";
type Cell = { id: number; kind: Kind; hit?: boolean } | null;
type Phase = "idle" | "playing" | "over";

const GAME_SECONDS = 30;
const CELLS = 9;
const BEST_KEY = "dcw-bug-squash-best";

const empty = (): Cell[] => Array.from({ length: CELLS }, () => null);

/**
 * Bug Squash - a 30-second whack-a-mole with a developer twist. Squash the
 * bugs that pop up on the "code lines", but leave the features alone.
 * Works with mouse, touch and keys 1-9. Best score is kept in localStorage.
 */
export function BugSquash() {
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [cells, setCells] = React.useState<Cell[]>(empty);
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(GAME_SECONDS);
  const [best, setBest] = React.useState(0);
  const [message, setMessage] = React.useState("");

  const cellsRef = React.useRef<Cell[]>(empty());
  const phaseRef = React.useRef<Phase>("idle");
  const timers = React.useRef<number[]>([]);
  const idRef = React.useRef(0);
  const startedAt = React.useRef(0);

  const commit = React.useCallback((next: Cell[]) => {
    cellsRef.current = next;
    setCells(next);
  }, []);

  const clearTimers = React.useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  // Load best score (storage can be unavailable in private mode).
  React.useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* ignore */
    }
    return () => clearTimers();
  }, [clearTimers]);

  // Spawn loop: gets faster as the round goes on.
  const spawn = React.useCallback(() => {
    if (phaseRef.current !== "playing") return;
    const elapsed = (Date.now() - startedAt.current) / 1000;
    const free = cellsRef.current
      .map((c, i) => (c ? -1 : i))
      .filter((i) => i >= 0);

    if (free.length > 0) {
      const idx = free[Math.floor(Math.random() * free.length)] as number;
      const id = ++idRef.current;
      const kind: Kind = Math.random() < 0.22 ? "feature" : "bug";
      const next = [...cellsRef.current];
      next[idx] = { id, kind };
      commit(next);

      const life = Math.max(650, 1250 - elapsed * 18);
      later(() => {
        if (cellsRef.current[idx]?.id === id) {
          const n = [...cellsRef.current];
          n[idx] = null;
          commit(n);
        }
      }, life);
    }

    const gap = Math.max(380, 850 - elapsed * 16);
    later(spawn, gap);
  }, [commit]);

  const start = () => {
    unlockAudio();
    playSound("start");
    clearTimers();
    commit(empty());
    setScore(0);
    setTimeLeft(GAME_SECONDS);
    setMessage("Go!");
    startedAt.current = Date.now();
    phaseRef.current = "playing";
    setPhase("playing");
    later(spawn, 400);
  };

  // Tick for the last few seconds.
  React.useEffect(() => {
    if (phase === "playing" && timeLeft > 0 && timeLeft <= 5) playSound("tick");
  }, [phase, timeLeft]);

  // Countdown.
  React.useEffect(() => {
    if (phase !== "playing") return;
    const iv = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  // End of round.
  React.useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;
    phaseRef.current = "over";
    clearTimers();
    commit(empty());
    setPhase("over");
    setBest((b) => {
      const nb = Math.max(b, score);
      try {
        window.localStorage.setItem(BEST_KEY, String(nb));
      } catch {
        /* ignore */
      }
      return nb;
    });
    setMessage(score > best ? "New best score!" : "Time's up!");
    playSound(score > best ? "finish" : "gameOver");
  }, [phase, timeLeft, score, best, clearTimers, commit]);

  const hit = React.useCallback(
    (i: number) => {
      if (phaseRef.current !== "playing") return;
      const c = cellsRef.current[i];
      if (!c || c.hit) return;
      const next = [...cellsRef.current];
      next[i] = { ...c, hit: true };
      commit(next);
      if (c.kind === "bug") {
        playSound("splat");
        setScore((s) => s + 10);
        setMessage("Squashed!");
      } else {
        playSound("wrong");
        setScore((s) => Math.max(0, s - 15));
        setMessage("Oops, that was a feature!");
      }
      later(() => {
        if (cellsRef.current[i]?.id === c.id) {
          const n = [...cellsRef.current];
          n[i] = null;
          commit(n);
        }
      }, 220);
    },
    [commit]
  );

  // Keys 1-9 hit the matching line.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) hit(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hit]);

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-5 sm:p-7">
      {/* Scoreboard */}
      <div className="flex items-center justify-between gap-3 font-mono text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground">
          <Bug className="size-4 text-red-400" /> {score}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            timeLeft <= 5 && phase === "playing" ? "text-red-400" : "text-muted-foreground"
          )}
        >
          <Timer className="size-4" /> {timeLeft}s
        </span>
        <span className="inline-flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-4 text-accent" /> {best}
          </span>
          <SoundToggle />
        </span>
      </div>

      {/* Board */}
      <div className="relative mt-5">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          {cells.map((c, i) => {
            const label = !c
              ? `Line ${i + 1}, empty`
              : c.kind === "bug"
                ? `Line ${i + 1}, bug - squash it`
                : `Line ${i + 1}, feature - leave it`;
            return (
              <button
                key={i}
                type="button"
                onClick={() => hit(i)}
                disabled={phase !== "playing"}
                aria-label={label}
                className={cn(
                  "relative flex aspect-square flex-col items-start justify-between rounded-xl border bg-surface/60 p-2.5 text-left transition-colors",
                  "border-border hover:border-primary/40 disabled:cursor-default",
                  c?.kind === "bug" && !c.hit && "border-red-400/50 bg-red-500/10",
                  c?.kind === "feature" && !c.hit && "border-accent/50 bg-accent/10"
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="block h-1.5 w-3/4 rounded bg-muted-foreground/20" />
                <span className="block h-1.5 w-1/2 rounded bg-muted-foreground/20" />
                {c && (
                  <span
                    className={cn(
                      "absolute inset-0 grid place-items-center transition-transform duration-150",
                      c.hit ? "scale-50 opacity-0" : "scale-100 opacity-100"
                    )}
                    aria-hidden
                  >
                    {c.kind === "bug" ? (
                      <Bug className="size-9 text-red-400 sm:size-11" />
                    ) : (
                      <Sparkles className="size-9 text-accent sm:size-11" />
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Start / game over overlay */}
        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/80 backdrop-blur-sm">
            <div className="px-4 text-center">
              {phase === "over" && (
                <p className="font-heading text-2xl font-bold">
                  {score} points
                </p>
              )}
              {phase === "over" && (
                <p className="mt-1 text-sm text-muted-foreground">{message}</p>
              )}
              {phase === "idle" && (
                <p className="max-w-xs text-sm text-muted-foreground">
                  Squash the <span className="text-red-400">bugs</span>, leave the{" "}
                  <span className="text-accent">features</span> alone. You&apos;ve got
                  30 seconds.
                </p>
              )}
              <Button onClick={start} variant="primary" className="mt-4">
                {phase === "idle" ? (
                  <>
                    <Play className="size-4" /> Start
                  </>
                ) : (
                  <>
                    <RotateCcw className="size-4" /> Play again
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 h-5 text-center text-sm text-muted-foreground" aria-live="polite">
        {phase === "playing" ? message : ""}
      </p>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        Bug +10 · Feature -15 · Keys 1-9 work too
      </p>
    </div>
  );
}
