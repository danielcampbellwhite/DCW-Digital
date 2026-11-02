"use client";

import * as React from "react";
import {
  Bug,
  Flame,
  Zap,
  GraduationCap,
  Crown,
  Timer,
  Languages,
  ShieldCheck,
  Lightbulb,
  Check,
  X,
  ArrowRight,
  RotateCcw,
  Share2,
  Trophy,
  Code2,
  Lock,
  type LucideIcon,
} from "lucide-react";
import {
  bugChallenges,
  BASE_POINTS,
  ROUND_MIX,
  type BugChallenge,
  type Difficulty,
} from "@/content/bug-hunt";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";

/* ── Config ─────────────────────────────────────────────────────────────── */

const SPEED_SECONDS = 20;
const SPEED_BONUS = 50;
const STREAK_STEP = 20;
const STREAK_CAP = 100;
const BEST_KEY = "dcw-spot-bug-best";
const BADGE_KEY = "dcw-spot-bug-badges";

type BadgeId =
  | "first"
  | "streak3"
  | "streak5"
  | "nohints"
  | "flawless"
  | "speedy"
  | "polyglot"
  | "security";

const BADGES: { id: BadgeId; name: string; desc: string; icon: LucideIcon }[] = [
  { id: "first", name: "First Catch", desc: "Spot your first bug", icon: Bug },
  { id: "streak3", name: "On a Roll", desc: "3 right in a row", icon: Flame },
  { id: "streak5", name: "Unstoppable", desc: "5 right in a row", icon: Zap },
  { id: "speedy", name: "Speed Reader", desc: "3 speed bonuses in one round", icon: Timer },
  { id: "security", name: "Security Minded", desc: "Catch a security bug", icon: ShieldCheck },
  { id: "polyglot", name: "Polyglot", desc: "Right answers in 4 languages in one round", icon: Languages },
  { id: "nohints", name: "No Training Wheels", desc: "Finish a round without hints", icon: GraduationCap },
  { id: "flawless", name: "Flawless", desc: "Get all 8 right", icon: Crown },
];

const RANKS = [
  { min: 0, name: "Rubber Duck", desc: "Developers explain bugs to a rubber duck until they spot the problem. You're the duck. Respect." },
  { min: 3, name: "Junior Dev", desc: "You've got the instincts. A few more late-night debugging sessions and you'll be dangerous." },
  { min: 5, name: "Mid-level Dev", desc: "Solid. You'd survive a code review, mostly with dignity intact." },
  { min: 7, name: "Senior Dev", desc: "Very sharp. You've clearly been burned by a few of these before." },
  { min: 8, name: "Bug Whisperer", desc: "A perfect round. Bugs fear you. Fancy a job?" },
];

const DIFF_STYLE: Record<Difficulty, string> = {
  easy: "border-accent/40 bg-accent/10 text-accent",
  medium: "border-primary/40 bg-primary/10 text-primary",
  hard: "border-red-400/40 bg-red-500/10 text-red-300",
};

/* ── Helpers ────────────────────────────────────────────────────────────── */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

function buildRound(): BugChallenge[] {
  const order: Difficulty[] = ["easy", "medium", "hard"];
  return order.flatMap((d) =>
    shuffle(bugChallenges.filter((c) => c.difficulty === d)).slice(0, ROUND_MIX[d])
  );
}

