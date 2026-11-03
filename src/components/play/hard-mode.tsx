"use client";

import * as React from "react";
import { Lock, Skull } from "lucide-react";
import { useRootSession } from "@/lib/root-access";
import { cn } from "@/lib/utils";

/**
 * Normal / hard switch for a game's start screen. Hard mode is a root-only
 * reward (crack the terminal password); without root it shows as locked.
 */
export function HardModeToggle({
  hard,
  onChange,
  hardLabel,
}: {
  hard: boolean;
  onChange: (hard: boolean) => void;
  hardLabel: string;
}) {
  const root = !!useRootSession();

  // Lose hard mode if root access ends (logout or midnight).
  React.useEffect(() => {
    if (!root && hard) onChange(false);
  }, [root, hard, onChange]);

  return (
    <div className="mx-auto mt-4 inline-flex rounded-full border border-border bg-surface/60 p-1 text-sm" role="radiogroup" aria-label="Difficulty">
      <button
        type="button"
        role="radio"
        aria-checked={!hard}
        onClick={() => onChange(false)}
        className={cn("rounded-full px-3 py-1 transition-colors", !hard ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
      >
        Normal
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={hard}
        aria-disabled={!root}
        title={root ? undefined : "Root access only. Crack the terminal password to unlock."}
        onClick={() => root && onChange(true)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition-colors",
          hard ? "bg-red-500/20 text-red-300" : root ? "text-muted-foreground hover:text-foreground" : "cursor-not-allowed text-muted-foreground/60"
        )}
      >
        {root ? <Skull className="size-3.5" /> : <Lock className="size-3.5" />}
        {hardLabel}
      </button>
    </div>
  );
}

/** Renders children only during a root session. */
export function RootOnly({ children }: { children: React.ReactNode }) {
  const root = !!useRootSession();
  return root ? <>{children}</> : null;
}
