import type { Metadata } from "next";
import Image from "next/image";
import {
  MapPin,
  Heart,
  Target,
  Sparkles,
  Compass,
  ShieldCheck,
  Lightbulb,
  Rocket,
  Download,
  ArrowRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { careerTimeline } from "@/content/timeline";
import { expertise } from "@/content/expertise";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: "About Daniel Campbell-White",
  description:
    "Liverpool-based web developer and digital consultant. Daniel's story, career timeline, technical skills, values and what drives him.",
  path: "/about",
});

const values = [
  {
    icon: Target,
    title: "Outcomes over output",
    description:
      "Code is a means to an end. I measure success by the business results a project delivers, not lines written.",
  },
  {
    icon: ShieldCheck,
    title: "Built to last",
    description:
      "Clean, documented, accessible code that your team — or the next developer — can confidently build on.",
  },
  {
    icon: Compass,
    title: "Honest & clear",
    description:
      "No jargon, no black boxes. You'll always understand what I'm doing, why, and what it costs.",
  },
  {
    icon: Lightbulb,
    title: "Always learning",
    description:
      "The web moves fast. I invest in staying current so my clients and teams benefit from the best tools available.",
  },
];

const interests = [
  "Family time",
  "Football",
  "Exploring the northwest",
  "Tinkering with new tech",
  "Open source",
  "Good coffee",
];

const futureGoals = [
  "Partner with ambitious businesses on long-term digital growth",
  "Contribute to a high-impact engineering team or product",
  "Keep deepening expertise in performance, accessibility and AI tooling",
  "Mentor the next generation of developers",
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={
          <>
            Hi, I&apos;m Daniel — I build{" "}
            <span className="text-gradient">websites that work</span>
          </>
        }
        description="Web developer and digital consultant based in Liverpool, UK. Here's my story, how I work, and what I'm looking for next."
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Button href={siteConfig.cvUrl} variant="primary">
            <Download className="size-4" /> Download CV
          </Button>
          <Button href="/contact" variant="outline">
            Get in touch
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </PageHeader>

      {/* My story + headshot */}
      <section className="py-24">
        <div className="container-px grid items-start gap-12 lg:grid-cols-[1fr_1.3fr]">
          <Reveal direction="right">
            <div className="sticky top-24">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border bg-surface">
                <Image
                  src={siteConfig.headshot}
                  alt={`${siteConfig.owner} — ${siteConfig.jobTitle}`}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover object-top"
                />
              </div>
              <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 text-primary" /> {siteConfig.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-accent" /> {siteConfig.jobTitle}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Heart className="size-4 text-secondary" /> Husband, dad &amp; lifelong tinkerer
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <span className="eyebrow">My Story</span>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              From curious tinkerer to trusted developer
            </h2>
            <div className="mt-5 space-y-4 text-muted-foreground">
              <p>
                My journey into technology started the way it does for a lot of
                developers — taking things apart to see how they worked, then
                figuring out how to build something better. That curiosity turned
                into a career I genuinely love.
              </p>
              <p>
                Over the past eight years I&apos;ve worked across agencies,
                in-house product teams and as an independent consultant. I&apos;ve
                built marketing sites that doubled enquiries, e-commerce stores
                that load in under two seconds, internal tools that saved teams
                hours every week, and SaaS platforms used daily by real
                businesses.
              </p>
              <p>
                What ties it all together is a focus on <strong className="text-foreground">solving
                real problems</strong>. I&apos;m happiest when I&apos;m
                understanding a business, finding where technology can make a
                genuine difference, and shipping something fast, reliable and
                measurable.
              </p>
              <p>
                Outside of work, I&apos;m a family man based in Liverpool. Time
                with my family keeps me grounded, and a healthy obsession with new
                technology keeps me sharp. I believe the best developers bring
                their whole selves to their work — and I think that balance makes
                me better at what I do.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "8+ years building for the web",
                "60+ projects delivered",
                "Agency, in-house & freelance experience",
                "Remote-first, UK-based",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-xl border border-border bg-surface/40 px-4 py-3 text-sm"
                >
                  <Rocket className="size-4 shrink-0 text-primary" />
                  {item}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Career timeline */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Career & Development"
            title="The journey so far"
            description="A timeline of the roles, teams and experiences that shaped how I build today."
          />

          <div className="relative mx-auto mt-16 max-w-3xl">
            <div className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary via-secondary to-accent" />
            <ol className="space-y-10">
              {careerTimeline.map((entry) => (
                <Reveal as="li" key={`${entry.period}-${entry.title}`} className="relative pl-10">
                  <span className="absolute left-0 top-1.5 size-4 rounded-full border-2 border-primary bg-background shadow-[0_0_16px_-4px_hsl(var(--primary))]" />
                  <span className="font-mono text-xs text-primary">{entry.period}</span>
                  <h3 className="mt-1 font-heading text-xl font-semibold">
                    {entry.title}
                  </h3>
                  <p className="text-sm font-medium text-muted-foreground">
                    {entry.organisation}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                  {entry.highlights && (
                    <ul className="mt-3 space-y-1.5">
                      {entry.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Technical skills */}
      <section className="py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Technical Skills"
            title="The tools of the trade"
            description="A modern, full-stack toolkit — chosen for speed, reliability and long-term maintainability."
          />
          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {expertise.map((area) => {
              const Icon = area.icon;
              return (
                <StaggerItem key={area.title}>
                  <div className="card-surface h-full">
                    <Icon className="size-6 text-primary" />
                    <h3 className="mt-3 font-heading font-semibold">{area.title}</h3>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {area.skills.map((s) => (
                        <li
                          key={s}
                          className="rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Values */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Professional Values"
            title="How I approach the work"
          />
          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2">
            {values.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card-surface flex h-full gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <v.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold">{v.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Interests + future goals */}
      <section className="py-24">
        <div className="container-px grid gap-10 lg:grid-cols-2">
          <Reveal>
            <span className="eyebrow">Beyond the Code</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Personal interests</h2>
            <p className="mt-3 text-muted-foreground">
              I believe a well-rounded life makes for a better developer. Here&apos;s
              a little of what I get up to when I&apos;m away from the keyboard.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {interests.map((i) => (
                <li
                  key={i}
                  className="rounded-full border border-border bg-surface/50 px-4 py-1.5 text-sm text-muted-foreground"
                >
                  {i}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal>
            <span className="eyebrow">Future Goals</span>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Where I&apos;m headed</h2>
            <ul className="mt-6 space-y-3">
              {futureGoals.map((g) => (
                <li key={g} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Target className="mt-0.5 size-4 shrink-0 text-accent" />
                  {g}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
