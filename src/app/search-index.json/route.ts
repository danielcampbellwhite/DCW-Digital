import { getSearchDocuments } from "@/lib/search-index";

// Built once at deploy time and cached by the CDN; the command palette loads it
// the first time it opens and searches it in the browser.
export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchDocuments(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" },
  });
}
