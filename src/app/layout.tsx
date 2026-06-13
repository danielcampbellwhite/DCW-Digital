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
import {
  personSchema,
  professionalServiceSchema,
  localBusinessSchema,
} from "@/lib/seo";

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
    apple: "/favicon.svg",
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
        <JsonLd data={personSchema()} />
        <JsonLd data={professionalServiceSchema()} />
        <JsonLd data={localBusinessSchema()} />

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
      </body>
    </html>
  );
}
