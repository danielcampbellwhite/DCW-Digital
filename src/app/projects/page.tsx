import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { projects } from "@/content/projects";
import { PageHeader } from "@/components/sections/page-header";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { FinalCta } from "@/components/sections/final-cta";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    "Selected web development case studies — business sites, e-commerce, SaaS, landing pages and internal tools, each built to deliver measurable results.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title={
          <>
            Work that delivers{" "}
            <span className="text-gradient">measurable results</span>
          </>
        }
        description="A selection of recent projects across business, e-commerce, SaaS, landing pages and internal tools. Filter by category and dive into the case studies."
      />

      <section className="py-20">
        <div className="container-px">
          <ProjectsGrid projects={projects} />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
