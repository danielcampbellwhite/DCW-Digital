import type { Client, ClientSector } from "@/types";

/** Sectors in display/filter order, with the accent colour used by the
 *  wordmark fallback monogram for each. */
export const sectorMeta: Record<ClientSector, { color: string }> = {
  "NHS & Healthcare": { color: "#0EA5E9" },
  "Public Health": { color: "#10B981" },
  Legal: { color: "#8B5CF6" },
  "Charity & Community": { color: "#F59E0B" },
  Commercial: { color: "#22D3EE" },
};

export const clientSectors: ClientSector[] = [
  "NHS & Healthcare",
  "Public Health",
  "Legal",
  "Charity & Community",
  "Commercial",
];

/**
 * Organisations DCW Digital has worked with. Presented as a logo + name
 * showcase. Descriptions are deliberately generic and truthful — no
 * fabricated performance metrics for these real, named organisations.
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
    sector: "NHS & Healthcare",
    description:
      "One of the largest acute NHS trusts in the North West, serving Wirral and the surrounding region.",
    services: ["Web Development", "Accessibility", "Support & Maintenance"],
    url: "https://www.wuth.nhs.uk",
    featured: true,
  },
  {
    slug: "arden-gem",
    name: "NHS Arden & GEM CSU",
    abbr: "A&G",
    sector: "NHS & Healthcare",
    description:
      "A leading NHS Commissioning Support Unit providing services and digital tools to health and care organisations nationally.",
    services: ["Web Development", "Digital Tools"],
    url: "https://www.ardengemcsu.nhs.uk",
    featured: true,
  },
  {
    slug: "asap-glos",
    name: "ASAP Glos NHS",
    abbr: "ASAP",
    sector: "NHS & Healthcare",
    description:
      "A Gloucestershire NHS service helping residents find the right urgent care, quickly and confidently.",
    services: ["Web Development", "UX"],
    url: "https://www.asapglos.nhs.uk",
    featured: false,
  },
  {
    slug: "hls-coventry",
    name: "Healthy Lifestyles Coventry",
    abbr: "HLS",
    sector: "Public Health",
    description:
      "Coventry's free healthy-lifestyles service supporting residents to lose weight, stop smoking, move more and drink less.",
    services: ["Web Development", "SEO", "Support & Maintenance"],
    url: "https://hlscoventry.org",
    featured: true,
  },
  {
    slug: "hls-warwickshire",
    name: "Healthy Lifestyles Warwickshire",
    abbr: "HLS",
    sector: "Public Health",
    description:
      "Warwickshire's free behaviour-change service helping people across the county build healthier habits.",
    services: ["Web Development", "SEO"],
    url: "https://hlswarwickshire.org",
    featured: false,
  },
  {
    slug: "stop-for-life-sandwell",
    name: "Stop For Life Sandwell",
    abbr: "SFL",
    sector: "Public Health",
    description:
      "Sandwell's free community stop-smoking service, supporting residents to quit smoking and vaping for good.",
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
      "Devon County Council's stop-smoking service, offering advice, support and guidance to residents across Devon.",
    services: ["Web Development", "Accessibility"],
    url: "https://stopforlifedevon.org",
    featured: false,
  },
  {
    slug: "liv-life-liverpool",
    name: "Liv Life Liverpool",
    abbr: "LIV",
    sector: "Public Health",
    description:
      "Liverpool's free healthy-lifestyles service supporting individuals and families to eat well, move more and feel better.",
    services: ["Web Development", "SEO", "Support & Maintenance"],
    url: "https://livlifeliverpool.org",
    featured: true,
  },
  {
    slug: "stop-for-life-app",
    name: "Stop For Life App",
    abbr: "SFL",
    sector: "Public Health",
    description:
      "The companion mobile app for the Stop For Life stop-smoking services, supporting people to quit and stay smoke-free on the go.",
    services: ["Mobile App", "Support & Maintenance"],
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
      "The companion mobile app for Help Me Quit, the NHS stop-smoking service for Wales, helping people quit smoking for good.",
    services: ["Mobile App", "Support & Maintenance"],
    url: "https://play.google.com/store/apps/details?id=com.mediaice.helpmequit",
    appStoreUrl: "https://apps.apple.com/gb/app/helpa-fi-i-stopio-helpmequit/id6759058234",
    featured: false,
  },
  {
    slug: "frontline-network",
    name: "The Frontline Network",
    abbr: "FN",
    sector: "Charity & Community",
    description:
      "A national network, supported by St Martin-in-the-Fields, connecting and empowering frontline workers who support people facing homelessness.",
    services: ["Web Development", "Community Platform"],
    url: "https://www.frontlinenetwork.org.uk",
    featured: true,
  },
  {
    slug: "smitfc",
    name: "St Martin-in-the-Fields Charity",
    abbr: "SMF",
    sector: "Charity & Community",
    description:
      "A national charity working to support people who are facing homelessness or in vulnerable situations, including through its Frontline Network.",
    services: ["Web Development", "Community Platform"],
    url: "https://www.smitfc.org",
    featured: false,
  },
  {
    slug: "bandm-waste",
    name: "B&M Waste Services",
    abbr: "B&M",
    sector: "Commercial",
    description:
      "An established, multi-award-winning waste management and recycling company operating across the North West and Wales.",
    services: ["Web Development", "SEO", "Performance"],
    url: "https://www.bandmwaste.com",
    featured: true,
  },
  {
    slug: "psr-solicitors",
    name: "PSR Solicitors",
    abbr: "PSR",
    sector: "Legal",
    description:
      "A modern, client-focused law firm providing legal services across a broad range of practice areas.",
    services: ["Web Development", "SEO"],
    url: "https://www.psrsolicitors.co.uk",
    featured: true,
  },
  {
    slug: "poole-alcock",
    name: "Poole Alcock Solicitors",
    abbr: "PA",
    sector: "Legal",
    description:
      "A long-established solicitors' practice with offices across Cheshire, serving individuals and businesses.",
    services: ["Web Development", "Support & Maintenance"],
    url: "https://www.poolealcock.co.uk",
    featured: false,
  },
];

export function getFeaturedClients(): Client[] {
  return clients.filter((c) => c.featured);
}

export function getClientsBySector(sector: ClientSector): Client[] {
  return clients.filter((c) => c.sector === sector);
}
