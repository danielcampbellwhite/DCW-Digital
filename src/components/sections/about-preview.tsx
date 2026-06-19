import Image from "next/image";
import { MapPin, Heart, Code2, Users, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const facts = [
  { icon: MapPin, label: "Liverpool-based, happy to work remote across the UK" },
  { icon: Code2, label: "8+ years building and maintaining sites at agencies" },
  { icon: Users, label: "Husband and dad - family comes first" },
  { icon: Heart, label: "Like fixing real problems, not chasing shiny things" },
];

/** Personal "About Daniel" preview that humanises the brand. */
export function AboutPreview() {
  return (
    <section className="py-24">
      <div className="container-px grid items-center gap-12 lg:grid-cols-2">
        <Reveal direction="right">
          <div className="relative">
            <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-surface">
              <Image
                src={siteConfig.headshot}
                alt={`${siteConfig.owner}, ${siteConfig.jobTitle}`}
                fill
                sizes="(max-width: 1024px) 100vw, 384px"
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
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
            A developer who actually cares{" "}
            <span className="text-gradient">whether it works for you</span>
          </h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>
              I&apos;m Daniel, a web developer based in Liverpool. I&apos;ve spent
              the last eight or so years building and looking after websites and
              apps at agencies, and I take on freelance work under my own name,
              DCW Digital, on the side.
            </p>
            <p>
              The part I genuinely enjoy is the problem-solving: working out what a
              business actually needs and then building something that holds up.
              Away from the keyboard I&apos;m usually with my family, having a
              tinker with some new bit of tech, or out somewhere in the northwest.
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
