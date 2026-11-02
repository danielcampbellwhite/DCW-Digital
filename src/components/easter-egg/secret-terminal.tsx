"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import type { TerminalPost } from "@/components/easter-egg/terminal";
import { unlockAudio } from "@/lib/sfx";

// Only downloaded when someone actually finds it.
const Terminal = dynamic(() => import("@/components/easter-egg/terminal").then((m) => m.Terminal), {
  ssr: false,
});

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const PASSWORD = "sudo";
const TAPS_NEEDED = 5;

/** Event other components can fire to open the terminal. */
export const OPEN_TERMINAL_EVENT = "dcw:terminal";

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

/**
 * The secret terminal's triggers:
 *  - the Konami code (↑ ↑ ↓ ↓ ← → ← → B A)
 *  - typing "sudo" anywhere outside a text box
 *  - tapping the footer copyright line five times quickly (for phones)
 *  - a hidden entry in the site search
 */
export function SecretTerminal({ posts }: { posts: TerminalPost[] }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    let seq: string[] = [];
    let typed = "";
    let taps: number[] = [];

    const show = () => {
      unlockAudio();
      setOpen(true);
    };

    const onKey = (e: KeyboardEvent) => {
      // Ignore while typing in a field or while a full-screen game is running.
      if (isTyping(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (document.body.style.overflow === "hidden") return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      seq = [...seq, key].slice(-KONAMI.length);
      if (seq.join() === KONAMI.join()) {
        seq = [];
        show();
        return;
      }
      if (key.length === 1) {
        typed = (typed + key).slice(-PASSWORD.length);
        if (typed === PASSWORD) {
          typed = "";
          show();
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest("[data-secret-tap]");
      if (!target) return;
      const now = Date.now();
      taps = [...taps.filter((t) => now - t < 2500), now];
      if (taps.length >= TAPS_NEEDED) {
        taps = [];
        show();
      }
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    window.addEventListener(OPEN_TERMINAL_EVENT, show);

    // A little something for anyone who opens the dev tools.
    if (!(window as unknown as { __dcwHint?: boolean }).__dcwHint) {
      (window as unknown as { __dcwHint?: boolean }).__dcwHint = true;
      console.log(
        "%c> psst. This site has a secret. ↑ ↑ ↓ ↓ ← → ← → B A",
        "color:#39ff7a;background:#020604;font-family:monospace;padding:6px 10px;border-radius:4px"
      );
    }

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
      window.removeEventListener(OPEN_TERMINAL_EVENT, show);
    };
  }, []);

  if (!open) return null;
  return <Terminal posts={posts} onClose={() => setOpen(false)} />;
}
