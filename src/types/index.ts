import type { LucideIcon } from "lucide-react";

/** Top-level and footer navigation links. */
export interface NavLink {
  label: string;
  href: string;
  description?: string;
}

/** A single, strongly-typed call-to-action. */
export interface CTA {
  label: string;
  href: string;
}

/** Homepage / about credibility metric with an animated counter. */
export interface Metric {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  description?: string;
}

/** A core-expertise card grouping related technologies. */
export interface ExpertiseArea {
  title: string;
  icon: LucideIcon;
  description: string;
  skills: string[];
}

/** A service offering. Used on the homepage overview and /services. */
export interface Service {
  slug: string;
  title: string;
  icon: LucideIcon;
  summary: string;
  description: string;
  benefits: string[];
  deliverables?: string[];
  cta: CTA;
}

/** A support & maintenance package tier (Bronze / Silver / Gold). */
export interface SupportPackage {
  name: string;
  description: string;
  features: string[];
  featured?: boolean;
}

/** Sector groupings used to filter the "worked with" client wall. */
export type ClientSector =
  | "NHS & Healthcare"
  | "Public Health"
  | "Legal"
  | "Charity & Community"
  | "Commercial";

/**
 * An organisation Daniel / DCW Digital has worked with. Presented as a
 * logo + name showcase (no fabricated metrics) rather than a case study.
 */
export interface Client {
  slug: string;
  /** Display name, e.g. "Wirral University Teaching Hospital". */
  name: string;
  /** Short monogram used by the wordmark fallback, e.g. "WUTH". */
  abbr: string;
  sector: ClientSector;
  /** Truthful, generic description of the engagement — no invented KPIs. */
  description: string;
  /** High-level services provided. */
  services: string[];
  /** Live site (used for an optional link; never displayed as raw text). */
  url: string;
  featured: boolean;
}

/** A client enriched with a resolved logo path (server-side, build time). */
export interface ClientWithLogo extends Client {
  /** `/logos/<slug>.(svg|png|webp)` if a real file exists, otherwise null. */
  logoSrc: string | null;
}

/** A timeline step for the "How I Work" process. */
export interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** A career / development timeline entry on the About page. */
export interface TimelineEntry {
  period: string;
  title: string;
  organisation: string;
  description: string;
  highlights?: string[];
}

/** A testimonial or professional recommendation. */
export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
  type: "client" | "employer" | "colleague";
  rating?: number;
}

/** Blog post categories. */
export type PostCategory =
  | "Web Development"
  | "SEO"
  | "Performance"
  | "Technology"
  | "Business Growth";

/** Blog post frontmatter, parsed from MDX. */
export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: PostCategory;
  tags: string[];
  author: string;
  featured: boolean;
  cover?: string;
  readingTime: number;
}

/** A full blog post: metadata plus raw MDX body. */
export interface Post extends PostMeta {
  content: string;
}
