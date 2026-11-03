"use client";

import * as React from "react";
import {
  AlertTriangle,
  Bot,
  Coffee,
  GraduationCap,
  Megaphone,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  UserRound,
  UsersRound,
  Wrench,
  Workflow,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { playSound, unlockAudio } from "@/lib/sfx";
import { SoundToggle } from "@/components/play/sound-toggle";

/* ── Balance ────────────────────────────────────────────────────────────── */

type GenId = "intern" | "junior" | "senior" | "team" | "ai" | "qa" | "server";
type BoostId = "coffee" | "marketing" | "ci" | "cloud";

const GENS: Record<GenId, { name: string; desc: string; base: number; icon: React.ComponentType<{ className?: string }>; rate?: number }> = {
  intern: { name: "Intern", desc: "Ships 0.2 features/s", base: 15, rate: 0.2, icon: GraduationCap },
  junior: { name: "Junior dev", desc: "Ships 1 feature/s", base: 110, rate: 1, icon: UserRound },
  senior: { name: "Senior dev", desc: "Ships 6 features/s, writes cleaner code", base: 1_200, rate: 6, icon: UsersRound },
  team: { name: "Dev team", desc: "Ships 40 features/s", base: 13_000, rate: 40, icon: Users },
  ai: { name: "AI pair programmer", desc: "Ships 260 features/s (a human still reviews it)", base: 140_000, rate: 260, icon: Bot },
  qa: { name: "QA engineer", desc: "Pays down 0.3% tech debt/s", base: 900, icon: ShieldCheck },
  server: { name: "Server", desc: "Room for more users", base: 50, icon: Server },
};
const GEN_ORDER: GenId[] = ["intern", "junior", "senior", "team", "ai", "qa", "server"];

const BOOSTS: Record<BoostId, { name: string; desc: string; costs: number[]; icon: React.ComponentType<{ className?: string }> }> = {
  coffee: { name: "Better coffee", desc: "Doubles what each click ships", costs: [60, 600, 6_000, 60_000, 600_000], icon: Coffee },
  marketing: { name: "Marketing push", desc: "+50% users per feature", costs: [250, 2_500, 25_000, 250_000, 2_500_000, 25_000_000], icon: Megaphone },
  ci: { name: "CI pipeline", desc: "Halves tech debt from new features", costs: [3_000, 300_000], icon: Workflow },
  cloud: { name: "Move to the cloud", desc: "Every server holds 5x the users", costs: [8_000, 400_000, 20_000_000], icon: Rocket },
};

const MILESTONES = [
  { users: 10, title: "First users!", text: "Your mum signed up. So did her friend.", cash: 0 },
  { users: 100, title: "Product Hunt", text: "You made it to the front page for an afternoon.", cash: 200 },
  { users: 1_000, title: "Seed round", text: "An angel investor liked your deck. +£2,000.", cash: 2_000 },
  { users: 10_000, title: "Series A", text: "You now have a ping-pong table. +£25,000.", cash: 25_000 },
  { users: 100_000, title: "Series B", text: "You've hired a Head of Vibes. +£300,000.", cash: 300_000 },
  { users: 1_000_000, title: "Unicorn", text: "Valued at £1bn. You can now sell the company.", cash: 3_000_000 },
  { users: 10_000_000, title: "IPO", text: "You rang the bell. The stock went up. Then down. Then up.", cash: 50_000_000 },
];

const SAVE_KEY = "dcw-startup-tycoon";
const REVENUE_PER_USER = 0.1; // £ per user per second
const BASE_CAPACITY = 50;
const SERVER_CAPACITY = 150;
const REFACTOR_SECONDS = 12;

const genCost = (id: GenId, owned: number) => Math.ceil(GENS[id].base * Math.pow(1.15, owned));

interface Save {
  v: 1;
  cash: number;
  users: number;
  peakUsers: number;
  features: number;
  debt: number; // 0-100
  gens: Record<GenId, number>;
  boosts: Record<BoostId, number>;
  milestone: number;
  exits: number;
  refactor: number; // seconds left
  savedAt: number;
}

const fresh = (exits = 0): Save => ({
  v: 1,
  cash: 0,
  users: 0,
  peakUsers: 0,
  features: 0,
  debt: 0,
  gens: { intern: 0, junior: 0, senior: 0, team: 0, ai: 0, qa: 0, server: 0 },
  boosts: { coffee: 0, marketing: 0, ci: 0, cloud: 0 },
  milestone: 0,
  exits,
  refactor: 0,
  savedAt: Date.now(),
});

/* ── Derived numbers ────────────────────────────────────────────────────── */

const capacity = (s: Save) => (BASE_CAPACITY + s.gens.server * SERVER_CAPACITY) * Math.pow(5, s.boosts.cloud);
const usersPerFeature = (s: Save) => Math.pow(1.5, s.boosts.marketing) * (1 + s.exits * 0.5);
const productivity = (s: Save) => (s.refactor > 0 ? 0 : 1 - (s.debt / 100) * 0.8);
const clickPower = (s: Save) => Math.pow(2, s.boosts.coffee);
const featureRate = (s: Save) =>
  (["intern", "junior", "senior", "team", "ai"] as GenId[]).reduce((sum, id) => sum + s.gens[id] * (GENS[id].rate ?? 0), 0) * productivity(s);
const debtPerFeature = (s: Save) => {
  const total = s.gens.intern + s.gens.junior + s.gens.senior + s.gens.team + s.gens.ai;
  const seniorShare = total ? (s.gens.senior + s.gens.team + s.gens.ai) / total : 0;
  // Debt per feature shrinks as the codebase grows, so it stays a steady pressure.
  const scale = 1 / (1 + Math.log10(1 + s.features / 50));
  return 0.06 * scale * (1 - seniorShare * 0.6) * Math.pow(0.5, s.boosts.ci);
};

function fmt(n: number, money = false): string {
  const sign = money ? "£" : "";
  if (n < 1000) return sign + (n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toLocaleString("en-GB"));
  const units = ["K", "M", "B", "T", "Qa", "Qi"];
  let u = -1;
  let v = n;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  return `${sign}${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)}${units[u]}`;
}

/** Advance the simulation by `dt` seconds. Mutates and returns the save. */
function simulate(s: Save, dt: number): Save {
  const cap = capacity(s);
  const shipped = featureRate(s) * dt;
  if (shipped > 0) {
    s.features += shipped;
    s.users = Math.min(cap, s.users + shipped * usersPerFeature(s));
    s.debt = Math.min(100, s.debt + shipped * debtPerFeature(s));
  }
  s.debt = Math.max(0, s.debt - s.gens.qa * 0.3 * dt);
  if (s.refactor > 0) {
    s.refactor = Math.max(0, s.refactor - dt);
    s.debt = Math.max(0, s.debt - 4 * dt);
  }
  s.cash += s.users * REVENUE_PER_USER * dt;
  s.peakUsers = Math.max(s.peakUsers, s.users);
  return s;
}

function load(): { save: Save; away: string | null } {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return { save: fresh(), away: null };
    const parsed = { ...fresh(), ...(JSON.parse(raw) as Partial<Save>) } as Save;
    parsed.gens = { ...fresh().gens, ...parsed.gens };
    parsed.boosts = { ...fresh().boosts, ...parsed.boosts };
    // Offline progress: up to two hours, at half speed.
    const away = Math.min(2 * 60 * 60, (Date.now() - (parsed.savedAt || Date.now())) / 1000);
    if (away > 60) {
      const before = { cash: parsed.cash, users: parsed.users };
      let left = away / 2;
      while (left > 0) {
        const step = Math.min(5, left);
        simulate(parsed, step);
        left -= step;
      }
      const gained = parsed.cash - before.cash;
      const newUsers = parsed.users - before.users;
      if (gained > 1)
        return {
          save: parsed,
          away: `While you were away the team kept going: +${fmt(gained, true)}${newUsers >= 1 ? ` and +${fmt(newUsers)} users` : ""}.`,
        };
    }
    return { save: parsed, away: null };
  } catch {
    return { save: fresh(), away: null };
  }
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Startup Tycoon - an idle game. Ship features to win users, users bring in
 * revenue, revenue hires a team that ships for you. Keep the servers ahead of
 * demand and don't let tech debt grind everything to a halt.
 */
export function StartupTycoon() {
  const s = React.useRef<Save>(fresh());
  const [, setFrame] = React.useState(0);
  const [ready, setReady] = React.useState(false);
  const [log, setLog] = React.useState<{ id: number; title: string; text: string }[]>([]);
  const [confirmSell, setConfirmSell] = React.useState(false);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const logId = React.useRef(0);

  const note = (title: string, text: string) =>
    setLog((l) => [{ id: ++logId.current, title, text }, ...l].slice(0, 4));

  const save = React.useCallback(() => {
    try {
      s.current.savedAt = Date.now();
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(s.current));
    } catch {
      /* ignore */
    }
  }, []);

  // Load, then tick ten times a second.
  React.useEffect(() => {
    const { save: loaded, away } = load();
    s.current = loaded;
    setReady(true);
    if (away) note("Welcome back", away);
    let last = performance.now();
    let sinceSave = 0;
    const iv = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(1, (now - last) / 1000);
      last = now;
      const cur = s.current;
      simulate(cur, dt);
      const m = MILESTONES[cur.milestone];
      if (m && cur.peakUsers >= m.users) {
        cur.milestone++;
        cur.cash += m.cash;
        note(m.title, m.text);
        playSound("badge");
      }
      sinceSave += dt;
      if (sinceSave > 5) {
        sinceSave = 0;
        save();
      }
      setFrame((f) => f + 1);
    }, 100);
    const onHide = () => document.visibilityState === "hidden" && save();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [save]);

  const cur = s.current;
  const cap = capacity(cur);
  const atCap = cur.users >= cap - 0.5;
  const rate = featureRate(cur);
  const income = cur.users * REVENUE_PER_USER;

  const ship = () => {
    unlockAudio();
    if (cur.refactor > 0) return;
    const n = clickPower(cur) * Math.max(0.2, productivity(cur));
    cur.features += n;
    cur.users = Math.min(cap, cur.users + n * usersPerFeature(cur));
    cur.debt = Math.min(100, cur.debt + n * debtPerFeature(cur));
    cur.peakUsers = Math.max(cur.peakUsers, cur.users);
    playSound(atCap ? "miss" : "click");
    setFrame((f) => f + 1);
  };

  const buyGen = (id: GenId) => {
    const cost = genCost(id, cur.gens[id]);
    if (cur.cash < cost) return;
    cur.cash -= cost;
    cur.gens[id]++;
    playSound("coin");
    if (cur.gens[id] === 1) note(`First ${GENS[id].name.toLowerCase()}!`, GENS[id].desc + ".");
    setFrame((f) => f + 1);
  };

  const buyBoost = (id: BoostId) => {
    const lvl = cur.boosts[id];
    const cost = BOOSTS[id].costs[lvl];
    if (cost === undefined || cur.cash < cost) return;
    cur.cash -= cost;
    cur.boosts[id]++;
    playSound("select");
    note(BOOSTS[id].name, BOOSTS[id].desc + ".");
    setFrame((f) => f + 1);
  };

  const refactor = () => {
    if (cur.refactor > 0 || cur.debt < 5) return;
    cur.refactor = REFACTOR_SECONDS;
    playSound("start");
    note("Refactor sprint", "Feature freeze while the team tidies up. Debt is coming down.");
  };

  const sell = () => {
    const exits = cur.exits + 1;
    s.current = fresh(exits);
    save();
    setConfirmSell(false);
    setLog([]);
    playSound("finish");
    note("Exit!", `You sold the company. On to startup #${exits + 1}, with +${exits * 50}% users per feature from experience.`);
  };

  const reset = () => {
    s.current = fresh();
    save();
    setConfirmReset(false);
    setLog([]);
  };

  const debtTone = cur.debt > 66 ? "bg-red-400" : cur.debt > 33 ? "bg-amber-400" : "bg-emerald-400";
  const nextMilestone = MILESTONES[cur.milestone];

  return (
    <div className={cn("mx-auto max-w-4xl rounded-3xl border border-border bg-card p-4 transition-opacity sm:p-6", !ready && "opacity-0")}>
      {/* Top stats */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-3xl font-bold tabular-nums">{fmt(cur.cash, true)}</p>
          <p className="font-mono text-xs text-muted-foreground">+{fmt(income, true)}/s revenue</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-bold tabular-nums text-primary">
            {fmt(cur.users)} <span className="text-sm font-normal text-muted-foreground">/ {fmt(cap)} users</span>
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {fmt(rate)} features/s{cur.exits > 0 && ` · startup #${cur.exits + 1}`}
          </p>
        </div>
      </div>

      {/* Capacity + debt bars */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Server capacity</span>
            {atCap && <span className="font-semibold text-amber-300">Full! Buy servers</span>}
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted-foreground/15">
            <div className={cn("h-full transition-all", atCap ? "bg-amber-400" : "bg-primary")} style={{ width: `${Math.min(100, (cur.users / cap) * 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Tech debt {cur.debt.toFixed(0)}%</span>
            {cur.refactor > 0 ? (
              <span className="text-emerald-300">Refactoring… {Math.ceil(cur.refactor)}s</span>
            ) : cur.debt > 50 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-red-300">
                <AlertTriangle className="size-3" /> Everything&apos;s slowing down
              </span>
            ) : null}
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted-foreground/15">
            <div className={cn("h-full transition-all", debtTone)} style={{ width: `${cur.debt}%` }} />
          </div>
        </div>
      </div>

      {/* Main actions */}
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <button
          type="button"
          onClick={ship}
          disabled={cur.refactor > 0}
          className="group flex touch-manipulation items-center justify-center gap-3 rounded-2xl border border-primary/50 bg-primary/10 px-6 py-5 font-heading text-lg font-semibold transition active:scale-[0.98] hover:bg-primary/20 disabled:opacity-50"
        >
          <Sparkles className="size-6 text-primary transition-transform group-active:scale-125" />
          Ship a feature
          <span className="font-mono text-xs font-normal text-muted-foreground">+{fmt(clickPower(cur))}</span>
        </button>
        <button
          type="button"
          onClick={refactor}
          disabled={cur.refactor > 0 || cur.debt < 5}
          title="Pause shipping for a few seconds to pay down tech debt"
          className="flex touch-manipulation items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm transition hover:border-emerald-400/60 disabled:opacity-40"
        >
          <Wrench className="size-4 text-emerald-300" /> Refactor sprint
        </button>
      </div>

      {/* Milestone + news */}
      <div className="mt-4 min-h-[3.5rem] rounded-xl border border-border bg-surface/40 px-4 py-2.5 text-sm" aria-live="polite">
        {log[0] ? (
          <p>
            <span className="font-semibold text-foreground">{/[.!?]$/.test(log[0].title) ? log[0].title : `${log[0].title}.`}</span>{" "}
            <span className="text-muted-foreground">{log[0].text}</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Day one. It&apos;s just you, a laptop and a dream. Ship something.</p>
        )}
        {nextMilestone && (
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            Next: {nextMilestone.title} at {fmt(nextMilestone.users)} users
          </p>
        )}
      </div>

      {/* Shop */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hire &amp; buy</p>
          <div className="mt-2 space-y-1.5">
            {GEN_ORDER.map((id) => {
              const gdef = GENS[id];
              const cost = genCost(id, cur.gens[id]);
              const visible = cur.gens[id] > 0 || cur.cash >= gdef.base * 0.4 || id === "intern" || id === "server";
              if (!visible) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => buyGen(id)}
                  disabled={cur.cash < cost}
                  className="flex w-full touch-manipulation items-center gap-3 rounded-xl border border-border bg-surface/40 px-3 py-2 text-left transition hover:border-primary/50 disabled:opacity-50"
                >
                  <gdef.icon className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {gdef.name} <span className="font-mono text-xs text-muted-foreground">×{cur.gens[id]}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{gdef.desc}</span>
                  </span>
                  <span className={cn("font-mono text-sm", cur.cash >= cost ? "text-yellow-300" : "text-muted-foreground")}>{fmt(cost, true)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upgrades</p>
          <div className="mt-2 space-y-1.5">
            {(Object.keys(BOOSTS) as BoostId[]).map((id) => {
              const b = BOOSTS[id];
              const lvl = cur.boosts[id];
              const cost = b.costs[lvl];
              const visible = lvl > 0 || (cost !== undefined && cur.cash >= cost * 0.3);
              if (!visible) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => buyBoost(id)}
                  disabled={cost === undefined || cur.cash < cost}
                  className="flex w-full touch-manipulation items-center gap-3 rounded-xl border border-border bg-surface/40 px-3 py-2 text-left transition hover:border-accent/50 disabled:opacity-50"
                >
                  <b.icon className="size-5 shrink-0 text-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {b.name} <span className="font-mono text-xs text-muted-foreground">lvl {lvl}</span>
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{b.desc}</span>
                  </span>
                  <span className={cn("font-mono text-sm", cost !== undefined && cur.cash >= cost ? "text-yellow-300" : "text-muted-foreground")}>
                    {cost === undefined ? "Maxed" : fmt(cost, true)}
                  </span>
                </button>
              );
            })}
            {(Object.keys(BOOSTS) as BoostId[]).every((id) => cur.boosts[id] === 0 && cur.cash < (BOOSTS[id].costs[0] ?? 0) * 0.3) && (
              <p className="rounded-xl border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">Upgrades appear as you can nearly afford them.</p>
            )}
          </div>

          {cur.peakUsers >= 1_000_000 && (
            <div className="mt-4 rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-3">
              <p className="text-sm font-semibold">Sell the company?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Start again from scratch, but every exit gives you +50% users per feature for good.
              </p>
              {confirmSell ? (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="primary" onClick={sell}>
                    Yes, sell it
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmSell(false)}>
                    Not yet
                  </Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="mt-2" onClick={() => setConfirmSell(true)}>
                  <Rocket className="size-4" /> Exit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Progress saves in this browser and keeps ticking (slowly) while you&apos;re away.</span>
        <span className="flex items-center gap-2">
          {confirmReset ? (
            <>
              <span>Start over?</span>
              <button type="button" onClick={reset} className="text-red-300 underline-offset-2 hover:underline">
                Yes, wipe it
              </button>
              <button type="button" onClick={() => setConfirmReset(false)} className="hover:text-foreground">
                Cancel
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-1 hover:text-foreground">
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
          <SoundToggle />
        </span>
      </div>
    </div>
  );
}
