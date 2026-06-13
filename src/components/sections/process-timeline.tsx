"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/content/expertise";
import { SectionHeading } from "@/components/sections/section-heading";

/** Animated, responsive "How I Work" timeline. */
export function ProcessTimeline() {
  return (
    <section className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="How I Work"
          title="A clear, collaborative process"
          description="No black boxes. From first conversation to long-term growth, you'll always know where we are and what comes next."
        />

        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* Vertical spine */}
          <div className="absolute left-[19px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary via-secondary to-accent md:left-1/2 md:-translate-x-1/2" />

          <ol className="space-y-10">
            {processSteps.map((step, i) => {
              const Icon = step.icon;
              const alignRight = i % 2 === 1;
              return (
                <motion.li
                  key={step.step}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative flex items-start gap-5 md:w-1/2 ${
                    alignRight
                      ? "md:ml-auto md:flex-row md:pl-10"
                      : "md:flex-row-reverse md:pr-10 md:text-right"
                  }`}
                >
                  {/* Node */}
                  <span
                    className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-background text-primary shadow-[0_0_24px_-8px_hsl(var(--primary)/0.8)] md:absolute md:top-0 ${
                      alignRight ? "md:-left-5" : "md:-right-5"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>

                  <div className="card-surface flex-1">
                    <span className="font-mono text-xs text-primary">
                      Step {step.step.toString().padStart(2, "0")}
                    </span>
                    <h3 className="mt-1 font-heading text-lg font-semibold">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
