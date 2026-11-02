"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { services, supportPackages } from "@/content/services";
import { clients } from "@/content/clients";
import { playSound } from "@/lib/sfx";

/* ── Types ──────────────────────────────────────────────────────────────── */

type Kind = "in" | "out" | "err" | "ok" | "dim" | "head";
type LetterState = "hit" | "near" | "miss";

type Line =
  | { id: number; kind: Kind; text: string }
  | { id: number; kind: "guess"; letters: { ch: string; state: LetterState }[] }
  | { id: number; kind: "keys"; states: Record<string, LetterState> };

export interface TerminalPost {
  title: string;
  slug: string;
}

interface Game {
  answer: string;
  guesses: string[];
  keys: Record<string, LetterState>;
}

interface Stats {
  played: number;
  wins: number;
  streak: number;
  best: number | null;
}

/* ── Constants ──────────────────────────────────────────────────────────── */

const THEMES = {
  green: { fg: "#39ff7a", dim: "rgba(57,255,122,0.45)", glow: "rgba(57,255,122,0.55)" },
  amber: { fg: "#ffb53d", dim: "rgba(255,181,61,0.45)", glow: "rgba(255,181,61,0.5)" },
  white: { fg: "#e9f1ff", dim: "rgba(233,241,255,0.45)", glow: "rgba(233,241,255,0.4)" },
} as const;
type ThemeName = keyof typeof THEMES;

const THEME_KEY = "dcw-term-theme";
const ROOT_KEY = "dcw-term-root";
const STATS_KEY = "dcw-term-stats";
const MAX_TRIES = 6;

const PASSWORDS = [
  "ARRAY", "CACHE", "DEBUG", "MERGE", "REACT", "QUERY", "FETCH", "ASYNC", "BUILD", "STACK",
  "PATCH", "PROXY", "REGEX", "TOKEN", "CLASS", "SCOPE", "SHELL", "LINUX", "CLOUD", "PIXEL",
  "BYTES", "LOGIN", "ROUTE", "STATE", "PROPS", "HOOKS", "FLOAT", "CONST", "YIELD", "AWAIT",
  "CRASH", "ERROR", "FRAME", "QUEUE", "TUPLE", "MUTEX", "SLICE", "PARSE", "INDEX", "TABLE",
  "GROUP", "MOUNT", "BREAK", "WHILE", "TRAIT", "SCRUM", "AGILE", "FLAGS", "NODES", "SWIFT",
];

const PAGES: Record<string, string> = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  work: "/projects",
  ai: "/ai",
  blog: "/blog",
  play: "/play",
  games: "/play",
  contact: "/contact",
  privacy: "/privacy",
};

const FILES = ["readme.txt", "about.txt", "services.txt", "projects.txt", "secret.enc"];

const COMMANDS: [string, string][] = [
  ["help", "show this list"],
  ["about", "who's behind the keyboard"],
  ["services", "what I can help with"],
  ["projects", "organisations I've worked with"],
  ["blog", "latest articles (then 'read <n>')"],
  ["games", "games on the Play page"],
  ["open <page>", "go to a page, e.g. 'open contact'"],
  ["ls / cat <file>", "look around the file system"],
  ["crack", "break the password and get root"],
  ["stats", "your code-breaking record"],
  ["theme <name>", "green, amber or white"],
  ["whoami / date / echo", "the usual suspects"],
  ["clear", "clear the screen"],
  ["exit", "close the terminal (or press Esc)"],
];

/* ── Helpers ────────────────────────────────────────────────────────────── */

