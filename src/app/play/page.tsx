import type { Metadata } from "next";
import { Gamepad2, ExternalLink, Landmark, Briefcase } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { BugSquash } from "@/components/play/bug-squash";
import { SpotTheBug } from "@/components/play/spot-the-bug";
import { BugInvaders } from "@/components/play/bug-invaders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: "Play",
  description:
    "Free developer games: Spot the Bug (find the bug in real code), Bug Invaders (a typing shooter) and Whack-a-Bug. Plus the browser games Daniel Campbell-White has built.",
  path: "/play",
});

const SLOPPY = "https://sloppygames.co.uk";

const sloppyPicks = [
  { title: "Sloppy Snake", href: "/games/snake/" },
  { title: "Whack-a-Splat", href: "/games/whack/" },
  { title: "Splat Flap", href: "/games/flap/" },
  { title: "Sloppy Battleships", href: "/games/battleships/" },
  { title: "Sloppy Sudoku", href: "/games/sudoku/" },
  { title: "Number Splash", href: "/games/make24/" },
];

export default function PlayPage() {
  return (
    <>
      <PageHeader
        eyebrow="Take a Break"
        title={
          <>
            Fancy a <span className="text-gradient">game?</span>
          </>
        }
        description="Not everything has to be serious. Spot the bug like a developer, type your way through a bug invasion, whack a few more against the clock, or play some of the games I've made outside work."
      />

      {/* Spot the Bug quiz */}
      <section id="spot-the-bug" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="The Quiz"
            title="Spot the Bug"
            description="A look at what I actually do all day. Find the broken line in real-world code, rack up streaks and unlock badges."
          />
          <div className="mt-12">
            <SpotTheBug />
          </div>
        </div>
      </section>

      {/* Typing shooter */}
      <section id="bug-invaders" className="scroll-mt-24 bg-surface/30 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Typing Game"
            title="Bug Invaders"
            description="Bugs are flying at your ship and the only weapon is your keyboard. Type each word to shoot it down. Fair warning: the bosses talk like developers."
          />
          <div className="mt-12">
            <BugInvaders />
          </div>
        </div>
      </section>

      {/* Whack-a-mole */}
      <section id="whack-a-bug" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Quick Game"
            title="Whack-a-Bug"
            description="Whack-a-mole, developer edition. Squash the bugs as they pop up, but leave the features alone. You've got 30 seconds."
          />
          <Reveal className="mt-12">
            <BugSquash />
          </Reveal>
        </div>
      </section>

      {/* Games I've built */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Side Projects"
            title="Games I've built"
            description="I've always made games for fun. It's where I try out new ideas without a client brief."
          />

          <div className="mx-auto mt-14 max-w-5xl space-y-6">
            {/* Sloppy Games */}
            <Reveal>
              <article className="card-surface">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                      <Gamepad2 className="size-6" />
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-semibold">Sloppy Games</h3>
                      <p className="font-mono text-xs text-muted-foreground">sloppygames.co.uk</p>
                    </div>
                  </div>
                  <Badge variant="accent">Live</Badge>
                </div>
                <p className="mt-4 text-muted-foreground">
                  A family project I build with my son: over 20 free browser games
                  for kids, from arcade classics to maths and spelling games. No
                  accounts, no downloads, just hit play. He comes up with the ideas,
                  we build them together, and it&apos;s plain HTML, CSS and
                  JavaScript, so every game loads instantly.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {sloppyPicks.map((g) => (
                    <a
                      key={g.href}
                      href={`${SLOPPY}${g.href}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border bg-surface/60 px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent"
                    >
                      {g.title}
                    </a>
                  ))}
                </div>
                <Button href={SLOPPY} variant="outline" className="mt-6">
                  Visit Sloppy Games <ExternalLink className="size-4" />
                </Button>
              </article>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Gaming Atlas */}
              <Reveal>
                <article className="card-surface h-full">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                      <Landmark className="size-6" />
                    </span>
                    <Badge variant="default">In progress</Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Gaming Atlas</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    An interactive museum of video game history: timelines, every
                    console generation, world records and gaming legends, with
                    search across all of it.
                  </p>
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    Next.js · TypeScript · Tailwind · static export
                  </p>
                </article>
              </Reveal>

              {/* Mafia Life */}
              <Reveal>
                <article className="card-surface h-full">
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid size-12 place-items-center rounded-xl border border-secondary/30 bg-secondary/10 text-violet-300">
                      <Briefcase className="size-6" />
                    </span>
                    <Badge variant="default">In progress</Badge>
                  </div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">Mafia Life</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    A persistent browser-based crime life sim. Your world keeps
                    ticking while you&apos;re away, worked out on the server the
                    next time you log in, with live events pushed in real time.
                  </p>
                  <p className="mt-4 font-mono text-xs text-muted-foreground">
                    React · Vite · Node · Express · SQLite · SSE
                  </p>
                </article>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
