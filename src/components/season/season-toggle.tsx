"use client";

import { Ghost, Snowflake } from "lucide-react";
import { setSeasonOff, useSeason } from "@/lib/season";

/** Small footer switch to turn the seasonal effects on or off. */
export function SeasonToggle() {
  const { season, off } = useSeason();
  if (!season) return null;
  const Icon = season === "winter" ? Snowflake : Ghost;
  const name = season === "winter" ? "Snow" : "Halloween";
  return (
    <button
      type="button"
      onClick={() => setSeasonOff(!off)}
      aria-pressed={!off}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="size-3.5" /> {name}: {off ? "off" : "on"}
    </button>
  );
}
