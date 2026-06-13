"use client";

import * as React from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import type { TimelineEntry } from "@/types";

/**
 * Vertical career timeline with a gradient progress line that fills as the
 * reader scrolls through it, plus per-entry reveal animations. Ordered
 * earliest → most recent. Falls back to a static list when the user prefers
 * reduced motion.
 */
export function AboutTimeline({ entries }: { entries: TimelineEntry[] }) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLOListElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <div className="relative mx-auto mt-16 max-w-3xl">
      {/* Static track */}
      <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-border" />
      {/* Animated progress line */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{ scaleY: lineScale }}
          className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-primary via-secondary to-accent"
        />
      )}

      <ol ref={ref} className="space-y-10">
        {entries.map((entry, i) => (
          <motion.li
            key={`${entry.period}-${entry.title}`}
            className="relative pl-10"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Node */}
            <motion.span
              className="absolute left-0 top-1.5 size-4 rounded-full border-2 border-primary bg-background"
              initial={reduce ? false : { scale: 0 }}
              whileInView={reduce ? undefined : { scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: i * 0.04 + 0.1, type: "spring", stiffness: 300 }}
              style={{ boxShadow: "0 0 16px -4px hsl(var(--primary))" }}
            />

            <span className="font-mono text-xs text-primary">{entry.period}</span>
            <h3 className="mt-1 font-heading text-xl font-semibold">{entry.title}</h3>
            <p className="text-sm font-medium text-muted-foreground">
              {entry.organisation}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{entry.description}</p>
            {entry.highlights && (
              <ul className="mt-3 space-y-1.5">
                {entry.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
