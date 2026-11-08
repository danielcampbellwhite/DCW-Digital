import { highlightParts } from "@/lib/search-core";

/** Renders text with the search terms highlighted. Plain text only, so it's safe for any content. */
export function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlightParts(text, terms).map((p, i) =>
        p.match ? (
          <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}