function read<T>(key: string, fallback: T): T {
  try {
    const v = window.localStorage.getItem(key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/** Wordle-style scoring, handling repeated letters properly. */
function score(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(5).fill("miss");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = "hit";
    else left[answer[i]!] = (left[answer[i]!] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    const ch = guess[i]!;
    if (result[i] !== "hit" && (left[ch] ?? 0) > 0) {
      result[i] = "near";
      left[ch]!--;
    }
  }
  return result;
}

const RANK: Record<LetterState, number> = { miss: 0, near: 1, hit: 2 };

/* ── Component ──────────────────────────────────────────────────────────── */

export function Terminal({ posts, onClose }: { posts: TerminalPost[]; onClose: () => void }) {
  const router = useRouter();
  const [lines, setLines] = React.useState<Line[]>([]);
  const [input, setInput] = React.useState("");
  const [theme, setTheme] = React.useState<ThemeName>("green");
  const [root, setRoot] = React.useState(false);
  const [game, setGame] = React.useState<Game | null>(null);
  const [booting, setBooting] = React.useState(true);
  const [touch, setTouch] = React.useState(false);

  const idRef = React.useRef(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const history = React.useRef<string[]>([]);
  const histIdx = React.useRef(-1);
  const bootTimers = React.useRef<number[]>([]);
  const bootQueue = React.useRef<Line[]>([]);

  const make = (kind: Kind, text: string): Line => ({ id: ++idRef.current, kind, text });
  const print = React.useCallback((...ls: Line[]) => setLines((prev) => [...prev, ...ls].slice(-400)), []);
  const out = (...texts: string[]) => print(...texts.map((t) => make("out", t)));

  /* Load preferences, then boot. */
  React.useEffect(() => {
    const t = read<ThemeName>(THEME_KEY, "green");
    if (t in THEMES) setTheme(t);
    const isRoot = read<boolean>(ROOT_KEY, false);
    setRoot(isRoot);
    setTouch(window.matchMedia("(pointer: coarse)").matches);

    const user = isRoot ? "root" : "guest";
    const boot: [Kind, string][] = [
      ["head", "DCW-OS 2.6.0 · (c) DCW Digital, Liverpool"],
      ["dim", "Memory check ..................... 640K OK"],
      ["dim", "Loading kernel modules ........... coffee.sys ok"],
      ["dim", "Mounting /home/" + user + " .............. ok"],
      ["dim", "Checking for bugs ................ 1 found (it's a feature)"],
      ["dim", "Establishing secure link ......... ok"],
      ["out", ""],
      ["ok", `Welcome, ${user}. Type 'help' to see what you can do.`],
      ["out", ""],
    ];
    const queue = boot.map(([k, t2]) => make(k, t2));
    bootQueue.current = queue;
    playSound("start");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setLines(queue);
      setBooting(false);
    } else {
      queue.forEach((l, i) => {
        bootTimers.current.push(
          window.setTimeout(() => {
            setLines((prev) => [...prev, l]);
            if (i === queue.length - 1) setBooting(false);
          }, 120 + i * 140)
        );
      });
    }
    const timers = bootTimers.current;
    return () => timers.forEach((t2) => window.clearTimeout(t2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skipBoot = () => {
    if (!booting) return;
    bootTimers.current.forEach((t) => window.clearTimeout(t));
    setLines(bootQueue.current);
    setBooting(false);
  };

  // Any key skips the boot sequence (Esc still closes).
  React.useEffect(() => {
    if (!booting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else skipBoot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booting]);

  // Focus the prompt as soon as it appears.
  React.useEffect(() => {
    if (!booting) inputRef.current?.focus();
  }, [booting]);

  /* Keep the latest output in view and the input focused. */
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  React.useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, []);

  const go = (href: string) => {
    out(`Opening ${href} ...`);
    playSound("select");
    window.setTimeout(() => {
      onClose();
      router.push(href);
    }, 350);
  };

  /* ── Code-breaking game ──────────────────────────────────────────────── */

  const startGame = () => {
    const answer = PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)]!;
    setGame({ answer, guesses: [], keys: {} });
    print(
      make("head", "PASSWORD DECRYPTION UTILITY"),
      make("out", "Guess the 5-letter password. It's always something a developer would say."),
      make("dim", `${MAX_TRIES} attempts. [A] right letter, right place · (A) in the password, wrong place · a = not in it.`),
      make("dim", "Type 'quit' to give up."),
      make("out", "")
    );
  };

  const recordGame = (won: boolean, tries: number) => {
    const s = read<Stats>(STATS_KEY, { played: 0, wins: 0, streak: 0, best: null });
    const next: Stats = {
      played: s.played + 1,
      wins: s.wins + (won ? 1 : 0),
      streak: won ? s.streak + 1 : 0,
      best: won ? Math.min(s.best ?? tries, tries) : s.best,
    };
    write(STATS_KEY, next);
  };

  const guess = (raw: string) => {
    if (!game) return;
    const word = raw.trim().toUpperCase();
    if (word === "QUIT" || word === "EXIT") {
      print(make("err", `Decryption aborted. The password was ${game.answer}.`), make("out", ""));
      recordGame(false, MAX_TRIES);
      setGame(null);
      return;
    }
    if (!/^[A-Z]{5}$/.test(word)) {
      playSound("miss");
      print(make("err", "Passwords are exactly 5 letters."));
      return;
    }
    const states = score(word, game.answer);
    const keys = { ...game.keys };
    states.forEach((st, i) => {
      const ch = word[i]!;
      if (!keys[ch] || RANK[st] > RANK[keys[ch]!]) keys[ch] = st;
    });
    const guesses = [...game.guesses, word];
    const row: Line = { id: ++idRef.current, kind: "guess", letters: states.map((state, i) => ({ ch: word[i]!, state })) };
    const won = word === game.answer;
    const left = MAX_TRIES - guesses.length;

    if (won) {
      playSound("finish");
      recordGame(true, guesses.length);
      setGame(null);
      setRoot(true);
      write(ROOT_KEY, true);
      print(
        row,
        make("out", ""),
        make("ok", "██ ACCESS GRANTED ██"),
        make("out", `Cracked in ${guesses.length} ${guesses.length === 1 ? "try" : "tries"}. You now have root.`),
        make("dim", "secret.enc has been decrypted. Try 'cat secret.enc'."),
        make("out", "")
      );
    } else if (left === 0) {
      playSound("gameOver");
      recordGame(false, MAX_TRIES);
      setGame(null);
      print(
        row,
        make("out", ""),
        make("err", "██ TERMINAL LOCKED ██"),
        make("out", `The password was ${game.answer}. Type 'crack' to try again.`),
        make("out", "")
      );
    } else {
      playSound("select");
      setGame({ ...game, guesses, keys });
      print(row, { id: ++idRef.current, kind: "keys", states: keys }, make("dim", `${left} ${left === 1 ? "attempt" : "attempts"} left.`));
    }
  };

  /* ── Commands ────────────────────────────────────────────────────────── */

  const cat = (file: string): void => {
    switch (file) {
      case "readme.txt":
        return out("You found the terminal. Not many people do.", "Have a poke around. 'help' lists everything, 'crack' is the fun bit.");
      case "about.txt":
        return run("about");
      case "services.txt":
        return run("services");
      case "projects.txt":
        return run("projects");
      case "secret.enc":
        if (!root) {
          return print(make("err", "secret.enc: encrypted. You need root to read this."), make("dim", "Hint: try 'crack'."));
        }
        return print(
          make("ok", "--- secret.enc (decrypted) ---"),
          make("out", "If you've made it this far, you're exactly the kind of person"),
          make("out", "I like working with: curious, persistent, and happy to poke"),
          make("out", "at things until they give up their secrets."),
          make("out", ""),
          make("out", "Fancy building something together? Type 'open contact'."),
          make("out", "- Daniel")
        );
      default:
        return print(make("err", `cat: ${file || "(nothing)"}: No such file. Try 'ls'.`));
    }
  };

  function run(raw: string): void {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    switch (cmd.toLowerCase()) {
      case "":
        return;
      case "help":
      case "?":
        print(make("head", "Available commands"));
        COMMANDS.forEach(([c, d]) => print(make("out", `  ${c.padEnd(22)} ${d}`)));
        return print(make("dim", "Tip: Tab completes commands, ↑/↓ recalls history."));
      case "about":
      case "whois":
        return out(
          "Daniel Campbell-White - web developer, Liverpool.",
          "8+ years building and looking after websites and apps, a lot of",
          "it for NHS trusts, public health services and charities.",
          "Freelances as DCW Digital: fast, accessible sites built properly.",
          "Uses AI every day, reviews every line. Runs on coffee."
        );
      case "services":
        services.forEach((s) => out(`  * ${s.title.padEnd(24)} ${s.summary}`));
        return out(
          `  Support plans from £${Math.min(...supportPackages.map((p) => p.priceMonthly))}/month.`,
          "  'open services' for the details."
        );
      case "projects":
      case "clients":
        clients.forEach((c) => out(`  * ${c.name}`));
        return out("  'open projects' for more.");
      case "blog":
        posts.forEach((p, i) => out(`  [${i + 1}] ${p.title}`));
        return print(make("dim", "Type 'read <number>' to open one."));
      case "read": {
        const n = Number(arg);
        const post = posts[n - 1];
        if (!post) return print(make("err", "read: give me a number from the 'blog' list."));
        return go(`/blog/${post.slug}`);
      }
      case "games":
        return out(
          "  * Spot the Bug   - find the broken line of code",
          "  * Bug Invaders   - a typing shooter",
          "  * Deploy Dash    - an endless runner",
          "  * Whack-a-Bug    - 30 seconds of squashing",
          "  * crack          - you're already here",
          "  'open play' to play."
        );
      case "open":
      case "cd":
      case "goto": {
        const key = arg.toLowerCase().replace(/^\/+/, "");
        if (!key) return print(make("err", `usage: ${cmd} <page>   pages: ${Object.keys(PAGES).join(", ")}`));
        if (key === "~" || key === "..") return go("/");
        const href = PAGES[key];
        if (!href) return print(make("err", `${cmd}: ${arg}: no such page. Try: ${Object.keys(PAGES).join(", ")}`));
        return go(href);
      }
      case "contact":
        return out("The best way to reach me is the contact form.", "Type 'open contact' and I'll take you there.");
      case "ls":
        return out(FILES.join("   "));
      case "cat":
      case "less":
      case "more":
        return cat(arg.toLowerCase());
      case "crack":
      case "hack":
      case "decrypt":
        return startGame();
      case "stats": {
        const s = read<Stats>(STATS_KEY, { played: 0, wins: 0, streak: 0, best: null });
        return out(
          `  Played: ${s.played}   Cracked: ${s.wins}   Streak: ${s.streak}`,
          `  Best: ${s.best ? `${s.best} ${s.best === 1 ? "try" : "tries"}` : "-"}`
        );
      }
      case "theme": {
        const t = arg.toLowerCase() as ThemeName;
        if (!(t in THEMES)) return print(make("err", "theme: choose green, amber or white."));
        setTheme(t);
        write(THEME_KEY, t);
        return print(make("ok", `Phosphor set to ${t}.`));
      }
      case "whoami":
        return out(root ? "root (you cracked it, nice)" : "guest");
      case "date":
        return out(new Date().toString());
      case "echo":
        return out(arg);
      case "pwd":
        return out(root ? "/root" : "/home/guest");
      case "history":
        return out(...history.current.map((h, i) => `  ${String(i + 1).padStart(3)}  ${h}`));
      case "sudo":
        if (root) return out("You're already root. With great power...");
        return print(make("err", "guest is not in the sudoers file. This incident will be reported."), make("dim", "(Earn root with 'crack'.)"));
      case "rm":
        return print(make("err", "Nice try."));
      case "coffee":
        return out("Brewing ... ☕ done. Productivity +10%.");
      case "hello":
      case "hi":
        return out("Hello! Type 'help' if you're lost.");
      case "clear":
      case "cls":
        return setLines([]);
      case "exit":
      case "quit":
      case "logout":
        return onClose();
      default:
        playSound("miss");
        return print(make("err", `command not found: ${cmd}. Type 'help'.`));
    }
  }

  const submit = () => {
    const value = input;
    setInput("");
    histIdx.current = -1;
    if (game) {
      print(make("in", `decrypt> ${value}`));
      if (value.trim()) guess(value);
      return;
    }
    print(make("in", `${root ? "root@dcw:~#" : "guest@dcw:~$"} ${value}`));
    if (value.trim()) {
      history.current = [...history.current, value].slice(-50);
      playSound("select");
    }
    run(value);
  };

  const completions = ["help", "about", "services", "projects", "blog", "read", "games", "open", "ls", "cat", "crack", "stats", "theme", "whoami", "date", "echo", "clear", "exit", "sudo", "coffee", "history"];

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (booting) {
      skipBoot();
      if (e.key !== "Escape") return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowUp" && !game) {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      histIdx.current = histIdx.current < 0 ? h.length - 1 : Math.max(0, histIdx.current - 1);
      setInput(h[histIdx.current] ?? "");
    } else if (e.key === "ArrowDown" && !game) {
      e.preventDefault();
      const h = history.current;
      if (histIdx.current < 0) return;
      histIdx.current += 1;
      if (histIdx.current >= h.length) {
        histIdx.current = -1;
        setInput("");
      } else setInput(h[histIdx.current] ?? "");
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [first, ...rest] = input.split(" ");
      if (rest.length === 0) {
        const match = completions.filter((c) => c.startsWith(first!.toLowerCase()));
        if (match.length === 1) setInput(match[0] + " ");
        else if (match.length > 1) print(make("dim", match.join("  ")));
      } else if (["open", "cd", "goto"].includes(first!)) {
        const match = Object.keys(PAGES).filter((p) => p.startsWith(rest.join(" ").toLowerCase()));
        if (match.length === 1) setInput(`${first} ${match[0]}`);
      } else if (first === "cat") {
        const match = FILES.filter((f) => f.startsWith(rest.join(" ").toLowerCase()));
        if (match.length === 1) setInput(`cat ${match[0]}`);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === "c" && e.ctrlKey && game) {
      e.preventDefault();
      guess("quit");
    } else if (e.key.length === 1) {
      playSound("click");
    }
  };

  const tap = (cmd: string) => {
    if (game && cmd !== "quit") return;
    print(make("in", `${game ? "decrypt>" : root ? "root@dcw:~#" : "guest@dcw:~$"} ${cmd}`));
    if (game) guess(cmd);
    else run(cmd);
    inputRef.current?.focus();
  };

  const t = THEMES[theme];
  const prompt = game ? "decrypt>" : root ? "root@dcw:~#" : "guest@dcw:~$";

  /* ── Render ──────────────────────────────────────────────────────────── */

  const renderLine = (l: Line) => {
    if (l.kind === "guess") {
      const label = l.letters.map((x) => `${x.ch} ${x.state === "hit" ? "correct" : x.state === "near" ? "in the word, wrong place" : "not in the word"}`).join(", ");
      return (
        <div key={l.id} className="my-1 flex gap-1.5" role="img" aria-label={label}>
          {l.letters.map((x, i) => (
            <span
              key={i}
              className="grid size-9 place-items-center rounded-sm border-2 text-lg font-bold sm:size-10"
              style={
                x.state === "hit"
                  ? { background: t.fg, borderColor: t.fg, color: "#031007", textShadow: "none" }
                  : x.state === "near"
                    ? { borderColor: t.fg, borderStyle: "dashed" }
                    : { borderColor: t.dim, color: t.dim, textShadow: "none" }
              }
            >
              {x.ch}
            </span>
          ))}
        </div>
      );
    }
    if (l.kind === "keys") {
      return (
        <div key={l.id} className="my-1 flex flex-wrap gap-x-1.5 text-sm tracking-wider" aria-label="Letters tried so far">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((ch) => {
            const st = l.states[ch];
            return (
              <span
                key={ch}
                className="px-0.5"
                style={
                  st === "hit"
                    ? { background: t.fg, color: "#031007", textShadow: "none" }
                    : st === "near"
                      ? { textDecoration: "underline dashed" }
                      : st === "miss"
                        ? { color: t.dim, textDecoration: "line-through", textShadow: "none" }
                        : { opacity: 0.85 }
                }
              >
                {ch}
              </span>
            );
          })}
        </div>
      );
    }
    const style: React.CSSProperties =
      l.kind === "dim" ? { color: t.dim, textShadow: "none" } : l.kind === "err" ? { color: "#ff6b6b", textShadow: "0 0 6px rgba(255,107,107,0.5)" } : {};
    return (
      <div
        key={l.id}
        className={l.kind === "head" || l.kind === "ok" ? "font-bold" : undefined}
        style={l.kind === "in" ? { opacity: 0.9 } : style}
      >
        {l.text || " "}
      </div>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secret terminal"
      className="dcwt fixed inset-0 z-[200] flex flex-col bg-[#020604] font-mono"
      style={{ color: t.fg, textShadow: `0 0 6px ${t.glow}`, ["--dcwt-fg" as string]: t.fg }}
      onClick={() => inputRef.current?.focus()}
      onPointerDown={skipBoot}
    >
      <style>{`
        .dcwt::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;
          background:repeating-linear-gradient(to bottom,rgba(0,0,0,0) 0,rgba(0,0,0,0) 2px,rgba(0,0,0,.28) 3px);}
        .dcwt::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:3;
          background:radial-gradient(ellipse at center,rgba(0,0,0,0) 60%,rgba(0,0,0,.65) 100%);}
        .dcwt-screen{animation:dcwt-on .45s ease-out both}
        @keyframes dcwt-on{0%{transform:scaleY(.01) scaleX(.6);filter:brightness(3)}60%{transform:scaleY(1) scaleX(1)}100%{filter:none}}
        @keyframes dcwt-flicker{0%,100%{opacity:1}50%{opacity:.96}}
        .dcwt-flicker{animation:dcwt-flicker .12s infinite}
        .dcwt-cursor{animation:dcwt-blink 1s steps(1) infinite}
        @keyframes dcwt-blink{50%{opacity:0}}
        .dcwt input{caret-color:transparent}
        .dcwt input:focus,.dcwt input:focus-visible{outline:none!important;box-shadow:none!important}
        @media (prefers-reduced-motion: reduce){.dcwt-screen,.dcwt-flicker,.dcwt-cursor{animation:none}}
      `}</style>

      <div className="dcwt-screen dcwt-flicker relative z-[1] flex min-h-0 flex-1 flex-col">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b px-4 py-2 text-xs sm:px-6" style={{ borderColor: t.dim }}>
          <span>DCW-OS TERMINAL · {theme.toUpperCase()} PHOSPHOR</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded border px-2 py-0.5 hover:opacity-80"
            style={{ borderColor: t.dim }}
            aria-label="Close terminal"
          >
            [ESC] EXIT
          </button>
        </div>

        {/* Output */}
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-sm leading-relaxed sm:px-6 sm:text-base">
          <div aria-live="polite" className="whitespace-pre-wrap break-words">
            {lines.map(renderLine)}
          </div>

          {/* Prompt */}
          {!booting && (
            <label className="flex items-center gap-2">
              <span className="shrink-0">{prompt}</span>
              <span className="relative flex min-w-0 flex-1 items-center">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(game ? e.target.value.toUpperCase() : e.target.value)}
                  onKeyDown={onKeyDown}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={game ? 12 : 120}
                  aria-label="Terminal input"
                  className="w-full bg-transparent text-[16px] outline-none sm:text-base"
                  style={{ color: t.fg, textShadow: `0 0 6px ${t.glow}`, outline: "none", boxShadow: "none" }}
                />
                <span
                  aria-hidden
                  className="dcwt-cursor pointer-events-none absolute top-1/2 h-[1.15em] w-[0.6em] -translate-y-1/2"
                  style={{ left: `${input.length}ch`, background: t.fg }}
                />
              </span>
            </label>
          )}
        </div>

        {/* Quick commands for touch screens */}
        {touch && !booting && (
          <div className="flex gap-2 overflow-x-auto border-t px-3 py-2 text-xs" style={{ borderColor: t.dim }}>
            {(game ? ["quit"] : ["help", "about", "crack", "ls", "blog", "theme amber", "exit"]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  tap(c);
                }}
                className="shrink-0 rounded border px-3 py-1.5"
                style={{ borderColor: t.dim }}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
