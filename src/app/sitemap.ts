import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { getAllPostsMeta } from "@/lib/blog";

/**
 * Dynamic sitemap.
 *
 * Served at `/sitemap.xml`. Static routes are listed once; every blog post is
 * pulled automatically from the `content/blog` collection (with its real
 * published date as <lastmod>), so adding/removing a post updates the sitemap
 * with no manual edits. Regenerated on each deploy and revalidated hourly.
 */
export const revalidate = 3600; // refresh at most once an hour

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = (
    [
      { path: "/", priority: 1, changeFrequency: "weekly" },
      { path: "/about", priority: 0.8, changeFrequency: "monthly" },
      { path: "/services", priority: 0.9, changeFrequency: "monthly" },
      { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
      { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
      { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
      { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    ] as const
  ).map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getAllPostsMeta().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
