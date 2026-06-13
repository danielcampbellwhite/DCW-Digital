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
 *
 * Copy is written for business owners trying to solve a problem, not for
 * people who know the jargon. Plain, outcome-led language throughout.
 * (Slugs are kept stable so existing anchor links keep working.)
 */
export const services: Service[] = [
  {
    slug: "website-development",
    title: "A Website That Wins You Customers",
    icon: Code2,
    summary:
      "A fast, professional website designed to turn visitors into enquiries and sales.",
    description:
      "Your website is often the first impression a customer gets of your business. I design and build websites that load fast, look the part, work perfectly on phones, and gently guide visitors towards getting in touch or buying — so your site actually earns its keep.",
    benefits: [
      "Turns more of your visitors into real enquiries and sales",
      "Looks professional and builds instant trust",
      "Works flawlessly on phones, tablets and computers",
      "Easy for you to update — no technical knowledge needed",
    ],
    deliverables: [
      "Single-page & landing sites",
      "Small business websites",
      "Larger business & corporate sites",
      "Online shops",
      "Booking systems & custom tools",
    ],
    startingPrice: "from £1,200",
    cta: { label: "Get a website that sells", href: "/contact?service=Build+a+new+website" },
  },
  {
    slug: "seo-optimisation",
    title: "Get Found by More Customers",
    icon: Search,
    summary:
      "Show up when local customers search for what you offer — and turn that into business.",
    description:
      "If customers can't find you online, they'll find your competitors instead. I help your website show up when the right people are searching for what you do — at the exact moment they're looking — and make sure your site turns that interest into enquiries.",
    benefits: [
      "Appear higher when customers search for what you do",
      "Attract more of the right visitors — ready to buy",
      "Get ahead of competitors who currently outrank you",
      "Simple reporting in plain English, no jargon",
    ],
    deliverables: [
      "Getting found on Google",
      "Being seen by local customers",
      "Clearer, more useful website content",
      "Fixing the technical bits behind the scenes",
      "Ongoing improvements over time",
    ],
    startingPrice: "from £600",
    cta: {
      label: "Help customers find me",
      href: "/contact?service=Get+found+by+more+customers",
    },
  },
  {
    slug: "website-auditing",
    title: "Website Health Check",
    icon: ClipboardCheck,
    summary:
      "A clear, jargon-free review of why your website isn't performing — and what to fix first.",
    description:
      "Not sure why your website isn't bringing in business? I'll review it from top to bottom — how fast it is, how easy it is to use, whether customers can find it, and whether anything's broken — then give you a simple, prioritised list of what to fix and why it matters.",
    benefits: [
      "Understand exactly what's holding your website back",
      "A simple, prioritised to-do list — in plain English",
      "Quick wins separated from the bigger jobs",
      "No obligation to have me do the work",
    ],
    deliverables: [
      "Speed & performance review",
      "How findable you are online",
      "Ease-of-use review",
      "Accessibility review",
      "Security review",
    ],
    startingPrice: "from £450",
    cta: { label: "Check my website", href: "/contact?service=Website+health+check" },
  },
  {
    slug: "performance-optimisation",
    title: "Make Your Website Faster",
    icon: Gauge,
    summary:
      "Slow websites lose customers. I make your existing site quick, so visitors stay and buy.",
    description:
      "Every extra second your website takes to load sends customers away. I take slow, sluggish websites and make them fast — so visitors stick around, you show up better on Google, and more people get in touch instead of giving up.",
    benefits: [
      "Keep visitors who would otherwise give up and leave",
      "Show up higher — search engines reward fast sites",
      "A smoother experience that builds trust",
      "Often pays for itself in extra enquiries",
    ],
    deliverables: [
      "Faster loading times",
      "Better speed on phones",
      "Image & media optimisation",
      "Hosting recommendations",
    ],
    startingPrice: "from £500",
    cta: {
      label: "Speed up my website",
      href: "/contact?service=Make+my+website+faster",
    },
  },
  {
    slug: "support-maintenance",
    title: "Website Care & Support",
    icon: LifeBuoy,
    summary:
      "Relax knowing your website is secure, up to date and online — with a real person on hand.",
    description:
      "Websites need looking after. My care plans keep yours secure, backed up and running smoothly — and give you a friendly expert to call whenever you need a change made or have a question. No more lying awake worrying about your website.",
    benefits: [
      "Your website stays secure, updated and online",
      "Regular backups, so nothing is ever lost",
      "A real person to call for changes and questions",
      "A predictable, fixed monthly cost",
    ],
    deliverables: ["Bronze", "Silver", "Gold"],
    startingPrice: "from £75/mo",
    cta: { label: "Keep my site running", href: "/contact?service=Website+care+%26+support" },
  },
  {
    slug: "digital-consulting",
    title: "Advice to Grow Online",
    icon: Lightbulb,
    summary:
      "Friendly, straight-talking guidance to help you make confident decisions about your online presence.",
    description:
      "Thinking about a new website, not sure what you actually need, or wondering how to reach more customers online? I give honest, jargon-free advice based on real experience — helping you avoid expensive mistakes and spend your budget where it genuinely makes a difference.",
    benefits: [
      "Honest advice with nothing to up-sell you",
      "Make confident decisions about your online presence",
      "Avoid costly mistakes and wasted spend",
      "A trusted expert in your corner",
    ],
    deliverables: [
      "Where to start online",
      "Choosing the right approach",
      "Planning your online growth",
      "Getting more from what you already have",
    ],
    startingPrice: "from £90/hr",
    cta: { label: "Get expert advice", href: "/contact?service=Advice+to+grow+online" },
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
      "We spot problems before you do",
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
      "Monthly check-up & speed review",
      "Up to 3 hours of changes / month",
      "Priority support (24h response)",
    ],
    featured: true,
  },
  {
    name: "Gold",
    price: "£300",
    cadence: "/month",
    description: "Comprehensive care for busy, revenue-critical websites.",
    features: [
      "Everything in Silver",
      "Round-the-clock monitoring & alerts",
      "Quarterly strategy review",
      "Up to 8 hours of changes / month",
      "Same-day priority support",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}
