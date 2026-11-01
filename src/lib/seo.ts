import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

interface PageMetaInput {
  title?: string;
  description?: string;
  path?: string;
  /** Social share image. Defaults to the site-wide card. */
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

/** Titles Google shows in full stay under ~60 characters. */
const TITLE_LIMIT = 60;

/** Homepage title: who, what and where people actually search for. */
export const HOME_TITLE = "Liverpool Web Developer | Daniel Campbell-White, DCW Digital";

const ID = {
  website: `${siteConfig.url}/#website`,
  person: `${siteConfig.url}/#person`,
  business: `${siteConfig.url}/#business`,
};

/**
 * Build a fully-formed Next.js Metadata object: title (brand suffix only when
 * it still fits), description, canonical URL, RSS discovery, Open Graph and
 * Twitter cards. Pages always get an explicit share image so a page's own
 * openGraph object never wipes out the site default.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
}: PageMetaInput = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const branded = title ? `${title} · ${siteConfig.name}` : HOME_TITLE;
  const fullTitle = title && branded.length > TITLE_LIMIT ? title : branded;
  const images = [{ url: image, width: 1200, height: 630, alt: title ?? siteConfig.name }];

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      types: { "application/rss+xml": `${siteConfig.url}/feed.xml` },
    },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
      ...(publishedTime ? { authors: [siteConfig.owner] } : {}),
      ...(tags ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

/* ── JSON-LD structured data ────────────────────────────────────────────── */

/**
 * Site-wide entity graph: the website, Daniel (Person) and DCW Digital
 * (ProfessionalService, a LocalBusiness subtype), linked by @id so search
 * engines understand they're the same person and business everywhere.
 */
export function siteGraphSchema() {
  const abs = (p: string) => new URL(p, siteConfig.url).toString();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": ID.website,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: "en-GB",
        publisher: { "@id": ID.business },
      },
      {
        "@type": "Person",
        "@id": ID.person,
        name: siteConfig.owner,
        url: abs("/about"),
        image: abs(siteConfig.headshot),
        jobTitle: "Web Developer & Digital Services Lead",
        homeLocation: { "@type": "Place", name: "Liverpool, United Kingdom" },
        worksFor: { "@id": ID.business },
        sameAs: [siteConfig.links.facebook, siteConfig.links.instagram],
        knowsAbout: [
          "Web development",
          "Next.js",
          "React",
          "TypeScript",
          "C# and .NET",
          "PHP",
          "Umbraco",
          "WordPress",
          "Technical SEO",
          "Core Web Vitals",
          "Web accessibility",
          "AI-assisted software development",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": ID.business,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        image: abs(siteConfig.ogImage),
        logo: abs("/favicon.svg"),
        founder: { "@id": ID.person },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Liverpool",
          addressRegion: "Merseyside",
          addressCountry: "GB",
        },
        geo: { "@type": "GeoCoordinates", latitude: 53.4084, longitude: -2.9916 },
        areaServed: [
          { "@type": "City", name: "Liverpool" },
          { "@type": "AdministrativeArea", name: "Merseyside" },
          { "@type": "Country", name: "United Kingdom" },
        ],
        priceRange: "££",
        serviceType: [
          "Website development",
          "Website auditing",
          "Website support and maintenance",
          "Digital partner and consultancy",
        ],
        sameAs: [siteConfig.links.facebook, siteConfig.links.instagram],
      },
    ],
  };
}

export function blogPostingSchema(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  cover?: string;
  tags?: string[];
}) {
  const url = `${siteConfig.url}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "en-GB",
    author: { "@id": ID.person, name: siteConfig.owner },
    publisher: { "@id": ID.business },
    isPartOf: { "@id": ID.website },
    ...(post.tags?.length ? { keywords: post.tags.join(", ") } : {}),
    // Real cover image when the post has one, otherwise its generated card.
    image:
      post.cover && post.cover.startsWith("/")
        ? new URL(post.cover, siteConfig.url).toString()
        : `${url}/opengraph-image`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
