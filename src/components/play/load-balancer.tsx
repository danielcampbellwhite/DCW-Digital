"use client";

import * as React from "react";
import { Braces, Globe, Heart, ImageIcon, Pause, Play, Plus, RotateCcw, Server, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";
import { submitScore, WeeklyRank } from "@/components/play/weekly-leaderboard";

/* ── Config ─────────────────────────────────────────────────────────────── */

type Kind = "web" | "api" | "cdn";
const KIND_LIST: Kind[] = ["web", "api", "cdn"];

const KINDS: Record<
  Kind,
  { label: string; req: string; icon: React.ComponentType<{ className?: string }>; work: number; chip: string; text: string; ring: string; buyKey: string }
> = {
  web: { label: "Web", req: "Page", icon: Globe, work: 1.5, chip: "bg-sky-500", text: "text-sky-300", ring: "border-sky-400/60", buyKey: "Q" },
  api: { label: "API", req: "API call", icon: Braces, work: 1.9, chip: "bg-violet-500", text: "text-violet-300", ring: "border-violet-400/60", buyKey: "W" },
  cdn: { label: "CDN", req: "Image", icon: ImageIcon, work: 0.9, chip: "bg-emerald-500", text: "text-emerald-300", ring: "border-emerald-400/60", buyKey: "E" },
};

const SLOTS = 2; // requests a server works on at once
const QUEUE = 3; // requests a server can hold waiting
const TIMEOUT = 5.5; // seconds a request waits at the router before a 504
const LIVES = 10;
const MAX_PER_KIND = 3;
const CRASH_TIME = 5;
const BEST_KEY = "dcw-load-balancer-best";

const serverCost = (owned: number) => 10 + owned * 6;

/* ── State ──────────────────────────────────────────────────────────────── */

interface Req {
  id: number;
  kind: Kind;
  age: number;
}
interface Srv {
  id: number;
  kind: Kind;
  jobs: number[]; // seconds left on each running job
  waiting: number;
  down: number; // seconds until back up
  outage: boolean; // down because of an outage (not overload)
  flash: number;
}
interface Pop {
  id: number;
  text: string;
  tone: "good" | "bad";
  at: number;
}
interface Game {
  t: number;
  queue: Req[];
  servers: Srv[];
  served: number;
  errors: number;
  lives: number;
  credits: number;
  spawnAcc: number;
  spikeUntil: number;
  nextSpike: number;
  nextOutage: number;
  banner: string;
  bannerUntil: number;
  pops: Pop[];
  nextId: number;
}

const SPIKE_LINES = [
  "Traffic spike! A client just got shared on the news",
  "Traffic spike! Black Friday sale has started",
  "Traffic spike! Somebody posted you on a forum",
  "Traffic spike! The newsletter just went out",
];
const OUTAGE_LINES = ["is having a moment", "fell over during a deploy", "lost its network cable", "is rebooting for updates"];
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)] as T;

function newGame(): Game {
  let id = 1;
  return {
    t: 0,
    queue: [],
    servers: KIND_LIST.map((kind) => ({ id: id++, kind, jobs: [], waiting: 0, down: 0, outage: false, flash: 0 })),
    served: 0,
    errors: 0,
    lives: LIVES,
    credits: 0,
    spawnAcc: 0.6,
    spikeUntil: 0,
    nextSpike: 40 + Math.random() * 15,
    nextOutage: 50 + Math.random() * 15,
    banner: "",
    bannerUntil: 0,
    pops: [],
    nextId: id,
  };
}

type Phase = "idle" | "playing" | "paused" | "over";

/**
 * Load Balancer - requests arrive at the router and you decide where each one
 * goes. Send each request to a server of the right type, spread the load so
 * nothing overheats, and buy more servers as traffic grows.
 */
