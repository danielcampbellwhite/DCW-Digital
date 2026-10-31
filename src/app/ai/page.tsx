import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  ClipboardList,
  Bot,
  Eye,
  ShieldCheck,
  FlaskConical,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: "How I Build with AI",
  description:
    "How Daniel Campbell-White uses AI in software development: as a fast pair of hands under an architect's direction, with human review, tests and guardrails on everything that ships.",
  path: "/ai",
});

const workflow = [
  {
    icon: Compass,
    title: "Understand the problem",
    body: "Talk to the client, read the existing code, work out what actually needs building. AI can't do this bit for you, and skipping it is how you end up with a fast, confident solution to the wrong problem.",
  },
  {
    icon: ClipboardList,
    title: "Design the solution",
    body: "Architecture, data model, boundaries, the risky parts. I write the plan and the constraints. This is the job now - the thinking that decides whether the code is any good before a line of it exists.",
  },
  {
    icon: Bot,
    title: "Let AI do the typing",
    body: "With a clear spec, AI is quick at the implementation: boilerplate, components, tests, migrations, the tedious refactor across forty files. Small, well-scoped chunks, not 'build me an app'.",
  },
  {
    icon: Eye,
    title: "Review every line",
    body: "I read everything it writes, the same way I'd review a pull request from a junior developer. If I can't explain a piece of code, it doesn't ship.",
  },
  {
    icon: FlaskConical,
    title: "Prove it works",
    body: "Tests, type checks, linting, a proper look in the browser. AI-written code is held to exactly the same bar as mine. 'It compiled' is not the same as 'it works'.",
  },
];

const handOff = [
  "Boilerplate, scaffolding and repetitive components",
  "Writing and extending test suites",
  "Large, mechanical refactors and migrations",
  "First drafts of docs, PR descriptions and reports",
  "Digging through an unfamiliar codebase to find things",
  "Triage of routine support tickets into draft fixes",
];

const keep = [
  "Architecture and system design decisions",
  "Understanding what the client actually needs",
  "Security, auth, payments and anything sensitive",
  "Deciding whether a change is the right change",
  "Final review and sign-off on everything that ships",
  "Accountability - it's my name on the work",
];

const guardrails = [
  {
    title: "A human gate on everything",
    body: "AI opens pull requests. It never merges them, never deploys and never touches production on its own.",
  },
  {
    title: "Least privilege",
    body: "Agents get the access they need for the task and nothing more. No blanket shell approval, no production keys on the machine running them.",
  },
  {
    title: "Untrusted input is untrusted",
    body: "Anything an agent reads - tickets, issues, web pages, other people's code - can try to steer it. I treat that content like user input to a shell.",
  },
  {
    title: "Client code and data stay private",
    body: "No pasting client secrets, credentials or personal data into tools that shouldn't have them. Confidentiality doesn't get relaxed because a tool is convenient.",
  },
];

