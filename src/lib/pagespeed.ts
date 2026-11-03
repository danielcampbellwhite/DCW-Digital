
/**
 * Runs a Google PageSpeed Insights (Lighthouse) check and turns the result
 * into a short, plain-English report for business owners.
 *
 * Set PAGESPEED_API_KEY (free from Google Cloud) for a proper daily quota.
 * PAGESPEED_API_URL can point at a stand-in API for testing.
 */

export type Impact = "high" | "medium" | "low";

export interface HealthIssue {
  id: string;
  title: string;
  why: string;
  impact: Impact;
  area: "Speed" | "SEO" | "Accessibility" | "Best practice";
  saving?: string;
}

export interface HealthMetric {
  label: string;
  value: string;
  verdict: "good" | "ok" | "poor";
  target: string;
}

export interface HealthReport {
  url: string;
  checkedAt: string;
  scores: { performance: number; seo: number; accessibility: number; bestPractices: number };
  metrics: HealthMetric[];
  issues: HealthIssue[];
  good: string[];
  reportUrl: string;
}

/** Plain-English versions of the checks that matter most to small businesses. */
const PLAIN: Record<string, { title: string; why: string; area: HealthIssue["area"] }> = {
  "render-blocking-resources": { title: "Files are holding the page back before it can appear", why: "Visitors stare at a blank screen while scripts and styles load first.", area: "Speed" },
  "uses-optimized-images": { title: "Images are bigger files than they need to be", why: "Heavy images are the most common reason small business sites are slow on phones.", area: "Speed" },
  "modern-image-formats": { title: "Images aren't using modern formats (WebP/AVIF)", why: "Modern formats look the same but are often half the size.", area: "Speed" },
  "uses-responsive-images": { title: "Phones are downloading desktop-sized images", why: "Mobile visitors wait for pixels they'll never see.", area: "Speed" },
  "offscreen-images": { title: "Images further down the page load straight away", why: "Loading them later would get the top of the page in front of visitors sooner.", area: "Speed" },
  "unused-javascript": { title: "The page loads JavaScript it doesn't use", why: "Unused code still has to download and slows the page down, especially on phones.", area: "Speed" },
  "unused-css-rules": { title: "The page loads styles it doesn't use", why: "Extra CSS delays the first paint of the page.", area: "Speed" },
  "unminified-javascript": { title: "JavaScript files aren't compressed (minified)", why: "Smaller files download faster.", area: "Speed" },
  "unminified-css": { title: "Style files aren't compressed (minified)", why: "Smaller files download faster.", area: "Speed" },
  "uses-text-compression": { title: "Text files aren't compressed by the server", why: "Turning on compression is a quick win that can cut file sizes dramatically.", area: "Speed" },
  "server-response-time": { title: "The server is slow to respond", why: "Everything else waits on this. It often points to hosting or caching issues.", area: "Speed" },
  "redirects": { title: "The page goes through extra redirects", why: "Each redirect adds a delay before anything loads.", area: "Speed" },
  "uses-long-cache-ttl": { title: "Returning visitors re-download files they already have", why: "Better caching makes repeat visits much faster.", area: "Speed" },
  "total-byte-weight": { title: "The page is very heavy overall", why: "Large pages are slow and costly on mobile data.", area: "Speed" },
  "dom-size": { title: "The page is built from a very large amount of code", why: "Huge pages are slower to display and to respond to taps.", area: "Speed" },
  "bootup-time": { title: "Scripts take a long time to run", why: "The page can feel frozen while JavaScript runs.", area: "Speed" },
  "mainthread-work-breakdown": { title: "The browser is kept very busy while the page loads", why: "Visitors can't tap or scroll smoothly until it's done.", area: "Speed" },
  "third-party-summary": { title: "Third-party tools (chat widgets, trackers, embeds) slow the page", why: "Every extra tool adds weight you don't control.", area: "Speed" },
  "largest-contentful-paint-element": { title: "The main content is slow to appear", why: "This is what Google measures as 'loading speed' for rankings.", area: "Speed" },
  "layout-shift-elements": { title: "Things jump around while the page loads", why: "It's annoying for visitors and Google counts it against you.", area: "Speed" },
  "font-display": { title: "Text is invisible while fonts load", why: "Visitors see blank space instead of words for a moment.", area: "Speed" },
  "meta-description": { title: "There's no description for Google to show", why: "Google writes its own snippet instead, which usually sells your business less well.", area: "SEO" },
  "document-title": { title: "The page has no title", why: "The title is the blue link people click in Google.", area: "SEO" },
  "link-text": { title: "Some links just say things like 'click here'", why: "Descriptive links help Google and screen reader users understand where they go.", area: "SEO" },
  "is-crawlable": { title: "Google is told not to index this page", why: "If this isn't deliberate, the page won't appear in search results at all.", area: "SEO" },
  "robots-txt": { title: "The robots.txt file has problems", why: "It can stop search engines reading your site properly.", area: "SEO" },
  "crawlable-anchors": { title: "Some links can't be followed by search engines", why: "Google may miss pages that are only reachable through them.", area: "SEO" },
  "hreflang": { title: "Language settings for the page are invalid", why: "It can confuse search engines about who the page is for.", area: "SEO" },
  canonical: { title: "The page's preferred address (canonical) is wrong", why: "It can split or lose your search rankings.", area: "SEO" },
  "http-status-code": { title: "The page returns an error status", why: "Search engines won't index pages that report errors.", area: "SEO" },
  "link-name": { title: "Some links have no readable name", why: "Screen reader users hear 'link' with no idea where it goes, and Google learns less about your pages.", area: "Accessibility" },
  "image-alt": { title: "Images are missing descriptions (alt text)", why: "Screen readers can't describe them, and Google can't understand them.", area: "Accessibility" },
  "color-contrast": { title: "Some text is hard to read against its background", why: "Low contrast is hard for many people to read, especially outdoors on a phone.", area: "Accessibility" },
  "button-name": { title: "Some buttons have no readable name", why: "Screen reader users can't tell what they do.", area: "Accessibility" },
  label: { title: "Form fields are missing labels", why: "People using assistive technology can't tell what to type.", area: "Accessibility" },
  "html-has-lang": { title: "The page doesn't declare its language", why: "Screen readers may read it out in the wrong accent or language.", area: "Accessibility" },
  "heading-order": { title: "Headings are out of order", why: "It makes the page harder to navigate for screen reader users.", area: "Accessibility" },
  "tap-targets": { title: "Buttons and links are too small or close together on phones", why: "Visitors keep tapping the wrong thing.", area: "Accessibility" },
  "target-size": { title: "Buttons and links are too small or close together on phones", why: "Visitors keep tapping the wrong thing.", area: "Accessibility" },
  "font-size": { title: "Text is too small to read on phones", why: "Visitors have to pinch and zoom.", area: "SEO" },
  viewport: { title: "The page isn't set up for mobile screens", why: "On phones it shows as a tiny desktop page.", area: "SEO" },
  "is-on-https": { title: "The page isn't fully secure (HTTPS)", why: "Browsers warn visitors, and it can put people off getting in touch.", area: "Best practice" },
  "errors-in-console": { title: "The page has errors behind the scenes", why: "Errors can mean something on the page is broken.", area: "Best practice" },
  "image-aspect-ratio": { title: "Some images are stretched or squashed", why: "It makes the site look less polished.", area: "Best practice" },
  "inspector-issues": { title: "The browser has flagged issues with the page", why: "They can point to security or compatibility problems.", area: "Best practice" },
  deprecations: { title: "The site uses outdated browser features", why: "They may stop working in future browser updates.", area: "Best practice" },
  "third-party-cookies": { title: "The page relies on third-party cookies", why: "Browsers are phasing these out, so features that depend on them may break.", area: "Best practice" },
};

