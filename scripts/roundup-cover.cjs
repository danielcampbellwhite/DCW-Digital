#!/usr/bin/env node
/**
 * Generates the featured image for a "This Week in Tech" roundup.
 *
 *   node scripts/roundup-cover.cjs <spec.json> <out.png>
 *
 * spec.json:
 * {
 *   "date": "2026-11-07",
 *   "stories": [                        // 2-4 main stories, in the post's order
 *     { "label": "WordPress", "tag": "Security", "icon": "ShieldAlert", "tone": "security" }
 *   ],
 *   "extras": ["Ivanti", "Node.js"]     // optional: quick hits, shown as small chips
 * }
 *
 * - label: a few words naming the story (max ~18 characters).
 * - tag: a one-word category shown on the card (Security, AI, Web, Cloud, UK, ...).
 * - icon: any Lucide icon name in PascalCase (https://lucide.dev/icons), e.g.
 *   ShieldAlert, ShieldCheck, Bug, Skull, Siren, Lock, KeyRound, Bot, BrainCircuit,
 *   CodeXml, Braces, Globe, Cloud, CloudAlert, Server, Database, Cpu, Router,
 *   Package, GitBranch, Landmark, Gavel, Scale, Rocket, TrendingUp, Smartphone, Zap.
 *   An unknown name stops the script and suggests close matches.
 * - tone: security | ai | web | cloud | policy | hardware | trend
 *
 * Renders an on-brand 1200x750 (16:10) PNG with the pre-installed Playwright
 * Chromium. Nothing here is fetched from the network.
 */
const fs = require("node:fs");
const path = require("node:path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { icons } = require("lucide-react");

const TONES = {
  security: "#fb7185",
  ai: "#a78bfa",
  web: "#00e5ff",
  cloud: "#00ffb3",
  policy: "#facc15",
  hardware: "#fb923c",
  trend: "#60a5fa",
};

const W = 1200;
const H = 750;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function icon(name, color, size) {
  const Cmp = icons[name];
  if (!Cmp) {
    const key = String(name).toLowerCase().replace(/\d+$/, "");
    const near = Object.keys(icons).filter((k) => k.toLowerCase().includes(key)).slice(0, 10);
    throw new Error(`Unknown icon "${name}".${near.length ? ` Did you mean: ${near.join(", ")}?` : " See https://lucide.dev/icons"}`);
  }
  return renderToStaticMarkup(React.createElement(Cmp, { size, color, strokeWidth: 1.6 }));
}

function formatDate(iso) {
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).toUpperCase();
}

