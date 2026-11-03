"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, ExternalLink, Gauge, Loader2, Search, Send } from "lucide-react";
import type { HealthReport } from "@/lib/pagespeed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  "Loading your page on a simulated mid-range phone",
  "Measuring how fast the main content appears",
  "Checking the SEO basics Google looks for",
  "Checking accessibility",
  "Looking for security and best-practice issues",
  "Putting your results together",
];

function band(score: number) {
  return score >= 90 ? "good" : score >= 50 ? "ok" : "poor";
}
const BAND_CLS = {
  good: "text-emerald-400 stroke-emerald-400",
  ok: "text-amber-400 stroke-amber-400",
  poor: "text-red-400 stroke-red-400",
} as const;

function ScoreRing({ label, score }: { label: string; score: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const b = band(score);
  return (
    <div className="flex flex-col items-center text-center">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90 sm:size-24" role="img" aria-label={`${label}: ${score} out of 100`}>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="7" className="stroke-border" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={cn("transition-[stroke-dashoffset] duration-1000", BAND_CLS[b])}
        />
        <text x="40" y="46" textAnchor="middle" className={cn("rotate-90 fill-current font-mono text-xl font-bold", BAND_CLS[b])} style={{ transformOrigin: "40px 40px" }}>
          {score}
        </text>
      </svg>
      <span className="mt-2 text-sm font-medium text-foreground">{label}</span>
    </div>
  );
}

function plainSummary(r: HealthReport) {
  const s = r.scores;
  const worst = Object.entries({ speed: s.performance, SEO: s.seo, accessibility: s.accessibility }).sort((a, b) => a[1] - b[1])[0]!;
  if (worst[1] >= 90) return "Nice work: your site is in great shape. There are still a few small wins below.";
  if (worst[0] === "speed") return "Your site is slower than it should be on phones, and that's costing you visitors. The good news: most of these fixes are straightforward.";
  return `The biggest opportunity is ${worst[0]}. Fixing the issues below will help more people find and use your site.`;
}

export function HealthCheckTool() {
  const [url, setUrl] = React.useState("");
  const [state, setState] = React.useState<"idle" | "running" | "done" | "error">("idle");
  const [step, setStep] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);
  const [report, setReport] = React.useState<HealthReport | null>(null);
  const [error, setError] = React.useState("");
  const resultsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Pre-fill from ?url= so outreach emails can link straight to a result.
    const q = new URLSearchParams(window.location.search).get("url");
    if (q) setUrl(q);
  }, []);

  React.useEffect(() => {
    if (state !== "running") return;
    const started = Date.now();
    const iv = window.setInterval(() => {
      const secs = (Date.now() - started) / 1000;
      setElapsed(secs);
      setStep(Math.min(STEPS.length - 1, Math.floor(secs / 5)));
    }, 250);
    return () => window.clearInterval(iv);
  }, [state]);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || state === "running") return;
    setState("running");
    setStep(0);
    setElapsed(0);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/health-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.error ?? "Something went wrong running the check. Please try again.");
      setReport(data as HealthReport);
      setState("done");
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const progress = Math.min(96, (elapsed / 32) * 100);

  return (
    <div className="mx-auto max-w-3xl">
      <form onSubmit={run} className="rounded-3xl border border-border bg-card p-4 sm:p-6">
        <label htmlFor="hc-url" className="block font-heading text-lg font-semibold">
          Your website address
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="hc-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="yourbusiness.co.uk"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={state === "running"}
              className="h-12 w-full rounded-xl border border-border bg-background/60 pl-10 pr-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
            />
          </div>
          <Button type="submit" variant="primary" size="lg" disabled={state === "running" || !url.trim()} className="h-12">
            {state === "running" ? <Loader2 className="size-4 animate-spin" /> : <Gauge className="size-4" />}
            {state === "running" ? "Checking…" : "Check my site"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Free and instant. Uses Google&apos;s own Lighthouse tests on your homepage (or any page you enter), as a mobile visitor sees it.
        </p>

        {state === "running" && (
          <div className="mt-6" aria-live="polite">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            <ul className="mt-4 space-y-1.5 font-mono text-sm">
              {STEPS.map((s, i) => (
                <li key={s} className={cn("flex items-center gap-2", i < step ? "text-accent" : i === step ? "text-foreground" : "text-muted-foreground/50")}>
                  {i < step ? <CheckCircle2 className="size-4" /> : i === step ? <Loader2 className="size-4 animate-spin" /> : <span className="size-4" />}
                  {s}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">This usually takes 20 to 40 seconds.</p>
          </div>
        )}

        {state === "error" && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}
      </form>

      {report && (
        <div ref={resultsRef} className="mt-8 scroll-mt-24 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
            <p className="font-mono text-xs text-muted-foreground">
              Results for <span className="text-foreground">{report.url}</span>
            </p>
            <p className="mt-2 text-muted-foreground">{plainSummary(report)}</p>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
              <ScoreRing label="Speed" score={report.scores.performance} />
              <ScoreRing label="SEO" score={report.scores.seo} />
              <ScoreRing label="Accessibility" score={report.scores.accessibility} />
              <ScoreRing label="Best practice" score={report.scores.bestPractices} />
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Scores out of 100. 90+ is good, 50 to 89 needs work, under 50 is poor.
            </p>
          </div>

          {report.metrics.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <h3 className="font-heading text-lg font-semibold">How it feels on a phone</h3>
              <ul className="mt-4 divide-y divide-border">
                {report.metrics.map((m) => (
                  <li key={m.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="text-right">
                      <span className={cn("font-mono font-semibold", m.verdict === "good" ? "text-emerald-400" : m.verdict === "ok" ? "text-amber-400" : "text-red-400")}>{m.value}</span>
                      <span className="ml-2 text-xs text-muted-foreground">aim for {m.target}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {report.issues.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <h3 className="font-heading text-lg font-semibold">What to fix first</h3>
              <ol className="mt-4 space-y-3">
                {report.issues.map((i) => (
                  <li key={i.id} className="rounded-2xl border border-border bg-surface/40 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
                          i.impact === "high" ? "bg-red-500/15 text-red-300" : i.impact === "medium" ? "bg-amber-500/15 text-amber-300" : "bg-surface text-muted-foreground"
                        )}
                      >
                        {i.impact} impact
                      </span>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{i.area}</span>
                      {i.saving && <span className="text-[11px] text-accent">{i.saving}</span>}
                    </div>
                    <p className="mt-2 font-medium text-foreground">{i.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{i.why}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {report.good.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-7">
              <h3 className="font-heading text-lg font-semibold">What&apos;s working</h3>
              <ul className="mt-3 space-y-2">
                {report.good.map((g) => (
                  <li key={g} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" /> {g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <FullReportForm report={report} />

          <p className="text-center text-xs text-muted-foreground">
            Want the technical detail?{" "}
            <a href={report.reportUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline">
              View Google&apos;s full report <ExternalLink className="size-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}

/** Lead capture: sends the result through the normal contact form. */
function FullReportForm({ report }: { report: HealthReport }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [note, setNote] = React.useState("");
  const [state, setState] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = React.useState("");
  const shownAt = React.useRef(Date.now());

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError("");
    const s = report.scores;
    const message = [
      `Full report requested for ${report.url}`,
      `Scores - speed ${s.performance}, SEO ${s.seo}, accessibility ${s.accessibility}, best practice ${s.bestPractices}`,
      "",
      "Top issues:",
      ...report.issues.map((i) => `- [${i.impact}] ${i.title}`),
      ...(note.trim() ? ["", "Their note:", note.trim()] : []),
    ].join("\n");
    try {
      if (!navigator.onLine) throw new Error("You're offline. Please try again once you're back online.");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          service: "Free Website Health Check",
          message,
          elapsedMs: Date.now() - shownAt.current,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-3xl border border-accent/40 bg-accent/10 p-6 text-center">
        <CheckCircle2 className="mx-auto size-8 text-accent" />
        <p className="mt-3 font-heading text-lg font-semibold">Thanks, {name.split(" ")[0]}!</p>
        <p className="mt-1 text-sm text-muted-foreground">
          I&apos;ll go through your site by hand and email you a written report with what to fix first, usually within two working days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-7">
      <h3 className="font-heading text-xl font-semibold">Want the full picture?</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Automated tests only go so far. I&apos;ll review your site by hand and send you a free written report: what&apos;s
        holding it back, what to fix first, and roughly what&apos;s involved. No obligation.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          required
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          autoComplete="name"
          className="h-11 rounded-xl border border-border bg-background/60 px-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-label="Your email"
          autoComplete="email"
          className="h-11 rounded-xl border border-border bg-background/60 px-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
        />
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Anything I should know? (optional)"
        aria-label="Anything I should know? (optional)"
        rows={3}
        className="mt-3 w-full rounded-xl border border-border bg-background/60 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none"
      />
      {state === "error" && (
        <p className="mt-2 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Your details are only used to send your report. See the privacy policy.</p>
        <Button type="submit" variant="primary" disabled={state === "sending"}>
          {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Send me the full report
          {state !== "sending" && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </form>
  );
}