function rankFor(correct: number) {
  return [...RANKS].reverse().find((r) => correct >= r.min) ?? RANKS[0]!;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

/** Render `backtick` spans in explanations as inline code. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded bg-background/70 px-1 py-0.5 font-mono text-[0.85em] text-accent">
            {part.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/** Mute comments so the code reads like a real editor. */
function CodeText({ text }: { text: string }) {
  if (text === "") return <span>&nbsp;</span>;
  const trimmed = text.trimStart();
  if (trimmed.startsWith("//") || trimmed.startsWith("--")) {
    return <span className="text-muted-foreground/70 italic">{text}</span>;
  }
  const idx = text.indexOf(" // ");
  if (idx > -1) {
    return (
      <>
        <span>{text.slice(0, idx)}</span>
        <span className="text-muted-foreground/70 italic">{text.slice(idx)}</span>
      </>
    );
  }
  return <span>{text}</span>;
}

/* ── Component ──────────────────────────────────────────────────────────── */

type Phase = "intro" | "question" | "results";

interface Outcome {
  correct: boolean;
  points: number;
  base: number;
  speed: number;
  streak: number;
  hinted: boolean;
}

export function SpotTheBug() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [round, setRound] = React.useState<BugChallenge[]>([]);
  const [index, setIndex] = React.useState(0);

  const [selected, setSelected] = React.useState<number | null>(null);
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const [hintShown, setHintShown] = React.useState(false);
  const [showFix, setShowFix] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const startRef = React.useRef(0);

  const [score, setScore] = React.useState(0);
  const [streak, setStreak] = React.useState(0);
  const [bestStreak, setBestStreak] = React.useState(0);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [hintsUsed, setHintsUsed] = React.useState(0);
  const [speedCount, setSpeedCount] = React.useState(0);
  const [langs, setLangs] = React.useState<Set<string>>(new Set());

  const [best, setBest] = React.useState(0);
  const [unlocked, setUnlocked] = React.useState<BadgeId[]>([]);
  const [newBadges, setNewBadges] = React.useState<BadgeId[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);
  const [shared, setShared] = React.useState(false);

  const topRef = React.useRef<HTMLDivElement>(null);
  const question = round[index];

  React.useEffect(() => {
    setBest(readJSON<number>(BEST_KEY, 0));
    setUnlocked(readJSON<BadgeId[]>(BADGE_KEY, []));
  }, []);

  // Per-question timer.
  React.useEffect(() => {
    if (phase !== "question" || outcome) return;
    const iv = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => window.clearInterval(iv);
  }, [phase, outcome, index]);

  // Auto-hide badge toast.
  React.useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const unlockedRef = React.useRef<BadgeId[]>([]);
  React.useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  const unlock = React.useCallback((ids: BadgeId[]) => {
    const prev = unlockedRef.current;
    const fresh = [...new Set(ids)].filter((id) => !prev.includes(id));
    if (fresh.length === 0) return;
    const next = [...prev, ...fresh];
    unlockedRef.current = next;
    writeJSON(BADGE_KEY, next);
    setUnlocked(next);
    setNewBadges((n) => [...n, ...fresh]);
    window.setTimeout(() => playSound("badge"), 450);
    const names = fresh.map((id) => BADGES.find((b) => b.id === id)?.name).join(", ");
    setToast(`Badge unlocked: ${names}`);
  }, []);

  const scrollTop = () =>
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const resetQuestion = () => {
    setSelected(null);
    setOutcome(null);
    setHintShown(false);
    setShowFix(false);
    setElapsed(0);
    startRef.current = Date.now();
  };

  const start = () => {
    unlockAudio();
    playSound("start");
    setRound(buildRound());
    setIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setHintsUsed(0);
    setSpeedCount(0);
    setLangs(new Set());
    setNewBadges([]);
    setShared(false);
    resetQuestion();
    setPhase("question");
    scrollTop();
  };

  const revealHint = () => {
    if (hintShown || outcome) return;
    setHintShown(true);
    setHintsUsed((h) => h + 1);
  };

  const submit = () => {
    if (!question || selected === null || outcome) return;
    const correct = question.bugLines.includes(selected);
    const seconds = (Date.now() - startRef.current) / 1000;

    playSound(correct ? "correct" : "wrong");
    if (!correct) {
      setOutcome({ correct: false, points: 0, base: 0, speed: 0, streak: 0, hinted: hintShown });
      setStreak(0);
      return;
    }

    const base = BASE_POINTS[question.difficulty] / (hintShown ? 2 : 1);
    const speed = seconds <= SPEED_SECONDS ? SPEED_BONUS : 0;
    const newStreak = streak + 1;
    const streakBonus = Math.min((newStreak - 1) * STREAK_STEP, STREAK_CAP);
    const points = base + speed + streakBonus;

    setOutcome({ correct: true, points, base, speed, streak: streakBonus, hinted: hintShown });
    setScore((s) => s + points);
    setStreak(newStreak);
    setBestStreak((b) => Math.max(b, newStreak));
    setCorrectCount((c) => c + 1);
    if (speed) setSpeedCount((n) => n + 1);
    const nextLangs = new Set(langs).add(question.language);
    setLangs(nextLangs);

    const earned: BadgeId[] = ["first"];
    if (newStreak >= 3) earned.push("streak3");
    if (newStreak >= 5) earned.push("streak5");
    if (question.tags?.includes("security")) earned.push("security");
    if (speed && speedCount + 1 >= 3) earned.push("speedy");
    if (nextLangs.size >= 4) earned.push("polyglot");
    unlock(earned);
  };

  const next = () => {
    if (index + 1 < round.length) {
      setIndex((i) => i + 1);
      resetQuestion();
      scrollTop();
      return;
    }
    // End of round.
    const earned: BadgeId[] = [];
    if (hintsUsed === 0) earned.push("nohints");
    if (correctCount === round.length) earned.push("flawless");
    unlock(earned);
    setBest((b) => {
      const nb = Math.max(b, score);
      writeJSON(BEST_KEY, nb);
      return nb;
    });
    setPhase("results");
    playSound("finish");
    scrollTop();
  };

  const share = async () => {
    const rank = rankFor(correctCount).name;
    const url = `${window.location.origin}/play`;
    const text = `I scored ${score} and ranked "${rank}" on Spot the Bug. Can you beat me?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Spot the Bug", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
      }
      setShared(true);
    } catch {
      /* cancelled */
    }
  };

  /* ── Render ───────────────────────────────────────────────────────────── */

  return (
    <div ref={topRef} className="relative mx-auto max-w-3xl scroll-mt-24">
      {/* Badge toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <div className="flex items-center gap-2 rounded-full border border-accent/40 bg-background/95 px-4 py-2 text-sm text-accent shadow-lg backdrop-blur">
            <Trophy className="size-4" /> {toast}
          </div>
        )}
      </div>

      {phase === "intro" && (
        <Intro best={best} unlocked={unlocked} onStart={start} />
      )}

      {phase === "question" && question && (
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
          {/* Status bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-mono text-muted-foreground">
              Bug {index + 1} of {round.length}
            </span>
            <div className="flex items-center gap-4 font-mono">
              <span className={cn("inline-flex items-center gap-1", streak >= 2 ? "text-orange-400" : "text-muted-foreground")}>
                <Flame className="size-4" /> {streak}
              </span>
              <span className={cn("inline-flex items-center gap-1", !outcome && elapsed <= SPEED_SECONDS ? "text-primary" : "text-muted-foreground")}>
                <Timer className="size-4" /> {elapsed}s
              </span>
              <span className="inline-flex items-center gap-1 text-foreground">
                <Trophy className="size-4 text-accent" /> {score}
              </span>
              <SoundToggle className="size-8" />
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500"
              style={{ width: `${((index + (outcome ? 1 : 0)) / round.length) * 100}%` }}
            />
          </div>

          {/* Question */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize", DIFF_STYLE[question.difficulty])}>
              {question.difficulty}
            </span>
            <span className="rounded-full border border-border bg-surface/60 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
              {question.language}
            </span>
          </div>
          <h3 className="mt-3 font-heading text-2xl font-bold">{question.title}</h3>
          <p className="mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">Supposed to: </span>
            {question.goal}
          </p>

          {/* Code */}
          <p className="mt-5 text-sm text-muted-foreground">
            {outcome ? "Here's where the bug was:" : "Tap the line you think is broken."}
          </p>
          <CodeBlock
            lines={question.code}
            selected={selected}
            bugLines={outcome ? question.bugLines : []}
            wrong={outcome && !outcome.correct ? selected : null}
            disabled={!!outcome}
            onSelect={(i) => {
              playSound("select");
              setSelected(i);
            }}
          />

          {/* Hint */}
          {!outcome && (
            <div className="mt-4">
              {hintShown ? (
                <p className="flex items-start gap-2 rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 text-sm text-yellow-200">
                  <Lightbulb className="mt-0.5 size-4 shrink-0" /> {question.hint}
                </p>
              ) : (
                <button
                  type="button"
                  onClick={revealHint}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  <Lightbulb className="size-4" /> Need a hint? (half points)
                </button>
              )}
            </div>
          )}

          {/* Submit */}
          {!outcome && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button onClick={submit} disabled={selected === null} variant="primary">
                <Bug className="size-4" />
                {selected === null ? "Pick a line" : `Line ${selected} is the bug`}
              </Button>
            </div>
          )}

          {/* Reveal */}
          {outcome && (
            <Reveal
              question={question}
              outcome={outcome}
              showFix={showFix}
              onToggleFix={() => setShowFix((v) => !v)}
              onNext={next}
              isLast={index + 1 === round.length}
            />
          )}
        </div>
      )}

      {phase === "results" && (
        <Results
          score={score}
          best={best}
          correct={correctCount}
          total={round.length}
          bestStreak={bestStreak}
          hintsUsed={hintsUsed}
          unlocked={unlocked}
          newBadges={newBadges}
          shared={shared}
          onShare={share}
          onRestart={start}
        />
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function CodeBlock({
  lines,
  selected,
  bugLines,
  wrong,
  disabled,
  onSelect,
  highlight,
}: {
  lines: string[];
  selected?: number | null;
  bugLines?: number[];
  wrong?: number | null;
  disabled?: boolean;
  onSelect?: (line: number) => void;
  highlight?: Set<number>;
}) {
  return (
    <div className="mt-2 overflow-x-auto rounded-xl border border-border bg-[#070b17] py-2 font-mono text-[13px] leading-relaxed">
      <div className="min-w-max">
        {lines.map((text, i) => {
          const n = i + 1;
          const isBug = bugLines?.includes(n);
          const isWrong = wrong === n;
          const isSel = selected === n && !bugLines?.length;
          const isNew = highlight?.has(n);
          const cls = cn(
            "flex w-full gap-4 border-l-2 px-3 py-0.5 text-left text-foreground/90 transition-colors",
            "border-transparent",
            onSelect && !disabled && "hover:bg-primary/10 cursor-pointer",
            isSel && "border-primary bg-primary/15",
            isBug && "border-accent bg-accent/15",
            isWrong && "border-red-400 bg-red-500/15",
            isNew && "border-accent bg-accent/10"
          );
          const inner = (
            <>
              <span className="w-5 shrink-0 select-none text-right text-muted-foreground/60">{n}</span>
              <span className="whitespace-pre">
                <CodeText text={text} />
              </span>
              {isBug && <Check className="ml-2 size-4 shrink-0 self-center text-accent" aria-hidden />}
              {isWrong && <X className="ml-2 size-4 shrink-0 self-center text-red-400" aria-hidden />}
            </>
          );
          if (!onSelect) return <div key={i} className={cls}>{inner}</div>;
          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(n)}
              aria-pressed={selected === n}
              aria-label={`Line ${n}: ${text.trim() || "blank line"}`}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Reveal({
  question,
  outcome,
  showFix,
  onToggleFix,
  onNext,
  isLast,
}: {
  question: BugChallenge;
  outcome: Outcome;
  showFix: boolean;
  onToggleFix: () => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const changed = React.useMemo(() => {
    const original = new Set(question.code);
    const s = new Set<number>();
    question.fixed.forEach((l, i) => {
      if (!original.has(l)) s.add(i + 1);
    });
    return s;
  }, [question]);

  return (
    <div className="mt-6 space-y-5" aria-live="polite">
      {outcome.correct ? (
        <div className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold text-accent">
            <Check className="size-5" /> Nice catch! +{outcome.points}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
            <span className="rounded border border-border px-2 py-0.5">
              {question.difficulty} +{outcome.base}
              {outcome.hinted ? " (hint)" : ""}
            </span>
            {outcome.speed > 0 && (
              <span className="rounded border border-primary/40 px-2 py-0.5 text-primary">speed +{outcome.speed}</span>
            )}
            {outcome.streak > 0 && (
              <span className="rounded border border-orange-400/40 px-2 py-0.5 text-orange-400">streak +{outcome.streak}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3">
          <p className="flex items-center gap-2 font-heading text-lg font-semibold text-red-300">
            <X className="size-5" /> Not quite.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The bug was on line {question.bugLines.join(" or ")}. Your streak resets, but you live to debug another day.
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In plain English</p>
          <p className="mt-2 text-sm text-foreground/90"><RichText text={question.plain} /></p>
        </div>
        <div className="rounded-xl border border-border bg-surface/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">For developers</p>
          <p className="mt-2 text-sm text-foreground/90"><RichText text={question.dev} /></p>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={onToggleFix}
          aria-expanded={showFix}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <Code2 className="size-4" /> {showFix ? "Hide the fix" : "Show the fix"}
        </button>
        {showFix && <CodeBlock lines={question.fixed} highlight={changed} />}
      </div>

      <Button onClick={onNext} variant="primary">
        {isLast ? "See my results" : "Next bug"}
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

function BadgeGrid({ unlocked, highlight = [] }: { unlocked: BadgeId[]; highlight?: BadgeId[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BADGES.map((b) => {
        const has = unlocked.includes(b.id);
        const fresh = highlight.includes(b.id);
        const Icon = has ? b.icon : Lock;
        return (
          <li
            key={b.id}
            className={cn(
              "flex flex-col items-center rounded-xl border p-3 text-center",
              has ? "border-accent/30 bg-accent/5" : "border-border bg-surface/40 opacity-60",
              fresh && "ring-2 ring-accent/60"
            )}
          >
            <Icon className={cn("size-6", has ? "text-accent" : "text-muted-foreground")} />
            <span className="mt-2 text-xs font-semibold">{b.name}</span>
            <span className="mt-0.5 text-[11px] text-muted-foreground">{b.desc}</span>
            {fresh && <span className="mt-1 text-[10px] font-semibold uppercase text-accent">New!</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Intro({ best, unlocked, onStart }: { best: number; unlocked: BadgeId[]; onStart: () => void }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-400/30 bg-red-500/10 text-red-400">
        <Bug className="size-7" />
      </span>
      <h3 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">Can you spot the bug?</h3>
      <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
        Each question shows a short bit of code with one bug hiding in it, the kind
        of thing I track down every week. Tap the line you think is broken.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        Not a developer? Have a go anyway. Every answer comes with a plain-English
        explanation, so you&apos;ll see what a normal day in my job looks like.
      </p>
      <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2 font-mono text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">8 bugs</span>
        <span className="rounded-full border border-border px-3 py-1">easy → hard</span>
        <span className="rounded-full border border-border px-3 py-1">speed &amp; streak bonuses</span>
        <span className="rounded-full border border-border px-3 py-1">{unlocked.length}/{BADGES.length} badges</span>
        {best > 0 && <span className="rounded-full border border-accent/40 px-3 py-1 text-accent">best {best}</span>}
      </div>
      <Button onClick={onStart} variant="primary" size="lg" className="mt-7">
        <Bug className="size-4" /> Start hunting
      </Button>
      {unlocked.length > 0 && (
        <div className="mt-10 text-left">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your badges</p>
          <BadgeGrid unlocked={unlocked} />
        </div>
      )}
    </div>
  );
}

function Results({
  score,
  best,
  correct,
  total,
  bestStreak,
  hintsUsed,
  unlocked,
  newBadges,
  shared,
  onShare,
  onRestart,
}: {
  score: number;
  best: number;
  correct: number;
  total: number;
  bestStreak: number;
  hintsUsed: number;
  unlocked: BadgeId[];
  newBadges: BadgeId[];
  shared: boolean;
  onShare: () => void;
  onRestart: () => void;
}) {
  const rank = rankFor(correct);
  const isBest = score > 0 && score >= best;
  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Your rank</p>
        <h3 className="mt-2 font-heading text-4xl font-bold text-gradient">{rank.name}</h3>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">{rank.desc}</p>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Score", value: score, accent: isBest },
          { label: "Bugs caught", value: `${correct}/${total}` },
          { label: "Best streak", value: bestStreak },
          { label: "Hints used", value: hintsUsed },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-4 text-center">
            <dt className="text-xs text-muted-foreground">{s.label}</dt>
            <dd className={cn("mt-1 font-heading text-2xl font-bold", s.accent && "text-accent")}>{s.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {isBest ? "That's a new personal best!" : `Your best is ${best}.`}
      </p>

      <div className="mt-10">
        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Badges {newBadges.length > 0 ? `(${newBadges.length} new this round)` : ""}
        </p>
        <BadgeGrid unlocked={unlocked} highlight={newBadges} />
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button onClick={onRestart} variant="primary">
          <RotateCcw className="size-4" /> Play again
        </Button>
        <Button onClick={onShare} variant="outline">
          <Share2 className="size-4" /> {shared ? "Shared!" : "Challenge a friend"}
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Each round picks a fresh mix from the bug pool, so play again for different bugs.
      </p>
    </div>
  );
}
