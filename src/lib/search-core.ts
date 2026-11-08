/**
 * Site search: scoring and snippets. Pure functions with no Node imports, so the
 * same code runs in the browser (instant results in the command palette) and on
 * the server (the /search results page).
 */

export type SearchType = "Blog" | "Page" | "Service" | "Work" | "Game";

export const SEARCH_TYPES: SearchType[] = ["Blog", "Page", "Service", "Work", "Game"];

export interface SearchDoc {
  id: string;
  type: SearchType;
  title: string;
  url: string;
  description: string;
  /** Tags, categories and other short keywords. */
  keywords: string[];
  /** Section headings, FAQ questions and similar. */
  headings: string[];
  /** Plain-text body. */
  body: string;
  /** ISO date, for blog posts. */
  date?: string;
}

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  url: string;
  snippet: string;
  date?: string;
  score: number;
}

export interface SearchResponse {
  query: string;
  terms: string[];
  total: number;
  results: SearchResult[];
  counts: Record<SearchType, number>;
}

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "can", "do", "does", "for", "from", "how", "i",
  "in", "is", "it", "my", "of", "on", "or", "the", "to", "what", "when", "why", "with", "you", "your",
]);

/** Lowercase, strip accents, and turn anything that isn't a letter or digit into a space. */
export function normalise(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function queryTerms(query: string): string[] {
  const words = normalise(query).split(" ").filter(Boolean);
  const meaningful = words.filter((w) => !STOPWORDS.has(w));
  const list = meaningful.length ? meaningful : words;
  return [...new Set(list)].slice(0, 8);
}

/* ── Prepared index (tokenised once, reused for every keystroke) ───────── */

interface Prepared {
  doc: SearchDoc;
  fields: { tokens: string[]; weight: number; cap: number }[];
  titleNorm: string;
  bodyNorm: string;
}

const FIELD_WEIGHTS = { title: 12, keywords: 7, description: 4, headings: 3, body: 1 };
const cache = new WeakMap<SearchDoc[], Prepared[]>();

function prepare(docs: SearchDoc[]): Prepared[] {
  const hit = cache.get(docs);
  if (hit) return hit;
  const prepared = docs.map((doc) => {
    const titleNorm = normalise(doc.title);
    const bodyNorm = normalise(doc.body);
    return {
      doc,
      titleNorm,
      bodyNorm,
      fields: [
        { tokens: titleNorm.split(" "), weight: FIELD_WEIGHTS.title, cap: 3 },
        { tokens: normalise(doc.keywords.join(" ")).split(" "), weight: FIELD_WEIGHTS.keywords, cap: 3 },
        { tokens: normalise(doc.description).split(" "), weight: FIELD_WEIGHTS.description, cap: 3 },
        { tokens: normalise(doc.headings.join(" ")).split(" "), weight: FIELD_WEIGHTS.headings, cap: 4 },
        { tokens: bodyNorm.split(" "), weight: FIELD_WEIGHTS.body, cap: 12 },
      ],
    };
  });
  cache.set(docs, prepared);
  return prepared;
}

/** Score for one term in one token list: whole-word hits count fully, prefix hits (as you type) count half. */
function termScore(tokens: string[], term: string, cap: number): number {
  let whole = 0;
  let prefix = 0;
  for (const t of tokens) {
    if (t === term) whole++;
    else if (term.length >= 2 && t.startsWith(term)) prefix++;
  }
  return Math.min(whole, cap) + Math.min(prefix, cap) * 0.5;
}

/* ── Snippets ───────────────────────────────────────────────────────────── */

function makeSnippet(doc: SearchDoc, terms: string[], length = 170): string {
  const source = doc.body || doc.description;
  const lower = source.toLowerCase();
  // Every place a term starts a word, then the window that covers the most different terms.
  const hits: { at: number; term: number }[] = [];
  terms.forEach((term, ti) => {
    const re = new RegExp(`(?<![a-z0-9])${term}`, "g");
    let m: RegExpExecArray | null;
    let n = 0;
    while ((m = re.exec(lower)) && n++ < 60) hits.push({ at: m.index, term: ti });
  });
  hits.sort((a, b) => a.at - b.at);
  let at = -1;
  let bestCover = 0;
  for (const h of hits) {
    const cover = new Set(hits.filter((x) => x.at >= h.at && x.at < h.at + length - 40).map((x) => x.term)).size;
    if (cover > bestCover) {
      bestCover = cover;
      at = h.at;
    }
  }
  // No match in the body (it matched the title or tags): lead with the description.
  if (at === -1) return truncate(doc.description || source, length);
  let start = Math.max(0, at - 60);
  if (start > 0) {
    const space = source.indexOf(" ", start);
    start = space > -1 && space < at ? space + 1 : start;
  }
  let end = Math.min(source.length, start + length);
  if (end < source.length) {
    const space = source.lastIndexOf(" ", end);
    end = space > at ? space : end;
  }
  return `${start > 0 ? "…" : ""}${source.slice(start, end).trim()}${end < source.length ? "…" : ""}`;
}

function truncate(text: string, length: number) {
  if (text.length <= length) return text;
  const cut = text.lastIndexOf(" ", length);
  return `${text.slice(0, cut > 40 ? cut : length)}…`;
}

/** Split text into plain and matching parts, for highlighting search terms safely (no HTML). */
export function highlightParts(text: string, terms: string[]): { text: string; match: boolean }[] {
  if (!terms.length) return [{ text, match: false }];
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const re = new RegExp(`(?<![a-z0-9])(${escaped.join("|")})[a-z0-9]*`, "gi");
  const parts: { text: string; match: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push({ text: text.slice(last, i), match: false });
    parts.push({ text: m[0], match: true });
    last = i + m[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts;
}

/* ── Search ─────────────────────────────────────────────────────────────── */

const TYPE_BOOST: Record<SearchType, number> = { Page: 2, Service: 2, Blog: 0, Work: 0, Game: 0 };

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  opts: { limit?: number; type?: SearchType | null } = {}
): SearchResponse {
  const terms = queryTerms(query);
  const counts = Object.fromEntries(SEARCH_TYPES.map((t) => [t, 0])) as Record<SearchType, number>;
  if (!terms.length) return { query, terms, total: 0, results: [], counts };

  const phrase = normalise(query);
  const scored: SearchResult[] = [];
  for (const p of prepare(docs)) {
    let score = 0;
    let allMatched = true;
    for (const term of terms) {
      let termTotal = 0;
      for (const f of p.fields) termTotal += termScore(f.tokens, term, f.cap) * f.weight;
      if (termTotal === 0) {
        allMatched = false;
        break;
      }
      score += termTotal;
    }
    if (!allMatched) continue;
    if (terms.length > 1 || phrase.includes(" ")) {
      if (p.titleNorm.includes(phrase)) score += 25;
      else if (p.bodyNorm.includes(phrase)) score += 8;
    }
    if (p.titleNorm === phrase) score += 30;
    score += TYPE_BOOST[p.doc.type];
    counts[p.doc.type]++;
    scored.push({
      id: p.doc.id,
      type: p.doc.type,
      title: p.doc.title,
      url: p.doc.url,
      date: p.doc.date,
      score,
      snippet: "",
    });
  }

  const filtered = opts.type ? scored.filter((r) => r.type === opts.type) : scored;
  filtered.sort((a, b) => b.score - a.score || (b.date ?? "").localeCompare(a.date ?? "") || a.title.localeCompare(b.title));
  const page = opts.limit ? filtered.slice(0, opts.limit) : filtered;
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const r of page) r.snippet = makeSnippet(byId.get(r.id)!, terms);
  return { query, terms, total: filtered.length, results: page, counts };
}
