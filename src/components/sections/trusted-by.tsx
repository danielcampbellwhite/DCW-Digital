import { ArrowRight } from "lucide-react";
import { getFeaturedClients } from "@/content/clients";
import { withLogos } from "@/lib/logos";
import { SectionHeading } from "@/components/sections/section-heading";
import { ClientLogo } from "@/components/clients/client-logo";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/** Homepage "trusted by" logo strip — real organisations DCW Digital has
 *  worked with, across the NHS, public health, legal and commercial sectors. */
export function TrustedBy() {
  const featured = withLogos(getFeaturedClients());

  return (
    <section className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Selected Work"
          title="Trusted by organisations that matter"
          description="From NHS trusts and public-health services to law firms and national charities, I've helped a wide range of organisations build and run effective websites."
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((client) => (
            <StaggerItem key={client.slug}>
              <ClientLogo client={client} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex justify-center">
          <Button href="/projects" variant="outline">
            See everyone I&apos;ve worked with
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
