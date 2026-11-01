import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown } from "lucide-react";
import {
  buildMetadata,
  breadcrumbSchema,
  faqSchema,
  serviceSchema,
} from "@/lib/seo";
import { services, supportPackages, getServiceBySlug } from "@/content/services";
import { servicePages } from "@/content/service-pages";
import { getAllPostsMeta } from "@/lib/blog";
import { Atmosphere } from "@/components/brand/atmosphere";
import { SectionHeading } from "@/components/sections/section-heading";
import { PricingPackages } from "@/components/services/pricing-packages";
import { PostCover } from "@/components/blog/post-cover";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";

export const dynamicParams = false;

export function generateStaticParams() {
  return services
    .filter((s) => servicePages[s.slug])
    .map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePages[slug];
  if (!page) return buildMetadata({ title: "Service not found" });
  return buildMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/services/${slug}`,
  });
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const page = servicePages[slug];
  if (!service || !page) notFound();

  const Icon = service.icon;
  const isSupport = slug === "support-maintenance";
  const allPosts = getAllPostsMeta();
  const related = page.relatedPosts
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p) => p !== undefined);
  const others = services.filter((s) => s.slug !== slug && servicePages[s.slug]);
  const cta = isSupport
    ? { label: "Ask about a care plan", href: "/contact?service=Support+%26+maintenance" }
    : service.cta;

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: page.seoDescription,
          slug,
          offers: isSupport
            ? supportPackages.map((p) => ({ name: `${p.name} care plan`, price: p.priceMonthly }))
            : undefined,
        })}
      />
      <JsonLd data={faqSchema(page.faqs)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Services", path: "/services" },
          { name: service.title, path: `/services/${slug}` },
        ])}
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border pt-28">
        <Atmosphere particles={10} />
        <div className="container-px relative z-10 pb-16">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All services
          </Link>
          <div className="mt-8 max-w-3xl animate-rise">
            <span className="eyebrow">
              <Icon className="size-3.5" /> {service.title}
            </span>
            <h1 className="mt-5 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">
              {page.headline}
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
              {page.lede}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={cta.href} variant="primary" size="lg">
                {cta.label}
                <ArrowRight className="size-4" />
              </Button>
              {isSupport && (
                <Button href="#plans" variant="outline" size="lg">
                  See the plans
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Intro + who it's for */}
      <section className="py-20">
        <div className="container-px grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-5 text-muted-foreground sm:text-lg">
            {page.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <aside className="card-surface h-fit">
            <h2 className="font-heading text-lg font-semibold">Who it&apos;s for</h2>
            <ul className="mt-4 space-y-3">
              {page.whoFor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* What's involved */}
      <section className="bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="What's Involved"
            title={isSupport ? "What a care plan covers" : `What ${service.title.toLowerCase()} covers`}
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
            {page.sections.map((s) => (
              <div key={s.title} className="card-surface h-full">
                <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing (support only) */}
      {isSupport && (
        <section id="plans" className="scroll-mt-24 py-24">
          <div className="container-px">
            <SectionHeading
              eyebrow="Care Plans"
              title="Pick the level of cover"
              description="Pay monthly, or yearly to get two months free."
            />
            <PricingPackages packages={supportPackages} />
          </div>
        </section>
      )}

      {/* Process */}
      <section className={isSupport ? "bg-surface/30 py-24" : "py-24"}>
        <div className="container-px">
          <SectionHeading eyebrow="How It Works" title="What working together looks like" />
          <ol className="mx-auto mt-14 max-w-3xl space-y-4">
            {page.steps.map((step, i) => (
              <li key={step.title} className="card-surface flex gap-5">
                <span className="font-mono text-sm text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-heading font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQs */}
      <section className={isSupport ? "py-24" : "bg-surface/30 py-24"}>
        <div className="container-px">
          <SectionHeading eyebrow="FAQs" title="Common questions" />
          <div className="mx-auto mt-12 max-w-3xl space-y-3">
            {page.faqs.map((f) => (
              <details
                key={f.q}
                className="group rounded-2xl border border-border bg-card px-6 py-4 open:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related reading */}
      {related.length > 0 && (
        <section className={isSupport ? "bg-surface/30 py-24" : "py-24"}>
          <div className="container-px">
            <SectionHeading eyebrow="Further Reading" title="Related articles" />
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <PostCover cover={r.cover} alt={r.title} />
                  <div className="p-4">
                    <h3 className="font-heading font-semibold leading-snug">{r.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                      Read
                      <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other services + CTA */}
      <section className="border-t border-border py-24">
        <div className="container-px text-center">
          <h2 className="font-heading text-3xl font-bold">Not quite what you need?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/services/${o.slug}`}
                className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {o.title}
              </Link>
            ))}
          </div>
          <Button href={cta.href} variant="primary" size="lg" className="mt-10">
            {cta.label}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>
    </>
  );
}
