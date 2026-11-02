"use client";

import * as React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isMuted, setMuted, subscribeMuted } from "@/lib/sfx";
import { cn } from "@/lib/utils";

/** Shared mute state for all games, kept in sync across every toggle. */
export function useSoundMuted(): [boolean, () => void] {
  const muted = React.useSyncExternalStore(subscribeMuted, isMuted, () => false);
  return [muted, () => setMuted(!muted)];
}

/** Small speaker button for a game's HUD. */
export function SoundToggle({ className }: { className?: string }) {
  const [muted, toggle] = useSoundMuted();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={muted}
      aria-label={muted ? "Turn sound on" : "Turn sound off"}
      title={muted ? "Sound off" : "Sound on"}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
