"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Like framer-motion's useReducedMotion, but always `false` on the first
 * render. The server can't know the visitor's setting, so branching on it
 * straight away makes the client's first render differ from the server HTML
 * (a hydration error). This waits until after mount to switch.
 */
export function useReducedMotionSafe(): boolean {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return mounted && !!reduce;
}
