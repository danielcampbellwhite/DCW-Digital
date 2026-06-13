import type { Metadata } from "next";
import { Mail, MapPin, CalendarCheck, Clock, Github, Linkedin } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Daniel Campbell-White / DCW Digital. Start a project, request a website audit, book a discovery call, or enquire about employment.",
  path: "/contact",
});

const quickFacts = [
  { icon: MapPin, label: "Based in", value: siteConfig.location },
  { icon: Clock, label: "Response time", value: "Within 1 working day" },
  { icon: Mail, label: "Email", value: siteConfig.email },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Let&apos;s start a <span className="text-gradient">conversation</span>
          </>
        }
        description="Have a project, a role, or a question? Fill in the form and I'll get back to you personally — usually within a working day."
      />

      <section className="py-16">
        <div className="container-px grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Form */}
          <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
            <h2 className="font-heading text-xl font-bold">Send me a message</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields marked <span className="text-primary">*</span> are required.
            </p>
            <div className="mt-6">
              <ContactForm defaultService={service} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book a free, no-obligation 30-minute discovery call and we&apos;ll
                discuss your goals.
              </p>
              <Button href={siteConfig.bookingUrl} variant="primary" className="mt-4 w-full">
                <CalendarCheck className="size-4" /> Book a Discovery Call
              </Button>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6">
              <h3 className="font-heading font-semibold">Details</h3>
              <ul className="mt-4 space-y-4">
                {quickFacts.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                      <f.icon className="size-4" />
                    </span>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {f.label}
                      </div>
                      <div className="text-sm font-medium">{f.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex gap-2 border-t border-border pt-5">
                <Button href={siteConfig.links.github} variant="outline" size="icon" aria-label="GitHub">
                  <Github className="size-4" />
                </Button>
                <Button href={siteConfig.links.linkedin} variant="outline" size="icon" aria-label="LinkedIn">
                  <Linkedin className="size-4" />
                </Button>
                <Button href={`mailto:${siteConfig.email}`} variant="outline" size="icon" aria-label="Email">
                  <Mail className="size-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6">
              <h3 className="font-heading font-semibold">Hiring?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                If you&apos;re a recruiter or hiring manager, mention the role in
                your message and grab my CV.
              </p>
              <Button href={siteConfig.cvUrl} variant="accent" className="mt-4 w-full">
                Download CV
              </Button>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
