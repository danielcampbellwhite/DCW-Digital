"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MessageCircleQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

const AssistantPanel = dynamic(() => import("./assistant-panel").then((m) => m.AssistantPanel), { ssr: false });

export const OPEN_ASSISTANT_EVENT = "dcw:open-assistant";

/** Floating "Ask DCW" button. Only appears when the API reports the assistant is configured. */
export function AssistantLauncher() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch("/api/assistant")
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { enabled?: boolean } | null) => !cancelled && setEnabled(Boolean(d?.enabled)))
        .catch(() => {});
    // Wait until the page has settled so it never competes with the first paint.
    const t = window.setTimeout(check, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setLoaded(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, []);

  // Keep the games' on-screen controls clear.
  const hidden = pathname?.startsWith("/play");
  if (!enabled || (hidden && !open)) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setLoaded(true);
            setOpen(true);
          }}
          onPointerEnter={() => setLoaded(true)}
          className={cn(
            "fixed bottom-5 right-5 z-[110] flex items-center gap-2 rounded-full border border-primary/40 bg-card/95 px-4 py-3 text-sm font-medium text-foreground shadow-lg shadow-primary/10 backdrop-blur",
            "transition hover:border-primary hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          )}
          aria-label="Ask DCW: chat with the AI assistant"
        >
          <MessageCircleQuestion className="size-5 text-primary" aria-hidden />
          <span className="hidden sm:inline">Ask DCW</span>
        </button>
      )}
      {loaded && <AssistantPanel open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
