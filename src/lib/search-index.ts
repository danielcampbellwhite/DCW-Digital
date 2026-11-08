import { getAllPosts } from "@/lib/blog";
import { siteConfig } from "@/lib/site";
import { services, supportPackages } from "@/content/services";
import { servicePages } from "@/content/service-pages";
import { clients } from "@/content/clients";
import { careerTimeline } from "@/content/timeline";
import { expertise, processSteps } from "@/content/expertise";
import type { SearchDoc } from "@/lib/search-core";

/** Turn MDX into plain, readable text for searching and snippets. */
export function mdxToText(mdx: string): string {
  return mdx
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[a-z]*\n?/gi, " "))
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^-{3,}$/gm, " ")
    .replace(/[*`~]/g, "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingsOf(mdx: string): string[] {
  return [...mdx.matchAll(/^#{2,4}\s+(.+)$/gm)].map((m) => mdxToText(m[1]!));
}

/** The games on /play that anyone can see (the classified ones stay secret). */
const GAMES: { id: string; title: string; description: string; keywords: string[] }[] = [
  { id: "spot-the-bug", title: "Spot the Bug", description: "A quiz: find the broken line in real-world code, build streaks and unlock badges.", keywords: ["quiz", "code", "debugging"] },
  { id: "dev-games", title: "The Dev Games", description: "A five-event sports day: 100m sprint, hurdles, long jump, javelin and archery, with all-time world records.", keywords: ["sports", "athletics", "olympics", "sprint", "javelin", "archery", "world records", "championship"] },
  { id: "bug-invaders", title: "Bug Invaders", description: "A typing shooter: type each word to shoot down the bugs before they reach your ship.", keywords: ["typing", "shooter", "keyboard"] },
  { id: "deploy-dash", title: "Deploy Dash", description: "An endless runner: get the release to production, jumping bugs and failing tests.", keywords: ["runner", "platformer", "deploy"] },
  { id: "load-balancer", title: "Load Balancer", description: "Route requests to the right servers, spread the load and survive traffic spikes and outages.", keywords: ["servers", "traffic", "ops", "devops"] },
  { id: "whack-a-bug", title: "Whack-a-Bug", description: "Whack-a-mole, developer edition: squash bugs, leave the features alone. 30 seconds.", keywords: ["whack a mole", "reflex", "quick"] },
  { id: "hangman", title: "Hangman", description: "Guess the developer word one letter at a time before the bug ships to production. Includes an easy word list.", keywords: ["word game", "letters", "spelling"] },
  { id: "startup-tycoon", title: "Startup Tycoon", description: "An idle game: ship features, win users, hire a team and grow to an IPO without drowning in tech debt.", keywords: ["idle", "clicker", "business", "tycoon"] },
];

function buildDocuments(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  /* Blog posts */
  for (const post of getAllPosts()) {
    docs.push({
      id: `blog:${post.slug}`,
      type: "Blog",
      title: post.title,
      url: `/blog/${post.slug}`,
      description: post.description,
      keywords: [post.category, ...post.tags],
      headings: headingsOf(post.content),
      body: mdxToText(post.content),
      date: post.date,
    });
  }

  /* Services */
  for (const s of services) {
    const page = servicePages[s.slug];
    const plans =
      s.slug === "support-maintenance"
        ? supportPackages.map((p) => `${p.name} care plan, £${p.priceMonthly} a month: ${p.description} ${p.features.join(". ")}.`).join(" ")
        : "";
    docs.push({
      id: `service:${s.slug}`,
      type: "Service",
      title: s.title,
      url: `/services/${s.slug}`,
      description: page?.lede ?? s.summary,
      keywords: [...(s.deliverables ?? []), ...s.benefits],
      headings: [...(page?.sections.map((x) => x.title) ?? []), ...(page?.faqs.map((f) => f.q) ?? [])],
      body: [
        s.description,
        ...(page?.intro ?? []),
        ...(page?.whoFor ?? []),
        ...(page?.sections.map((x) => `${x.title}. ${x.body}`) ?? []),
        ...(page?.steps.map((x) => `${x.title}. ${x.body}`) ?? []),
        ...(page?.faqs.map((f) => `${f.q} ${f.a}`) ?? []),
        plans,
      ].join(" "),
    });
  }

  /* Pages */
  const page = (id: string, title: string, url: string, description: string, keywords: string[], body = "", headings: string[] = []) =>
    docs.push({ id: `page:${id}`, type: "Page", title, url, description, keywords, headings, body });

  page("home", "Home", "/", siteConfig.description, ["web developer", "Liverpool", "Next.js", "React", siteConfig.name], `${siteConfig.tagline} ${siteConfig.altTagline}`);
  page(
    "about",
    "About Daniel",
    "/about",
    "Daniel Campbell-White is a Liverpool web developer and Digital Services Lead: his story, career timeline, skills and how he works.",
    ["about", "Daniel Campbell-White", "career", "experience", "skills", "CV"],
    [
      ...careerTimeline.map((t) => `${t.period}: ${t.title}, ${t.organisation}. ${t.description}`),
      ...expertise.map((e) => `${e.title}: ${e.description} ${e.skills.join(", ")}.`),
    ].join(" "),
    expertise.map((e) => e.title)
  );
  page(
    "services",
    "Services",
    "/services",
    "Website development, website audits, support and maintenance care plans, and ongoing digital partner work.",
    ["services", "pricing", "care plans", "packages"],
    [
      ...services.map((s) => `${s.title}: ${s.summary}`),
      ...supportPackages.map((p) => `${p.name} care plan, £${p.priceMonthly} a month.`),
      ...processSteps.map((p) => `${p.title}: ${p.description}`),
    ].join(" ")
  );
  page(
    "projects",
    "Work & Clients",
    "/projects",
    "Websites and apps Daniel has built and supported for NHS trusts, public health services and charities, including mobile apps.",
    ["work", "portfolio", "clients", "case studies", "projects"],
    clients.map((c) => `${c.name}: ${c.description}`).join(" ")
  );
  page(
    "ai",
    "How I Use AI",
    "/ai",
    "How Daniel uses AI in development: AI writes the routine code, while design, review, testing and security stay with a human.",
    ["AI", "artificial intelligence", "Claude", "agents", "automation", "code review"]
  );
  page(
    "health-check",
    "Free Website Health Check",
    "/website-health-check",
    "Test any website for free in about 30 seconds: speed, SEO and accessibility scores in plain English, plus what to fix first.",
    ["health check", "audit", "speed test", "PageSpeed", "Lighthouse", "Core Web Vitals", "SEO", "accessibility", "free"]
  );
  page("blog", "Blog", "/blog", "Practical writing on building, optimising and growing modern websites, plus a weekly tech news roundup.", ["blog", "articles", "news", "insights", "This Week in Tech"]);
  page("play", "Play", "/play", "Free browser games for developers and the curious.", ["games", "play", "fun"], GAMES.map((g) => `${g.title}: ${g.description}`).join(" "));
  page("contact", "Contact", "/contact", "Get in touch to start a project, ask for a free website health check, or talk about a role.", ["contact", "get in touch", "enquiry", "quote", "hire", "book a call"]);
  page("privacy", "Privacy Policy", "/privacy", "How DCW Digital collects, uses and protects your personal data under UK GDPR.", ["privacy", "GDPR", "cookies", "data protection"]);

  /* Clients */
  for (const c of clients) {
    docs.push({
      id: `work:${c.slug}`,
      type: "Work",
      title: c.name,
      url: `/projects#${c.slug}`,
      description: c.description,
      keywords: [c.sector, c.abbr, ...c.services],
      headings: [],
      body: c.description,
    });
  }

  /* Games */
  for (const g of GAMES) {
    docs.push({
      id: `game:${g.id}`,
      type: "Game",
      title: g.title,
      url: `/play#${g.id}`,
      description: g.description,
      keywords: ["game", ...g.keywords],
      headings: [],
      body: g.description,
    });
  }

  return docs;
}

let cached: SearchDoc[] | null = null;

/** Every searchable document on the site. Built once per server instance. */
export function getSearchDocuments(): SearchDoc[] {
  cached ??= buildDocuments();
  return cached;
}