function build(spec) {
  const stories = (spec.stories || []).slice(0, 4);
  if (stories.length < 2) throw new Error("spec.stories needs 2-4 entries");
  const tones = stories.map((s) => TONES[s.tone] || TONES.web);
  const glowA = tones[0];
  const glowB = tones[1] || TONES.ai;

  const n = stories.length;
  const cardW = n === 4 ? 210 : 240;
  const gap = n === 4 ? 70 : n === 3 ? 100 : 160;
  const rowW = n * cardW + (n - 1) * gap;
  const left = (W - rowW) / 2;
  const cardTop = 262;
  const cardH = 250;
  const lineY = cardTop + 108;

  const connectors = stories
    .slice(1)
    .map((_, i) => {
      const x1 = left + (i + 1) * cardW + i * gap;
      const x2 = x1 + gap;
      const mid = (x1 + x2) / 2;
      return `
      <div class="dash" style="left:${x1}px;top:${lineY}px;width:${gap}px;background:repeating-linear-gradient(90deg, ${tones[i]} 0 10px, transparent 10px 20px)"></div>
      <div class="node" style="left:${mid - 9}px;top:${lineY - 8}px;border-color:${tones[i + 1]}55"><span style="background:${tones[i + 1]}"></span></div>`;
    })
    .join("");

  const cards = stories
    .map((s, i) => {
      const c = tones[i];
      const x = left + i * (cardW + gap);
      return `
      <div class="card" style="left:${x}px;top:${cardTop}px;width:${cardW}px;height:${cardH}px;border-color:${c}66;box-shadow:0 0 60px -20px ${c}66">
        <div class="chip" style="color:${c};border-color:${c}66;background:${c}1a">${esc(String(s.tag || "").toUpperCase())}</div>
        <div class="orb" style="background:radial-gradient(circle, ${c}33 0%, ${c}10 55%, transparent 72%);border-color:${c}40">${icon(s.icon, c, 62)}</div>
        <div class="bars"><span style="width:78%"></span><span style="width:52%"></span></div>
      </div>
      <div class="label" style="left:${x - 30}px;top:${cardTop + cardH + 28}px;width:${cardW + 60}px">${esc(String(s.label).toUpperCase())}</div>`;
    })
    .join("");

  const extras = (spec.extras || []).slice(0, 4);
  const extrasHtml = extras.length
    ? `<div class="extras"><span class="plus">ALSO</span>${extras.map((e) => `<span class="x">${esc(String(e).toUpperCase())}</span>`).join("")}</div>`
    : "";

  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${W}px;height:${H}px;background:#050816;overflow:hidden}
  body{position:relative;font-family:"DejaVu Sans","Liberation Sans",Arial,sans-serif;color:#e2e8f0}
  .bg{position:absolute;inset:0;
    background:
      radial-gradient(42% 52% at 12% 8%, ${glowA}30 0%, transparent 70%),
      radial-gradient(45% 55% at 92% 100%, ${glowB}2e 0%, transparent 70%),
      linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px) 0 0/44px 44px,
      linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px) 0 0/44px 44px,
      #050816}
  .mono{font-family:"DejaVu Sans Mono","Liberation Mono",monospace}
  .brand{position:absolute;left:64px;top:56px;display:flex;align-items:center;gap:18px}
  .logo{width:58px;height:58px;border-radius:14px;border:1px solid rgba(0,229,255,.45);background:linear-gradient(135deg,rgba(0,229,255,.22),rgba(124,58,237,.22));display:grid;place-items:center;color:#00e5ff;font-weight:700;font-size:30px}
  .kicker{font-size:15px;letter-spacing:.32em;color:#00e5ff}
  .title{margin-top:6px;font-size:30px;font-weight:700;letter-spacing:.01em;color:#f8fafc}
  .date{position:absolute;right:64px;top:64px;text-align:right}
  .date .d{font-size:15px;letter-spacing:.22em;color:#94a3b8}
  .date .s{margin-top:8px;font-size:13px;letter-spacing:.3em;color:#64748b}
  .card{position:absolute;border:1.5px solid;border-radius:20px;background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(10,14,32,.92));display:flex;flex-direction:column;align-items:center;padding-top:22px}
  .chip{font-size:13px;font-weight:700;letter-spacing:.14em;border:1px solid;border-radius:999px;padding:5px 14px}
  .orb{margin-top:22px;width:118px;height:118px;border-radius:999px;border:1px solid;display:grid;place-items:center}
  .bars{margin-top:24px;width:68%;display:flex;flex-direction:column;align-items:center;gap:8px}
  .bars span{display:block;height:7px;border-radius:4px;background:rgba(148,163,184,.28)}
  .dash{position:absolute;height:3px;opacity:.85}
  .node{position:absolute;width:18px;height:18px;border-radius:999px;border:5px solid;background:#050816;display:grid;place-items:center}
  .node span{width:8px;height:8px;border-radius:999px}
  .label{position:absolute;text-align:center;font-size:19px;letter-spacing:.16em;color:#cbd5e1}
  .extras{position:absolute;left:0;right:0;bottom:56px;display:flex;justify-content:center;gap:12px;align-items:center}
  .extras .plus{font-size:12px;letter-spacing:.3em;color:#64748b;margin-right:4px}
  .extras .x{font-size:13px;letter-spacing:.14em;color:#94a3b8;border:1px solid rgba(148,163,184,.25);border-radius:8px;padding:6px 12px;background:rgba(15,23,42,.6)}
  </style></head><body>
  <div class="bg"></div>
  <div class="brand"><div class="logo">D</div><div><div class="kicker mono">DCW DIGITAL</div><div class="title">This Week in Tech</div></div></div>
  <div class="date mono"><div class="d">${esc(formatDate(spec.date))}</div><div class="s">WEEKLY ROUNDUP</div></div>
  ${connectors}
  ${cards}
  <div class="mono">${extrasHtml}</div>
  </body></html>`;
}

async function main() {
  const [specPath, outPath] = process.argv.slice(2);
  if (!specPath || !outPath) {
    console.error("Usage: node scripts/roundup-cover.cjs <spec.json> <out.png>");
    process.exit(1);
  }
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(spec.date || "")) throw new Error("spec.date must be YYYY-MM-DD");
  const html = build(spec);

  // Playwright is pre-installed in the cloud environment (not a project dependency).
  const { chromium } = require("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: "load" });
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    await page.screenshot({ path: outPath, type: "png" });
  } finally {
    await browser.close();
  }
  const kb = Math.round(fs.statSync(outPath).size / 1024);
  console.log(`Wrote ${outPath} (${W}x${H}, ${kb}KB)`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
