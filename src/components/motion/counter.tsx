"use client";

import * as React from "react";
import {
  useInView,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to render. */
  decimals?: number;
}

/**
 * Animated number that counts up from 0 to `value` when scrolled into view.
 * Falls back to the final value immediately when motion is reduced.
 */
export function Counter({ value, prefix = "", suffix = "", decimals = 0 }: CounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, value, motionValue]);

  React.useEffect(() => {
    if (reduce) {
      setDisplay(value.toFixed(decimals));
      return;
    }
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(latest.toFixed(decimals));
    });
    return unsubscribe;
  }, [spring, reduce, value, decimals]);

  return (
    <span ref={ref} aria-label={`${prefix}${value}${suffix}`}>
      {prefix}
      {reduce ? value.toFixed(decimals) : display}
      {suffix}
    </span>
  );
}
