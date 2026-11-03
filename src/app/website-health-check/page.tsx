import type { Metadata } from "next";
import { Accessibility, Gauge, Search, ShieldCheck } from "lucide-react";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { JsonLd } from "@/components/seo/json-ld";
import { HealthCheckTool } from "@/components/health-check/health-check-tool";

export const metadata: Metadata = buildMetadata({
  title: "Free Website Health Check: Speed, SEO & Accessibility",
  description:
    "Test your website for free in 30 seconds. See your speed, SEO and accessibility scores in plain English, plus what to fix first. From a Liverpool web developer.",
  path: "/website-health-check",
});

const CHECKS = [
  { icon: Gauge, title: "Speed", body: "How quickly your page loads and becomes usable on a typical phone, using Google's Core Web Vitals." },
  { icon: Search, title: "SEO basics", body: "Titles, descriptions, mobile set-up and the technical things Google needs to list you properly." },
  { icon: Accessibility, title: "Accessibility", body: "Whether everyone can use your site, including people with visual impairments or using screen readers." },
  { icon: ShieldCheck, title: "Best practice", body: "Security (HTTPS), errors behind the scenes and outdated code that could break." },
];

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes. The instant check is free and you don't need to give any details. If you'd like a written review with what to fix first, that's free too: just leave your name and email after the results.",
  },
  {
    q: "Where do the results come from?",
    a: "From Google's own Lighthouse tests (the same ones behind PageSpeed Insights), run as a visitor on a mid-range mobile phone. I translate the results into plain English and rank them by what matters most to a business.",
  },
  {
    q: "Why is my score different each time?",
    a: "Speed scores vary a little between runs because network and server conditions change. Look at the overall picture rather than a single number.",
  },
  {
    q: "Can you fix the problems for me?",
    a: "Yes, that's what I do. Most fixes are straightforward. Request the full report and I'll tell you what's involved, or get in touch to talk it through.",
  },
];

export default function HealthCheckPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Free Website Health Check", path: "/website-health-check" }])} />
      <PageHeader
        eyebrow="Free Tool"
        title={
          <>
            Free website <span className="text-gradient">health check</span>
          </>
        }
        description="Find out how fast your website really is on a phone, how well it's set up for Google, and what to fix first. In plain English, in about 30 seconds."
      />

      <section className="py-14">
        <div className="container-px">
          <HealthCheckTool />
        </div>
      </section>

      <section className="bg-surface/30 py-20">
        <div className="container-px">
          <SectionHeading eyebrow="What It Checks" title="Four things that decide whether a website works" />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2">
            {CHECKS.map((c) => (
              <div key={c.title} className="card-surface flex gap-4">
                <c.icon className="mt-0.5 size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-heading font-semibold">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-px">
          <SectionHeading eyebrow="FAQs" title="Good to know" />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-border bg-card px-6 py-4 open:border-primary/30">
                <summary className="cursor-pointer list-none font-heading font-semibold [&::-webkit-details-marker]:hidden">{f.q}</summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