/** Problems that matter a lot to a business, however Lighthouse weights them. */
const CRITICAL = new Set(["document-title", "is-crawlable", "http-status-code", "viewport", "is-on-https"]);

const CATEGORY_AREA: Record<string, HealthIssue["area"]> = {
  performance: "Speed",
  seo: "SEO",
  accessibility: "Accessibility",
  "best-practices": "Best practice",
};

interface LhAudit {
  id: string;
  title: string;
  score: number | null;
  scoreDisplayMode?: string;
  displayValue?: string;
  numericValue?: number;
  details?: { type?: string; overallSavingsMs?: number; overallSavingsBytes?: number };
}
interface LhResult {
  finalDisplayedUrl?: string;
  finalUrl?: string;
  categories: Record<string, { score: number | null; auditRefs: { id: string; weight: number }[] }>;
  audits: Record<string, LhAudit>;
}

const pct = (n: number | null | undefined) => Math.round((n ?? 0) * 100);

function metric(a: LhAudit | undefined, label: string, target: string): HealthMetric | null {
  if (!a || !a.displayValue) return null;
  const s = a.score ?? 0;
  return { label, value: a.displayValue.replace(/ /g, " "), verdict: s >= 0.9 ? "good" : s >= 0.5 ? "ok" : "poor", target };
}

