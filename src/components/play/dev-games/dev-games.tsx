"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Crown, Medal, Play, RotateCcw, SkipForward, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { EVENTS, eventPoints, formatMark, isBetter, type EventId } from "@/lib/records";
import { createEvent, H, W, type EventRun, type Flag, type GameEventId, type Ghost } from "./engine";
import { loadRecords, submitMark, useRecords, WorldRecords } from "./world-records";

type Choice = GameEventId | "championship";
type Phase = "idle" | "playing" | "result" | "final";

const ORDER: GameEventId[] = ["sprint", "hurdles", "longjump", "javelin", "archery"];
const PB_KEY = "dcw-devgames-pb";

const INFO: Record<Choice, { label: string; how: string }> = {
  sprint: {
    label: "100m",
    how: "Alternate Left and Right as fast as you can (← → keys or the buttons). Wait for the gun: two false starts and you're out.",
  },
  hurdles: {
    label: "Hurdles",
    how: "Alternate Left and Right to run, and Jump (Space) to clear each hurdle. Clip one and you lose speed.",
  },
  longjump: {
    label: "Long jump",
    how: "Build speed with Left and Right. Press and hold Jump before the board, then let go at about 45°. Three attempts, best one counts.",
  },
  javelin: {
    label: "Javelin",
    how: "Run up with Left and Right. Press and hold Throw before the foul line, then let go at about 45°. Three attempts, best one counts.",
  },
  archery: {
    label: "Archery",
    how: "Aim with the mouse, by dragging, or with the arrow keys. Click, tap Shoot or press Space to loose. Allow for the wind. Six arrows.",
  },
  championship: {
    label: "Championship",
    how: "All five events back to back. Every result scores points, decathlon style, and the highest total takes the All-Round record.",
  },
};

function readPBs(): Partial<Record<EventId, number>> {
  try {
    return JSON.parse(window.localStorage.getItem(PB_KEY) ?? "{}") as Partial<Record<EventId, number>>;
  } catch {
    return {};
  }
}

function savePB(event: EventId, mark: number): boolean {
  const pbs = readPBs();
  if (!isBetter(event, mark, pbs[event])) return false;
  pbs[event] = mark;
  try {
    window.localStorage.setItem(PB_KEY, JSON.stringify(pbs));
  } catch {
    /* ignore */
  }
  return true;
}

interface Result {
  event: EventId;
  mark: number | null;
  points?: number;
  note: string;
  tone: "gold" | "good" | "plain" | "bad";
}

