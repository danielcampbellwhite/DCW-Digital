import type { Client, ClientSector } from "@/types";

/** Sectors in display/filter order, with the accent colour used by the
 *  wordmark fallback monogram for each. */
export const sectorMeta: Record<ClientSector, { color: string }> = {
  "NHS & Healthcare": { color: "#0EA5E9" },
  "Public Health": { color: "#10B981" },
  "Charity & Community": { color: "#F59E0B" },
};

export const clientSectors: ClientSector[] = [
  "NHS & Healthcare",
  "Public Health",
  "Charity & Community",
];

/**
 * Websites and apps Daniel has built, extended, maintained or supported as a
 * web developer across agencies. Descriptions describe his actual involvement
 * — truthful, specific, with no fabricated performance metrics.
 *
 * To use real logos, drop files at `public/logos/<slug>.svg` (or .png/.webp).
 * They are picked up automatically — see `scripts/fetch-logos.sh` and
 * `src/lib/logos.ts`. Until then, a branded wordmark is shown.
 */
export const clients: Client[] = [
  {
    slug: "wuth",
    name: "Wirral University Teaching Hospital",
    abbr: "WUTH",
    logoOnLight: true,
    sector: "NHS & Healthcare",
    description:
      "One of the largest acute NHS trusts in the North West. I maintain the site and provide ongoing client support, including accessibility audits and improvements to help meet WCAG standards.",
    services: ["Accessibility", "Support & Maintenance"],
    url: "https://www.wuth.nhs.uk",
    featured: true,
  },
  {
    slug: "arden-gem",
    name: "NHS Arden & GEM CSU",
    abbr: "A&G",
    logoOnLight: true,
    sector: "NHS & Healthcare",
    description:
      "A leading NHS Commissioning Support Unit providing services to health and care organisations nationally. I built their website from scratch and delivered it under ongoing support and maintenance contracts.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://www.ardengemcsu.nhs.uk",
    featured: true,
  },
  {
    slug: "asap-glos",
    name: "ASAP Glos NHS",
    abbr: "ASAP",
    logoOnLight: true,
    sector: "NHS & Healthcare",
    description:
      "A Gloucestershire NHS service helping residents find the right urgent care. I maintain the site and provide ongoing support, including accessibility improvements.",
    services: ["Accessibility", "Support & Maintenance"],
    url: "https://www.asapglos.nhs.uk",
    featured: false,
  },
  {
    slug: "hls-coventry",
    name: "Healthy Lifestyles Coventry",
    abbr: "HLS",
    logoOnLight: true,
    sector: "Public Health",
    description:
      "Coventry's free healthy-lifestyles service supporting residents to lose weight, stop smoking, move more and drink less. I built the site and continue to maintain it.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://hlscoventry.org",
    featured: true,
  },
  {
    slug: "hls-warwickshire",
    name: "Healthy Lifestyles Warwickshire",
    abbr: "HLS",
    sector: "Public Health",
    description:
      "Warwickshire's free behaviour-change service helping people across the county build healthier habits. I built and maintain the site.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://hlswarwickshire.org",
    featured: false,
  },
  {
    slug: "stop-for-life-sandwell",
    name: "Stop For Life Sandwell",
    abbr: "SFL",
    sector: "Public Health",
    description:
      "Sandwell's free community stop-smoking service, supporting residents to quit smoking and vaping for good. I built the site and provide its ongoing support and maintenance.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://stopforlifesandwell.org",
    featured: true,
  },
  {
    slug: "stop-for-life-devon",
    name: "Stop For Life Devon",
    abbr: "SFL",
    sector: "Public Health",
    description:
      "Devon County Council's stop-smoking service, offering advice and guidance to residents across Devon. I built and maintain the site.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://stopforlifedevon.org",
    featured: true,
  },
  {
    slug: "liv-life-liverpool",
    name: "Liv Life Liverpool",
    abbr: "LIV",
    sector: "Public Health",
    description:
      "Liverpool's free healthy-lifestyles service supporting individuals and families to eat well, move more and feel better. I built and maintain the site.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://livlifeliverpool.org",
    featured: true,
  },
  {
    slug: "stop-for-life-app",
    name: "Stop For Life App",
    abbr: "SFL",
    sector: "Public Health",
    description:
      "The companion mobile app for the Stop For Life stop-smoking services. Originally built by a colleague, I've extended it with new features.",
    services: ["Mobile App", "Feature Development"],
    url: "https://play.google.com/store/apps/details?id=com.mediaice.journey",
    appStoreUrl: "https://apps.apple.com/gb/app/stop-smoking-stop-for-life/id6746129332",
    featured: false,
  },
  {
    slug: "help-me-quit",
    name: "Help Me Quit",
    abbr: "HMQ",
    sector: "Public Health",
    description:
      "Public Health Wales' counterpart to the Stop For Life app, helping people across Wales quit smoking. I've worked on and extended the app alongside its sister product.",
    services: ["Mobile App", "Feature Development"],
    url: "https://play.google.com/store/apps/details?id=com.mediaice.helpmequit",
    appStoreUrl: "https://apps.apple.com/gb/app/helpa-fi-i-stopio-helpmequit/id6759058234",
    featured: false,
  },
  {
    slug: "frontline-network",
    name: "The Frontline Network",
    abbr: "FN",
    logoOnLight: true,
    sector: "Charity & Community",
    description:
      "A national network, supported by St Martin-in-the-Fields, connecting frontline workers who support people facing homelessness. I maintain the site and have added pages and features over time.",
    services: ["Feature Development", "Support & Maintenance"],
    url: "https://www.frontlinenetwork.org.uk",
    featured: true,
  },
  {
    slug: "smitfc",
    name: "St Martin-in-the-Fields Charity",
    abbr: "SMF",
    logoOnLight: true,
    sector: "Charity & Community",
    description:
      "A national charity supporting people facing homelessness, and home of the Frontline Network. We took the site on from another agency, and I provide its ongoing support and maintenance.",
    services: ["Support & Maintenance"],
    url: "https://www.smitfc.org",
    featured: true,
  },
];

export function getFeaturedClients(): Client[] {
  return clients.filter((c) => c.featured);
}

export function getClientsBySector(sector: ClientSector): Client[] {
  return clients.filter((c) => c.sector === sector);
}
