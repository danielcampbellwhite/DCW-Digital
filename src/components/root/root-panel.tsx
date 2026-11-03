"use client";

import * as React from "react";
import Link from "next/link";
import { Lock, LogOut, ShieldCheck, SquareTerminal, X, Gamepad2 } from "lucide-react";
import {
  formatCountdown,
  revokeRoot,
  type RootSettings,
  updateRootSettings,
  useNow,
  useRootSession,
  useRootSettings,
} from "@/lib/root-access";
import { OPEN_TERMINAL_EVENT } from "@/components/easter-egg/secret-terminal";
import { cn } from "@/lib/utils";

function Toggle({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={cn("flex items-start justify-between gap-4 py-3", disabled && "opacity-50")}>
      <span>
        <span className="block font-medium text-foreground">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-accent bg-accent/80" : "border-border bg-surface"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-[18px] rounded-full bg-foreground transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </label>
  );
}

/** The root control panel: site-wide fun settings, only while root is active. */
export function RootPanel({ onClose }: { onClose: () => void }) {
  const session = useRootSession();
  const settings = useRootSettings();
  const now = useNow(!!session);
  const [finePointer, setFinePointer] = React.useState(true);
  const closeRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setFinePointer(window.matchMedia("(pointer: fine)").matches);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch: Partial<RootSettings>) => updateRootSettings(patch);
  const openTerminal = () => {
    onClose();
    window.setTimeout(() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT)), 50);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-background/70 p-4 pt-[10vh] backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Root control panel"
        className="w-full max-w-md rounded-3xl border border-accent/30 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-accent">
              {session ? <ShieldCheck className="size-4" /> : <Lock className="size-4" />}
              {session ? "root access" : "access denied"}
            </p>
            <h2 className="mt-1 font-heading text-xl font-bold">Root control panel</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {!session ? (
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            <p>You need root access to change these settings. Crack the password in the terminal to get it until midnight.</p>
            <button
              type="button"
              onClick={openTerminal}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-foreground hover:border-accent/50"
            >
              <SquareTerminal className="size-4" /> Open terminal
            </button>
          </div>
        ) : (
          <>
            <p className="mt-3 font-mono text-sm text-muted-foreground">
              expires at 00:00 · <span className="tabular-nums text-foreground">{formatCountdown(session.expiresAt - now)}</span> left
            </p>

            <div className="mt-4 divide-y divide-border">
              <div className="py-3">
                <span className="block font-medium text-foreground">Terminal mode</span>
                <span className="block text-sm text-muted-foreground">Turn the whole site into a phosphor terminal.</span>
                <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Terminal mode">
                  {(["off", "green", "amber"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={settings.terminalMode === m}
                      onClick={() => set({ terminalMode: m })}
                      className={cn(
                        "rounded-lg border px-3 py-2 font-mono text-sm capitalize transition-colors",
                        settings.terminalMode === m ? "border-accent bg-accent/15 text-accent" : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="CRT screen" description="An old, dusty tube monitor: curved glass, scanlines, static and flicker." checked={settings.crt} onChange={(v) => set({ crt: v })} />
              <Toggle
                label="Bug cursor"
                description={finePointer ? "A bug follows your mouse. Click to squash it." : "Needs a mouse, so it's off on touch screens."}
                checked={settings.bugCursor && finePointer}
                disabled={!finePointer}
                onChange={(v) => set({ bugCursor: v })}
              />
              <Toggle label="Party mode" description="Confetti on every click, and the logo can't sit still." checked={settings.party} onChange={(v) => set({ party: v })} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/play#classified"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent/20"
              >
                <Gamepad2 className="size-4" /> Classified games
              </Link>
              <button
                type="button"
                onClick={openTerminal}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-accent/50"
              >
                <SquareTerminal className="size-4" /> Terminal
              </button>
              <button
                type="button"
                onClick={() => {
                  revokeRoot();
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <LogOut className="size-4" /> Log off
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
