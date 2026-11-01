import { getAllPostsMeta } from "@/lib/blog";
import { services } from "@/content/services";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

/** A plain-text site summary for AI search tools (see llmstxt.org). */
export function GET() {
  const u = siteConfig.url;
  const posts = getAllPostsMeta();

  const body = `# ${siteConfig.name}

> ${siteConfig.description}

${siteConfig.owner} is a web developer and Digital Services Lead based in Liverpool, UK. He builds websites and web apps with Next.js, React and TypeScript, audits existing sites for speed, SEO and security, and offers monthly support and maintenance plans for businesses across the UK.

## Pages

- [Home](${u}/): Overview of DCW Digital and what it offers
- [About](${u}/about): Daniel's background, career and skills
- [Services](${u}/services): Services and support & maintenance plans (from £75 a month)
- [Work & Clients](${u}/projects): Organisations Daniel has built and supported sites for
- [How I Use AI](${u}/ai): How Daniel uses AI in development, with a human reviewing everything
- [Play](${u}/play): Developer games, including Spot the Bug and a typing game
- [Contact](${u}/contact): Contact form for projects and roles

## Services

${services.map((s) => `- [${s.title}](${u}/services/${s.slug}): ${s.summary}`).join("\n")}

## Blog

${posts.map((p) => `- [${p.title}](${u}/blog/${p.slug}): ${p.seoDescription ?? p.description}`).join("\n")}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
