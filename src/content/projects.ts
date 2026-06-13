import type { Project, ProjectCategory } from "@/types";

export const projectCategories: ProjectCategory[] = [
  "Business",
  "E-Commerce",
  "SaaS",
  "Landing Pages",
  "Internal Tools",
];

/**
 * Portfolio projects. `cover` / gallery `src` values are gradient preset keys
 * (see ProjectVisual) so the portfolio renders crisp, on-brand artwork with
 * zero external image dependencies. Swap for real screenshots before launch.
 */
export const projects: Project[] = [
  {
    slug: "northwest-joinery",
    title: "Northwest Joinery Co.",
    client: "Northwest Joinery Co.",
    category: "Business",
    year: "2024",
    featured: true,
    cover: "cyan",
    summary:
      "A complete rebuild for a Liverpool joinery firm that doubled enquiries in three months.",
    overview:
      "Northwest Joinery had an ageing, slow website that ranked poorly and converted worse. They needed a fast, modern site that showcased their craftsmanship and turned visitors into quote requests.",
    challenge:
      "The legacy site scored under 40 on mobile Lighthouse, had no clear conversion path, and was effectively invisible for local search terms. Trust signals and project imagery were buried.",
    solution:
      "I designed and built a fast Next.js site with a clear quote-request funnel, local SEO and schema, an image-led project gallery, and a CMS so the team could publish new work themselves.",
    results: [
      { label: "Enquiries", value: "+112%" },
      { label: "Mobile Lighthouse", value: "98/100" },
      { label: "Organic traffic", value: "+74%" },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Sanity CMS", "Vercel"],
    gallery: [
      { src: "cyan", alt: "Northwest Joinery homepage hero" },
      { src: "violet", alt: "Project gallery layout" },
      { src: "emerald", alt: "Quote request funnel" },
    ],
    liveUrl: "https://example.com",
  },
  {
    slug: "lumen-retail",
    title: "Lumen Retail Store",
    client: "Lumen Retail",
    category: "E-Commerce",
    year: "2024",
    featured: true,
    cover: "violet",
    summary:
      "A headless e-commerce storefront with a 45% faster checkout and improved Core Web Vitals.",
    overview:
      "Lumen's Shopify theme was bloated and slow, hurting both conversions and search rankings. They wanted the flexibility of headless without losing the reliability of Shopify checkout.",
    challenge:
      "Heavy third-party scripts and an unoptimised theme produced poor Core Web Vitals and a sluggish browsing experience, especially on mobile where most of their traffic came from.",
    solution:
      "I built a headless storefront on Next.js backed by the Shopify Storefront API, with image optimisation, edge caching and a streamlined checkout flow — keeping Shopify's secure payments.",
    results: [
      { label: "Checkout speed", value: "+45%" },
      { label: "Conversion rate", value: "+28%" },
      { label: "LCP", value: "1.4s" },
    ],
    stack: ["Next.js", "Shopify Storefront API", "TypeScript", "Tailwind CSS"],
    gallery: [
      { src: "violet", alt: "Lumen storefront homepage" },
      { src: "cyan", alt: "Product listing page" },
      { src: "emerald", alt: "Optimised checkout flow" },
    ],
    liveUrl: "https://example.com",
  },
  {
    slug: "coastline-booking",
    title: "Coastline Booking Platform",
    client: "Coastline Wellness",
    category: "SaaS",
    year: "2023",
    featured: true,
    cover: "emerald",
    summary:
      "A custom booking platform for a wellness studio, handling scheduling, payments and reminders.",
    overview:
      "Coastline was juggling bookings across spreadsheets, email and phone. They needed a single platform their clients could use to book and pay for classes 24/7.",
    challenge:
      "Off-the-shelf tools were either too expensive or too rigid for their class-based model, with no room for their branding or specific scheduling rules.",
    solution:
      "I built a bespoke booking platform with real-time availability, Stripe payments, automated email/SMS reminders and an admin dashboard — all branded and tailored to their workflow.",
    results: [
      { label: "Admin time saved", value: "10 hrs/wk" },
      { label: "No-shows", value: "-35%" },
      { label: "Online bookings", value: "82%" },
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Stripe", "Resend"],
    gallery: [
      { src: "emerald", alt: "Booking calendar interface" },
      { src: "cyan", alt: "Admin dashboard" },
      { src: "violet", alt: "Checkout and payment" },
    ],
    liveUrl: "https://example.com",
  },
  {
    slug: "atlas-launch",
    title: "Atlas Product Launch",
    client: "Atlas Commerce",
    category: "Landing Pages",
    year: "2023",
    featured: false,
    cover: "cyan",
    summary:
      "A high-converting product launch landing page with a 9.2% sign-up conversion rate.",
    overview:
      "Atlas needed a focused, fast landing page to capture demand ahead of a new product launch and validate interest with a waitlist.",
    challenge:
      "The launch window was tight and the page had to convert hard from paid traffic while loading instantly on mobile.",
    solution:
      "I delivered a single, animation-rich landing page with a frictionless waitlist form, A/B-tested copy, analytics and sub-second load times — shipped in under two weeks.",
    results: [
      { label: "Sign-up conversion", value: "9.2%" },
      { label: "Lighthouse", value: "100/100" },
      { label: "Time to ship", value: "12 days" },
    ],
    stack: ["Next.js", "Framer Motion", "Tailwind CSS", "Vercel"],
    gallery: [
      { src: "cyan", alt: "Landing page hero" },
      { src: "violet", alt: "Waitlist signup form" },
    ],
    liveUrl: "https://example.com",
  },
  {
    slug: "vega-internal-tools",
    title: "Vega Operations Dashboard",
    client: "Vega Digital",
    category: "Internal Tools",
    year: "2022",
    featured: false,
    cover: "violet",
    summary:
      "An internal operations dashboard that replaced a tangle of spreadsheets for a 40-person team.",
    overview:
      "Vega's operations ran on fragile, shared spreadsheets. They needed a single internal tool to manage projects, resourcing and reporting.",
    challenge:
      "Data was siloed and error-prone, with no permissions or audit trail, making reporting slow and unreliable.",
    solution:
      "I built a role-based internal dashboard with real-time data, filtering, exports and audit logging — integrating with their existing systems via API.",
    results: [
      { label: "Reporting time", value: "-70%" },
      { label: "Data errors", value: "-90%" },
      { label: "Adoption", value: "100%" },
    ],
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Auth.js"],
    gallery: [
      { src: "violet", alt: "Operations dashboard overview" },
      { src: "emerald", alt: "Reporting and exports" },
    ],
  },
  {
    slug: "harbor-accountants",
    title: "Harbor Accountants",
    client: "Harbor Accountants",
    category: "Business",
    year: "2022",
    featured: false,
    cover: "emerald",
    summary:
      "A professional, trust-building website for an accountancy practice with strong local SEO.",
    overview:
      "Harbor wanted a credible, modern website to attract higher-value clients and rank for local accountancy searches.",
    challenge:
      "Their old site felt dated and generic, did little to build trust, and ranked on page two for key local terms.",
    solution:
      "I delivered a polished, accessible site with clear service pages, case studies, structured data and a local SEO foundation — plus an easy enquiry flow.",
    results: [
      { label: "Local rankings", value: "Top 3" },
      { label: "Enquiries", value: "+60%" },
      { label: "Bounce rate", value: "-22%" },
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Sanity CMS"],
    gallery: [
      { src: "emerald", alt: "Harbor Accountants homepage" },
      { src: "cyan", alt: "Service detail page" },
    ],
    liveUrl: "https://example.com",
  },
];

export function getProjectBySlug(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}
