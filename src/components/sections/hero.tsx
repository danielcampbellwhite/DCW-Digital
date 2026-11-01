import Image from "next/image";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "@/components/brand/atmosphere";
import { siteConfig } from "@/lib/site";

/** Staggered entrance via CSS. Content is visible from the first paint. */
const rise = (i: number) => ({ animationDelay: `${0.05 + i * 0.08}s` });

/**
 * Homepage hero. A server component: no JavaScript is needed to show the
 * heading, which is the page's Largest Contentful Paint element.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-16">
      <Atmosphere />

      <div className="container-px relative z-10 py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="animate-rise" style={rise(0)}>
            <span className="eyebrow">
              <Sparkles className="size-3.5 text-accent" />
              {siteConfig.jobTitle}
            </span>
          </div>

          <h1
            className="mt-6 animate-rise text-balance text-4xl font-bold leading-[1.05] sm:text-6xl md:text-7xl"
            style={rise(1)}
          >
            Building Modern Websites{" "}
            <span className="text-gradient">That Help Businesses Grow</span>
          </h1>

          <p
            className="mt-6 max-w-2xl animate-rise text-pretty text-base text-muted-foreground sm:text-lg"
            style={rise(2)}
          >
            I build fast, modern websites and web apps that do an actual job for
            your business - bring in enquiries, rank on Google, and work properly
            on a phone.
          </p>

          <div
            className="mt-9 flex animate-rise flex-col items-center gap-3 sm:flex-row"
            style={rise(3)}
          >
            <Button href="/projects" variant="primary" size="lg">
              View My Work
              <ArrowRight className="size-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              <Mail className="size-4" />
              Get in touch
            </Button>
          </div>

          {/* Personal introduction */}
          <div
            className="mt-14 flex animate-rise items-center gap-4 rounded-2xl border border-border bg-surface/50 px-5 py-4 backdrop-blur-sm"
            style={rise(4)}
          >
            <Image
              src={siteConfig.headshot}
              alt={siteConfig.owner}
              width={48}
              height={48}
              priority
              className="size-12 shrink-0 rounded-full border border-primary/30 object-cover"
            />
            <div className="text-left">
              <div className="font-heading font-semibold text-foreground">
                {siteConfig.owner}
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Web Developer in Liverpool, UK
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
