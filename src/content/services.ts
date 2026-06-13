import {
  Code2,
  Search,
  ClipboardCheck,
  Gauge,
  LifeBuoy,
  Lightbulb,
} from "lucide-react";
import type { Service, SupportPackage } from "@/types";

/**
 * Service catalogue — the single source of truth for the homepage overview
 * and the full /services page.
 */
export const services: Service[] = [
  {
    slug: "website-development",
    title: "Website Development",
    icon: Code2,
    summary:
      "Fast, scalable, conversion-focused websites and web apps built on a modern stack.",
    description:
      "From a single high-converting landing page to a full custom web application, I design and build websites that are fast, accessible and easy to maintain. Every build is engineered for Core Web Vitals, SEO and real business outcomes — not just visual polish.",
    benefits: [
      "Built on Next.js, React & TypeScript for speed and longevity",
      "Conversion-first layouts that turn visitors into enquiries",
      "Fully responsive and accessible (WCAG) out of the box",
      "Clean, documented code your team can build on",
    ],
    deliverables: [
      "Landing Pages",
      "Brochure Websites",
      "Business Websites",
      "Corporate Websites",
      "Custom Web Applications",
    ],
    startingPrice: "from £1,200",
    cta: { label: "Discuss a build", href: "/contact?service=Website+Development" },
  },
  {
    slug: "seo-optimisation",
    title: "SEO Optimisation",
    icon: Search,
    summary:
      "Technical and on-page SEO that gets you found and grows qualified organic traffic.",
    description:
      "I help businesses climb the rankings with a measurable, technical approach to SEO. That means fixing the foundations search engines care about, optimising content and metadata, and shipping structured data that earns rich results.",
    benefits: [
      "Higher rankings for the terms that actually convert",
      "Cleaner crawlability, indexing and site architecture",
      "Rich results via structured data (schema.org)",
      "Reporting you can understand and act on",
    ],
    deliverables: [
      "Technical SEO",
      "Content Optimisation",
      "Metadata Improvements",
      "Structured Data",
      "Core Web Vitals",
    ],
    startingPrice: "from £600",
    cta: { label: "Improve my rankings", href: "/contact?service=SEO+Optimisation" },
  },
  {
    slug: "website-auditing",
    title: "Website Auditing",
    icon: ClipboardCheck,
    summary:
      "A deep, prioritised review of your site across performance, SEO, UX, accessibility and security.",
    description:
      "Not sure why your website isn't performing? A DCW Digital audit gives you a clear, prioritised action plan. I review the technical foundations, search visibility, user experience, accessibility and security — then tell you exactly what to fix first.",
    benefits: [
      "Know exactly what's holding your site back",
      "Prioritised, plain-English recommendations",
      "Quick wins separated from longer-term work",
      "A roadmap you can hand to any developer",
    ],
    deliverables: [
      "Technical Review",
      "SEO Audit",
      "UX Audit",
      "Accessibility Review",
      "Security Review",
    ],
    startingPrice: "from £450",
    cta: { label: "Request an audit", href: "/contact?service=Website+Auditing" },
  },
  {
    slug: "performance-optimisation",
    title: "Performance Optimisation",
    icon: Gauge,
    summary:
      "Make your existing site dramatically faster — better Core Web Vitals, better conversions.",
    description:
      "Speed is revenue. I take slow, bloated websites and make them fast — improving Lighthouse scores, Core Web Vitals and real-world load times. Faster sites rank higher, convert better and cost less to run.",
    benefits: [
      "Measurable Lighthouse & Core Web Vitals gains",
      "Lower bounce rates and higher conversions",
      "Optimised images, fonts, code and caching",
      "Hosting and infrastructure recommendations",
    ],
    deliverables: [
      "Speed Improvements",
      "Lighthouse Optimisation",
      "Hosting Review",
      "Database Improvements",
    ],
    startingPrice: "from £500",
    cta: {
      label: "Speed up my site",
      href: "/contact?service=Performance+Optimisation",
    },
  },
  {
    slug: "support-maintenance",
    title: "Support & Maintenance",
    icon: LifeBuoy,
    summary:
      "Keep your website secure, updated and performing with a monthly care plan.",
    description:
      "Websites need looking after. My care plans keep your site secure, up to date and online — with proactive monitoring, regular updates, backups and a real person to call when something needs changing.",
    benefits: [
      "Proactive updates, backups and uptime monitoring",
      "Priority access for changes and fixes",
      "Monthly performance and security checks",
      "Peace of mind with a fixed monthly cost",
    ],
    deliverables: ["Bronze", "Silver", "Gold"],
    startingPrice: "from £75/mo",
    cta: { label: "Choose a plan", href: "/contact?service=Support+%26+Maintenance" },
  },
  {
    slug: "digital-consulting",
    title: "Digital Consulting",
    icon: Lightbulb,
    summary:
      "Strategic and technical advice to help you make confident digital decisions.",
    description:
      "Whether you're choosing a tech stack, planning a rebuild or scaling a product, I provide clear, vendor-neutral advice grounded in real engineering experience. I help you avoid expensive mistakes and invest where it matters.",
    benefits: [
      "Vendor-neutral technical and business advice",
      "Tech stack and architecture guidance",
      "Digital roadmaps tied to business goals",
      "A trusted technical partner on call",
    ],
    deliverables: [
      "Technology Strategy",
      "Architecture Review",
      "Digital Roadmaps",
      "Team & Process Advice",
    ],
    startingPrice: "from £90/hr",
    cta: { label: "Book a consultation", href: "/contact?service=Digital+Consulting" },
  },
];

/** Support & maintenance tiers shown on the /services page. */
export const supportPackages: SupportPackage[] = [
  {
    name: "Bronze",
    price: "£75",
    cadence: "/month",
    description: "Essential cover for small business and brochure sites.",
    features: [
      "Software & security updates",
      "Weekly off-site backups",
      "Uptime monitoring",
      "Up to 1 hour of changes / month",
      "Email support (48h response)",
    ],
  },
  {
    name: "Silver",
    price: "£150",
    cadence: "/month",
    description: "For growing businesses that depend on their website.",
    features: [
      "Everything in Bronze",
      "Daily backups",
      "Monthly performance & SEO check",
      "Up to 3 hours of changes / month",
      "Priority support (24h response)",
    ],
    featured: true,
  },
  {
    name: "Gold",
    price: "£300",
    cadence: "/month",
    description: "Comprehensive care for high-traffic and revenue-critical sites.",
    features: [
      "Everything in Silver",
      "Real-time monitoring & alerts",
      "Quarterly strategy review",
      "Up to 8 hours of changes / month",
      "Same-day priority support",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
