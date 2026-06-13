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
  startingPrice?: string;
  cta: CTA;
}

/** A support & maintenance package tier (Bronze / Silver / Gold). */
export interface SupportPackage {
  name: string;
  price: string;
  cadence: string;
  description: string;
  features: string[];
  featured?: boolean;
}

/** Portfolio project category, used for the filterable grid. */
export type ProjectCategory =
  | "Business"
  | "E-Commerce"
  | "SaaS"
  | "Landing Pages"
  | "Internal Tools";

/** A portfolio project with full case-study fields. */
export interface Project {
  slug: string;
  title: string;
  client: string;
  category: ProjectCategory;
  year: string;
  featured: boolean;
  cover: string;
  summary: string;
  overview: string;
  challenge: string;
  solution: string;
  results: { label: string; value: string }[];
  stack: string[];
  gallery: { src: string; alt: string }[];
  liveUrl?: string;
  repoUrl?: string;
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
