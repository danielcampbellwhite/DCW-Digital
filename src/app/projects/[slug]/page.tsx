import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Github, ArrowRight } from "lucide-react";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { projects, getProjectBySlug } from "@/content/projects";
import { Atmosphere } from "@/components/brand/atmosphere";
import { ProjectVisual } from "@/components/projects/project-visual";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return buildMetadata({ title: "Project not found" });

  return buildMetadata({
    title: `${project.title} — Case Study`,
    description: project.summary,
    path: `/projects/${project.slug}`,
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const sections = [
    { title: "Overview", body: project.overview },
    { title: "The Challenge", body: project.challenge },
    { title: "The Solution", body: project.solution },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Projects", path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border pt-28">
        <Atmosphere particles={10} />
        <div className="container-px relative z-10 pb-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All projects
          </Link>
          <Reveal className="mt-6 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="primary">{project.category}</Badge>
              <span className="text-sm text-muted-foreground">{project.year}</span>
              <span className="text-sm text-muted-foreground">· {project.client}</span>
            </div>
            <h1 className="mt-4 text-balance text-4xl font-bold sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              {project.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <Button href={project.liveUrl} variant="primary">
                  <ExternalLink className="size-4" /> Visit live site
                </Button>
              )}
              {project.repoUrl && (
                <Button href={project.repoUrl} variant="outline">
                  <Github className="size-4" /> View code
                </Button>
              )}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container-px py-16">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          {/* Main content */}
          <div className="space-y-12">
            <Reveal>
              <ProjectVisual preset={project.cover} label={project.title} />
            </Reveal>

            {sections.map((s) => (
              <Reveal key={s.title}>
                <h2 className="font-heading text-2xl font-bold">{s.title}</h2>
                <p className="mt-3 text-muted-foreground">{s.body}</p>
              </Reveal>
            ))}

            {/* Results */}
            <Reveal>
              <h2 className="font-heading text-2xl font-bold">Results</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {project.results.map((r) => (
                  <div
                    key={r.label}
                    className="rounded-2xl border border-border bg-card p-5 text-center"
                  >
                    <div className="font-heading text-3xl font-bold text-gradient">
                      {r.value}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{r.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Gallery */}
            <Reveal>
              <h2 className="font-heading text-2xl font-bold">Gallery</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {project.gallery.map((g, i) => (
                  <ProjectVisual key={i} preset={g.src} label={g.alt} />
                ))}
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Technology
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-lg border border-border bg-surface/60 px-2.5 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                At a glance
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Client</dt>
                  <dd className="text-right font-medium">{project.client}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Category</dt>
                  <dd className="text-right font-medium">{project.category}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Year</dt>
                  <dd className="text-right font-medium">{project.year}</dd>
                </div>
              </dl>

              <div className="mt-6 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  Want results like these for your business?
                </p>
                <Button href="/contact" variant="primary" className="mt-3 w-full">
                  Start your project
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
