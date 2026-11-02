import type { Metadata } from "next";
import { WifiOff, Home, Gamepad2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TryAgain } from "@/components/pwa/try-again";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

/** Shown by the service worker when a page hasn't been saved for offline use. */
export default function OfflinePage() {
  return (
    <section className="flex min-h-[80vh] items-center pt-16">
      <div className="container-px mx-auto max-w-xl py-20 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-amber-400/30 bg-amber-400/10 text-amber-400">
          <WifiOff className="size-7" />
        </span>
        <h1 className="mt-6 text-3xl font-bold sm:text-4xl">You&apos;re offline</h1>
        <p className="mt-4 text-muted-foreground">
          This page hasn&apos;t been saved for offline use yet. The main pages,
          and any page you&apos;ve already visited, still work without a
          connection. So do the games.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <TryAgain />
          <Button href="/" variant="outline">
            <Home className="size-4" /> Home
          </Button>
          <Button href="/services" variant="outline">
            <Layers className="size-4" /> Services
          </Button>
          <Button href="/play" variant="outline">
            <Gamepad2 className="size-4" /> Play a game
          </Button>
        </div>
      </div>
    </section>
  );
}
