import { MapPin, Heart, Code2, Users, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const facts = [
  { icon: MapPin, label: "Liverpool-based, working with clients UK-wide & remote" },
  { icon: Code2, label: "8+ years building for the web, from agencies to SaaS" },
  { icon: Users, label: "Family-first — a husband and dad who values balance" },
  { icon: Heart, label: "Driven by solving real problems with clean technology" },
];

/** Personal "About Daniel" preview that humanises the brand. */
export function AboutPreview() {
  return (
    <section className="py-24">
      <div className="container-px grid items-center gap-12 lg:grid-cols-2">
        <Reveal direction="right">
          <div className="relative">
            {/* Headshot placeholder */}
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-surface to-secondary/20">
              <div className="absolute inset-0 bg-grid bg-grid opacity-30" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-heading text-6xl font-bold text-foreground/30">
                  DCW
                </span>
              </div>
              <div className="absolute bottom-4 left-4 rounded-xl border border-border bg-background/80 px-4 py-2 backdrop-blur">
                <div className="font-heading text-sm font-semibold">
                  Daniel Campbell-White
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  Liverpool, UK
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -top-3 -z-10 size-32 rounded-full bg-primary/20 blur-3xl" />
          </div>
        </Reveal>

        <Reveal>
          <span className="eyebrow">About Daniel</span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            An experienced developer who cares about{" "}
            <span className="text-gradient">outcomes, not just code</span>
          </h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>
              I&apos;m Daniel — a web developer and digital
              consultant based in Liverpool. Over the last eight years I&apos;ve
              built everything from marketing sites to SaaS platforms, in
              agencies, in-house teams and now under my own banner, DCW Digital.
            </p>
            <p>
              What I genuinely enjoy is the problem-solving: understanding a
              business, finding where technology can move the needle, and
              shipping something fast, reliable and measurable. When I&apos;m not
              building, you&apos;ll find me with my family, tinkering with new
              tech, or out exploring the northwest.
            </p>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {facts.map((fact) => (
              <li key={fact.label} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <fact.icon className="size-4" />
                </span>
                <span className="text-muted-foreground">{fact.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button href="/about" variant="outline">
              Read my full story
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
