"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Home,
  User,
  Layers,
  FolderGit2,
  Newspaper,
  Gamepad2,
  Mail,
  Facebook,
  Instagram,
  ArrowRight,
  SquareTerminal,
} from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { OPEN_TERMINAL_EVENT } from "@/components/easter-egg/secret-terminal";
import { searchDocs, type SearchDoc, type SearchResult } from "@/lib/search-core";
import { Highlight } from "@/components/search/highlight";
import { TYPE_META } from "@/components/search/type-meta";

interface CommandItem {
  id: string;
  label: string;
  group: "Pages" | "Actions" | "Social";
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  external?: boolean;
  keywords?: string;
}

const COMMANDS: CommandItem[] = [
  { id: "home", label: "Home", group: "Pages", icon: Home, href: "/" },
  { id: "about", label: "About Daniel", group: "Pages", icon: User, href: "/about", keywords: "story experience cv" },
  { id: "services", label: "Services", group: "Pages", icon: Layers, href: "/services", keywords: "seo development audit pricing" },
  { id: "svc-website-development", label: "Website Development", group: "Pages", icon: Layers, href: "/services/website-development", keywords: "build new site web app shop" },
  { id: "svc-website-auditing", label: "Website Audits", group: "Pages", icon: Layers, href: "/services/website-auditing", keywords: "audit seo speed security review" },
  { id: "svc-support-maintenance", label: "Support & Maintenance", group: "Pages", icon: Layers, href: "/services/support-maintenance", keywords: "care plan pricing updates backups" },
  { id: "svc-digital-partner", label: "Digital Partner", group: "Pages", icon: Layers, href: "/services/digital-partner", keywords: "advice ad hoc consultant" },
  { id: "projects", label: "Projects", group: "Pages", icon: FolderGit2, href: "/projects", keywords: "work portfolio case study" },
  { id: "ai", label: "How I Build with AI", group: "Pages", icon: Layers, href: "/ai", keywords: "ai artificial intelligence claude architect workflow" },
  { id: "play", label: "Play a game", group: "Pages", icon: Gamepad2, href: "/play", keywords: "games fun quiz spot the bug invaders typing whack squash deploy dash runner jump" },
  { id: "dev-games", label: "The Dev Games (world records)", group: "Pages", icon: Gamepad2, href: "/play#dev-games", keywords: "sports olympics athletics sprint 100m hurdles long jump javelin archery championship world record" },
  { id: "load-balancer", label: "Load Balancer game", group: "Pages", icon: Gamepad2, href: "/play#load-balancer", keywords: "servers traffic ops devops router game" },
  { id: "hangman", label: "Hangman", group: "Pages", icon: Gamepad2, href: "/play#hangman", keywords: "word game guess letters hangman spelling" },
  { id: "startup-tycoon", label: "Startup Tycoon", group: "Pages", icon: Gamepad2, href: "/play#startup-tycoon", keywords: "idle clicker startup business tycoon game" },
  { id: "blog", label: "Blog", group: "Pages", icon: Newspaper, href: "/blog", keywords: "articles insights writing" },
  { id: "contact", label: "Contact", group: "Pages", icon: Mail, href: "/contact", keywords: "email quote enquiry" },
  { id: "get-in-touch", label: "Get in touch", group: "Actions", icon: Mail, href: "/contact", keywords: "email enquiry quote message" },
  { id: "audit", label: "Request a Free Website Health Check", group: "Actions", icon: Search, href: "/website-health-check", keywords: "audit review free" },
  { id: "facebook", label: "Facebook", group: "Social", icon: Facebook, href: siteConfig.links.facebook, external: true },
  { id: "instagram", label: "Instagram", group: "Social", icon: Instagram, href: siteConfig.links.instagram, external: true },
];

const SECRET_WORDS = ["sudo", "terminal", "hack", "crack", "root"];
const SECRET_COMMAND: CommandItem = { id: "terminal", label: "Open terminal", group: "Actions", icon: SquareTerminal };

