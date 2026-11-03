/**
 * All-time "world records" for the Dev Games events. Unlike the weekly game
 * leaderboards these never reset: the best mark ever set by a player on the
 * site stands until someone beats it.
 *
 * Marks are stored as integers: times in hundredths of a second, distances in
 * centimetres, points as-is. `order` says whether lower or higher is better.
 */

export const EVENTS = {
  sprint: { label: "100m Sprint", short: "100m", unit: "s", order: "asc", scale: 100, min: 850, max: 6000 },
  hurdles: { label: "110m Hurdles", short: "Hurdles", unit: "s", order: "asc", scale: 100, min: 900, max: 9000 },
  longjump: { label: "Long Jump", short: "Long jump", unit: "m", order: "desc", scale: 100, min: 1, max: 1300 },
  javelin: { label: "Javelin", short: "Javelin", unit: "m", order: "desc", scale: 100, min: 1, max: 13000 },
  archery: { label: "Archery", short: "Archery", unit: "pts", order: "desc", scale: 1, min: 1, max: 60 },
  allround: { label: "All-Round Champion", short: "All-round", unit: "pts", order: "desc", scale: 1, min: 1, max: 8000 },
} as const;

export type EventId = keyof typeof EVENTS;
export const EVENT_IDS = Object.keys(EVENTS) as EventId[];

export const isEventId = (v: unknown): v is EventId =>
  typeof v === "string" && Object.prototype.hasOwnProperty.call(EVENTS, v);

/** Is mark `a` better than mark `b` for this event? */
export function isBetter(event: EventId, a: number, b: number | null | undefined): boolean {
  if (b === null || b === undefined) return true;
  return EVENTS[event].order === "asc" ? a < b : a > b;
}

export function formatMark(event: EventId, mark: number): string {
  const e = EVENTS[event];
  if (e.scale === 1) return `${mark.toLocaleString("en-GB")} ${e.unit}`;
  return `${(mark / e.scale).toFixed(2)}${e.unit}`;
}

/** Shortest time a finished event could plausibly take, in ms. */
const MIN_DURATION: Record<EventId, number> = {
  sprint: 8000,
  hurdles: 9000,
  longjump: 4000,
  javelin: 4000,
  archery: 6000,
  allround: 40000,
};

export function plausibleMark(event: EventId, mark: number, durationMs: number): boolean {
  const e = EVENTS[event];
  if (!Number.isInteger(mark) || mark < e.min || mark > e.max) return false;
  return Number.isFinite(durationMs) && durationMs >= MIN_DURATION[event] && durationMs < 3 * 60 * 60 * 1000;
}

export interface RecordEntry {
  rank: number;
  name: string;
  mark: number;
  setAt: string | null;
  you?: boolean;
}

export interface EventRecords {
  top: RecordEntry[];
  you: { rank: number; mark: number } | null;
}

export type RecordsResponse = Record<EventId, EventRecords> & { newRecord?: boolean; improved?: boolean };

/** Championship points for a mark, loosely modelled on decathlon scoring tables. */
export function eventPoints(event: Exclude<EventId, "allround">, mark: number | null): number {
  if (mark === null) return 0;
  const p = (a: number, b: number, c: number) => (b > 0 ? Math.floor(a * Math.pow(b, c)) : 0);
  switch (event) {
    case "sprint":
      return p(25.4347, 18 - mark / 100, 1.81);
    case "hurdles":
      return p(8, 26 - mark / 100, 1.81);
    case "longjump":
      return p(0.14354, mark - 220, 1.4);
    case "javelin":
      return p(10.14, mark / 100 - 7, 1.08);
    case "archery":
      return mark * 18;
  }
}
