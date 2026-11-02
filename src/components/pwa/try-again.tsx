"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sends the visitor back to the page they were trying to reach. */
export function TryAgain() {
  const [target, setTarget] = React.useState<string | null>(null);

  React.useEffect(() => {
    const from = new URLSearchParams(window.location.search).get("from");
    // Only allow same-site paths.
    if (from && from.startsWith("/") && !from.startsWith("//")) setTarget(from);
  }, []);

  if (!target) return null;
  return (
    <Button onClick={() => window.location.assign(target)} variant="primary">
      <RotateCcw className="size-4" /> Try again
    </Button>
  );
}