interface CommandContextValue {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

export function useCommandPalette() {
  const ctx = React.useContext(CommandContext);
  if (!ctx) throw new Error("useCommandPalette must be used within CommandProvider");
  return ctx;
}

/* ── Site search index: loaded the first time the palette opens ─────────── */

let indexPromise: Promise<SearchDoc[]> | null = null;
function loadSearchIndex(): Promise<SearchDoc[]> {
  indexPromise ??= fetch("/search-index.json")
    .then((r) => (r.ok ? (r.json() as Promise<SearchDoc[]>) : Promise.reject(new Error(String(r.status)))))
    .catch(() => {
      indexPromise = null; // try again next time
      return [];
    });
  return indexPromise;
}

const PREVIEW = 5;

type Item =
  | { kind: "cmd"; cmd: CommandItem }
  | { kind: "result"; result: SearchResult }
  | { kind: "more" };

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [docs, setDocs] = React.useState<SearchDoc[] | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((v) => !v), []);

  const q = query.trim();
  const secret = SECRET_WORDS.includes(q.toLowerCase());

  const search = React.useMemo(
    () => (q && docs && !secret ? searchDocs(docs, q, { limit: PREVIEW }) : null),
    [q, docs, secret]
  );

  const commands = React.useMemo(() => {
    if (!q) return COMMANDS;
    // A hidden entry for anyone who goes looking.
    if (secret) return [SECRET_COMMAND];
    // Once the search index is loaded, pages come from the search results instead.
    const pool = docs ? COMMANDS.filter((c) => c.group !== "Pages") : COMMANDS;
    const lower = q.toLowerCase();
    return pool.filter((c) => `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(lower));
  }, [q, docs, secret]);

  const items: Item[] = React.useMemo(
    () => [
      ...(search?.results.map((result) => ({ kind: "result" as const, result })) ?? []),
      ...(search && search.total > PREVIEW ? [{ kind: "more" as const }] : []),
      ...commands.map((cmd) => ({ kind: "cmd" as const, cmd })),
    ],
    [search, commands]
  );

  // Global keyboard shortcut: ⌘K / Ctrl+K
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, close]);

  // Reset state when opening; focus the input; load the search index.
  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      void loadSearchIndex().then((d) => setDocs(d.length ? d : null));
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // While typing, nothing is selected, so Enter opens the full results page.
  React.useEffect(() => {
    setActiveIndex(q ? -1 : 0);
  }, [q]);

  React.useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(q ? -1 : 0);
  }, [items.length, activeIndex, q]);

  // Keep the highlighted row in view when moving with the arrow keys.
  React.useEffect(() => {
    if (activeIndex < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const go = React.useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router]
  );

  const searchAll = React.useCallback(() => {
    if (q) go(`/search?q=${encodeURIComponent(q)}`);
  }, [q, go]);

  const run = React.useCallback(
    (item: Item) => {
      if (item.kind === "more") return searchAll();
      if (item.kind === "result") return go(item.result.url);
      const cmd = item.cmd;
      if (cmd.id === "terminal") {
        close();
        window.setTimeout(() => window.dispatchEvent(new Event(OPEN_TERMINAL_EVENT)), 50);
        return;
      }
      if (!cmd.href) return;
      if (cmd.external) {
        close();
        window.open(cmd.href, "_blank", "noopener,noreferrer");
      } else go(cmd.href);
    },
    [close, go, searchAll]
  );

  const onListKeyDown = (e: React.KeyboardEvent) => {
    const n = items.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (n) setActiveIndex((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (n) setActiveIndex((i) => (i <= 0 ? n - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) run(item);
      else searchAll();
    }
  };

  const rowClass = (active: boolean) =>
    cn(
      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
      active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-surface"
    );

  const groups = ["Pages", "Actions", "Social"] as const;
  const resultCount = search?.results.length ?? 0;
  const nothing = q && !secret && items.length === 0 && (docs !== null || commands.length === 0);

  return (
    <CommandContext.Provider value={{ open, close, toggle, isOpen }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-sm"
              onClick={close}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search the site"
              initial={{ opacity: 0, scale: 0.97, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
              onKeyDown={onListKeyDown}
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="size-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the site…"
                  enterKeyHint="search"
                  maxLength={100}
                  className="h-14 w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 sm:text-sm"
                  aria-label="Search the site"
                />
                <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                  ESC
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
                {nothing && (
                  <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                    <p>No results for “{q}”.</p>
                    <button type="button" onClick={searchAll} className="mt-2 text-primary underline-offset-2 hover:underline">
                      Open the search page
                    </button>
                  </div>
                )}

                {q && !docs && !secret && (
                  <p className="px-3 pb-1 pt-2 text-xs text-muted-foreground">Loading search…</p>
                )}

                {resultCount > 0 && search && (
                  <div className="mb-2">
                    <p className="flex items-center justify-between px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <span>Results</span>
                      <span className="font-mono normal-case tracking-normal">
                        {search.total > PREVIEW ? `${PREVIEW} of ${search.total}` : `${search.total} found`}
                      </span>
                    </p>
                    <ul>
                      {search.results.map((r, i) => {
                        const meta = TYPE_META[r.type];
                        const active = i === activeIndex;
                        return (
                          <li key={r.id}>
                            <button
                              type="button"
                              data-index={i}
                              onMouseEnter={() => setActiveIndex(i)}
                              onClick={() => run({ kind: "result", result: r })}
                              className={cn(rowClass(active), "items-start")}
                            >
                              <meta.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                              <span className="min-w-0 flex-1">
                                <span className="flex items-baseline gap-2">
                                  <span className="truncate font-medium text-foreground">
                                    <Highlight text={r.title} terms={search.terms} />
                                  </span>
                                  <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{meta.label}</span>
                                </span>
                                <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  <Highlight text={r.snippet} terms={search.terms} />
                                </span>
                              </span>
                              {active && <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
                            </button>
                          </li>
                        );
                      })}
                      {search.total > PREVIEW && (
                        <li>
                          <button
                            type="button"
                            data-index={resultCount}
                            onMouseEnter={() => setActiveIndex(resultCount)}
                            onClick={searchAll}
                            className={cn(rowClass(activeIndex === resultCount), "justify-between")}
                          >
                            <span className="font-mono text-xs">
                              {PREVIEW} of {search.total}
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                              More results <ArrowRight className="size-3.5" />
                            </span>
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {groups.map((group) => {
                  const groupItems = commands.filter((c) => c.group === group);
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group} className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {group}
                      </p>
                      <ul>
                        {groupItems.map((cmd) => {
                          const globalIndex = items.findIndex((it) => it.kind === "cmd" && it.cmd === cmd);
                          const active = globalIndex === activeIndex;
                          const Icon = cmd.icon;
                          return (
                            <li key={cmd.id}>
                              <button
                                type="button"
                                data-index={globalIndex}
                                onMouseEnter={() => setActiveIndex(globalIndex)}
                                onClick={() => run({ kind: "cmd", cmd })}
                                className={rowClass(active)}
                              >
                                <Icon className="size-4 shrink-0 text-primary" />
                                <span className="flex-1">{cmd.label}</span>
                                {active && <ArrowRight className="size-3.5 text-muted-foreground" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {q && !secret && (
                <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
                  <button type="button" onClick={searchAll} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    <kbd className="rounded border border-border px-1 font-mono">↵</kbd> All results
                  </button>
                  <span className="hidden items-center gap-1.5 sm:inline-flex">
                    <kbd className="rounded border border-border px-1 font-mono">↑↓</kbd> Choose
                    <kbd className="ml-2 rounded border border-border px-1 font-mono">esc</kbd> Close
                  </span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommandContext.Provider>
  );
}
