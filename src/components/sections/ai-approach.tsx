import { Compass, Bot, Eye, ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/sections/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    icon: Compass,
    title: "I design it",
    body: "Understanding the problem, planning the architecture and setting the constraints stays with me.",
  },
  {
    icon: Bot,
    title: "AI helps build it",
    body: "With a clear spec, AI speeds up the repetitive implementation work in small, well-scoped chunks.",
  },
  {
    icon: Eye,
    title: "I check all of it",
    body: "Every line is reviewed and tested before it ships. If I can't explain it, it doesn't go live.",
  },
];

/** Homepage teaser for the /ai page - how Daniel uses AI in development. */
export function AiApproach() {
  return (
    <section className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="AI in Development"
          title="Using AI properly, not blindly"
          description="AI has moved my time away from typing code and towards designing it and checking it. Faster delivery, same standards."
        />
        <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-3">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <StaggerItem key={p.title}>
                <div className="card-surface h-full">
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-3 font-heading text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
        <div className="mt-10 flex justify-center">
          <Button href="/ai" variant="outline">
            How I build with AI
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
