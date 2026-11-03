import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { BugSquash } from "@/components/play/bug-squash";
import { SpotTheBug } from "@/components/play/spot-the-bug";
import { BugInvaders } from "@/components/play/bug-invaders";
import { DeployDash } from "@/components/play/deploy-dash";
import { WeeklyLeaderboard } from "@/components/play/weekly-leaderboard";
import { ClassifiedGames } from "@/components/play/classified-games";

export const metadata: Metadata = buildMetadata({
  title: "Developer Games: Spot the Bug & Typing Game",
  description:
    "Free games for developers and the curious: find the bug in real code, a typing shooter, an endless runner and Whack-a-Bug. Play in your browser.",
  path: "/play",
});

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
        description="Not everything has to be serious. Spot the bug like a developer, type your way through a bug invasion, dash a release to production, or whack a few more against the clock."
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
          <WeeklyLeaderboard game="invaders" className="mt-6" />
        </div>
      </section>

      {/* Endless runner */}
      <section id="deploy-dash" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Endless Runner"
            title="Deploy Dash"
            description="Get the release to production. Jump the bugs and failing tests, duck under the error pop-ups, and grab coffee on the way. It only gets faster."
          />
          <div className="mt-12">
            <DeployDash />
          </div>
          <WeeklyLeaderboard game="dash" className="mt-6" />
        </div>
      </section>

      {/* Whack-a-mole */}
      <section id="whack-a-bug" className="scroll-mt-24 bg-surface/30 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Quick Game"
            title="Whack-a-Bug"
            description="Whack-a-mole, developer edition. Squash the bugs as they pop up, but leave the features alone. You've got 30 seconds."
          />
          <Reveal className="mt-12">
            <BugSquash />
          </Reveal>
          <WeeklyLeaderboard game="whack" className="mt-6 max-w-xl" />
        </div>
      </section>

      {/* Root-only games, unlocked via the secret terminal */}
      <section id="classified" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Classified"
            title="Classified games"
            description="Root access only. Extra games for anyone who's cracked the terminal password today."
          />
          <div className="mt-12">
            <ClassifiedGames />
          </div>
        </div>
      </section>
    </>
  );
}
