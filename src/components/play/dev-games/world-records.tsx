"use client";

import * as React from "react";
import { Crown, Medal, RefreshCw, Trophy } from "lucide-react";
import { getPlayerId } from "@/components/play/weekly-leaderboard";
import { EVENT_IDS, EVENTS, type EventId, formatMark, type RecordsResponse } from "@/lib/records";
import { playerName } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

/* ── Shared store ───────────────────────────────────────────────────────── */

type Status = "loading" | "ready" | "unavailable";
interface State {
  status: Status;
  data: RecordsResponse | null;
}

let state: State = { status: "loading", data: null };
const subs = new Set<() => void>();
const initial: State = { status: "loading", data: null };

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn());
}

export async function loadRecords() {
  const player = getPlayerId();
  try {
    const res = await fetch(`/api/records${player ? `?player=${player}` : ""}`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    set({ status: "ready", data: (await res.json()) as RecordsResponse });
  } catch {
    if (!state.data) set({ status: "unavailable" });
  }
}

/** Submit a mark. Resolves with whether it was a new world record / personal best. */
export async function submitMark(
  event: EventId,
  mark: number,
  durationMs: number
): Promise<{ newRecord: boolean; improved: boolean; rank: number | null } | null> {
  const player = getPlayerId(true);
  if (!player) return null;
  try {
    const res = await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, player, mark: Math.round(mark), durationMs: Math.round(durationMs) }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as RecordsResponse;
    set({ status: "ready", data });
    return { newRecord: Boolean(data.newRecord), improved: Boolean(data.improved), rank: data[event]?.you?.rank ?? null };
  } catch {
    return null;
  }
}

export function useRecords(): State {
  return React.useSyncExternalStore(
    React.useCallback((fn: () => void) => {
      subs.add(fn);
      return () => {
        subs.delete(fn);
      };
    }, []),
    () => state,
    () => initial
  );
}

/* ── Panel ──────────────────────────────────────────────────────────────── */

function setOn(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function WorldRecords({ className, highlight }: { className?: string; highlight?: EventId | null }) {
  const { status, data } = useRecords();
  const [me, setMe] = React.useState<string | null>(null);

  React.useEffect(() => {
    void loadRecords();
  }, []);

  React.useEffect(() => {
    const id = getPlayerId();
    setMe(id ? playerName(id) : null);
  }, [data]);

  if (status === "unavailable") return null;

  return (
    <section aria-label="Dev Games world records" className={cn("rounded-3xl border border-border bg-card p-5 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
          <Trophy className="size-5 text-yellow-400" /> World records
        </h3>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span>All-time · never reset</span>
          <button
            type="button"
            onClick={() => void loadRecords()}
            aria-label="Refresh world records"
            className="grid size-7 place-items-center rounded-md border border-border transition-colors hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {!data ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_IDS.map((e) => {
            const rec = data[e];
            const wr = rec?.top[0];
            const youInTop = rec?.top.some((t) => t.you);
            return (
              <div
                key={e}
                className={cn(
                  "rounded-2xl border bg-surface/40 p-4 transition-colors",
                  highlight === e ? "border-yellow-400/60" : "border-border",
                  e === "allround" && "sm:col-span-2 lg:col-span-3"
                )}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-heading text-sm font-semibold">{EVENTS[e].label}</p>
                  {wr && <p className="font-mono text-sm font-bold text-yellow-400">{formatMark(e, wr.mark)}</p>}
                </div>
                {!wr ? (
                  <p className="mt-2 text-xs text-muted-foreground">No record yet. It&apos;s there for the taking.</p>
                ) : (
                  <ol className="mt-2 space-y-1">
                    {rec.top.slice(0, 3).map((t) => (
                      <li key={t.rank} className={cn("flex items-center gap-2 font-mono text-xs", t.you ? "text-primary" : "text-muted-foreground")}>
                        <span className="w-4 shrink-0">
                          {t.rank === 1 ? (
                            <Crown className="size-3.5 text-yellow-400" aria-label="World record" />
                          ) : (
                            <Medal className={cn("size-3.5", t.rank === 2 ? "text-slate-300" : "text-amber-600")} aria-label={`#${t.rank}`} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {t.name}
                          {t.you && " (you)"}
                        </span>
                        <span className="tabular-nums text-foreground">{formatMark(e, t.mark)}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {wr?.setAt && <p className="mt-2 text-[11px] text-muted-foreground">Record set {setOn(wr.setAt)}</p>}
                {rec?.you && !youInTop && (
                  <p className="mt-1 text-[11px] text-primary">
                    Your best: {formatMark(e, rec.you.mark)} (#{rec.you.rank})
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {me ? (
          <>
            You compete as <span className="font-mono text-foreground">{me}</span>. Your best in each event counts.
          </>
        ) : (
          "Finish an event and you'll get a random athlete name. No sign-up, nothing personal."
        )}
      </p>
    </section>
  );
}