export function DevGames() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const runRef = React.useRef<EventRun | null>(null);
  const rafRef = React.useRef(0);
  const startedRef = React.useRef(0);
  const champStartRef = React.useRef(0);
  const [choice, setChoice] = React.useState<Choice>("sprint");
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [current, setCurrent] = React.useState<GameEventId>("sprint");
  const [action, setAction] = React.useState("Jump");
  const [live, setLive] = React.useState("");
  const [results, setResults] = React.useState<Result[]>([]);
  const [lastResult, setLastResult] = React.useState<Result | null>(null);
  const [highlight, setHighlight] = React.useState<EventId | null>(null);
  const { data } = useRecords();
  const dataRef = React.useRef(data);
  dataRef.current = data;
  const phaseRef = React.useRef(phase);
  phaseRef.current = phase;
  const choiceRef = React.useRef(choice);
  choiceRef.current = choice;

  /* ── Drawing ─────────────────────────────────────────────────────────── */

  const getCtx = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== W * dpr) {
      canvas.width = W * dpr;
      canvas.height = H * dpr;
    }
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }, []);

  // Idle preview: draw the chosen event's opening frame.
  React.useEffect(() => {
    if (phase !== "idle") return;
    const id = choice === "championship" ? "sprint" : choice;
    const ctx = getCtx();
    if (ctx) createEvent(id).draw(ctx);
  }, [choice, phase, getCtx]);

  React.useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  /* ── Event lifecycle ─────────────────────────────────────────────────── */

  const ghostsAndFlags = (id: GameEventId) => {
    const pb = readPBs()[id];
    const wr = dataRef.current?.[id]?.top[0]?.mark;
    const ghosts: Ghost[] = [];
    const flags: Flag[] = [];
    const scale = EVENTS[id].scale;
    if (id === "sprint" || id === "hurdles") {
      if (wr) ghosts.push({ label: "WR", time: wr / scale, color: "#facc15" });
      if (pb && pb !== wr) ghosts.push({ label: "PB", time: pb / scale, color: "#a78bfa" });
    } else if (id === "longjump" || id === "javelin") {
      if (wr) flags.push({ label: `WR ${(wr / scale).toFixed(2)}`, dist: wr / scale, color: "#facc15" });
      if (pb && pb !== wr) flags.push({ label: `PB ${(pb / scale).toFixed(2)}`, dist: pb / scale, color: "#a78bfa" });
    }
    return { ghosts, flags };
  };

  const finishEvent = React.useCallback(async (run: EventRun) => {
    cancelAnimationFrame(rafRef.current);
    const st = run.status();
    const id = run.id;
    const duration = performance.now() - startedRef.current;
    const champ = choiceRef.current === "championship";
    const points = champ ? eventPoints(id, st.mark) : undefined;

    const base: Result = {
      event: id,
      mark: st.mark,
      points,
      note: st.mark === null ? (id === "sprint" || id === "hurdles" ? "Disqualified" : "No mark") : "",
      tone: st.mark === null ? "bad" : "plain",
    };
    if (st.mark !== null) {
      const pb = savePB(id, st.mark);
      if (pb) {
        base.note = "Personal best!";
        base.tone = "good";
      }
    }
    setLastResult(base);
    setPhase("result");
    if (champ) setResults((r) => [...r, base]);

    if (st.mark !== null) {
      const res = await submitMark(id, st.mark, duration);
      if (res?.newRecord) {
        playSound("badge");
        setHighlight(id);
        const upd = { ...base, note: "NEW WORLD RECORD!", tone: "gold" as const };
        setLastResult(upd);
        if (champ) setResults((r) => r.map((x, i) => (i === r.length - 1 ? upd : x)));
      } else if (res?.improved && res.rank) {
        const upd = { ...base, note: `Personal best! #${res.rank} all-time`, tone: "good" as const };
        setLastResult(upd);
        if (champ) setResults((r) => r.map((x, i) => (i === r.length - 1 ? upd : x)));
      }
    }
  }, []);

  const startEvent = React.useCallback(
    (id: GameEventId) => {
      unlockAudio();
      cancelAnimationFrame(rafRef.current);
      const run = createEvent(id, ghostsAndFlags(id));
      runRef.current = run;
      setCurrent(id);
      setAction(run.status().action);
      setPhase("playing");
      setHighlight(null);
      startedRef.current = performance.now();
      let last = performance.now();
      let finished = false;
      const loop = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        run.update(dt);
        const ctx = getCtx();
        if (ctx) run.draw(ctx);
        const st = run.status();
        setAction((a) => (a === st.action ? a : st.action));
        setLive((m) => (m === st.message ? m : st.message));
        if (st.done && !finished) {
          finished = true;
          void finishEvent(run);
          return;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
      // Focus the game so keys don't scroll the page, and bring it into view.
      canvasRef.current?.focus({ preventScroll: true });
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && (rect.top < 64 || rect.bottom > window.innerHeight)) {
        canvasRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [finishEvent, getCtx]
  );

  const start = () => {
    void loadRecords();
    if (choice === "championship") {
      setResults([]);
      champStartRef.current = performance.now();
      startEvent("sprint");
    } else startEvent(choice);
  };

  const next = () => {
    const idx = results.length;
    if (choice === "championship" && idx < ORDER.length) startEvent(ORDER[idx]!);
  };

  // Championship complete: total up and submit the All-Round mark.
  const champTotal = results.reduce((s, r) => s + (r.points ?? 0), 0);
  const [finalNote, setFinalNote] = React.useState("");
  const showFinal = async () => {
    setPhase("final");
    setFinalNote("");
    playSound("finish");
    if (champTotal > 0) {
      const pb = savePB("allround", champTotal);
      if (pb) setFinalNote("Personal best!");
      const res = await submitMark("allround", champTotal, performance.now() - champStartRef.current);
      if (res?.newRecord) {
        playSound("badge");
        setHighlight("allround");
        setFinalNote("NEW WORLD RECORD! You're the All-Round Champion.");
      } else if (res?.improved && res.rank) setFinalNote(`Personal best! #${res.rank} all-time`);
    }
  };

  /* ── Input ───────────────────────────────────────────────────────────── */

  React.useEffect(() => {
    if (phase !== "playing") return;
    const aimKeys = { x: 0, y: 0 };
    const held = new Set<string>();
    const syncAim = () => {
      aimKeys.x = (held.has("ArrowRight") ? 1 : 0) - (held.has("ArrowLeft") ? 1 : 0);
      aimKeys.y = (held.has("ArrowDown") ? 1 : 0) - (held.has("ArrowUp") ? 1 : 0);
      runRef.current?.setAimKeys?.({ ...aimKeys });
    };
    const isArchery = () => runRef.current?.id === "archery";
    const onDown = (e: KeyboardEvent) => {
      const run = runRef.current;
      if (!run || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (isArchery() && k.startsWith("Arrow")) {
        e.preventDefault();
        held.add(k);
        syncAim();
        return;
      }
      if (e.repeat && k !== " ") return;
      if (["ArrowLeft", "a", "A", "z", "Z"].includes(k)) {
        e.preventDefault();
        run.tap(0);
      } else if (["ArrowRight", "d", "D", "x", "X"].includes(k)) {
        e.preventDefault();
        run.tap(1);
      } else if ([" ", "ArrowUp", "w", "W", "Enter"].includes(k)) {
        e.preventDefault();
        if (!e.repeat) run.actionDown();
      } else if (k === "ArrowDown") e.preventDefault();
    };
    const onUp = (e: KeyboardEvent) => {
      const run = runRef.current;
      if (!run) return;
      if (isArchery() && e.key.startsWith("Arrow")) {
        held.delete(e.key);
        syncAim();
        return;
      }
      if ([" ", "ArrowUp", "w", "W", "Enter"].includes(e.key)) run.actionUp();
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [phase]);

  // Canvas pointer: archery aiming (mouse = absolute, touch = drag).
  const lastTouch = React.useRef<{ x: number; y: number } | null>(null);
  const toCanvas = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H, k: W / rect.width };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const run = runRef.current;
    if (phaseRef.current !== "playing" || run?.id !== "archery") return;
    const p = toCanvas(e);
    if (e.pointerType === "mouse") run.aimTo?.(p.x, p.y);
    else if (lastTouch.current) {
      run.aimBy?.((e.clientX - lastTouch.current.x) * p.k * 0.8, (e.clientY - lastTouch.current.y) * p.k * 0.8);
      lastTouch.current = { x: e.clientX, y: e.clientY };
    }
  };
  const onPointerDown = (e: React.PointerEvent) => {
    const run = runRef.current;
    if (phaseRef.current !== "playing" || run?.id !== "archery") return;
    if (e.pointerType === "mouse") {
      const p = toCanvas(e);
      run.aimTo?.(p.x, p.y);
      run.actionDown();
    } else lastTouch.current = { x: e.clientX, y: e.clientY };
  };

  const press = (fn: () => void) => (e: React.PointerEvent) => {
    e.preventDefault();
    if (phaseRef.current === "playing") fn();
  };

  /* ── UI ──────────────────────────────────────────────────────────────── */

  const isTrack = current === "sprint" || current === "hurdles";
  const showAction = phase === "playing" && current !== "sprint";
  const champIdx = results.length;
  const champDone = choice === "championship" && champIdx >= ORDER.length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Choose an event" className="flex flex-wrap gap-1.5">
          {(Object.keys(INFO) as Choice[]).map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={choice === c}
              disabled={phase === "playing"}
              onClick={() => {
                setChoice(c);
                setPhase("idle");
                setResults([]);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                choice === c ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                c === "championship" && "border-yellow-400/40"
              )}
            >
              {c === "championship" && <Trophy className="mr-1 inline size-3.5 text-yellow-400" />}
              {INFO[c].label}
            </button>
          ))}
        </div>
        <div className="ml-auto">
          <SoundToggle />
        </div>
      </div>

      <div className="relative mt-4 flex min-h-[260px] items-center overflow-hidden rounded-2xl border border-border bg-background sm:min-h-0">
        <canvas
          ref={canvasRef}
          tabIndex={-1}
          aria-label="Dev Games arena"
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={() => (lastTouch.current = null)}
          className={cn("block aspect-[16/9] w-full outline-none", phase === "playing" && current === "archery" && "cursor-none touch-none")}
        />

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-background/75 p-4 backdrop-blur-sm">
            <div className="max-w-md text-center">
              {phase === "idle" && (
                <>
                  <p className="font-heading text-xl font-bold sm:text-2xl">
                    {choice === "championship" ? "The Championship" : EVENTS[choice].label}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{INFO[choice].how}</p>
                  <Button onClick={start} variant="primary" className="mt-4">
                    <Play className="size-4" /> {choice === "championship" ? "Start the championship" : "Start"}
                  </Button>
                </>
              )}

              {phase === "result" && lastResult && (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {EVENTS[lastResult.event].label}
                    {choice === "championship" && ` · event ${champIdx} of ${ORDER.length}`}
                  </p>
                  <p className="mt-1 font-heading text-3xl font-bold sm:text-4xl">
                    {lastResult.mark !== null ? formatMark(lastResult.event, lastResult.mark) : lastResult.note}
                  </p>
                  {lastResult.mark !== null && lastResult.note && (
                    <p
                      className={cn(
                        "mt-1 text-sm font-semibold",
                        lastResult.tone === "gold" ? "animate-pulse text-yellow-400" : "text-primary"
                      )}
                    >
                      {lastResult.tone === "gold" && <Crown className="mr-1 inline size-4" />}
                      {lastResult.note}
                    </p>
                  )}
                  {lastResult.points !== undefined && (
                    <p className="mt-2 font-mono text-sm text-muted-foreground">
                      +{lastResult.points} points · total {champTotal}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {choice === "championship" ? (
                      champDone ? (
                        <Button onClick={() => void showFinal()} variant="primary">
                          <Trophy className="size-4" /> See final standings
                        </Button>
                      ) : (
                        <Button onClick={next} variant="primary">
                          <SkipForward className="size-4" /> Next: {EVENTS[ORDER[champIdx]!].label}
                        </Button>
                      )
                    ) : (
                      <Button onClick={() => startEvent(current)} variant="primary">
                        <RotateCcw className="size-4" /> Try again
                      </Button>
                    )}
                  </div>
                </>
              )}

              {phase === "final" && (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Championship complete</p>
                  <p className="mt-1 font-heading text-4xl font-bold text-yellow-400">{champTotal.toLocaleString("en-GB")} pts</p>
                  {finalNote && (
                    <p className={cn("mt-1 text-sm font-semibold", finalNote.startsWith("NEW") ? "animate-pulse text-yellow-400" : "text-primary")}>
                      {finalNote}
                    </p>
                  )}
                  <ul className="mx-auto mt-3 max-w-xs space-y-1 text-left font-mono text-xs">
                    {results.map((r) => (
                      <li key={r.event} className="flex justify-between gap-3">
                        <span className="text-muted-foreground">{EVENTS[r.event].short}</span>
                        <span>{r.mark !== null ? formatMark(r.event, r.mark) : "-"}</span>
                        <span className="w-12 text-right text-foreground">{r.points}</span>
                      </li>
                    ))}
                  </ul>
                  <Button onClick={start} variant="primary" className="mt-4">
                    <RotateCcw className="size-4" /> Go again
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite" data-testid="dev-games-status">
        {phase === "playing" ? live : ""}
      </p>

      {/* On-screen controls (touch and mouse) */}
      <div className="mt-3 grid select-none grid-cols-3 gap-2" aria-hidden={phase !== "playing"}>
        {current === "archery" && phase === "playing" ? (
          <>
            <p className="col-span-2 self-center text-xs text-muted-foreground">Drag on the target to aim, or use the mouse or arrow keys.</p>
            <button
              type="button"
              onPointerDown={press(() => runRef.current?.actionDown())}
              className="touch-manipulation rounded-xl border border-primary/50 bg-primary/15 py-4 font-heading font-semibold active:bg-primary/30"
            >
              Shoot
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label="Left"
              onPointerDown={press(() => runRef.current?.tap(0))}
              className="flex touch-manipulation items-center justify-center rounded-xl border border-border bg-surface/60 py-4 active:bg-primary/20"
            >
              <ArrowLeft className="size-6" />
            </button>
            <button
              type="button"
              disabled={!showAction}
              onPointerDown={press(() => runRef.current?.actionDown())}
              onPointerUp={() => runRef.current?.actionUp()}
              onPointerCancel={() => runRef.current?.actionUp()}
              onPointerLeave={() => phaseRef.current === "playing" && runRef.current?.actionUp()}
              className="touch-manipulation rounded-xl border border-primary/50 bg-primary/15 py-4 font-heading font-semibold active:bg-primary/30 disabled:border-border disabled:bg-transparent disabled:text-muted-foreground"
            >
              {showAction ? action : isTrack ? "Run!" : "—"}
            </button>
            <button
              type="button"
              aria-label="Right"
              onPointerDown={press(() => runRef.current?.tap(1))}
              className="flex touch-manipulation items-center justify-center rounded-xl border border-border bg-surface/60 py-4 active:bg-primary/20"
            >
              <ArrowRight className="size-6" />
            </button>
          </>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Keys: ← → (or A/D) to run · Space to jump, throw or shoot · Beat the gold ghost to break the world record
      </p>

      {choice === "championship" && results.length > 0 && phase !== "final" && (
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          {results.map((r) => (
            <span key={r.event}>
              <Medal className="mr-1 inline size-3 text-primary" />
              {EVENTS[r.event].short} {r.points}
            </span>
          ))}
        </p>
      )}

      <WorldRecords className="mt-6" highlight={highlight} />
    </div>
  );
}
