"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useSeason } from "@/lib/season";

// Effects only download while a season is actually active.
const SeasonEffects = dynamic(() => import("@/components/season/season-effects").then((m) => m.SeasonEffects), { ssr: false });

/** Applies the seasonal theme (snow in December, Halloween in late October). */
export function SeasonalLayer() {
  const { active } = useSeason();

  React.useEffect(() => {
    const html = document.documentElement;
    if (active) html.dataset.season = active;
    else delete html.dataset.season;
  }, [active]);

  return active ? <SeasonEffects season={active} /> : null;
}
