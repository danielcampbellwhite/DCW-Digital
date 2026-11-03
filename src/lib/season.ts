"use client";

import * as React from "react";

export type Season = "winter" | "halloween";

const OFF_KEY = "dcw-season-off";
const PREVIEW_KEY = "dcw-season-preview";
const EVENT = "dcw:season-change";

/** Which seasonal theme (if any) applies on a given date. */
export function seasonFor(d = new Date()): Season | null {
  const m = d.getMonth() + 1;
  const day = d.getDate();
  if (m === 12 || (m === 1 && day <= 6)) return "winter";
  if ((m === 10 && day >= 20) || (m === 11 && day === 1)) return "halloween";
  return null;
}

/** ?season=winter|halloween previews a theme for this browser tab; ?season=off clears it. */
function preview(): Season | null {
  try {
    const q = new URLSearchParams(window.location.search).get("season");
    if (q === "winter" || q === "halloween") window.sessionStorage.setItem(PREVIEW_KEY, q);
    if (q === "off") window.sessionStorage.removeItem(PREVIEW_KEY);
    const v = window.sessionStorage.getItem(PREVIEW_KEY);
    return v === "winter" || v === "halloween" ? v : null;
  } catch {
    return null;
  }
}

function readOff() {
  try {
    return window.localStorage.getItem(OFF_KEY) === "1";
  } catch {
    return false;
  }
}

export function setSeasonOff(off: boolean) {
  try {
    if (off) window.localStorage.setItem(OFF_KEY, "1");
    else window.localStorage.removeItem(OFF_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** The season in force (date or preview), whether the visitor turned it off, and the active theme. */
export function useSeason(): { season: Season | null; off: boolean; active: Season | null } {
  const [state, setState] = React.useState<{ season: Season | null; off: boolean }>({ season: null, off: false });
  React.useEffect(() => {
    const update = () => setState({ season: preview() ?? seasonFor(), off: readOff() });
    update();
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return { ...state, active: state.off ? null : state.season };
}

/** Non-hook read for code outside React render (e.g. the terminal's commands). */
export function currentSeason(): Season | null {
  if (typeof window === "undefined" || readOff()) return null;
  return preview() ?? seasonFor();
}
