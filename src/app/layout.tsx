import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CommandProvider } from "@/components/command/command-palette";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { JsonLd } from "@/components/seo/json-ld";
import { siteGraphSchema } from "@/lib/seo";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { SecretTerminal } from "@/components/easter-egg/secret-terminal";
import { RootLayer } from "@/components/root/root-layer";
import { getAllPostsMeta } from "@/lib/blog";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...buildMetadata(),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.owner, url: siteConfig.url }],
  creator: siteConfig.owner,
  keywords: [
    "Daniel Campbell-White",
    "DCW Digital",
    "web developer Liverpool",
    "Next.js developer",
    "React developer",
    "freelance web developer",
    "website optimisation",
    "digital consultant",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background">
        <JsonLd data={siteGraphSchema()} />

        {/* Skip link for keyboard / screen-reader users */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>

        <CommandProvider>
          <ScrollProgress />
          <Navbar />
          <main id="main" className="relative">
            {children}
          </main>
          <Footer />
        </CommandProvider>
        <ServiceWorker />
        <RootLayer />
        <SecretTerminal posts={getAllPostsMeta().slice(0, 8).map(({ title, slug }) => ({ title, slug }))} />
      </body>
    </html>
  );
}
