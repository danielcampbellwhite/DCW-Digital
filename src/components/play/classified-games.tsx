"use client";

import dynamic from "next/dynamic";
import { Lock, ShieldCheck } from "lucide-react";
import { formatCountdown, useNow, useRootSession } from "@/lib/root-access";
import { OPEN_TERMINAL_EVENT } from "@/components/easter-egg/secret-terminal";

// Only downloaded for people with root access.
const BugSweeper = dynamic(() => import("@/components/play/bug-sweeper").then((m) => m.BugSweeper), {
  ssr: false,
  loading: () => <p className="text-center text-sm text-muted-foreground">Decrypting…</p>,
});

/** Games only available during a root session (see the secret terminal). */
export function ClassifiedGames() {
  const session = useRootSession();
  const now = useNow(!!session);

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
      <BugSweeper />
    </div>
  );
}