export function summarise(lh: LhResult, requested: string): HealthReport {
  const url = lh.finalDisplayedUrl ?? lh.finalUrl ?? requested;
  const a = lh.audits;

  // Collect failing audits with a weight we can rank by.
  const weightOf = new Map<string, { weight: number; category: string }>();
  for (const [cat, c] of Object.entries(lh.categories)) {
    for (const ref of c.auditRefs) weightOf.set(ref.id, { weight: ref.weight, category: cat });
  }

  // Raw metrics are shown separately, not as "fixes".
  const METRICS = new Set([
    "first-contentful-paint", "largest-contentful-paint", "total-blocking-time", "cumulative-layout-shift",
    "speed-index", "interactive", "max-potential-fid", "first-meaningful-paint",
  ]);

  const issues: (HealthIssue & { rank: number })[] = [];
  for (const audit of Object.values(a)) {
    if (audit.score === null || audit.score >= 0.9 || METRICS.has(audit.id)) continue;
    if (audit.scoreDisplayMode && !["binary", "numeric", "metricSavings"].includes(audit.scoreDisplayMode)) continue;
    const plain = PLAIN[audit.id];
    const w = weightOf.get(audit.id);
    const savingsMs = audit.details?.overallSavingsMs ?? 0;
    const savingsBytes = audit.details?.overallSavingsBytes ?? 0;
    // Unmapped checks only make the list if they're clearly significant.
    if (!plain && savingsMs < 300 && !(w && w.weight > 0 && w.category !== "performance")) continue;
    const area = plain?.area ?? CATEGORY_AREA[w?.category ?? "performance"] ?? "Speed";
    const critical = CRITICAL.has(audit.id) ? 15 : 0;
    const rank =
      savingsMs / 100 + savingsBytes / 50_000 + (w?.weight ?? 0) * 2 + (1 - audit.score) * 3 + (plain ? 2 : 0) +
      (area === "SEO" ? 6 : 0) + critical;
    const impact: Impact = rank > 14 ? "high" : rank > 7 ? "medium" : "low";
    const saving =
      savingsMs >= 200
        ? `could save about ${(savingsMs / 1000).toFixed(1)}s`
        : savingsBytes >= 50_000
          ? `could save about ${Math.round(savingsBytes / 1024)} KB`
          : undefined;
    issues.push({
      id: audit.id,
      title: plain?.title ?? audit.title,
      why: plain?.why ?? "Google's checks flagged this as something worth fixing.",
      impact,
      area,
      saving,
      rank,
    });
  }
  issues.sort((x, y) => y.rank - x.rank);
  // De-duplicate titles (e.g. tap-targets / target-size).
  const seen = new Set<string>();
  const unique = issues.filter((i) => (seen.has(i.title) ? false : (seen.add(i.title), true)));
  // Make sure every area with a problem gets at least one slot, then fill by rank.
  const picked: typeof unique = [];
  for (const area of ["Speed", "SEO", "Accessibility", "Best practice"] as const) {
    const first = unique.find((i) => i.area === area);
    if (first) picked.push(first);
  }
  for (const i of unique) if (picked.length < 6 && !picked.includes(i)) picked.push(i);
  const top = picked
    .sort((x, y) => y.rank - x.rank)
    .slice(0, 6)
    .map(({ rank: _rank, ...rest }) => rest);

  const scores = {
    performance: pct(lh.categories.performance?.score),
    seo: pct(lh.categories.seo?.score),
    accessibility: pct(lh.categories.accessibility?.score),
    bestPractices: pct(lh.categories["best-practices"]?.score),
  };

  const good: string[] = [];
  if (a["is-on-https"]?.score === 1) good.push("The site is secure (HTTPS).");
  if (a.viewport?.score === 1) good.push("It's set up for mobile screens.");
  if (a["document-title"]?.score === 1 && a["meta-description"]?.score === 1) good.push("Google has a title and description to show.");
  if (scores.seo >= 90) good.push("The SEO basics are in good shape.");
  if (scores.accessibility >= 90) good.push("Accessibility is in good shape.");
  if (scores.performance >= 90) good.push("The page loads quickly on a phone.");
  if ((a["cumulative-layout-shift"]?.score ?? 0) >= 0.9) good.push("The layout stays steady while it loads.");

  const metrics = [
    metric(a["largest-contentful-paint"], "Main content appears", "under 2.5s"),
    metric(a["first-contentful-paint"], "First thing on screen", "under 1.8s"),
    metric(a["total-blocking-time"], "Time the page is unresponsive", "under 200ms"),
    metric(a["cumulative-layout-shift"], "Layout jumping around", "under 0.1"),
    metric(a["speed-index"], "Looks fully loaded", "under 3.4s"),
  ].filter((m): m is HealthMetric => m !== null);

  return {
    url,
    checkedAt: new Date().toISOString(),
    scores,
    metrics,
    issues: top,
    good: good.slice(0, 4),
    reportUrl: `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&form_factor=mobile`,
  };
}

export class PageSpeedError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

export async function runPageSpeed(url: string): Promise<HealthReport> {
  const base = process.env.PAGESPEED_API_URL ?? "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
  const params = new URLSearchParams({ url, strategy: "mobile" });
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) params.append("category", c);
  if (process.env.PAGESPEED_API_KEY) params.set("key", process.env.PAGESPEED_API_KEY);

  const res = await fetch(`${base}?${params}`, { cache: "no-store", signal: AbortSignal.timeout(55_000) });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 429) throw new PageSpeedError("The checker is very busy right now. Please try again in a little while.", 429);
    if (/FAILED_DOCUMENT_REQUEST|ERRORED_DOCUMENT_REQUEST|DNS_FAILURE|NO_FCP/.test(body)) {
      throw new PageSpeedError("Google couldn't load that page. Check the address is right and the site is online.", 422);
    }
    throw new PageSpeedError("Something went wrong running the check. Please try again.", 502);
  }
  const data = (await res.json()) as { lighthouseResult?: LhResult };
  if (!data.lighthouseResult) throw new PageSpeedError("Google didn't return a result for that page.", 502);
  return summarise(data.lighthouseResult, url);
}
