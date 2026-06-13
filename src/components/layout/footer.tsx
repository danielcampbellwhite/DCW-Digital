import Link from "next/link";
import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { footerNav, siteConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border bg-surface/40">
      <div className="container-px py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand + pitch */}
          <div className="flex flex-col gap-4">
            <Logo variant="stacked" />
            <p className="max-w-xs text-sm text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              {siteConfig.location}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Button
                href={siteConfig.links.github}
                variant="outline"
                size="icon"
                aria-label="GitHub"
              >
                <Github className="size-4" />
              </Button>
              <Button
                href={siteConfig.links.linkedin}
                variant="outline"
                size="icon"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </Button>
              <Button
                href={siteConfig.links.twitter}
                variant="outline"
                size="icon"
                aria-label="Twitter / X"
              >
                <Twitter className="size-4" />
              </Button>
              <Button
                href={`mailto:${siteConfig.email}`}
                variant="outline"
                size="icon"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </Button>
            </div>
          </div>

          {/* Link columns */}
          {footerNav.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => {
                  const external = /^https?:\/\//.test(link.href);
                  return (
                    <li key={link.label}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-primary"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {year} {siteConfig.name}. Built by {siteConfig.owner}.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block size-2 animate-pulse-glow rounded-full bg-accent" />
            Available for new projects &amp; opportunities
          </p>
        </div>
      </div>
    </footer>
  );
}
