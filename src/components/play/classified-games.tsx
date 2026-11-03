"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCountdown, useNow, useRootSession } from "@/lib/root-access";
import { OPEN_TERMINAL_EVENT } from "@/components/easter-egg/secret-terminal";

// Only downloaded for people with root access, one game at a time.
const loading = () => <p className="py-10 text-center font-mono text-sm text-muted-foreground">decrypting…</p>;
const BugSweeper = dynamic(() => import("@/components/play/bug-sweeper").then((m) => m.BugSweeper), { ssr: false, loading });
const StackOverflow = dynamic(() => import("@/components/play/stack-overflow").then((m) => m.StackOverflow), { ssr: false, loading });

const GAMES = [
  { id: "sweeper", name: "Bug Sweeper", blurb: "Clear the codebase without opening a file that's hiding a bug. Numbers count the bugs next door." },
  { id: "stack", name: "Stack Overflow", blurb: "A falling-blocks puzzle. Fit the code blocks together so full rows compile, before legacy code pushes the stack over the top." },
] as const;
type GameId = (typeof GAMES)[number]["id"];
const TAB_KEY = "dcw-classified-tab";

/** Games only available during a root session (see the secret terminal). */
export function ClassifiedGames() {
  const session = useRootSession();
  const now = useNow(!!session);
  const [tab, setTab] = React.useState<GameId>("sweeper");

  React.useEffect(() => {
    try {
      const t = window.localStorage.getItem(TAB_KEY) as GameId | null;
      if (t && GAMES.some((g) => g.id === t)) setTab(t);
    } catch {
      /* ignore */
    }
  }, []);

  const choose = (id: GameId) => {
    setTab(id);
    try {
      window.localStorage.setItem(TAB_KEY, id);
    } catch {
      /* ignore */
    }
  };
  const current = GAMES.find((g) => g.id === tab)!;

  if (!session) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border bg-card/50 p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-surface text-muted-foreground">
          <Lock className="size-6" />
        </span>
        <h3 className="mt-4 font-heading text-xl font-semibold">Clearance required</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          There are more games here, but they&apos;re locked. Rumour has it there&apos;s a terminal
          hidden somewhere on this site, and whoever cracks its password gets in until midnight.
        </p>
        <p className="mt-4 font-mono text-xs text-muted-foreground/70">hint: developers know where to look</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-6 flex items-center justify-center gap-2 font-mono text-xs text-accent">
        <ShieldCheck className="size-4" /> root access · {formatCountdown(session.expiresAt - now)} until midnight
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT))}
          className="ml-2 underline-offset-4 hover:underline"
        >
          open terminal
        </button>
      </p>

      <div role="tablist" aria-label="Classified games" className="mx-auto mb-4 flex max-w-xl flex-wrap justify-center gap-2">
        {GAMES.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={tab === g.id}
            onClick={() => choose(g.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab === g.id ? "border-accent bg-accent/15 text-accent" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>
      <p className="mx-auto mb-6 max-w-xl text-center text-sm text-muted-foreground">{current.blurb}</p>

      <div role="tabpanel" aria-label={current.name}>
        {tab === "sweeper" && <BugSweeper />}
        {tab === "stack" && <StackOverflow />}
      </div>
    </div>
  );
}
