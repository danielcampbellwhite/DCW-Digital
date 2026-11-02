"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { services, supportPackages } from "@/content/services";
import { clients } from "@/content/clients";
import { playSound } from "@/lib/sfx";
import { ANSWERS, ALLOWED } from "@/components/easter-egg/words";

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

/** Fake file system for `ls -l` / `cat`. */
const FILES: { name: string; size: number; owner: "guest" | "root"; perms: string }[] = [
  { name: "readme.txt", size: 214, owner: "guest", perms: "-rw-r--r--" },
  { name: "about.txt", size: 389, owner: "guest", perms: "-rw-r--r--" },
  { name: "services.txt", size: 512, owner: "guest", perms: "-rw-r--r--" },
  { name: "projects.txt", size: 455, owner: "guest", perms: "-rw-r--r--" },
  { name: "secret.enc", size: 256, owner: "root", perms: "-r--------" },
];

const COMMANDS: [string, string][] = [
  ["help", "list available commands"],
  ["about", "print operator profile"],
  ["services", "list installed services"],
  ["projects", "list client deployments"],
  ["blog", "list recent posts"],
  ["read <n>", "open post <n> from blog"],
  ["games", "list games on /play"],
  ["open <page>", "navigate to a page"],
  ["ls [-l]", "list directory contents"],
  ["cat <file>", "print file contents"],
  ["crack", "run password recovery on secret.enc"],
  ["stats", "show crack statistics"],
  ["theme <green|amber|white>", "set phosphor colour"],
  ["whoami, pwd, date, echo", "standard utilities"],
  ["history", "show command history"],
  ["clear", "clear the screen"],
  ["exit", "close session"],
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

/** Format like the Unix `date` command: "Mon Nov  2 17:41:03 GMT 2026". */
function unixDate(d = new Date()) {
  const day = d.toLocaleString("en-GB", { weekday: "short" });
  const mon = d.toLocaleString("en-GB", { month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour12: false });
  const tz =
    new Intl.DateTimeFormat("en-GB", { timeZoneName: "short" })
      .formatToParts(d)
      .find((x) => x.type === "timeZoneName")?.value ?? "";
  return `${day} ${mon} ${String(d.getDate()).padStart(2, " ")} ${time} ${tz} ${d.getFullYear()}`;
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
    const host = window.location.hostname || "localhost";
    const boot: [Kind, string][] = [
      ["dim", "[    0.000000] DCW-OS 2.6.0-lts (build@dcw) #1 SMP PREEMPT"],
      ["dim", "[    0.014212] Memory: 640K available, 0K reserved"],
      ["dim", "[    0.051877] Loading module coffee.ko ... ok"],
      ["dim", "[    0.093340] Running self-test: 1 bug found (marked as feature)"],
      ["dim", `[    0.127608] Mounting /home/${user} ... ok`],
      ["dim", `[    0.188054] eth0: link up, connected to ${host}`],
      ["out", ""],
      ["out", `Last login: ${unixDate(new Date(Date.now() - 1000 * 60 * 60 * 26))} on tty1`],
      ["out", "Type 'help' for a list of commands."],
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
    out(`navigating to ${href} ...`);
    playSound("select");
    window.setTimeout(() => {
      onClose();
      router.push(href);
    }, 350);
  };

  /* ── Code-breaking game ──────────────────────────────────────────────── */

  const startGame = () => {
    const answer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)]!;
    setGame({ answer, guesses: [], keys: {} });
    print(
      make("head", "crack 1.4.2 - password recovery utility"),
      make("dim", `target: secret.enc   wordlist: en_GB (${ANSWERS.length} entries)   max attempts: ${MAX_TRIES}`),
      make("dim", "key: solid = correct position, dashed = wrong position, faded = not present"),
      make("dim", "enter a 5-letter guess, or 'quit' to abort"),
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
      print(make("err", "^C"), make("err", `crack: aborted by user (password was ${game.answer})`), make("out", ""));
      recordGame(false, MAX_TRIES);
      setGame(null);
      return;
    }
    if (!/^[A-Z]{5}$/.test(word)) {
      playSound("miss");
      print(make("err", `crack: invalid input '${raw.trim()}': expected 5 letters [A-Z]`));
      return;
    }
    if (!ALLOWED.has(word)) {
      playSound("miss");
      print(make("err", `crack: ${word}: not in wordlist (attempt not counted)`));
      return;
    }
    if (game.guesses.includes(word)) {
      playSound("miss");
      print(make("err", `crack: ${word}: already tried (attempt not counted)`));
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
        make("ok", `[+] match found: ${word} (${guesses.length}/${MAX_TRIES} attempts)`),
        make("ok", "[+] decrypting secret.enc ... done"),
        make("ok", "[+] escalating privileges ... uid=0(root) gid=0(root)"),
        make("dim", "run 'cat secret.enc' to read the file"),
        make("out", "")
      );
    } else if (left === 0) {
      playSound("gameOver");
      recordGame(false, MAX_TRIES);
      setGame(null);
      print(
        row,
        make("out", ""),
        make("err", `[-] max attempts (${MAX_TRIES}) reached. session locked.`),
        make("err", `[-] password was: ${game.answer}`),
        make("dim", "run 'crack' to retry"),
        make("out", "")
      );
    } else {
      playSound("select");
      setGame({ ...game, guesses, keys });
      print(row, { id: ++idRef.current, kind: "keys", states: keys }, make("dim", `attempts remaining: ${left}`));
    }
  };

  /* ── Commands ────────────────────────────────────────────────────────── */

  const cat = (file: string): void => {
    switch (file) {
      case "readme.txt":
        return out(
          "README",
          "======",
          "You've found the terminal. Not many people do.",
          "",
          "Run 'help' to see what's here. 'crack' is the fun bit."
        );
      case "about.txt":
        return run("about");
      case "services.txt":
        return run("services");
      case "projects.txt":
        return run("projects");
      case "secret.enc":
        if (!root) return print(make("err", "cat: secret.enc: Permission denied"));
        return out(
          "From: daniel@dcw",
          "To:   root",
          "Subj: you made it",
          "",
          "If you've got this far, you're exactly the kind of person I like",
          "working with: curious, persistent, and happy to poke at things",
          "until they give up their secrets.",
          "",
          "Fancy building something together? Run 'open contact'.",
          "",
          "-- Daniel"
        );
      case "":
        return print(make("err", "usage: cat <file>"));
      default:
        return print(make("err", `cat: ${file}: No such file or directory`));
    }
  };

  function run(raw: string): void {
    const [cmd = "", ...args] = raw.trim().split(/\s+/);
    const arg = args.join(" ");
    const pageList = Object.keys(PAGES).join("  ");
    switch (cmd.toLowerCase()) {
      case "":
        return;
      case "help":
      case "?":
        out("DCW-OS shell, version 2.6.0", "These commands are available:", "");
        COMMANDS.forEach(([c, d]) => out(`  ${c.padEnd(28)}${d}`));
        return print(make("out", ""), make("dim", "tab completes commands and paths. up/down recalls history."));
      case "about":
      case "whois":
      case "finger":
        return out(
          ...[
            ["Login", "daniel"],
            ["Name", "Daniel Campbell-White"],
            ["Role", "web developer"],
            ["Location", "Liverpool, UK"],
            ["Company", "DCW Digital (freelance)"],
            ["Experience", "8+ years"],
            ["Sectors", "NHS trusts, public health, charities"],
            ["Stack", "Next.js, React, TypeScript"],
            ["Plan", "build fast, accessible sites properly. review every line."],
            ["Fuel", "coffee"],
          ].map(([k, v]) => `${(k + ":").padEnd(12)}${v}`)
        );
      case "services": {
        out(`${"SERVICE".padEnd(24)}STATUS    DESCRIPTION`);
        services.forEach((sv) => out(`${sv.slug.padEnd(24)}active    ${sv.summary}`));
        const from = Math.min(...supportPackages.map((pk) => pk.priceMonthly));
        return print(make("out", ""), make("dim", `support plans from £${from}/mo. run 'open services' for details.`));
      }
      case "projects":
      case "clients":
        out(`total ${clients.length}`);
        clients.forEach((c) => out(`  ${c.sector.padEnd(22)}${c.name}`));
        return print(make("out", ""), make("dim", "run 'open projects' for details."));
      case "blog":
        posts.forEach((pt, i) => out(`  ${String(i + 1).padStart(2)}  ${pt.title}`));
        return print(make("out", ""), make("dim", "usage: read <n>"));
      case "read": {
        if (!arg) return print(make("err", "usage: read <n>"));
        const n = Number(arg);
        const post = posts[n - 1];
        if (!post) return print(make("err", `read: ${arg}: invalid post number (1-${posts.length})`));
        return go(`/blog/${post.slug}`);
      }
      case "games":
        return out(
          `${"GAME".padEnd(16)}TYPE`,
          `${"spot-the-bug".padEnd(16)}quiz: find the broken line of code`,
          `${"bug-invaders".padEnd(16)}typing shooter`,
          `${"deploy-dash".padEnd(16)}endless runner`,
          `${"whack-a-bug".padEnd(16)}30-second reflex game`,
          `${"crack".padEnd(16)}password recovery (this terminal)`,
          "",
          "run 'open play' to launch."
        );
      case "open":
      case "cd":
      case "goto": {
        const key = arg.toLowerCase().replace(/^\/+/, "");
        if (!key) return print(make("err", `usage: ${cmd} <page>`), make("dim", `pages: ${pageList}`));
        if (key === "~" || key === ".." || key === "/") return go("/");
        const href = PAGES[key];
        if (!href) return print(make("err", `${cmd}: ${arg}: No such page`), make("dim", `pages: ${pageList}`));
        return go(href);
      }
      case "contact":
      case "mail":
        return out("contact: messages are handled by the contact form.", "run 'open contact' to send one.");
      case "ls":
      case "dir": {
        if (arg.includes("-l")) {
          const now = new Date();
          const stamp = `${now.toLocaleString("en-GB", { month: "short" })} ${String(now.getDate()).padStart(2, " ")} 09:14`;
          out(`total ${FILES.length}`);
          return FILES.forEach((f) =>
            out(`${f.perms}  1 ${f.owner.padEnd(6)}${f.owner.padEnd(6)}${String(f.size).padStart(5)} ${stamp} ${f.name}`)
          );
        }
        return out(FILES.map((f) => f.name).join("  "));
      }
      case "cat":
      case "less":
      case "more":
        return cat(arg.toLowerCase());
      case "crack":
      case "hack":
      case "decrypt":
        return startGame();
      case "stats": {
        const st = read<Stats>(STATS_KEY, { played: 0, wins: 0, streak: 0, best: null });
        return out(
          `runs:     ${st.played}`,
          `cracked:  ${st.wins}`,
          `streak:   ${st.streak}`,
          `best:     ${st.best ? `${st.best}/${MAX_TRIES} attempts` : "n/a"}`
        );
      }
      case "theme": {
        const th = arg.toLowerCase() as ThemeName;
        if (!arg) return out(`current: ${theme}`, "usage: theme <green|amber|white>");
        if (!(th in THEMES)) return print(make("err", `theme: invalid argument '${arg}'`), make("dim", "valid: green, amber, white"));
        setTheme(th);
        write(THEME_KEY, th);
        return out(`theme: phosphor set to ${th}`);
      }
      case "whoami":
        return out(root ? "root" : "guest");
      case "id":
        return out(root ? "uid=0(root) gid=0(root) groups=0(root)" : "uid=1000(guest) gid=1000(guest) groups=1000(guest)");
      case "date":
        return out(unixDate());
      case "uname":
        return out(arg.includes("-a") ? "DCW-OS dcw 2.6.0-lts #1 SMP PREEMPT x86_64 GNU/Linux" : "DCW-OS");
      case "echo":
        return out(arg);
      case "pwd":
        return out(root ? "/root" : "/home/guest");
      case "history":
        return out(...history.current.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`));
      case "sudo":
        if (root) return out("sudo: you are already root");
        return print(make("out", "[sudo] password for guest: "), make("err", "guest is not in the sudoers file. This incident will be reported."));
      case "su":
        if (root) return out("su: already root");
        return print(make("out", "Password: "), make("err", "su: Authentication failure"), make("dim", "hint: try 'crack'"));
      case "rm":
        return print(make("err", `rm: cannot remove '${arg || "/"}': Permission denied`));
      case "coffee":
        return out("coffee: brewing ... done", "coffee: productivity +10%");
      case "hello":
      case "hi":
        return out("hi. run 'help' to get started.");
      case "clear":
      case "cls":
        return setLines([]);
      case "exit":
      case "quit":
      case "logout":
        out("logout");
        window.setTimeout(onClose, 300);
        return;
      default:
        playSound("miss");
        return print(make("err", `dcwsh: command not found: ${cmd}`));
    }
  }

  const submit = () => {
    const value = input;
    setInput("");
    histIdx.current = -1;
    if (game) {
      print(make("in", `crack> ${value}`));
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

  const completions = ["help", "about", "services", "projects", "blog", "read", "games", "open", "ls", "cat", "crack", "stats", "theme", "whoami", "id", "date", "uname", "echo", "pwd", "clear", "exit", "sudo", "coffee", "history"];

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
        const match = FILES.map((f) => f.name).filter((f) => f.startsWith(rest.join(" ").toLowerCase()));
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
    print(make("in", `${game ? "crack>" : root ? "root@dcw:~#" : "guest@dcw:~$"} ${cmd}`));
    if (game) guess(cmd);
    else run(cmd);
    inputRef.current?.focus();
  };

  const t = THEMES[theme];
  const prompt = game ? "crack>" : root ? "root@dcw:~#" : "guest@dcw:~$";

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
          <span>{root ? "root" : "guest"}@dcw: ~ (tty1)</span>
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
