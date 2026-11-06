"use client";

import * as React from "react";
import { Flame, Lightbulb, Play, RotateCcw, SkipForward, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { submitScore, WeeklyRank } from "@/components/play/weekly-leaderboard";
import { DEV_WORDS, EASY_WORDS, type HangmanWord } from "./hangman-words";

type Mode = "dev" | "easy";
type Phase = "idle" | "playing" | "won" | "lost";

const LIVES = 7;
const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");
const BEST_KEY = "dcw-hangman-best";

const isLetter = (c: string) => c >= "a" && c <= "z";

/** Points for solving a word: more for longer words and fewer mistakes. Easy words score half. */
function wordPoints(word: string, livesLeft: number, hinted: boolean, mode: Mode) {
  const unique = new Set(word.replace(/[^a-z]/g, "")).size;
  const pts = unique * 10 + livesLeft * 15;
  return Math.round((hinted ? pts / 2 : pts) * (mode === "easy" ? 0.5 : 1));
}

/* ── The drawing: every wrong guess adds a piece to the bug ─────────────── */

function BugDrawing({ wrong, lost }: { wrong: number; lost: boolean }) {
  const stroke = lost ? "#f87171" : "hsl(var(--primary))";
  const show = (n: number) => (wrong >= n ? "opacity-100" : "opacity-0");
  return (
    <svg viewBox="0 0 200 170" className="h-full w-full" aria-hidden>
      {/* Laptop it's crawling out of */}
      <path d="M40 150 h120 l12 12 H28 Z" fill="hsl(var(--surface))" stroke="hsl(var(--border))" strokeWidth="2" />
      <rect x="48" y="96" width="104" height="54" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="2" />
      <text x="58" y="114" className="fill-muted-foreground font-mono" fontSize="8">
        {lost ? "$ git push --force" : "$ npm run build"}
      </text>
      <text x="58" y="126" fill={lost ? "#f87171" : "#00ffb3"} className="font-mono" fontSize="8">
        {lost ? "shipped to production" : wrong ? `${LIVES - wrong} tries left` : "all tests passing"}
      </text>
      <g stroke={stroke} strokeWidth="3" strokeLinecap="round" fill="none" className="[&>*]:transition-opacity [&>*]:duration-300">
        {/* 1: body */}
        <ellipse cx="100" cy="62" rx="20" ry="26" className={show(1)} fill={lost ? "rgba(248,113,113,0.15)" : "rgba(0,229,255,0.08)"} />
        {/* 2: head */}
        <circle cx="100" cy="28" r="11" className={show(2)} />
        {/* 3: left legs */}
        <path d="M81 50 L62 40 M80 63 L58 63 M81 76 L62 88" className={show(3)} />
        {/* 4: right legs */}
        <path d="M119 50 L138 40 M120 63 L142 63 M119 76 L138 88" className={show(4)} />
        {/* 5: antennae */}
        <path d="M95 18 Q88 6 80 6 M105 18 Q112 6 120 6" className={show(5)} />
        {/* 6: shell line + spots */}
        <g className={show(6)}>
          <path d="M100 37 L100 88" />
          <circle cx="91" cy="58" r="3" fill={stroke} />
          <circle cx="109" cy="70" r="3" fill={stroke} />
        </g>
        {/* 7: angry eyes */}
        <path d="M93 25 l5 3 M107 25 l-5 3" className={show(7)} />
      </g>
    </svg>
  );
}

/**
 * Hangman, developer edition. Guess the word one letter at a time; every
 * wrong guess builds a bit more of a bug, and if it's finished, it ships.
 * Solve words in a row to build a streak. Keyboard or on-screen keys.
 */
export function Hangman() {
  const [mode, setMode] = React.useState<Mode>("dev");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [current, setCurrent] = React.useState<HangmanWord | null>(null);
  const [guessed, setGuessed] = React.useState<Set<string>>(new Set());
  const [hinted, setHinted] = React.useState(false);
  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [lastPoints, setLastPoints] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const used = React.useRef<Set<string>>(new Set());
  const startedAt = React.useRef(0);

  React.useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  // Only listen to the keyboard while the game is on screen, so it never
  // steals letters from anything else on the page.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting && e.intersectionRatio > 0.35)), {
      threshold: [0, 0.35, 0.6],
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const word = current?.word ?? "";
  const letters = React.useMemo(() => new Set(word.split("").filter(isLetter)), [word]);
  const wrong = [...guessed].filter((l) => !letters.has(l));
  const livesLeft = LIVES - wrong.length;

  const nextWord = React.useCallback((m: Mode) => {
    const list = m === "dev" ? DEV_WORDS : EASY_WORDS;
    let pool = list.filter((w) => !used.current.has(w.word));
    if (pool.length === 0) {
      used.current.clear();
      pool = list;
    }
    const w = pool[Math.floor(Math.random() * pool.length)]!;
    used.current.add(w.word);
    setCurrent(w);
    setGuessed(new Set());
    setHinted(false);
    setPhase("playing");
  }, []);

  const start = () => {
    unlockAudio();
    playSound("start");
    setScore(0);
    setStreak(0);
    startedAt.current = Date.now();
    nextWord(mode);
  };

  const finishRun = React.useCallback(
    (finalScore: number) => {
      setBest((b) => {
        const nb = Math.max(b, finalScore);
        try {
          window.localStorage.setItem(BEST_KEY, String(nb));
        } catch {
          /* ignore */
        }
        return nb;
      });
      void submitScore("hangman", finalScore, Date.now() - startedAt.current);
    },
    []
  );

  const guess = React.useCallback(
    (l: string) => {
      if (phase !== "playing" || !current || guessed.has(l)) return;
      const next = new Set(guessed).add(l);
      setGuessed(next);
      const hit = letters.has(l);
      const nowWrong = [...next].filter((x) => !letters.has(x)).length;
      const nowSolved = [...letters].every((x) => next.has(x));
      if (nowSolved) {
        const pts = wordPoints(word, LIVES - nowWrong, hinted, mode);
        setLastPoints(pts);
        setScore((s) => s + pts);
        setStreak((s) => s + 1);
        setPhase("won");
        playSound("finish");
      } else if (nowWrong >= LIVES) {
        setPhase("lost");
        playSound("gameOver");
        finishRun(score);
      } else {
        playSound(hit ? "correct" : "wrong");
      }
    },
    [phase, current, guessed, letters, word, hinted, mode, score, finishRun]
  );

  // Physical keyboard
  React.useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (phase === "playing" && k.length === 1 && isLetter(k)) {
        e.preventDefault();
        guess(k);
      } else if (phase === "won" && (k === "enter" || k === " ")) {
        e.preventDefault();
        nextWord(mode);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, phase, guess, nextWord, mode]);

  const showHint = () => {
    if (phase !== "playing" || hinted) return;
    setHinted(true);
    playSound("select");
  };

  const revealAll = phase === "lost";

  return (
    <div ref={rootRef} className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-5 sm:p-7">
      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-sm">
        <div className="flex items-center gap-4">
          <span className="text-foreground">
            <span className="text-muted-foreground">Score </span>
            {score.toLocaleString("en-GB")}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300" title="Words solved in a row">
            <Flame className="size-4" /> {streak}
          </span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="size-4 text-accent" /> {best.toLocaleString("en-GB")}
          </span>
          <SoundToggle />
        </div>
      </div>

      <div className="relative mt-5 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
        <div className="mx-auto h-40 w-48 sm:h-44 sm:w-full">
          <BugDrawing wrong={phase === "idle" ? 0 : wrong.length} lost={phase === "lost"} />
        </div>

        <div className="min-w-0">
          {current && phase !== "idle" ? (
            <>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {mode === "dev" ? "Developer word" : "Easy word"} · {word.replace(/[^a-z]/g, "").length} letters
              </p>
              {/* The word */}
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-3" aria-label="The word so far">
                {word.split(" ").map((part, pi) => (
                  <div key={pi} className="flex gap-1.5">
                    {part.split("").map((c, i) => {
                      const shown = !isLetter(c) || guessed.has(c) || revealAll;
                      const missed = revealAll && !guessed.has(c) && isLetter(c);
                      return (
                        <span
                          key={i}
                          className={cn(
                            "grid h-10 w-7 place-items-center border-b-2 font-mono text-xl font-bold uppercase sm:h-11 sm:w-8 sm:text-2xl",
                            shown ? "border-primary/60" : "border-muted-foreground/40",
                            missed && "text-red-400",
                            phase === "won" && "text-accent"
                          )}
                        >
                          {shown ? c : ""}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
              <p className="sr-only" aria-live="polite">
                {word
                  .split("")
                  .map((c) => (!isLetter(c) ? "space" : guessed.has(c) || revealAll ? c : "blank"))
                  .join(", ")}
              </p>

              {/* Hint + lives */}
              <div className="mt-4 flex min-h-[2.5rem] flex-wrap items-center gap-3 text-sm">
                {hinted || phase !== "playing" ? (
                  <p className="inline-flex items-start gap-1.5 text-muted-foreground">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-yellow-300" />
                    {current.hint}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={showHint}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-yellow-300/50 hover:text-foreground"
                  >
                    <Lightbulb className="size-3.5 text-yellow-300" /> Show a hint (half points)
                  </button>
                )}
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {phase === "playing" && (
                  <>
                    <span className={livesLeft <= 2 ? "text-red-400" : "text-foreground"}>{livesLeft}</span> wrong guess
                    {livesLeft === 1 ? "" : "es"} left
                    {wrong.length > 0 && (
                      <>
                        {" · missed: "}
                        <span className="uppercase text-red-300">{wrong.join(" ")}</span>
                      </>
                    )}
                  </>
                )}
              </p>
            </>
          ) : (
            <div>
              <p className="font-heading text-lg font-semibold">Guess the word before the bug ships</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick letters with your keyboard or the buttons. Every wrong guess builds a bit more of the bug, and after {LIVES} it&apos;s
                in production. Solve words in a row to build a streak.
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Word list">
                {(
                  [
                    ["dev", "Developer words"],
                    ["easy", "Easy words"],
                  ] as const
                ).map(([m, label]) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      mode === m ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {mode === "dev" ? "Web and coding terms, with a clue for each." : "Everyday words for younger players. Scores count half."}
              </p>
              <Button onClick={start} variant="primary" className="mt-4">
                <Play className="size-4" /> Start
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Result banners */}
      {phase === "won" && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/5 px-4 py-3">
          <p className="text-sm">
            <span className="font-semibold text-accent">Solved! +{lastPoints}</span>
            <span className="text-muted-foreground"> · {streak} in a row</span>
          </p>
          <Button onClick={() => nextWord(mode)} variant="primary" size="sm">
            <SkipForward className="size-4" /> Next word
          </Button>
        </div>
      )}
      {phase === "lost" && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-400/40 bg-red-500/5 px-4 py-3">
          <div className="text-sm">
            <p>
              <span className="font-semibold text-red-300">The bug shipped.</span>{" "}
              <span className="text-muted-foreground">
                The word was <span className="font-mono uppercase text-foreground">{word}</span>.
              </span>
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Final score {score.toLocaleString("en-GB")} from {streak} word{streak === 1 ? "" : "s"}.
            </p>
            <WeeklyRank game="hangman" className="mt-0.5" />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setPhase("idle")} variant="outline" size="sm">
              Change words
            </Button>
            <Button onClick={start} variant="primary" size="sm">
              <RotateCcw className="size-4" /> Play again
            </Button>
          </div>
        </div>
      )}

      {/* On-screen keyboard */}
      {phase !== "idle" && (
        <div className="mt-5 grid grid-cols-7 gap-1.5 sm:grid-cols-[repeat(13,minmax(0,1fr))]">
          {LETTERS.map((l) => {
            const isUsed = guessed.has(l);
            const hit = isUsed && letters.has(l);
            return (
              <button
                key={l}
                type="button"
                onClick={() => guess(l)}
                disabled={phase !== "playing" || isUsed}
                aria-label={`Guess ${l.toUpperCase()}`}
                className={cn(
                  "touch-manipulation rounded-lg border py-2.5 font-mono text-sm font-semibold uppercase transition-colors",
                  !isUsed && "border-border bg-surface/60 hover:border-primary/60 hover:text-primary",
                  hit && "border-accent/40 bg-accent/15 text-accent",
                  isUsed && !hit && "border-transparent bg-transparent text-muted-foreground/40 line-through",
                  phase !== "playing" && !isUsed && "opacity-50"
                )}
              >
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
