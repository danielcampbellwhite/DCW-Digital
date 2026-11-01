import type { NavLink } from "@/types";

/**
 * Central site configuration. Single source of truth for brand metadata,
 * navigation, social links and the canonical URL used across SEO + schema.
 */
export const siteConfig = {
  name: "DCW Digital",
  owner: "Daniel Campbell-White",
  shortName: "DCW",
  jobTitle: "Web Developer · Digital Consultant",
  tagline: "Building Modern Websites. Optimising Digital Growth.",
  altTagline: "Web Development, SEO & Digital Solutions.",
  description:
    "Daniel Campbell-White (DCW Digital) is a Liverpool web developer building fast, modern websites and web apps that bring UK businesses more enquiries.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcw-digital.co.uk",
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://cal.com/danielcampbellwhite/discovery",
  cvUrl: "/daniel-campbell-white-cv.pdf",
  headshot: "/daniel-campbell-white.png",
  locale: "en_GB",
  location: "Liverpool, United Kingdom",
  email: "contact@dcw-digital.co.uk",
  ogImage: "/opengraph-image",
  links: {
    facebook: "https://www.facebook.com/share/1JCp4YL1n5/",
    instagram: "https://www.instagram.com/danwhite_web?igsh=aG5lNHdwN3hhZnUy",
  },
} as const;

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about", description: "Daniel's story & background" },
  { label: "Services", href: "/services", description: "How DCW Digital can help" },
  { label: "Projects", href: "/projects", description: "Selected work & case studies" },
  { label: "Blog", href: "/blog", description: "Insights on web, SEO & growth" },
  { label: "Play", href: "/play", description: "Take a break and play a game" },
  { label: "Contact", href: "/contact", description: "Start a conversation" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "How I Use AI", href: "/ai" },
      { label: "Play", href: "/play" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "What I Do",
    links: [
      { label: "Website Development", href: "/services/website-development" },
      { label: "Website Auditing", href: "/services/website-auditing" },
      { label: "Support & Maintenance", href: "/services/support-maintenance" },
      { label: "Digital Partner", href: "/services/digital-partner" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Free Website Health Check", href: "/contact?service=Free+Website+Health+Check" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
