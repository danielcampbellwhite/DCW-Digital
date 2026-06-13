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
  Mail,
  Download,
  CalendarCheck,
  Github,
  Linkedin,
  ArrowRight,
} from "lucide-react";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

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
  { id: "projects", label: "Projects", group: "Pages", icon: FolderGit2, href: "/projects", keywords: "work portfolio case study" },
  { id: "blog", label: "Blog", group: "Pages", icon: Newspaper, href: "/blog", keywords: "articles insights writing" },
  { id: "contact", label: "Contact", group: "Pages", icon: Mail, href: "/contact", keywords: "email quote enquiry" },
  { id: "cv", label: "Download CV", group: "Actions", icon: Download, href: siteConfig.cvUrl, keywords: "resume hire" },
  { id: "call", label: "Book a Discovery Call", group: "Actions", icon: CalendarCheck, href: siteConfig.bookingUrl, external: true, keywords: "meeting consultation" },
  { id: "audit", label: "Request a Free Website Health Check", group: "Actions", icon: Search, href: "/contact?service=Free+Website+Health+Check", keywords: "audit review free" },
  { id: "github", label: "GitHub", group: "Social", icon: Github, href: siteConfig.links.github, external: true },
  { id: "linkedin", label: "LinkedIn", group: "Social", icon: Linkedin, href: siteConfig.links.linkedin, external: true },
];

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

export function CommandProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((v) => !v), []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) =>
      `${c.label} ${c.keywords ?? ""} ${c.group}`.toLowerCase().includes(q)
    );
  }, [query]);

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

  // Reset state when opening; focus the input.
  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setActiveIndex(0);
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (activeIndex >= filtered.length) setActiveIndex(0);
  }, [filtered.length, activeIndex]);

  const run = React.useCallback(
    (cmd: CommandItem) => {
      close();
      if (!cmd.href) return;
      if (cmd.external) {
        window.open(cmd.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(cmd.href);
      }
    },
    [close, router]
  );

  const onListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % Math.max(filtered.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = filtered[activeIndex];
      if (cmd) run(cmd);
    }
  };

  const groups = ["Pages", "Actions", "Social"] as const;

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
              aria-label="Command palette"
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
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages and actions…"
                  className="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  aria-label="Search commands"
                />
                <kbd className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
                  ESC
                </kbd>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {filtered.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                    No results for “{query}”.
                  </p>
                )}
                {groups.map((group) => {
                  const items = filtered.filter((c) => c.group === group);
                  if (items.length === 0) return null;
                  return (
                    <div key={group} className="mb-2">
                      <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {group}
                      </p>
                      <ul>
                        {items.map((cmd) => {
                          const globalIndex = filtered.indexOf(cmd);
                          const active = globalIndex === activeIndex;
                          const Icon = cmd.icon;
                          return (
                            <li key={cmd.id}>
                              <button
                                type="button"
                                onMouseEnter={() => setActiveIndex(globalIndex)}
                                onClick={() => run(cmd)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                                  active
                                    ? "bg-primary/10 text-foreground"
                                    : "text-muted-foreground hover:bg-surface"
                                )}
                              >
                                <Icon className="size-4 shrink-0 text-primary" />
                                <span className="flex-1">{cmd.label}</span>
                                {active && (
                                  <ArrowRight className="size-3.5 text-muted-foreground" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </CommandContext.Provider>
  );
}
