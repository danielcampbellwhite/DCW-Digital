"use client";

import * as React from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Registers the service worker (production only) so the site keeps working
 * offline once pages have been cached, and shows a small notice when the
 * connection drops or comes back.
 */
export function ServiceWorker() {
  const [status, setStatus] = React.useState<"online" | "offline" | "back">("online");

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        /* offline support is a bonus; never break the page */
      });
    };
    // Wait until the page has loaded so caching never competes with it.
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  React.useEffect(() => {
    let timer: number | undefined;
    const goOffline = () => {
      window.clearTimeout(timer);
      setStatus("offline");
    };
    const goOnline = () => {
      setStatus("back");
      timer = window.setTimeout(() => setStatus("online"), 3000);
    };
    if (!navigator.onLine) setStatus("offline");
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      window.clearTimeout(timer);
    };
  }, []);

  if (status === "online") return null;
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[120] flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 text-sm text-muted-foreground shadow-lg backdrop-blur">
        {status === "offline" ? (
          <>
            <WifiOff className="size-4 text-amber-400" /> You&apos;re offline, so you&apos;re seeing saved pages.
          </>
        ) : (
          <>
            <Wifi className="size-4 text-accent" /> Back online
          </>
        )}
      </div>
    </div>
  );
}
