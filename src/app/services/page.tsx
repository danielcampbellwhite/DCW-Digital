import type { Metadata } from "next";
import { Check, ArrowRight, Star, CalendarCheck } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { services, supportPackages } from "@/content/services";
import { processSteps } from "@/content/expertise";
import { PageHeader } from "@/components/sections/page-header";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    "Website development, SEO optimisation, website auditing, performance optimisation, support & maintenance and digital consulting — services built around measurable business outcomes.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="What I Do"
        title={
          <>
            Helping your business{" "}
            <span className="text-gradient">grow online</span>
          </>
        }
        description="Whether you need a brand-new website, more customers, or simply a website that finally works the way it should — here's how I can help, in plain English."
      >
        <Button href={siteConfig.bookingUrl} variant="primary" size="lg">
          <CalendarCheck className="size-4" /> Book a Discovery Call
        </Button>
      </PageHeader>

      {/* Detailed service offerings */}
      <section className="py-24">
        <div className="container-px space-y-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.slug}>
                <article
                  id={service.slug}
                  className="scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-card"
                >
                  <div className="grid gap-8 p-8 lg:grid-cols-[1.4fr_1fr] sm:p-10">
                    <div>
                      <div className="flex items-center gap-4">
                        <span className="grid size-12 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                          <Icon className="size-6" />
                        </span>
                        <div>
                          <span className="font-mono text-xs text-primary">
                            Service {String(i + 1).padStart(2, "0")}
                          </span>
                          <h2 className="font-heading text-2xl font-bold">
                            {service.title}
                          </h2>
                        </div>
                      </div>
                      <p className="mt-5 text-muted-foreground">{service.description}</p>

                      <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {service.benefits.map((b) => (
                          <div key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                            {b}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col rounded-2xl border border-border bg-surface/50 p-6">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        What&apos;s included
                      </h3>
                      <ul className="mt-4 flex-1 space-y-2.5">
                        {service.deliverables?.map((d) => (
                          <li key={d} className="flex items-center gap-2 text-sm">
                            <span className="size-1.5 rounded-full bg-primary" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 border-t border-border pt-5">
                        <Button href={service.cta.href} variant="primary" className="w-full">
                          {service.cta.label}
                          <ArrowRight className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Support & maintenance packages */}
      <section id="packages" className="scroll-mt-24 bg-surface/30 py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="Support & Maintenance"
            title="Care plans that keep you online"
            description="Pick the level of cover that suits your site. Prices are starting guides — every plan is tailored to your needs."
          />

          <StaggerGroup className="mt-14 grid gap-6 lg:grid-cols-3">
            {supportPackages.map((pkg) => (
              <StaggerItem key={pkg.name} className="h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                    pkg.featured
                      ? "border-primary/60 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
                      : "border-border"
                  )}
                >
                  {pkg.featured && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      <Star className="size-3 fill-current" /> Most popular
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-bold">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>
                  <div className="mt-5 text-sm font-medium text-primary">
                    Tailored monthly plan
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    href={`/contact?service=Website+care+%26+support`}
                    variant={pkg.featured ? "primary" : "outline"}
                    className="mt-7 w-full"
                  >
                    Choose {pkg.name}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Every plan is tailored to your website — get in touch for a quote.
          </p>
        </div>
      </section>

      {/* Process recap */}
      <section className="py-24">
        <div className="container-px">
          <SectionHeading
            eyebrow="The Process"
            title="What working together looks like"
          />
          <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.slice(0, 4).map((step) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.step}>
                  <div className="card-surface h-full">
                    <span className="font-mono text-xs text-primary">
                      Step {String(step.step).padStart(2, "0")}
                    </span>
                    <Icon className="mt-2 size-5 text-primary" />
                    <h3 className="mt-2 font-heading font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
          <div className="mt-10 text-center">
            <Button href="/contact" variant="primary" size="lg">
              Start a conversation
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
