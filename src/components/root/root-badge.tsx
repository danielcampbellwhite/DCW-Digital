"use client";

import { ShieldCheck } from "lucide-react";
import { formatCountdown, OPEN_ROOT_PANEL_EVENT, useNow, useRootSession } from "@/lib/root-access";
import { cn } from "@/lib/utils";

/** Header pill shown during a root session, counting down to midnight. */
export function RootBadge({ compact = false }: { compact?: boolean }) {
  const session = useRootSession();
  const now = useNow(!!session);
  if (!session) return null;
  const left = formatCountdown(session.expiresAt - now);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_ROOT_PANEL_EVENT))}
      aria-label={`Root access active, ${left} left. Open root control panel`}
      title="Root control panel"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 font-mono text-accent transition-colors hover:bg-accent/20",
        compact ? "h-10 px-2.5 text-[11px]" : "px-3 py-1.5 text-xs"
      )}
    >
      <ShieldCheck className={compact ? "size-4" : "size-3.5"} />
      <span>ROOT</span>
      <span className={cn("tabular-nums", compact && "hidden min-[380px]:inline")}>{left}</span>
    </button>
  );
}
