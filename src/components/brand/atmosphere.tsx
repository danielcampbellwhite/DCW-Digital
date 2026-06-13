"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Premium technology atmosphere: an animated grid, layered aurora gradients
 * and subtle floating particles. Purely decorative (aria-hidden) and disabled
 * for users who prefer reduced motion.
 */
export function Atmosphere({
  className,
  particles = 18,
  grid = true,
}: {
  className?: string;
  particles?: number;
  grid?: boolean;
}) {
  const reduce = useReducedMotion();

  // Deterministic pseudo-random positions so SSR and client markup match.
  const dots = React.useMemo(
    () =>
      Array.from({ length: particles }, (_, i) => {
        const seed = (i + 1) * 9301;
        const left = (seed % 97) / 97;
        const top = ((seed * 1.7) % 89) / 89;
        const delay = (i % 6) * 0.8;
        const duration = 6 + (i % 5);
        const size = 1 + (i % 3);
        return { left, top, delay, duration, size };
      }),
    [particles]
  );

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Aurora gradient wash */}
      <div className="absolute inset-0 bg-aurora animate-aurora-shift" />

      {/* Animated grid */}
      {grid && (
        <div className="absolute inset-0 bg-grid bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      )}

      {/* Floating particles */}
      {!reduce &&
        dots.map((d, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-primary/60"
            style={{
              left: `${d.left * 100}%`,
              top: `${d.top * 100}%`,
              width: d.size,
              height: d.size,
            }}
            animate={{ y: [0, -18, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{
              duration: d.duration,
              delay: d.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

      {/* Top + bottom vignette to blend into the page */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
