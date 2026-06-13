"use client";

import { motion } from "framer-motion";
import { ArrowRight, CalendarCheck, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "@/components/brand/atmosphere";
import { siteConfig } from "@/lib/site";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
      <Atmosphere />

      <div className="container-px relative z-10 py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span className="eyebrow">
              <Sparkles className="size-3.5 text-accent" />
              {siteConfig.jobTitle}
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 text-balance text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl"
          >
            Building Modern Websites{" "}
            <span className="text-gradient">That Help Businesses Grow</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg"
          >
            I design, build and optimise high-performance websites and digital
            experiences that deliver measurable business results.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
          >
            <Button href="/projects" variant="primary" size="lg">
              View My Work
              <ArrowRight className="size-4" />
            </Button>
            <Button href={siteConfig.bookingUrl} variant="outline" size="lg">
              <CalendarCheck className="size-4" />
              Book a Discovery Call
            </Button>
            <Button href={siteConfig.cvUrl} variant="ghost" size="lg">
              <Download className="size-4" />
              Download CV
            </Button>
          </motion.div>

          {/* Personal introduction */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mt-14 flex items-center gap-4 rounded-2xl border border-border bg-surface/50 px-5 py-4 backdrop-blur-sm"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 font-heading text-lg font-bold text-primary">
              DC
            </span>
            <div className="text-left">
              <div className="font-heading font-semibold text-foreground">
                {siteConfig.owner}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Web Developer · Digital Consultant
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
