/**
 * Shared leaderboard helpers, used by both the API route and the client.
 *
 * Players are anonymous: each browser gets a random ID, and its public name
 * is generated from that ID (e.g. "Async Otter 42"), so nobody types a name
 * and there's nothing to moderate. Boards reset every Monday at 00:00 UTC.
 */

export const GAMES = {
  invaders: { label: "Bug Invaders", maxScore: 500_000, perSecond: 600 },
  dash: { label: "Deploy Dash", maxScore: 200_000, perSecond: 140 },
  whack: { label: "Whack-a-Bug", maxScore: 1_500, perSecond: 60 },
  "invaders-hard": { label: "Bug Invaders: Nightmare", maxScore: 1_000_000, perSecond: 1_000 },
  "dash-hard": { label: "Deploy Dash: Friday Deploy", maxScore: 300_000, perSecond: 220 },
  balancer: { label: "Load Balancer", maxScore: 300_000, perSecond: 120 },
} as const;

export type GameId = keyof typeof GAMES;

export const isGameId = (v: unknown): v is GameId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(GAMES, v);

/** Player IDs are 32 lowercase hex characters. */
export const PLAYER_ID_RE = /^[a-f0-9]{32}$/;

export interface BoardEntry {
  rank: number;
  name: string;
  score: number;
  you?: boolean;
}

export interface BoardResponse {
  game: GameId;
  week: string;
  resetsAt: string;
  top: BoardEntry[];
  you: { rank: number; score: number } | null;
}

/* ── Week maths (ISO weeks, UTC) ────────────────────────────────────────── */

export function weekInfo(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7; // Monday = 1 ... Sunday = 7
  // ISO week number: the week containing this week's Thursday.
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  const id = `${thursday.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
  const nextMonday = new Date(d);
  nextMonday.setUTCDate(d.getUTCDate() + (8 - day));
  return { id, resetsAt: nextMonday };
}

/* ── Generated player names ─────────────────────────────────────────────── */

const ADJECTIVES = [
  "Async", "Sneaky", "Speedy", "Lazy", "Cached", "Nested", "Rogue", "Quiet",
  "Brave", "Sleepy", "Fuzzy", "Turbo", "Clever", "Witty", "Lucky", "Mighty",
  "Pixel", "Static", "Dynamic", "Hidden", "Silent", "Bold", "Cosmic", "Swift",
  "Shiny", "Grumpy", "Happy", "Nimble", "Stealthy", "Curious", "Daring", "Jolly",
];

const NOUNS = [
  "Otter", "Semicolon", "Pointer", "Badger", "Compiler", "Falcon", "Lambda", "Penguin",
  "Kernel", "Fox", "Bracket", "Gecko", "Hedgehog", "Monad", "Owl", "Packet",
  "Panda", "Promise", "Raccoon", "Router", "Squirrel", "Thread", "Tortoise", "Wombat",
  "Cursor", "Debugger", "Koala", "Lemur", "Narwhal", "Proxy", "Sprite", "Yak",
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function playerName(id: string): string {
  const h = hash(id);
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const noun = NOUNS[Math.floor(h / ADJECTIVES.length) % NOUNS.length];
  const num = Math.floor(h / (ADJECTIVES.length * NOUNS.length)) % 100;
  return `${adj} ${noun} ${String(num).padStart(2, "0")}`;
}

/** Rough sanity check so obviously impossible scores are rejected. */
export function plausible(game: GameId, score: number, durationMs: number): boolean {
  const g = GAMES[game];
  if (!Number.isInteger(score) || score <= 0 || score > g.maxScore) return false;
  if (!Number.isFinite(durationMs) || durationMs < 1000 || durationMs > 6 * 60 * 60 * 1000) return false;
  return score <= (durationMs / 1000) * g.perSecond + 250;
}
