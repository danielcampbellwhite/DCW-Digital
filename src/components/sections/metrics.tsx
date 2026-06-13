import { ShieldCheck } from "lucide-react";
import { metrics } from "@/content/expertise";
import { Counter } from "@/components/motion/counter";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";

/** Trust & credibility metrics band with animated counters. */
export function Metrics() {
  return (
    <section className="border-y border-border bg-surface/30 py-16">
      <div className="container-px">
        <StaggerGroup className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {metrics.map((metric) => (
            <StaggerItem key={metric.label} className="text-center">
              <div className="font-heading text-4xl font-bold text-gradient sm:text-5xl">
                <Counter
                  value={metric.value}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                />
              </div>
              <div className="mt-2 font-medium text-foreground">{metric.label}</div>
              {metric.description && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {metric.description}
                </div>
              )}
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" /> WCAG-aware, accessible builds
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" /> 95+ Lighthouse targets
          </span>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-accent" /> UK-based · remote-friendly
          </span>
        </Reveal>
      </div>
    </section>
  );
}
