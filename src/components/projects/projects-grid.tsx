"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Project, ProjectCategory } from "@/types";
import { projectCategories } from "@/content/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { cn } from "@/lib/utils";

type Filter = ProjectCategory | "All";

/** Filterable, animated portfolio grid. */
export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = React.useState<Filter>("All");

  const filters: Filter[] = ["All", ...projectCategories];
  const visible =
    filter === "All" ? projects : projects.filter((p) => p.category === filter);

  return (
    <div>
      {/* Filter pills */}
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Filter projects by category"
      >
        {filters.map((f) => {
          const active = f === filter;
          const count =
            f === "All" ? projects.length : projects.filter((p) => p.category === f).length;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <motion.div layout className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.div
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && (
        <p className="mt-12 text-center text-muted-foreground">
          No projects in this category yet — check back soon.
        </p>
      )}
    </div>
  );
}
