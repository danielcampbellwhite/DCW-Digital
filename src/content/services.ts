import { Code2, ClipboardCheck, LifeBuoy, Handshake } from "lucide-react";
import type { Service, SupportPackage } from "@/types";

/**
 * Service catalogue — four core things Daniel can help with. These are framed
 * as pointers to what's possible rather than rigid, priced products: the call
 * to action is always "let's have a chat". The only place pricing is shown is
 * the Support & Maintenance packages below.
 */
export const services: Service[] = [
  {
    slug: "website-development",
    title: "Website Development",
    icon: Code2,
    summary:
      "Fast, modern websites and web apps, designed and built from scratch around your goals.",
    description:
      "I design and build websites and web applications from the ground up — fast, accessible, easy to manage and built to convert. Strong SEO foundations and performance come as standard, not as an afterthought.",
    benefits: [
      "Bespoke design and build, tailored to you",
      "Fast, accessible and built to convert",
      "SEO and performance baked in",
      "Clean, maintainable code that lasts",
    ],
    deliverables: [
      "Business & corporate websites",
      "Landing pages & campaign sites",
      "Online shops",
      "Booking systems & custom web apps",
      "SEO & performance built in",
    ],
    cta: { label: "Get in touch for a chat", href: "/contact?service=Website+development" },
  },
  {
    slug: "website-auditing",
    title: "Website Auditing",
    icon: ClipboardCheck,
    summary:
      "A clear, prioritised review of an existing site — what's working, what isn't, and what to fix first.",
    description:
      "Already have a website but it's not pulling its weight? I'll review it across performance, SEO, user experience, accessibility and security, then give you a plain-English, prioritised action plan you can act on.",
    benefits: [
      "Know exactly what's holding your site back",
      "Prioritised, jargon-free recommendations",
      "Quick wins separated from the bigger jobs",
      "A roadmap you can use with any developer",
    ],
    deliverables: [
      "Performance & Core Web Vitals",
      "SEO & search visibility",
      "UX & ease-of-use",
      "Accessibility review",
      "Security review",
    ],
    cta: { label: "Get in touch for a chat", href: "/contact?service=Website+audit" },
  },
  {
    slug: "support-maintenance",
    title: "Support & Maintenance",
    icon: LifeBuoy,
    summary:
      "Keep your site secure, updated and online with a simple monthly care plan — pick the level that suits.",
    description:
      "Websites need looking after. My care plans keep yours secure, backed up and running smoothly, with a real person on hand for changes and questions. Available as straightforward monthly subscription packages — see the tiers below.",
    benefits: [
      "Updates, backups and monitoring",
      "A real person for changes & questions",
      "A predictable, fixed monthly cost",
      "Three levels to suit your needs",
    ],
    deliverables: ["Bronze", "Silver", "Gold"],
    cta: { label: "See the care plans", href: "/services#packages" },
  },
  {
    slug: "digital-partner",
    title: "Digital Partner",
    icon: Handshake,
    summary:
      "Your go-to person for digital — on hand for advice or ad-hoc work, charged as used and invoiced monthly.",
    description:
      "Don't need a big project, just someone reliable in your corner? As your digital partner I'm on hand for advice, small jobs and the occasional 'can you just…'. Work is charged ad hoc and invoiced monthly, so you only ever pay for what you use.",
    benefits: [
      "A trusted expert on call",
      "Advice and ad-hoc work, no big commitment",
      "Only pay for what you use",
      "Simple monthly invoicing",
    ],
    deliverables: [
      "Ongoing advice & guidance",
      "Small fixes & changes",
      "Tech & tooling decisions",
      "Whatever comes up — just ask",
    ],
    cta: { label: "Get in touch for a chat", href: "/contact?service=Digital+partner" },
  },
];

/** Support & maintenance tiers shown on the /services page. The one place
 *  on the site where pricing is displayed. */
export const supportPackages: SupportPackage[] = [
  {
    name: "Bronze",
    priceMonthly: 75,
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
    priceMonthly: 150,
    description: "For growing businesses that depend on their website.",
    features: [
      "Everything in Bronze",
      "Daily backups",
      "Monthly check-up & speed review",
      "Up to 3 hours of changes / month",
      "Priority support (24h response)",
    ],
    featured: true,
  },
  {
    name: "Gold",
    priceMonthly: 250,
    description: "Comprehensive care for busy, business-critical websites.",
    features: [
      "Everything in Silver",
      "Round-the-clock monitoring & alerts",
      "Quarterly review & planning",
      "Up to 8 hours of changes / month",
      "Same-day priority support",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
