import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { getSearchDocuments } from "@/lib/search-index";
import { SEARCH_TYPES, searchDocs, type SearchType } from "@/lib/search-core";
import { PageHeader } from "@/components/sections/page-header";
import { Highlight } from "@/components/search/highlight";
import { TYPE_META } from "@/components/search/type-meta";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ q?: string | string[]; type?: string | string[] }> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = one((await searchParams).q).trim().slice(0, 100);
  return {
    ...buildMetadata({
      title: q ? `Search: ${q}` : "Search",
      description: "Search DCW Digital's services, blog posts, work and games.",
      path: "/search",
    }),
    robots: { index: false, follow: true },
  };
}

const SUGGESTIONS = [
  { label: "Services", href: "/services" },
  { label: "Care plans", href: "/services#packages" },
  { label: "Free website health check", href: "/website-health-check" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = one(params.q).trim().slice(0, 100);
  const typeParam = one(params.type);
  const type = (SEARCH_TYPES as string[]).includes(typeParam) ? (typeParam as SearchType) : null;

  const docs = getSearchDocuments();
  const all = q ? searchDocs(docs, q) : null;
  const shown = q && type ? searchDocs(docs, q, { type }) : all;
  const total = all?.total ?? 0;

  const href = (t: SearchType | null) => `/search?q=${encodeURIComponent(q)}${t ? `&type=${t}` : ""}`;

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={q ? <>Results for &ldquo;{q}&rdquo;</> : "Search the site"}
        description={
          q
            ? total === 0
              ? "Nothing matched that. Try a different word, or one of the suggestions below."
              : `${total} result${total === 1 ? "" : "s"} across services, blog posts, work and games.`
            : "Find services, blog posts, client work and games."
        }
      />

      <section className="py-12 sm:py-16">
        <div className="container-px mx-auto max-w-3xl">
          <form action="/search" method="get" role="search" className="flex gap-2">
            <label htmlFor="site-search" className="sr-only">
              Search the site
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="site-search"
                name="q"
                type="search"
                defaultValue={q}
                autoFocus={!q}
                maxLength={100}
                placeholder="Search the site…"
                className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
              />
            </div>
            <button
              type="submit"
              className="h-12 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Search
            </button>
          </form>

          {all && total > 0 && (
            <nav aria-label="Filter results" className="mt-6 flex flex-wrap gap-2">
              <FilterChip href={href(null)} active={!type} label="All" count={total} />
              {SEARCH_TYPES.filter((t) => all.counts[t] > 0).map((t) => (
                <FilterChip key={t} href={href(t)} active={type === t} label={TYPE_META[t].plural} count={all.counts[t]} />
              ))}
            </nav>
          )}

          {shown && shown.results.length > 0 && (
            <ol className="mt-8 space-y-3">
              {shown.results.map((r) => {
                const meta = TYPE_META[r.type];
                return (
                  <li key={r.id}>
                    <Link
                      href={r.url}
                      className="group block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                    >
                      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5">
                          <meta.icon className="size-3 text-primary" /> {meta.label}
                        </span>
                        {r.date && <span>{formatDate(r.date)}</span>}
                        <span className="truncate font-mono">{r.url}</span>
                      </p>
                      <h2 className="mt-2 flex items-start justify-between gap-3 font-heading text-lg font-semibold">
                        <span>
                          <Highlight text={r.title} terms={shown.terms} />
                        </span>
                        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </h2>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        <Highlight text={r.snippet} terms={shown.terms} />
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}

          {(!q || total === 0) && (
            <div className="mt-10">
              <p className="text-sm font-medium text-muted-foreground">{q ? "You might be looking for:" : "Popular:"}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function FilterChip({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {label} <span className="ml-1 font-mono text-muted-foreground">{count}</span>
    </Link>
  );
}
