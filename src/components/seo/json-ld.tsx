/**
 * Renders a JSON-LD <script> tag. `data` is serialised safely; pass any of the
 * schema generators from `@/lib/seo`.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; we additionally escape `<` to avoid
      // any chance of breaking out of the script context.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
