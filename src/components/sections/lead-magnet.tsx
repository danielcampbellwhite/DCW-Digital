import { Activity, Check, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const checks = [
  "How fast your website loads",
  "How easily customers can find you online",
  "How well it works on phones",
  "Your top 3 fixes, in plain English",
];

/** "Free Website Health Check" lead magnet - a low-commitment first step. */
export function LeadMagnet() {
  return (
    <section className="py-12">
      <div className="container-px">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-card p-8 sm:p-12">
            <div className="absolute -left-16 top-1/2 size-56 -translate-y-1/2 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent">
                  <Activity className="size-3.5" /> Free Lead Magnet
                </span>
                <h2 className="mt-5 text-3xl font-bold sm:text-4xl">
                  Free Website Health Check
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Not sure why your website isn&apos;t pulling its weight? I&apos;ll
                  review your site and send you a no-obligation snapshot of what&apos;s
                  working, what isn&apos;t, and the three highest-impact fixes - completely free.
                </p>
                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {checks.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  href="/contact?service=Free+Website+Health+Check"
                  variant="accent"
                  size="lg"
                >
                  Claim my free health check
                  <ArrowRight className="size-4" />
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  No cost, no commitment, no jargon. Results within 2 working days.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
