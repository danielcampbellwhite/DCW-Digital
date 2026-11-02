import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.name} - ${siteConfig.altTagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#050816",
    theme_color: "#050816",
    categories: ["business", "productivity", "games"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    shortcuts: [
      { name: "Services", url: "/services", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Play a game", url: "/play", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Blog", url: "/blog", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Get in touch", url: "/contact", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
