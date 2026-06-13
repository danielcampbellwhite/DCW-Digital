import fs from "node:fs";
import path from "node:path";
import type { Client, ClientWithLogo } from "@/types";

const LOGO_DIR = path.join(process.cwd(), "public", "logos");
const EXTENSIONS = ["svg", "png", "webp", "jpg"] as const;

/**
 * Resolve the on-disk logo for a client, if one has been added to
 * `public/logos/`. Returns a public path (e.g. `/logos/wuth.svg`) or null.
 *
 * Server-only (uses `fs`) — never import this from a client component.
 */
function resolveLogo(slug: string): string | null {
  for (const ext of EXTENSIONS) {
    const file = path.join(LOGO_DIR, `${slug}.${ext}`);
    if (fs.existsSync(file)) return `/logos/${slug}.${ext}`;
  }
  return null;
}

/** Attach a resolved `logoSrc` to each client. Call in a server component
 *  and pass the result down to client components as plain props. */
export function withLogos(list: Client[]): ClientWithLogo[] {
  return list.map((client) => ({ ...client, logoSrc: resolveLogo(client.slug) }));
}