export default function AiPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI in Development"
        title={
          <>
            Less typing, more{" "}
            <span className="text-gradient">architecting</span>
          </>
        }
        description="AI has changed how I build software. Not by replacing the developer, but by moving my time away from typing code and towards designing it, reviewing it and making sure it's right."
      />

      {/* Intro */}
      <section className="py-20">
        <div className="container-px mx-auto max-w-3xl space-y-5 text-muted-foreground">
          <Reveal>
            <p className="text-lg text-foreground">
              I use AI every day. I&apos;d be lying if I said otherwise, and
              I&apos;d be doing clients a disservice if I didn&apos;t.
            </p>
          </Reveal>
          <Reveal>
            <p>
              But there&apos;s a big difference between using AI well and just
              letting it loose. Used badly, it produces a lot of code very quickly
              that nobody really understands, with bugs and security holes
              baked in. Used properly, it&apos;s like having a quick, tireless
              junior developer who needs clear instructions and has every piece
              of work checked.
            </p>
          </Reveal>
          <Reveal>
            <p>
              That&apos;s shifted my role. I spend less time writing every line
              myself and more time doing the parts that actually decide whether
              software is any good: understanding the problem, designing the
              system, setting the constraints, and reviewing what gets built. In
              other words, I work more like an <strong className="text-foreground">architect</strong> than
              a typist.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Workflow */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="The Workflow"
            title="How a feature actually gets built"
            description="AI sits in the middle of the process, not at either end. The thinking before it and the checking after it are mine."
          />
          <ol className="mx-auto mt-14 max-w-3xl space-y-4">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              const isAi = i === 2;
              return (
                <Reveal as="li" key={step.title}>
                  <div
                    className={`card-surface flex gap-5 ${
                      isAi ? "border-secondary/40" : ""
                    }`}
                  >
                    <span
                      className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                        isAi
                          ? "border-secondary/40 bg-secondary/10 text-violet-300"
                          : "border-primary/20 bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                        {isAi ? " · AI-assisted" : " · Me"}
                      </span>
                      <h3 className="mt-0.5 font-heading text-lg font-semibold">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Hand off vs keep */}
      <section className="py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Drawing the Line"
            title="What I hand to AI, and what I don't"
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
            <Reveal>
              <div className="card-surface h-full">
                <h3 className="font-heading text-lg font-semibold">
                  Happy to hand off
                </h3>
                <ul className="mt-4 space-y-3">
                  {handOff.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal>
              <div className="card-surface h-full">
                <h3 className="font-heading text-lg font-semibold">
                  Always stays with me
                </h3>
                <ul className="mt-4 space-y-3">
                  {keep.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <X className="mt-0.5 size-4 shrink-0 text-red-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Guardrails */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Guardrails"
            title="Using it responsibly"
            description="Fast is only useful if it's also safe. These aren't optional."
          />
          <StaggerGroup className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2">
            {guardrails.map((g) => (
              <StaggerItem key={g.title}>
                <div className="card-surface flex h-full gap-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-heading font-semibold">{g.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{g.body}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* In practice */}
      <section className="py-24">
        <div className="container-px mx-auto max-w-3xl">
          <SectionHeading
            align="left"
            eyebrow="In Practice"
            title="Things I've built with it"
          />
          <div className="mt-8 space-y-4 text-muted-foreground">
            <Reveal>
              <p>
                It&apos;s not just about writing code faster. I&apos;ve built AI
                into tooling that takes the repetitive work out of the job, always
                with me reviewing the output:
              </p>
            </Reveal>
            <Reveal>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary" />
                  <span>
                    <Link href="/blog/automating-website-audits-with-claude-and-github-actions" className="font-medium text-primary underline-offset-4 hover:underline">
                      An automated audit pipeline
                    </Link>{" "}
                    that checks a site&apos;s performance and security and emails
                    me a finished report.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary" />
                  <span>
                    <Link href="/blog/from-support-ticket-to-pull-request" className="font-medium text-primary underline-offset-4 hover:underline">
                      A support bot
                    </Link>{" "}
                    that turns a ticket into a draft pull request for me to review.
                  </span>
                </li>
              </ul>
            </Reveal>
            <Reveal>
              <p>
                And I keep an eye on the risks too - like the{" "}
                <Link href="/blog/php2shell-and-the-claude-code-extension-backdoor" className="font-medium text-primary underline-offset-4 hover:underline">
                  backdoored AI extension
                </Link>{" "}
                that hit developers recently. Knowing how these tools fail is part
                of using them properly.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What it means for you */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <Reveal>
              <div className="card-surface h-full">
                <span className="eyebrow">For clients</span>
                <h3 className="mt-4 font-heading text-xl font-semibold">
                  Quicker, without cutting corners
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  The repetitive bits get done faster, so more of your budget goes
                  on the parts that matter: getting the design right, getting it
                  secure, and getting it working properly. Everything is still
                  built, reviewed and tested by someone who understands it.
                </p>
              </div>
            </Reveal>
            <Reveal>
              <div className="card-surface h-full">
                <span className="eyebrow">For teams</span>
                <h3 className="mt-4 font-heading text-xl font-semibold">
                  Someone who can lead with it
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  I lead a team of developers, and a lot of that now is setting how
                  we use AI: where it helps, where it doesn&apos;t, how work gets
                  reviewed, and how to keep it safe. Getting the speed without
                  losing the quality is an engineering problem, not a tooling one.
                </p>
              </div>
            </Reveal>
          </div>
          <div className="mt-12 text-center">
            <Button href="/contact" variant="primary" size="lg">
              Talk to me about a project
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
