"use client";

import * as React from "react";
import {
  Bug,
  Coffee,
  Cpu,
  Database,
  GitBranch,
  GitMerge,
  RotateCcw,
  Server,
  SquareTerminal,
  Timer,
  Trophy,
  Footprints,
  type LucideIcon,
} from "lucide-react";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { cn } from "@/lib/utils";

const ICONS: { icon: LucideIcon; label: string; colour: string }[] = [
  { icon: GitBranch, label: "branch", colour: "text-primary" },
  { icon: GitMerge, label: "merge", colour: "text-accent" },
  { icon: Bug, label: "bug", colour: "text-red-400" },
  { icon: Coffee, label: "coffee", colour: "text-amber-400" },
  { icon: Database, label: "database", colour: "text-violet-400" },
  { icon: Server, label: "server", colour: "text-sky-400" },
  { icon: SquareTerminal, label: "terminal", colour: "text-emerald-400" },
  { icon: Cpu, label: "cpu", colour: "text-pink-400" },
];

const BEST_KEY = "dcw-merge-conflict-best";

interface Card {
  id: number;
  pair: number;
  matched: boolean;
}

function deal(): Card[] {
  const cards = ICONS.flatMap((_, pair) => [pair, pair]).map((pair, id) => ({ id, pair, matched: false }));
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

/**
 * Merge Conflict - a memory game. Flip two cards at a time to find matching
 * pairs and resolve all eight conflicts in as few moves as possible.
 */
export function MergeConflict() {
  const [cards, setCards] = React.useState<Card[]>(deal);
  const [open, setOpen] = React.useState<number[]>([]);
  const [moves, setMoves] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [best, setBest] = React.useState<number | null>(null);
  const [newBest, setNewBest] = React.useState(false);
  const lock = React.useRef(false);

  React.useEffect(() => {
    try {
      const v = Number(window.localStorage.getItem(BEST_KEY));
      if (v > 0) setBest(v);
    } catch {
      /* ignore */
    }
  }, []);

  React.useEffect(() => {
    if (!startedAt || done) return;
    const iv = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 250);
    return () => window.clearInterval(iv);
  }, [startedAt, done]);

  const reset = () => {
    setCards(deal());
    setOpen([]);
    setMoves(0);
    setStartedAt(null);
    setElapsed(0);
    setDone(false);
    setNewBest(false);
    lock.current = false;
  };

  const flip = (i: number) => {
    const card = cards[i]!;
    if (lock.current || done || card.matched || open.includes(i)) return;
    if (!startedAt) {
      unlockAudio();
      setStartedAt(Date.now());
    }
    playSound("click");
    const next = [...open, i];
    setOpen(next);
    if (next.length < 2) return;

    const [a, b] = next as [number, number];
    const m = moves + 1;
    setMoves(m);
    if (cards[a]!.pair === cards[b]!.pair) {
      const nextCards = cards.map((c, k) => (k === a || k === b ? { ...c, matched: true } : c));
      setCards(nextCards);
      setOpen([]);
      if (nextCards.every((c) => c.matched)) {
        setDone(true);
        playSound("finish");
        if (best === null || m < best) {
          setBest(m);
          setNewBest(true);
          try {
            window.localStorage.setItem(BEST_KEY, String(m));
          } catch {
            /* ignore */
          }
        }
      } else {
        playSound("coin");
      }
    } else {
      lock.current = true;
      window.setTimeout(() => {
        playSound("miss");
        setOpen([]);
        lock.current = false;
      }, 750);
    }
  };

  const resolved = cards.filter((c) => c.matched).length / 2;

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-sm">
        <span className="inline-flex items-center gap-1.5 text-accent">
          <GitMerge className="size-4" /> {resolved}/{ICONS.length} resolved
        </span>
        <span className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1" title="Moves">
            <Footprints className="size-4" /> {moves}
          </span>
          <span className="inline-flex items-center gap-1">
            <Timer className="size-4" /> {elapsed}s
          </span>
          <span className="inline-flex items-center gap-1" title="Fewest moves">
            <Trophy className="size-4 text-accent" /> {best ?? "-"}
          </span>
          <SoundToggle />
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((c, i) => {
          const faceUp = c.matched || open.includes(i);
          const { icon: Icon, label, colour } = ICONS[c.pair]!;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => flip(i)}
              aria-label={faceUp ? `${label}${c.matched ? ", matched" : ""}` : "Hidden card"}
              className="aspect-square [perspective:600px]"
            >
              <span
                className={cn(
                  "relative block size-full transition-transform duration-300 [transform-style:preserve-3d]",
                  faceUp && "[transform:rotateY(180deg)]"
                )}
              >
                {/* Back */}
                <span className="absolute inset-0 grid place-items-center rounded-xl border border-foreground/25 bg-gradient-to-b from-foreground/[0.16] to-foreground/[0.06] font-mono text-xs text-muted-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.2),0_2px_0_rgb(0_0_0/0.5)] [backface-visibility:hidden]">
                  {"<<<"}
                </span>
                {/* Front */}
                <span
                  className={cn(
                    "absolute inset-0 grid place-items-center rounded-xl border bg-background/70 [backface-visibility:hidden] [transform:rotateY(180deg)]",
                    c.matched ? "border-accent/50 bg-accent/10" : "border-primary/50"
                  )}
                >
                  <Icon className={cn("size-1/2", colour)} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm" aria-live="polite">
          {done ? (
            <span className="font-medium text-accent">
              All conflicts resolved in {moves} moves{newBest ? " - new best!" : "."}
            </span>
          ) : (
            <span className="text-muted-foreground">Flip two cards at a time. Match all 8 pairs in as few moves as you can.</span>
          )}
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-primary/50"
        >
          <RotateCcw className="size-4" /> New game
        </button>
      </div>
    </div>
  );
}
