"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUp, Gauge, RotateCcw, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const STORE_KEY = "dcw-assistant-chat";
const SUGGESTIONS = [
  "What do your care plans include?",
  "How much does a new website cost?",
  "Can you look after a site you didn't build?",
  "What kind of organisations have you worked with?",
];
const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi! I can answer questions about Daniel's services, care plans and experience. What would you like to know?",
};

function load(): Msg[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Msg[]) : null;
    if (Array.isArray(parsed) && parsed.length) return parsed;
  } catch {
    /* ignore */
  }
  return [GREETING];
}

function save(msgs: Msg[]) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(msgs.slice(-30)));
  } catch {
    /* ignore */
  }
}

/* ── Tiny, safe Markdown: links to site paths, **bold**, bullet lists ───────── */

function inline(text: string, onNavigate: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      const href = m[2].replace(/^https?:\/\/(www\.)?dcw-digital\.co\.uk/i, "") || "/";
      out.push(
        href.startsWith("/") && !href.startsWith("//") ? (
          <Link key={out.length} href={href} onClick={onNavigate} className="font-medium text-primary underline underline-offset-2">
            {m[1]}
          </Link>
        ) : (
          m[1]
        )
      );
    } else if (m[3]) {
      out.push(
        <strong key={out.length} className="font-semibold text-foreground">
          {m[3]}
        </strong>
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Rich({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={blocks.length} className="my-1.5 list-disc space-y-1 pl-5">
        {list.map((li, i) => (
          <li key={i}>{inline(li, onNavigate)}</li>
        ))}
      </ul>
    );
    list = [];
  };
  for (const line of text.split("\n")) {
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      list.push(bullet[1]!);
      continue;
    }
    flush();
    if (line.trim()) blocks.push(<p key={blocks.length} className="my-1.5 first:mt-0 last:mb-0">{inline(line.replace(/^#+\s*/, ""), onNavigate)}</p>);
  }
  flush();
  return <Fragment>{blocks}</Fragment>;
}

/* ── Panel ─────────────────────────────────────────────────────────────── */

export function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => (typeof window === "undefined" ? [GREETING] : load()));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => save(msgs), [msgs]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    // Don't pop the on-screen keyboard open on phones.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim().slice(0, 600);
      if (!q || busy) return;
      const history = [...msgs.filter((m) => !m.error), { role: "user" as const, content: q }];
      setMsgs((m) => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);

      const setReply = (fn: (prev: Msg) => Msg) =>
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = fn(copy[copy.length - 1]!);
          return copy;
        });

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })).slice(-12) }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setReply(() => ({ role: "assistant", content: data?.error ?? "Sorry, something went wrong. Please try again.", error: true }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            let ev: { t?: string; reset?: boolean; error?: string };
            try {
              ev = JSON.parse(line);
            } catch {
              continue;
            }
            if (ev.error) setReply(() => ({ role: "assistant", content: ev.error!, error: true }));
            else if (ev.reset) setReply((p) => ({ ...p, content: ev.t ?? "" }));
            else if (ev.t) setReply((p) => ({ ...p, content: p.content + ev.t }));
          }
        }
        setReply((p) => (p.content ? p : { ...p, content: "Sorry, I didn't catch that. Please try again.", error: true }));
      } catch {
        if (!ctrl.signal.aborted) setReply(() => ({ role: "assistant", content: "Sorry, I couldn't connect. Please try again.", error: true }));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, msgs]
  );

  const reset = () => {
    abortRef.current?.abort();
    setBusy(false);
    setMsgs([GREETING]);
  };

  const onlyGreeting = msgs.length === 1;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Ask DCW assistant"
      className={cn(
        open ? "flex" : "hidden",
        "fixed z-[110] flex-col overflow-hidden border border-border bg-card shadow-2xl shadow-black/40",
        "inset-x-3 bottom-3 top-20 rounded-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[min(600px,calc(100vh-7rem))] sm:w-[400px]"
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-surface/60 px-4 py-3">
        <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 font-heading text-xs font-bold text-primary">DCW</span>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-sm font-semibold">Ask DCW</p>
          <p className="text-xs text-muted-foreground">AI assistant - may make mistakes</p>
        </div>
        {!onlyGreeting && (
          <button type="button" onClick={reset} className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Start a new chat" title="New chat">
            <RotateCcw className="size-4" />
          </button>
        )}
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-muted-foreground transition hover:bg-surface hover:text-foreground" aria-label="Close assistant">
          <X className="size-4" />
        </button>
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed",
                m.role === "user"
                  ? "rounded-br-sm bg-primary text-primary-foreground"
                  : m.error
                    ? "rounded-bl-sm border border-amber-500/30 bg-amber-500/10 text-foreground"
                    : "rounded-bl-sm bg-surface text-muted-foreground"
              )}
            >
              {m.role === "assistant" && !m.content ? (
                <span className="flex gap-1 py-1" aria-label="Thinking">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-primary/70" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </span>
              ) : m.role === "assistant" ? (
                <Rich text={m.content} onNavigate={onClose} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {onlyGreeting && (
          <div className="space-y-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => ask(s)}
                className="block w-full rounded-xl border border-border px-3 py-2 text-left text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
            <Link
              href="/website-health-check"
              onClick={onClose}
              className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground transition hover:border-primary"
            >
              <Gauge className="size-4 text-primary" /> Or check your own website for free
            </Link>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="flex items-end gap-2 border-t border-border p-3"
      >
        <label htmlFor="dcw-assistant-input" className="sr-only">
          Your question
        </label>
        <textarea
          id="dcw-assistant-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void ask(input);
            }
          }}
          rows={1}
          maxLength={600}
          placeholder="Ask a question..."
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-base outline-none sm:text-sm placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="flex size-[42px] shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition disabled:opacity-40"
          aria-label="Send"
        >
          {busy ? <ArrowUp className="size-4 animate-pulse" /> : <Send className="size-4" />}
        </button>
      </form>
      <p className="px-4 pb-3 text-[11px] text-muted-foreground">
        Answers come from this website only. For anything important, use the{" "}
        <Link href="/contact" onClick={onClose} className="text-primary underline-offset-2 hover:underline">
          contact form
        </Link>
        . <Link href="/privacy" onClick={onClose} className="underline-offset-2 hover:underline">Privacy</Link>
      </p>
    </div>
  );
}
