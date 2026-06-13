"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ProjectVisual } from "@/components/projects/project-visual";

/** Interactive portfolio card with a hover lift + glow. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="group relative h-full"
    >
      <Link
        href={`/projects/${project.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-300 hover:border-primary/40"
      >
        <div className="p-3">
          <ProjectVisual preset={project.cover} label={project.title} />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5 pt-2">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="primary">{project.category}</Badge>
            <span className="text-xs text-muted-foreground">{project.year}</span>
          </div>
          <h3 className="font-heading text-lg font-semibold leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">{project.summary}</p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
            {project.stack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {project.stack.length > 3 && (
              <span className="rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                +{project.stack.length - 3}
              </span>
            )}
          </div>

          <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View case study
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
