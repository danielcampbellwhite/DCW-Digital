/**
 * The contents of ~/vault, unlocked by beating `crack` in the secret
 * terminal. Everything here is just for fun. Art is kept to 38 columns or
 * less so it still fits on a phone.
 */

const art = (s: string) => s.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");

const JOKES = [
  "Why do programmers prefer dark mode?\nBecause light attracts bugs.",
  "A SQL query walks into a bar, walks up\nto two tables and asks: \"Can I join you?\"",
  "There are 10 kinds of people: those who\nunderstand binary and those who don't.",
  "I'd tell you a UDP joke, but you\nmight not get it.",
  "How many programmers does it take to\nchange a light bulb? None. That's a\nhardware problem.",
  "Debugging: being the detective in a\ncrime film where you're also the\nmurderer.",
  "My code doesn't work and I don't know\nwhy. My code works and I don't know\nwhy.",
  "It's not a bug. It's an undocumented\nfeature.",
  "Knock knock.\nRace condition.\nWho's there?",
  "There are two hard things in computer\nscience: cache invalidation, naming\nthings, and off-by-one errors.",
  "I've got a joke about recursion.\nI've got a joke about recursion.\nI've got a joke about recursion...",
  "The best thing about a Boolean is that\neven if you're wrong, you're only off\nby a bit.",
];

export const randomJoke = () => JOKES[Math.floor(Math.random() * JOKES.length)]!.split("\n");

export interface VaultFile {
  name: string;
  size: number;
  hidden?: boolean;
  exec?: boolean;
  /** Lines to print for `cat`. A function gives fresh output each time. */
  lines: string[] | (() => string[]);
}

export const VAULT: VaultFile[] = [
  {
    name: "readme.txt",
    size: 302,
    lines: art(`
WELCOME TO THE VAULT
====================
Everything in here is classified.
(It isn't.)

  cat <file>     open a file
  ls -a          show hidden files
  ./matrix.sh    you know you want to
  cd ..          back to safety
`),
  },
  {
    name: "bug.txt",
    size: 412,
    lines: art(String.raw`
        \       /
         \_____/
      ___( o o )___
     /   /  ^  \   \
    |   |  '-'  |   |
     \___\_____/___/
        /  | |  \
       /   | |   \

  BUG #4521   status: won't fix
  reason: "works on my machine"
`),
  },
  {
    name: "coffee.txt",
    size: 388,
    lines: art(String.raw`
       (  )   (   )  )
        ) (   )  (  (
        ( )  (    ) )
       _____________
      <_____________> ___
      |             |/ _ \
      |  DEV  FUEL  | | | |
      |             |_| |_|
   ___|             |\___/
  /    \___________/    \
  \_____________________/

  caffeine: 87%    status: coding
`),
  },
  {
    name: "rubber-duck.txt",
    size: 356,
    lines: art(String.raw`
          __
        <(o )___
         ( ._> /
          '---'
   ~~~~~~~~~~~~~~~~~~~~

  RUBBER DUCK DEBUGGING
  1. explain your code to the duck,
     line by line
  2. the duck says nothing
  3. you find the bug
  4. the duck takes the credit
`),
  },
  {
    name: "keyboard-cat.txt",
    size: 341,
    lines: art(String.raw`
     /\_/\
    ( -.- )   zzz
     > ^ <
   __/   \______________________
  |qwertyuiopasdfghjjjjjjjjjjjjj|
  |_____________________________|

  $ git log -1
  commit 9f3a2c1 (HEAD -> main)
  Author: the cat
      jjjjjjjjjjjjjjjjjjjjjjjjjj
`),
  },
  {
    name: "liverpool.txt",
    size: 420,
    lines: art(String.raw`
      ,v,               ,v,
      |_|               |_|
     _|o|_             _|o|_
    | (_) |           | (_) |
    |  _  |___________|  _  |
    | |_| | |_| |_| | | |_| |
    |  _  |  _   _  | |  _  |
  __| |_| |_| |_| |_|_| |_| |__
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  greetings from the waterfront.
  built in Liverpool. mind the wind.
`),
  },
  {
    name: "deploy-bot.txt",
    size: 298,
    lines: art(String.raw`
          o
          |
       .-----.
       | o o |    beep boop.
       |  _  |    shipping to
       '-----'    production.
       /|   |\
        |   |
       _|   |_

  DEPLOY-BOT v1.0
  status: running. always running.
  (catch it on /play: Deploy Dash)
`),
  },
  {
    name: "friday.txt",
    size: 365,
    lines: art(String.raw`
  FRIDAY 16:59
  .-------------------------.
  | $ git push origin main  |
  |   are you sure? [y/N] y |
  '-------------------------'
               |
         \  \  |  /  /
          .---------.
          |  PROD   |
          | (fire)  |
          '---------'

  rule #1: never deploy on a Friday.
  rule #2: see rule #1.
`),
  },
  {
    name: "jokes.txt",
    size: 1024,
    lines: () => ["$ fortune --dev", "", ...randomJoke(), "", "(cat it again for another)"],
  },
  {
    name: ".do_not_open",
    size: 64,
    hidden: true,
    lines: art(`
You opened it anyway.

That's exactly why you're in here.
`),
  },
  {
    name: "matrix.sh",
    size: 211,
    exec: true,
    lines: art(`
#!/bin/sh
# digital rain. run it, don't read it.
./matrix.sh
`),
  },
];

export const findVaultFile = (name: string) => VAULT.find((f) => f.name === name);

/** One line of "digital rain" for matrix.sh. */
export function rainLine(width = 34) {
  const glyphs = "01アイウエオカキクケコサシスセソタチツテト$#%&*+=<>";
  let s = "";
  for (let i = 0; i < width; i++) s += Math.random() < 0.35 ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
  return s;
}
