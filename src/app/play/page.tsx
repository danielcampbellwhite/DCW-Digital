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
import { RootOnly } from "@/components/play/hard-mode";
import { DevGames } from "@/components/play/dev-games/dev-games";
import { LoadBalancer } from "@/components/play/load-balancer";
import { StartupTycoon } from "@/components/play/startup-tycoon";
import { Hangman } from "@/components/play/hangman";

export const metadata: Metadata = buildMetadata({
  title: "Developer Games: Dev Games, Spot the Bug & More",
  description:
    "Free browser games for developers and the curious: a five-event sports day with all-time world records, spot the bug, hangman, a typing shooter, a load balancer and an idle startup game.",
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
        description="Not everything has to be serious. Chase a world record at the Dev Games, spot the bug like a developer, keep the servers up as the load balancer, or build a startup empire one feature at a time."
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

      {/* Multi-event athletics */}
      <section id="dev-games" className="scroll-mt-24 bg-surface/30 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Sports Day"
            title="The Dev Games"
            description="Five events, one champion. Sprint, hurdles, long jump, javelin and archery, played on your keyboard or phone. The world records are the best ever set by players on this site, and they never reset."
          />
          <div className="mt-12">
            <DevGames />
          </div>
        </div>
      </section>

      {/* Typing shooter */}
      <section id="bug-invaders" className="scroll-mt-24 py-20">
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
          <RootOnly>
            <WeeklyLeaderboard game="invaders-hard" className="mt-6" />
          </RootOnly>
        </div>
      </section>

      {/* Endless runner */}
      <section id="deploy-dash" className="scroll-mt-24 bg-surface/30 py-20">
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
          <RootOnly>
            <WeeklyLeaderboard game="dash-hard" className="mt-6" />
          </RootOnly>
        </div>
      </section>

      {/* Load balancer */}
      <section id="load-balancer" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Ops Game"
            title="Load Balancer"
            description="Traffic is pouring in and you're the router. Send every request to the right kind of server, keep the load spread so nothing falls over, and scale up before the next spike hits."
          />
          <div className="mt-12">
            <LoadBalancer />
          </div>
          <WeeklyLeaderboard game="balancer" className="mt-6" />
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

      {/* Word game */}
      <section id="hangman" className="scroll-mt-24 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Word Game"
            title="Hangman"
            description="The classic, developer edition. Guess the coding term one letter at a time before the bug ships to production. There's an easy word list for younger players too."
          />
          <div className="mt-12">
            <Hangman />
          </div>
          <WeeklyLeaderboard game="hangman" className="mt-6" />
        </div>
      </section>

      {/* Idle game */}
      <section id="startup-tycoon" className="scroll-mt-24 bg-surface/30 py-20">
        <div className="container-px">
          <SectionHeading
            eyebrow="Idle Game"
            title="Startup Tycoon"
            description="Start with a laptop and a dream. Ship features, win users, hire a team and grow to an IPO, without letting tech debt or your servers sink you. It keeps going while you're away."
          />
          <div className="mt-12">
            <StartupTycoon />
          </div>
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
