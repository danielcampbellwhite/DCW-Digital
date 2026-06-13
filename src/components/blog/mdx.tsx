import Link from "next/link";
import type { MDXComponents } from "mdx/types";

/**
 * Styled MDX element mapping. Keeps article typography on-brand and consistent
 * without reaching for a global prose plugin.
 */
export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-12 scroll-mt-24 font-heading text-2xl font-bold text-foreground"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="mt-8 scroll-mt-24 font-heading text-xl font-semibold text-foreground"
      {...props}
    />
  ),
  p: (props) => (
    <p className="mt-5 leading-relaxed text-muted-foreground" {...props} />
  ),
  a: ({ href = "#", ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link
          href={href}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...props}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary underline-offset-4 hover:underline"
        {...props}
      />
    );
  },
  ul: (props) => (
    <ul className="mt-5 space-y-2 text-muted-foreground" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 text-muted-foreground" {...props} />
  ),
  li: (props) => (
    <li className="marker:text-primary [&>strong]:text-foreground" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-foreground" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="mt-6 border-l-2 border-primary/60 bg-surface/40 py-2 pl-5 pr-4 text-lg font-medium italic text-foreground/90"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm text-accent"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface p-4 font-mono text-sm"
      {...props}
    />
  ),
  hr: () => <hr className="my-10 border-border" />,
};
