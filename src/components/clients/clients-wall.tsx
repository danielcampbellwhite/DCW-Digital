"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { ClientWithLogo, ClientSector } from "@/types";
import { clientSectors } from "@/content/clients";
import { ClientMark } from "@/components/clients/client-logo";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Filter = ClientSector | "All";

/** Filterable, animated "worked with" grid of client cards. */
export function ClientsWall({ clients }: { clients: ClientWithLogo[] }) {
  const [filter, setFilter] = React.useState<Filter>("All");

  const filters: Filter[] = ["All", ...clientSectors];
  const visible =
    filter === "All" ? clients : clients.filter((c) => c.sector === filter);

  return (
    <div>
      {/* Filter pills */}
      <div
        className="flex flex-wrap items-center justify-center gap-2"
        role="tablist"
        aria-label="Filter clients by sector"
      >
        {filters.map((f) => {
          const active = f === filter;
          const count =
            f === "All" ? clients.length : clients.filter((c) => c.sector === f).length;
          if (count === 0 && f !== "All") return null;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((client) => (
            <motion.article
              key={client.slug}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <ClientCard client={client} />
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/** Inner content shared by both card variants. */
function CardBody({ client, isApp }: { client: ClientWithLogo; isApp: boolean }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <ClientMark client={client} />
        {!isApp && (
          <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        )}
      </div>

      <h3 className="mt-5 font-heading text-lg font-semibold leading-snug">
        {client.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {client.description}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Badge variant="primary">{client.sector}</Badge>
        {client.services.slice(0, 2).map((s) => (
          <span
            key={s}
            className="rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      {isApp && (
        <div className="mt-4 flex flex-wrap gap-2">
          <StoreLink href={client.url} label="Google Play" />
          {client.appStoreUrl && (
            <StoreLink href={client.appStoreUrl} label="App Store" />
          )}
        </div>
      )}
    </>
  );
}

/** A small external link to an app-store listing. */
function StoreLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
    >
      {label}
      <ArrowUpRight className="size-3" />
    </a>
  );
}

/**
 * Renders a client card. App entries (those with an App Store link) use a
 * plain container with two store buttons; everything else is a single
 * whole-card link to the organisation's site.
 */
function ClientCard({ client }: { client: ClientWithLogo }) {
  const isApp = Boolean(client.appStoreUrl);
  const className =
    "group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-primary/40";

  if (isApp) {
    return (
      <div className={className}>
        <CardBody client={client} isApp />
      </div>
    );
  }

  return (
    <a
      href={client.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit ${client.name}`}
      className={className}
    >
      <CardBody client={client} isApp={false} />
    </a>
  );
}
