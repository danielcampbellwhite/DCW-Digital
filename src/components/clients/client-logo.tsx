import type { ClientWithLogo } from "@/types";
import { sectorMeta } from "@/content/clients";
import { cn } from "@/lib/utils";

/**
 * The visual "mark" for a client: the real logo image when one exists at
 * `public/logos/<slug>.*`, otherwise an on-brand wordmark monogram. Pure
 * presentational component - safe inside both server and client trees.
 */
export function ClientMark({
  client,
  className,
}: {
  client: ClientWithLogo;
  className?: string;
}) {
  const color = sectorMeta[client.sector].color;

  if (client.logoSrc) {
    // Logos designed for a light background sit on a white plaque so they stay
    // legible (and on-brand) against the dark cards.
    if (client.logoOnLight) {
      return (
        <span
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-lg bg-white px-3 py-2 shadow-sm",
            className
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={client.logoSrc}
            alt={`${client.name} logo`}
            loading="lazy"
            className="h-full w-auto max-w-[140px] object-contain"
          />
        </span>
      );
    }
    return (
      // White / light logos render directly on the dark card.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={client.logoSrc}
        alt={`${client.name} logo`}
        loading="lazy"
        className={cn(
          "h-10 w-auto max-w-[150px] object-contain transition duration-300",
          className
        )}
      />
    );
  }

  // Wordmark fallback
  return (
    <span
      aria-hidden
      className={cn(
        "grid h-12 min-w-12 place-items-center rounded-xl border px-3 font-heading text-base font-bold tracking-tight transition-transform duration-300 group-hover:scale-105",
        className
      )}
      style={{
        color,
        backgroundColor: `${color}1a`,
        borderColor: `${color}40`,
      }}
    >
      {client.abbr}
    </span>
  );
}

/** Compact logo + name unit used in the homepage "trusted by" strip. */
export function ClientLogo({ client }: { client: ClientWithLogo }) {
  return (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${client.name}`}
      className="group flex h-24 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-4 text-center transition-colors hover:border-primary/40"
    >
      <ClientMark client={client} />
      <span className="line-clamp-1 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
        {client.name}
      </span>
    </a>
  );
}
