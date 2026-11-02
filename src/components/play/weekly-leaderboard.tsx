"use client";

import * as React from "react";
import { Crown, Medal, RefreshCw, Trophy } from "lucide-react";
import { type BoardResponse, type GameId, GAMES, playerName } from "@/lib/leaderboard";
import { cn } from "@/lib/utils";

/* ── Anonymous player ID ────────────────────────────────────────────────── */

const PLAYER_KEY = "dcw-player-id";

/** The browser's random player ID. Only created when a score is submitted. */
export function getPlayerId(create = false): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = window.localStorage.getItem(PLAYER_KEY);
    if (id && !/^[a-f0-9]{32}$/.test(id)) id = null;
    if (!id && create) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      window.localStorage.setItem(PLAYER_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/* ── Tiny shared store, so a game's submit updates its board panel ──────── */

type Status = "loading" | "ready" | "unavailable";
interface State {
  status: Status;
  board: BoardResponse | null;
  lastRank: number | null; // rank after the most recent submitted score
}

const states = new Map<GameId, State>();
const subs = new Map<GameId, Set<() => void>>();
const initial: State = { status: "loading", board: null, lastRank: null };

function getState(game: GameId) {
  return states.get(game) ?? initial;
}
function setState(game: GameId, patch: Partial<State>) {
  states.set(game, { ...getState(game), ...patch });
  subs.get(game)?.forEach((fn) => fn());
}
function subscribe(game: GameId, fn: () => void) {
  const set = subs.get(game) ?? new Set();
  set.add(fn);
  subs.set(game, set);
  return () => {
    set.delete(fn);
  };
}

export async function loadBoard(game: GameId) {
  const player = getPlayerId();
  try {
    const res = await fetch(`/api/leaderboard?game=${game}${player ? `&player=${player}` : ""}`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    setState(game, { status: "ready", board: (await res.json()) as BoardResponse });
  } catch {
    setState(game, { status: "unavailable" });
  }
}

/** Submit a finished game's score. Safe to call without awaiting. */
export async function submitScore(game: GameId, score: number, durationMs: number) {
  const player = getPlayerId(true);
  if (!player || score <= 0) return;
  setState(game, { lastRank: null });
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ game, player, score: Math.floor(score), durationMs: Math.round(durationMs) }),
    });
    if (!res.ok) return;
    const board = (await res.json()) as BoardResponse;
    setState(game, { status: "ready", board, lastRank: board.you?.rank ?? null });
  } catch {
    /* offline or unavailable: the game carries on regardless */
  }
}

export function useLeaderboard(game: GameId): State {
  return React.useSyncExternalStore(
    React.useCallback((fn) => subscribe(game, fn), [game]),
    () => getState(game),
    () => initial
  );
}

/** "You're #3 this week" line for a game-over screen. */
export function WeeklyRank({ game, className }: { game: GameId; className?: string }) {
  const { lastRank, board } = useLeaderboard(game);
  if (!lastRank || !board?.you) return null;
  return (
    <p className={cn("text-sm font-medium text-primary", className)}>
      {lastRank === 1 ? "Top of this week's leaderboard!" : `You're #${lastRank} this week`}
    </p>
  );
}

/* ── Panel ──────────────────────────────────────────────────────────────── */

function resetsIn(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return "under an hour";
}

export function WeeklyLeaderboard({ game, className }: { game: GameId; className?: string }) {
  const { status, board } = useLeaderboard(game);
  const [me, setMe] = React.useState<string | null>(null);

  React.useEffect(() => {
    void loadBoard(game);
  }, [game]);

  // Pick up the player's name once their first score creates an ID.
  React.useEffect(() => {
    const id = getPlayerId();
    setMe(id ? playerName(id) : null);
  }, [board]);

  // Hide entirely if the leaderboard service isn't set up.
  if (status === "unavailable") return null;

  const youInTop = board?.top.some((e) => e.you);

  return (
    <section
      aria-label={`${GAMES[game].label} weekly leaderboard`}
      className={cn("mx-auto max-w-3xl rounded-3xl border border-border bg-card p-5 sm:p-6", className)}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="inline-flex items-center gap-2 font-heading text-lg font-semibold">
          <Trophy className="size-5 text-accent" /> This week&apos;s top scores
        </h3>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          {board && <span>Resets in {resetsIn(board.resetsAt)}</span>}
          <button
            type="button"
            onClick={() => void loadBoard(game)}
            aria-label="Refresh leaderboard"
            className="grid size-7 place-items-center rounded-md border border-border transition-colors hover:text-foreground"
          >
            <RefreshCw className="size-3.5" />
          </button>
        </div>
      </div>

      {status === "loading" && !board ? (
        <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
      ) : board && board.top.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No scores yet this week. Play a round and take the top spot.
        </p>
      ) : (
        board && (
          <ol className="mt-4 space-y-1.5">
            {board.top.map((e) => (
              <li
                key={`${e.rank}-${e.name}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-sm",
                  e.you ? "border border-primary/40 bg-primary/10" : "bg-surface/50"
                )}
              >
                <span className="w-7 shrink-0 text-muted-foreground">
                  {e.rank === 1 ? (
                    <Crown className="size-4 text-yellow-400" aria-label="1st" />
                  ) : e.rank <= 3 ? (
                    <Medal className={cn("size-4", e.rank === 2 ? "text-slate-300" : "text-amber-600")} aria-label={e.rank === 2 ? "2nd" : "3rd"} />
                  ) : (
                    `#${e.rank}`
                  )}
                </span>
                <span className={cn("min-w-0 flex-1 truncate", e.you ? "text-primary" : "text-foreground")}>
                  {e.name}
                  {e.you && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                </span>
                <span className="tabular-nums text-foreground">{e.score.toLocaleString("en-GB")}</span>
              </li>
            ))}
          </ol>
        )
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        {board?.you && !youInTop
          ? `You're #${board.you.rank} this week with ${board.you.score.toLocaleString("en-GB")}. `
          : ""}
        {me ? (
          <>
            You play as <span className="font-mono text-foreground">{me}</span>. Names are random, so nobody knows who&apos;s who.
          </>
        ) : (
          "Post a score and you'll get a random player name. No sign-up, nothing personal."
        )}
      </p>
    </section>
  );
}
