import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/sections/page-header";
import { ContactForm } from "@/components/contact/contact-form";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Daniel Campbell-White / DCW Digital. Start a project, request a free website health check, or enquire about employment.",
  path: "/contact",
});

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
              I&apos;ll reply within one working day.
            </p>
            <div className="mt-6">
              <ContactForm defaultService={service} />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
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
