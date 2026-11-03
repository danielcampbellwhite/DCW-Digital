"use client";

/**
 * "Root access": the reward for cracking the terminal password. It's purely
 * cosmetic and lives in this browser only. It never touches real admin
 * features, content or data.
 *
 * Access lasts until local midnight. Logging off ends it early, so you can
 * crack a new password. Changes are synced across open tabs.
 */

import * as React from "react";

const KEY = "dcw-root";
const LEGACY_KEY = "dcw-term-root"; // the old, permanent flag
const SETTINGS_KEY = "dcw-root-settings";
const EVENT = "dcw:root-change";

export interface RootSession {
  grantedAt: number;
  expiresAt: number;
}

export interface RootSettings {
  terminalMode: "off" | "green" | "amber";
  crt: boolean;
  bugCursor: boolean;
  party: boolean;
}

export const DEFAULT_SETTINGS: RootSettings = { terminalMode: "off", crt: false, bugCursor: false, party: false };

/** Local midnight at the end of today. */
export function nextMidnight(from = new Date()) {
  const d = new Date(from);
  d.setHours(24, 0, 0, 0);
  return d.getTime();
}

let legacyCleared = false;

function readSession(): RootSession | null {
  try {
    if (!legacyCleared) {
      legacyCleared = true;
      window.localStorage.removeItem(LEGACY_KEY);
    }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as RootSession;
    if (typeof s.expiresAt !== "number" || s.expiresAt <= Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

/** Is there an active root session right now? (Non-hook, for event handlers.) */
export function hasRoot() {
  return typeof window !== "undefined" && readSession() !== null;
}

export function grantRoot() {
  const session: RootSession = { grantedAt: Date.now(), expiresAt: nextMidnight() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
  emit();
  return session;
}

export function revokeRoot() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

/* ── Stores for useSyncExternalStore ────────────────────────────────────── */

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === SETTINGS_KEY) cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

// Cache snapshots so useSyncExternalStore gets stable references.
let sessionCache: { raw: string | null; value: RootSession | null } = { raw: null, value: null };
function sessionSnapshot(): RootSession | null {
  const value = readSession();
  const raw = value ? JSON.stringify(value) : null;
  if (raw !== sessionCache.raw) sessionCache = { raw, value };
  return sessionCache.value;
}

let settingsCache: { raw: string | null; value: RootSettings } = { raw: null, value: DEFAULT_SETTINGS };
function settingsSnapshot(): RootSettings {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SETTINGS_KEY);
  } catch {
    /* ignore */
  }
  if (raw !== settingsCache.raw) {
    let parsed: Partial<RootSettings> = {};
    try {
      parsed = raw ? (JSON.parse(raw) as Partial<RootSettings>) : {};
    } catch {
      /* ignore */
    }
    settingsCache = { raw, value: { ...DEFAULT_SETTINGS, ...parsed } };
  }
  return settingsCache.value;
}

export function updateRootSettings(patch: Partial<RootSettings>) {
  const next = { ...settingsSnapshot(), ...patch };
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

/** The current root session (or null), re-rendering when it changes or expires at midnight. */
export function useRootSession(): RootSession | null {
  const session = React.useSyncExternalStore(subscribe, sessionSnapshot, () => null);
  const [, force] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    if (!session) return;
    const ms = session.expiresAt - Date.now();
    const t = window.setTimeout(() => {
      emit();
      force();
    }, Math.max(0, Math.min(ms + 50, 2 ** 31 - 1)));
    return () => window.clearTimeout(t);
  }, [session]);
  return session;
}

export function useRootSettings(): RootSettings {
  return React.useSyncExternalStore(subscribe, settingsSnapshot, () => DEFAULT_SETTINGS);
}

/** "05:12:33" until the given time. */
export function formatCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Re-renders every second while `active`, returning Date.now(). */
export function useNow(active: boolean) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(iv);
  }, [active]);
  return now;
}

/** Fired to open the root control panel. */
export const OPEN_ROOT_PANEL_EVENT = "dcw:root-panel";