export function LoadBalancer() {
  const g = React.useRef<Game>(newGame());
  const [, setFrame] = React.useState(0);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const phaseRef = React.useRef<Phase>("idle");
  const [best, setBest] = React.useState(0);
  const [isBest, setIsBest] = React.useState(false);
  const raf = React.useRef(0);
  const startedAt = React.useRef(0);

  const setP = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  React.useEffect(() => {
    try {
      setBest(Number(window.localStorage.getItem(BEST_KEY)) || 0);
    } catch {
      /* ignore */
    }
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const pop = (text: string, tone: Pop["tone"]) => {
    const s = g.current;
    s.pops.push({ id: s.nextId++, text, tone, at: s.t });
    if (s.pops.length > 4) s.pops.shift();
  };

  const loseLife = (n: number, text: string) => {
    const s = g.current;
    s.lives = Math.max(0, s.lives - n);
    s.errors += n;
    pop(text, "bad");
    playSound("hurt");
  };

  const gameOver = React.useCallback(() => {
    const s = g.current;
    cancelAnimationFrame(raf.current);
    setP("over");
    playSound("gameOver");
    const score = s.served * 10;
    setBest((b) => {
      const nb = Math.max(b, score);
      setIsBest(score > b && score > 0);
      try {
        window.localStorage.setItem(BEST_KEY, String(nb));
      } catch {
        /* ignore */
      }
      return nb;
    });
    void submitScore("balancer", score, performance.now() - startedAt.current);
  }, []);

  const step = React.useCallback((dt: number) => {
    const s = g.current;
    s.t += dt;
    const spike = s.t < s.spikeUntil;

    // Events
    if (s.t > s.nextSpike) {
      s.spikeUntil = s.t + 8;
      s.nextSpike = s.t + 40 + Math.random() * 20;
      s.banner = pick(SPIKE_LINES);
      s.bannerUntil = s.t + 3.5;
      playSound("wave");
    }
    if (s.t > s.nextOutage) {
      const up = s.servers.filter((v) => v.down <= 0);
      if (up.length > 1) {
        const v = pick(up);
        const dropped = v.jobs.length + v.waiting;
        v.jobs = [];
        v.waiting = 0;
        v.down = 7;
        v.outage = true;
        s.banner = `Outage: ${KINDS[v.kind].label} server #${v.id} ${pick(OUTAGE_LINES)}`;
        s.bannerUntil = s.t + 3.5;
        if (dropped) loseLife(Math.min(2, dropped), `${dropped} request${dropped > 1 ? "s" : ""} lost in the outage`);
        else playSound("crash");
      }
      s.nextOutage = s.t + 30 + Math.random() * 15;
    }

    // New requests
    const rate = (0.75 + s.t * 0.017) * (spike ? 2.1 : 1);
    s.spawnAcc += rate * dt;
    while (s.spawnAcc >= 1) {
      s.spawnAcc -= 1;
      const r = Math.random();
      const kind: Kind = r < 0.45 ? "web" : r < 0.75 ? "api" : "cdn";
      s.queue.push({ id: s.nextId++, kind, age: 0 });
    }

    // Timeouts at the router
    for (const q of s.queue) q.age += dt;
    const expired = s.queue.filter((q) => q.age > TIMEOUT);
    if (expired.length) {
      s.queue = s.queue.filter((q) => q.age <= TIMEOUT);
      loseLife(expired.length, `504 · ${KINDS[expired[0]!.kind].req} timed out`);
    }

    // Servers work
    for (const v of s.servers) {
      v.flash = Math.max(0, v.flash - dt);
      if (v.down > 0) {
        v.down -= dt;
        if (v.down <= 0) {
          v.down = 0;
          v.outage = false;
        }
        continue;
      }
      let done = 0;
      v.jobs = v.jobs.map((j) => j - dt).filter((j) => {
        if (j <= 0) done++;
        return j > 0;
      });
      if (done) {
        s.served += done;
        s.credits += done;
        if (Math.random() < 0.35) playSound("coin");
      }
      while (v.jobs.length < SLOTS && v.waiting > 0) {
        v.waiting--;
        v.jobs.push(KINDS[v.kind].work);
      }
    }
    s.pops = s.pops.filter((p) => s.t - p.at < 1.6);
    // loseLife only touches refs, so it's safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loop = React.useCallback(() => {
    let last = performance.now();
    let acc = 0;
    const frame = (now: number) => {
      if (phaseRef.current !== "playing") return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      step(dt);
      acc += dt;
      if (acc > 0.05) {
        acc = 0;
        setFrame((f) => f + 1);
      }
      if (g.current.lives <= 0) return gameOver();
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [step, gameOver]);

  const start = () => {
    unlockAudio();
    playSound("start");
    g.current = newGame();
    startedAt.current = performance.now();
    setIsBest(false);
    setP("playing");
    loop();
  };

  const togglePause = React.useCallback(() => {
    if (phaseRef.current === "playing") {
      cancelAnimationFrame(raf.current);
      setP("paused");
    } else if (phaseRef.current === "paused") {
      setP("playing");
      loop();
    }
  }, [loop]);

  // Pause when the tab or window loses focus.
  React.useEffect(() => {
    const onBlur = () => phaseRef.current === "playing" && togglePause();
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [togglePause]);

  /* ── Actions ─────────────────────────────────────────────────────────── */

  const route = React.useCallback((serverId: number) => {
    if (phaseRef.current !== "playing") return;
    const s = g.current;
    const v = s.servers.find((x) => x.id === serverId);
    const req = s.queue[0];
    if (!v || !req) return;
    s.queue.shift();
    if (v.down > 0) {
      loseLife(1, `503 · ${KINDS[v.kind].label} #${v.id} is down`);
    } else if (req.kind !== v.kind) {
      v.flash = 0.4;
      loseLife(1, `404 · ${KINDS[req.kind].req} sent to a ${KINDS[v.kind].label} server`);
    } else if (v.jobs.length < SLOTS) {
      v.jobs.push(KINDS[v.kind].work);
      playSound("click");
    } else if (v.waiting < QUEUE) {
      v.waiting++;
      playSound("click");
    } else {
      // Overloaded: it falls over and drops everything it was holding.
      const lost = v.jobs.length + v.waiting + 1;
      v.jobs = [];
      v.waiting = 0;
      v.down = CRASH_TIME;
      v.flash = 0.6;
      loseLife(2, `Overload! ${KINDS[v.kind].label} #${v.id} crashed (${lost} requests lost)`);
      playSound("crash");
    }
    setFrame((f) => f + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buy = React.useCallback((kind: Kind) => {
    if (phaseRef.current !== "playing") return;
    const s = g.current;
    const owned = s.servers.filter((v) => v.kind === kind).length;
    const cost = serverCost(owned);
    if (owned >= MAX_PER_KIND || s.credits < cost) {
      playSound("wrong");
      return;
    }
    s.credits -= cost;
    s.servers.push({ id: s.nextId++, kind, jobs: [], waiting: 0, down: 0, outage: false, flash: 0 });
    playSound("select");
    pop(`New ${KINDS[kind].label} server online`, "good");
    setFrame((f) => f + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard: 1-9 route to the numbered server, Q/W/E buy, P pauses.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const p = phaseRef.current;
      if (p !== "playing" && p !== "paused") return;
      const k = e.key.toLowerCase();
      if (k === "p" || k === "escape") {
        e.preventDefault();
        togglePause();
        return;
      }
      if (p !== "playing") return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) {
        const ordered = orderedServers(g.current.servers);
        const v = ordered[n - 1];
        if (v) {
          e.preventDefault();
          route(v.id);
        }
      } else if (k === "q" || k === "w" || k === "e") {
        e.preventDefault();
        buy(k === "q" ? "web" : k === "w" ? "api" : "cdn");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [route, buy, togglePause]);

  /* ── Render ──────────────────────────────────────────────────────────── */

  const s = g.current;
  const ordered = orderedServers(s.servers);
  const keyOf = (id: number) => ordered.findIndex((v) => v.id === id) + 1;
  const spike = s.t < s.spikeUntil;
  const score = s.served * 10;
  const uptime = s.served + s.errors ? (s.served / (s.served + s.errors)) * 100 : 100;

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-4 sm:p-6">
      {/* HUD */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-sm">
        <span className="text-foreground">
          <span className="text-muted-foreground">Served </span>
          {s.served.toLocaleString("en-GB")}
        </span>
        <span className="inline-flex items-center gap-1 text-yellow-300" title="Credits for new servers">
          <Zap className="size-4" /> {s.credits}
        </span>
        <span className="inline-flex items-center gap-1" aria-label={`${s.lives} of ${LIVES} error budget left`}>
          {Array.from({ length: LIVES }, (_, i) => (
            <Heart key={i} className={cn("size-3.5", i < s.lives ? "fill-red-400 text-red-400" : "text-muted-foreground/40")} />
          ))}
        </span>
        <span className="ml-auto inline-flex items-center gap-2 text-muted-foreground">
          <Trophy className="size-4 text-accent" /> {best.toLocaleString("en-GB")}
          {(phase === "playing" || phase === "paused") && (
            <button
              type="button"
              onClick={togglePause}
              aria-label={phase === "paused" ? "Resume" : "Pause"}
              className="grid size-9 place-items-center rounded-lg border border-border hover:text-foreground"
            >
              {phase === "paused" ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
          <SoundToggle />
        </span>
      </div>

      <div className="relative mt-4">
        {/* Router queue */}
        <div
          className={cn(
            "rounded-2xl border bg-surface/50 p-3 transition-colors",
            spike ? "border-amber-400/60 bg-amber-500/5" : "border-border"
          )}
        >
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="font-mono uppercase tracking-wider">Router queue</span>
            <span className={cn("truncate", s.t < s.bannerUntil ? "text-amber-300" : "")} aria-live="polite">
              {s.t < s.bannerUntil ? s.banner : spike ? "Traffic spike in progress" : `${s.queue.length} waiting`}
            </span>
          </div>
          <div className="mt-2 flex min-h-[56px] items-center gap-1.5 overflow-hidden">
            {s.queue.length === 0 && <span className="text-xs text-muted-foreground">All quiet. For now.</span>}
            {s.queue.slice(0, 14).map((q, i) => {
              const K = KINDS[q.kind];
              const left = 1 - q.age / TIMEOUT;
              return (
                <div
                  key={q.id}
                  data-kind={q.kind}
                  title={i === 0 ? `Next: ${K.req}` : K.req}
                  className={cn(
                    "relative flex shrink-0 flex-col items-center rounded-lg border px-2 pb-1.5 pt-1",
                    i === 0 ? cn("scale-110 border-2 bg-card", K.ring) : "border-transparent bg-card/60"
                  )}
                >
                  <K.icon className={cn("size-5", K.text)} />
                  <span className="mt-0.5 text-[9px] uppercase text-muted-foreground">{i === 0 ? "next" : K.label}</span>
                  <span className="absolute inset-x-1 bottom-0.5 h-0.5 overflow-hidden rounded bg-muted-foreground/20">
                    <span className={cn("block h-full", left < 0.3 ? "bg-red-400" : K.chip)} style={{ width: `${Math.max(0, left) * 100}%` }} />
                  </span>
                </div>
              );
            })}
            {s.queue.length > 14 && <span className="font-mono text-xs text-red-300">+{s.queue.length - 14}</span>}
          </div>
        </div>

        {/* Servers */}
        <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3">
          {KIND_LIST.map((kind) => {
            const K = KINDS[kind];
            const mine = ordered.filter((v) => v.kind === kind);
            const cost = serverCost(mine.length);
            return (
              <div key={kind} className="flex flex-col gap-2">
                <p className={cn("flex items-center gap-1.5 text-xs font-semibold", K.text)}>
                  <K.icon className="size-3.5" /> {K.label}
                  <span className="hidden font-normal text-muted-foreground sm:inline">· {K.req}s</span>
                </p>
                {mine.map((v) => {
                  const load = (v.jobs.length + v.waiting) / (SLOTS + QUEUE);
                  return (
                    <button
                      key={v.id}
                      type="button"
                      data-kind={v.kind}
                      data-load={v.down > 0 ? 99 : v.jobs.length + v.waiting}
                      onClick={() => route(v.id)}
                      disabled={phase !== "playing"}
                      aria-label={`${K.label} server ${keyOf(v.id)}: ${v.down > 0 ? "down" : `${v.jobs.length + v.waiting} of ${SLOTS + QUEUE} busy`}`}
                      className={cn(
                        "relative touch-manipulation rounded-xl border bg-surface/60 p-2.5 text-left transition-all active:scale-[0.98] disabled:cursor-default",
                        v.down > 0 ? "border-red-500/50 bg-red-500/10" : v.flash > 0 ? "border-red-400" : load >= 0.8 ? "border-amber-400/70" : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="flex items-center justify-between gap-1">
                        <Server className={cn("size-4", v.down > 0 ? "text-red-400" : K.text)} />
                        <kbd className="rounded border border-border px-1 font-mono text-[10px] text-muted-foreground">{keyOf(v.id)}</kbd>
                      </span>
                      {v.down > 0 ? (
                        <span className="mt-2 block font-mono text-[11px] text-red-300">
                          {v.outage ? "OUTAGE" : "CRASHED"} {Math.ceil(v.down)}s
                        </span>
                      ) : (
                        <>
                          <span className="mt-2 flex gap-1">
                            {Array.from({ length: SLOTS }, (_, i) => (
                              <span key={i} className={cn("h-2 flex-1 rounded-sm", i < v.jobs.length ? K.chip : "bg-muted-foreground/20")} />
                            ))}
                          </span>
                          <span className="mt-1 flex gap-1">
                            {Array.from({ length: QUEUE }, (_, i) => (
                              <span
                                key={i}
                                className={cn("h-1.5 flex-1 rounded-sm", i < v.waiting ? (v.waiting >= QUEUE ? "bg-red-400" : "bg-amber-400") : "bg-muted-foreground/15")}
                              />
                            ))}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
                {mine.length < MAX_PER_KIND && (
                  <button
                    type="button"
                    onClick={() => buy(kind)}
                    disabled={phase !== "playing" || s.credits < cost}
                    className="flex touch-manipulation items-center justify-center gap-1 rounded-xl border border-dashed border-border py-2 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-40"
                  >
                    <Plus className="size-3" /> {cost}
                    <Zap className="size-3 text-yellow-300" />
                    <kbd className="ml-1 hidden font-mono text-[10px] sm:inline">{K.buyKey}</kbd>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Pop-up messages */}
        <div className="pointer-events-none mt-3 h-10 space-y-0.5 overflow-hidden text-center font-mono text-xs" aria-live="polite">
          {s.pops.slice(-2).map((p) => (
            <p key={p.id} className={p.tone === "bad" ? "text-red-300" : "text-emerald-300"}>
              {p.text}
            </p>
          ))}
        </div>

        {phase !== "playing" && (
          <div className="absolute inset-0 grid place-items-center rounded-2xl bg-background/80 p-4 backdrop-blur-sm">
            <div className="max-w-md text-center">
              {phase === "idle" && (
                <>
                  <p className="font-heading text-xl font-bold">You&apos;re the load balancer</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Requests queue up at the router. Click (or press its number) a server of the{" "}
                    <span className="text-foreground">matching type</span> to send the next one there. Spread the load: a server with a full queue
                    crashes. Spend credits on more servers as traffic grows. Watch out for spikes and outages.
                  </p>
                </>
              )}
              {phase === "paused" && <p className="font-heading text-xl font-bold">Paused</p>}
              {phase === "over" && (
                <>
                  <p className="font-heading text-2xl font-bold">Error budget spent</p>
                  <p className="mt-1 font-mono text-3xl font-bold text-primary">{score.toLocaleString("en-GB")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.served} requests served · {uptime.toFixed(1)}% success · {Math.floor(s.t)}s online
                  </p>
                  {isBest && <p className="mt-1 text-sm font-semibold text-accent">New best score!</p>}
                  <WeeklyRank game="balancer" className="mt-1" />
                </>
              )}
              {phase === "paused" ? (
                <Button onClick={togglePause} variant="primary" className="mt-4">
                  <Play className="size-4" /> Resume
                </Button>
              ) : (
                <Button onClick={start} variant="primary" className="mt-4">
                  {phase === "idle" ? (
                    <>
                      <Play className="size-4" /> Start shift
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" /> Try again
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mt-1 text-center text-xs text-muted-foreground">
        Keys 1-9 route · Q/W/E buy Web/API/CDN servers · P pauses · Score is 10 per request served
      </p>
    </div>
  );
}

function orderedServers(list: Srv[]) {
  return KIND_LIST.flatMap((k) => list.filter((v) => v.kind === k));
}
