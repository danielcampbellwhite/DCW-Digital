import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { clients } from "@/content/clients";
import { withLogos } from "@/lib/logos";
import { PageHeader } from "@/components/sections/page-header";
import { ClientsWall } from "@/components/clients/clients-wall";
import { FinalCta } from "@/components/sections/final-cta";

export const metadata: Metadata = buildMetadata({
  title: "Work & Clients",
  description:
    "Organisations DCW Digital has worked with — across the NHS, public health, legal, charity and commercial sectors. Web development, SEO, performance and support.",
  path: "/projects",
});

export default function ProjectsPage() {
  const clientsWithLogos = withLogos(clients);

  return (
    <>
      <PageHeader
        eyebrow="Selected Work"
        title={
          <>
            Organisations I&apos;ve{" "}
            <span className="text-gradient">worked with</span>
          </>
        }
        description="A selection of the NHS trusts, public-health services, mobile apps, law firms, charities and businesses I've helped design, build, optimise and support over the years."
      />

      <section className="py-20">
        <div className="container-px">
          <ClientsWall clients={clientsWithLogos} />
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Logos and names are the property of their respective organisations and
            shown to indicate prior work.
          </p>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
