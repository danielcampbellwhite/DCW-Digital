import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

interface PageMetaInput {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
}

/**
 * Build a fully-formed Next.js Metadata object with sensible, on-brand
 * defaults: canonical URL, Open Graph, and Twitter cards.
 */
export function buildMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  type = "website",
  publishedTime,
  tags,
}: PageMetaInput = {}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const fullTitle = title
    ? `${title} · ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.altTagline}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
      ...(publishedTime ? { publishedTime } : {}),
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

/* ── JSON-LD structured data generators ──────────────────────────────────── */

export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.owner,
    url: siteConfig.url,
    image: new URL(siteConfig.headshot, siteConfig.url).toString(),
    jobTitle: "Web Developer & Digital Consultant",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Liverpool",
      addressCountry: "GB",
    },
    sameAs: [siteConfig.links.facebook, siteConfig.links.instagram],
    knowsAbout: [
      "Web Development",
      "Next.js",
      "React",
      "TypeScript",
      "Search Engine Optimisation",
      "Core Web Vitals",
      "Performance Optimisation",
    ],
  };
}

export function professionalServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    image: new URL(siteConfig.ogImage, siteConfig.url).toString(),
    url: siteConfig.url,
    description: siteConfig.description,
    founder: { "@type": "Person", name: siteConfig.owner },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Liverpool",
      addressCountry: "GB",
    },
    priceRange: "££",
    serviceType: [
      "Website Development",
      "SEO Optimisation",
      "Website Auditing",
      "Performance Optimisation",
      "Support & Maintenance",
      "Digital Consulting",
    ],
  };
}

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#business`,
    name: siteConfig.name,
    url: siteConfig.url,
    image: new URL(siteConfig.ogImage, siteConfig.url).toString(),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Liverpool",
      addressRegion: "Merseyside",
      addressCountry: "GB",
    },
    geo: { "@type": "GeoCoordinates", latitude: 53.4084, longitude: -2.9916 },
    priceRange: "££",
  };
}

export function blogPostingSchema(post: {
  title: string;
  description: string;
  date: string;
  slug: string;
  cover?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { "@type": "Person", name: siteConfig.owner, url: siteConfig.url },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: new URL(siteConfig.ogImage, siteConfig.url).toString(),
      },
    },
    image: post.cover
      ? new URL(post.cover, siteConfig.url).toString()
      : new URL(siteConfig.ogImage, siteConfig.url).toString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
