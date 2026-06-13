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
    "Daniel Campbell-White (DCW Digital) is a Liverpool-based web developer and digital consultant building high-performance websites and digital experiences that deliver measurable business results.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dcwdigital.co.uk",
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://cal.com/danielcampbellwhite/discovery",
  cvUrl: "/daniel-campbell-white-cv.pdf",
  headshot: "/daniel-campbell-white.png",
  locale: "en_GB",
  location: "Liverpool, United Kingdom",
  email: "hello@dcwdigital.co.uk",
  ogImage: "/opengraph-image",
  links: {
    github: "https://github.com/danielcampbellwhite",
    linkedin: "https://www.linkedin.com/in/danielcampbellwhite",
    twitter: "https://twitter.com/dcwdigital",
  },
  twitterHandle: "@dcwdigital",
} as const;

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about", description: "Daniel's story & background" },
  { label: "Services", href: "/services", description: "How DCW Digital can help" },
  { label: "Projects", href: "/projects", description: "Selected work & case studies" },
  { label: "Blog", href: "/blog", description: "Insights on web, SEO & growth" },
  { label: "Contact", href: "/contact", description: "Start a conversation" },
];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "What I Do",
    links: [
      { label: "Website Design & Build", href: "/services#website-development" },
      { label: "Get Found Online", href: "/services#seo-optimisation" },
      { label: "Website Health Check", href: "/services#website-auditing" },
      { label: "Website Care & Support", href: "/services#support-maintenance" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Book a Discovery Call", href: siteConfig.bookingUrl },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];
