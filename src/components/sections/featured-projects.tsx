import { ArrowRight } from "lucide-react";
import { getFeaturedProjects } from "@/content/projects";
import { SectionHeading } from "@/components/sections/section-heading";
import { ProjectCard } from "@/components/projects/project-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/** Featured project grid for the homepage. */
export function FeaturedProjects() {
  const featured = getFeaturedProjects();

  return (
    <section className="py-24">
      <div className="container-px">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Featured Work"
            title="Selected projects & case studies"
            description="A snapshot of recent work — each one built to solve a real business problem and deliver measurable results."
          />
          <Button href="/projects" variant="outline" className="shrink-0">
            View all projects
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <StaggerItem key={project.slug} className="h-full">
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
