"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Clock, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PostMeta, PostCategory } from "@/types";
import { postCategories } from "@/lib/constants";
import { formatDate, cn } from "@/lib/utils";
import { PostCover } from "@/components/blog/post-cover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Filter = PostCategory | "All";

/** Client-side searchable, filterable blog index. */
export function BlogIndex({
  posts,
  featured,
}: {
  posts: PostMeta[];
  featured: PostMeta[];
}) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("All");

  const filters: Filter[] = ["All", ...postCategories];

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesCategory = filter === "All" || p.category === filter;
      const matchesQuery =
        !q ||
        `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [posts, query, filter]);

  const lead = featured[0];

  return (
    <div className="space-y-16">
      {/* Featured post */}
      {lead && !query && filter === "All" && (
        <Link
          href={`/blog/${lead.slug}`}
          className="group grid gap-6 overflow-hidden rounded-3xl border border-border bg-card p-3 transition-colors hover:border-primary/40 md:grid-cols-2 md:p-4"
        >
          <PostCover cover={lead.cover} alt={lead.title} priority />
          <div className="flex flex-col justify-center p-4 md:p-8">
            <div className="flex items-center gap-3">
              <Badge variant="accent">Featured</Badge>
              <Badge variant="primary">{lead.category}</Badge>
            </div>
            <h2 className="mt-4 font-heading text-2xl font-bold leading-tight sm:text-3xl">
              {lead.title}
            </h2>
            <p className="mt-3 text-muted-foreground">{lead.description}</p>
            <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatDate(lead.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" /> {lead.readingTime} min read
              </span>
              <span className="inline-flex items-center gap-1 text-primary">
                Read article
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-5">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles…"
            className="pl-10"
            aria-label="Search articles"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No articles found. Try a different search or category.
        </p>
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((post) => (
              <motion.article
                key={post.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <PostCover cover={post.cover} alt={post.title} />
                  <div className="flex flex-1 flex-col p-4">
                    <Badge variant="primary" className="w-fit">
                      {post.category}
                    </Badge>
                    <h3 className="mt-3 font-heading text-lg font-semibold leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.description}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                      <span>{formatDate(post.date)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" /> {post.readingTime} min
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
